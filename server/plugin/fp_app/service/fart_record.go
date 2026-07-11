package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"gorm.io/gorm"
)

var FartRecord = new(fartRecord)

type fartRecord struct{}

// 默认使用东八区时间，避免服务器时区是 UTC 时，0~7 点出现“少一天”的问题
var cstZone = time.FixedZone("CST", 8*3600)

// nowCST 返回东八区当前时间
func nowCST() time.Time {
	return time.Now().In(cstZone)
}

// CreateFartRecord 创建放屁记录
func (s *fartRecord) CreateFartRecord(ctx context.Context, record *model.BreakFartRecord) (*CreateFartRecordResponse, error) {
	// 将纯时间转换为完整的 datetime 格式
	// 因为数据库 fart_time 字段是 datetime 类型
	fartDateStr := record.FartDate.Format("2006-01-02")
	fartTimeStr := record.FartTime

	// 如果是纯时间格式（HH:MM:SS），转换为完整的 datetime
	if len(fartTimeStr) <= 8 && !strings.Contains(fartTimeStr, "T") {
		record.FartTime = fartDateStr + " " + fartTimeStr
	}

	// 解析时间段
	fartTime, _ := time.Parse("15:04:05", fartTimeStr)
	record.HourOfDay = fartTime.Hour()
	record.TimePeriod = getTimePeriod(fartTime)

	// 开启事务
	tx := global.GVA_DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. 保存记录
	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 2. 更新用户统计
	var user model.WxUser
	if err := tx.Where("id = ?", record.UserId).First(&user).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 更新总次数和经验值
	updates := map[string]interface{}{
		"total_farts": gorm.Expr("total_farts + ?", 1),
		"experience":  gorm.Expr("experience + ?", 1),
	}

	if err := tx.Model(&user).Updates(updates).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 3. 记录打卡天数（用于升级判断）
	checkin := &model.BreakUserCheckinDays{
		UserId:      record.UserId,
		CheckinDate: fartDateStr,
	}
	// 使用 FirstOrCreate 避免重复插入同一天
	tx.Where("user_id = ? AND checkin_date = ?", record.UserId, fartDateStr).FirstOrCreate(&checkin)

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// 4. 同步检查成就
	newAchievements := s.checkAchievements(record.UserId, record)

	// 5. 异步检查升级（升级不需要立即反馈给前端）
	go s.checkLevelUp(record.UserId)

	// 6. 构建响应
	response := &CreateFartRecordResponse{
		RecordId:        record.ID,
		TodayCount:      s.getTodayCount(record.UserId, fartDateStr),
		NewAchievements: newAchievements,
	}

	return response, nil
}

// getTimePeriod 根据时间获取时间段
func getTimePeriod(t time.Time) string {
	hour := t.Hour()
	switch {
	case hour >= 0 && hour < 6:
		return "dawn" // 凌晨
	case hour >= 6 && hour < 12:
		return "morning" // 上午
	case hour >= 12 && hour < 18:
		return "afternoon" // 下午
	default:
		return "evening" // 晚上
	}
}

// getTodayCount 获取今日次数
func (s *fartRecord) getTodayCount(userId uint, date string) int {
	var count int64
	global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND fart_date = ?", userId, date).
		Count(&count)
	return int(count)
}

// asyncCheckAchievementsAndLevel 异步检查成就和升级
func (s *fartRecord) asyncCheckAchievementsAndLevel(userId uint, record *model.BreakFartRecord) {
	// 检查成就解锁
	newAchievements := s.checkAchievements(userId, record)
	if len(newAchievements) > 0 {
		global.GVA_LOG.Sugar().Infof("用户 %d 解锁了 %d 个新成就", userId, len(newAchievements))
	}

	// 检查等级升级
	levelUp := s.checkLevelUp(userId)
	if levelUp {
		global.GVA_LOG.Sugar().Infof("用户 %d 升级了", userId)
	}
}

// checkAchievements 检查成就解锁
func (s *fartRecord) checkAchievements(userId uint, record *model.BreakFartRecord) []model.BreakAchievement {
	var newAchievements []model.BreakAchievement

	// 1. 获取所有成就配置
	var allAchievements []model.BreakAchievement
	global.GVA_DB.Where("status = ?", 1).Find(&allAchievements)

	// 2. 获取用户已解锁成就
	var userAchievementCodes []string
	global.GVA_DB.Model(&model.BreakUserAchievement{}).
		Where("user_id = ?", userId).
		Pluck("achievement_code", &userAchievementCodes)

	unlockedMap := make(map[string]bool)
	for _, code := range userAchievementCodes {
		unlockedMap[code] = true
	}

	// 3. 检查每个成就
	for _, achievement := range allAchievements {
		if unlockedMap[achievement.AchievementCode] {
			continue // 跳过已解锁成就
		}

		// 检查解锁条件
		if s.checkUnlockCondition(userId, achievement) {
			// 解锁成就
			if err := s.unlockAchievement(userId, achievement); err == nil {
				newAchievements = append(newAchievements, achievement)
			}
		}
	}

	return newAchievements
}

// checkUnlockCondition 检查解锁条件
func (s *fartRecord) checkUnlockCondition(userId uint, achievement model.BreakAchievement) bool {
	// 解析解锁条件 JSON
	var condition map[string]interface{}
	if err := json.Unmarshal([]byte(achievement.UnlockCondition), &condition); err != nil {
		global.GVA_LOG.Error("解析成就解锁条件失败: " + err.Error())
		return false
	}

	conditionType, ok := condition["type"].(string)
	if !ok {
		global.GVA_LOG.Error("成就解锁条件缺少type字段")
		return false
	}

	switch conditionType {
	case "fart_type_count":
		return s.checkFartTypeCount(userId, condition)
	case "smell_level_count":
		return s.checkSmellLevelCount(userId, condition)
	case "mood_count":
		return s.checkMoodCount(userId, condition)
	case "total_farts":
		return s.checkTotalFarts(userId, condition)
	case "continuous_days":
		return s.checkContinuousDays(userId, condition)
	default:
		global.GVA_LOG.Error("未知的成就解锁条件类型: " + conditionType)
		return false
	}
}

// checkFartTypeCount 检查特定类型放屁次数
func (s *fartRecord) checkFartTypeCount(userId uint, condition map[string]interface{}) bool {
	fartType, ok := condition["fart_type"].(string)
	if !ok {
		return false
	}

	count, ok := condition["count"].(float64)
	if !ok {
		return false
	}

	var actualCount int64
	global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND fart_type = ? AND deleted_at IS NULL", userId, fartType).
		Count(&actualCount)

	return int64(count) <= actualCount
}

// checkSmellLevelCount 检查特定气味等级次数
func (s *fartRecord) checkSmellLevelCount(userId uint, condition map[string]interface{}) bool {
	smellLevel, ok := condition["smell_level"].(float64)
	if !ok {
		return false
	}

	count, ok := condition["count"].(float64)
	if !ok {
		return false
	}

	var actualCount int64
	global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND smell_level = ? AND deleted_at IS NULL", userId, int(smellLevel)).
		Count(&actualCount)

	return int64(count) <= actualCount
}

// checkMoodCount 检查特定心情次数
func (s *fartRecord) checkMoodCount(userId uint, condition map[string]interface{}) bool {
	mood, ok := condition["mood"].(string)
	if !ok {
		return false
	}

	count, ok := condition["count"].(float64)
	if !ok {
		return false
	}

	var actualCount int64
	global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND mood = ? AND deleted_at IS NULL", userId, mood).
		Count(&actualCount)

	return int64(count) <= actualCount
}

// checkTotalFarts 检查总放屁次数
func (s *fartRecord) checkTotalFarts(userId uint, condition map[string]interface{}) bool {
	count, ok := condition["count"].(float64)
	if !ok {
		return false
	}

	var user model.WxUser
	if err := global.GVA_DB.Where("id = ?", userId).First(&user).Error; err != nil {
		return false
	}

	return int(count) <= user.TotalFarts
}

// checkContinuousDays 检查连续打卡天数
func (s *fartRecord) checkContinuousDays(userId uint, condition map[string]interface{}) bool {
	days, ok := condition["days"].(float64)
	if !ok {
		return false
	}

	// 计算用户连续打卡天数
	continuousDays := s.calculateContinuousDays(userId)
	return int(days) <= continuousDays
}

// calculateContinuousDays 计算用户连续打卡天数
func (s *fartRecord) calculateContinuousDays(userId uint) int {
	// 获取用户所有打卡记录，按日期倒序排列
	var results []struct {
		CheckinDate string
	}
	global.GVA_DB.Model(&model.BreakUserCheckinDays{}).
		Where("user_id = ?", userId).
		Select("checkin_date").
		Order("checkin_date DESC").
		Find(&results)

	var checkinDates []string
	for _, r := range results {
		// 提取日期部分（格式：YYYY-MM-DD）
		date := r.CheckinDate
		if len(date) >= 10 {
			date = date[:10] // 截取前10个字符
		}
		checkinDates = append(checkinDates, date)
	}

	if len(checkinDates) == 0 {
		return 0
	}

	// 计算连续天数（按东八区“今天”来算）
	continuousDays := 0
	today := nowCST().Format("2006-01-02")

	// 从今天开始往前计算
	for i, date := range checkinDates {
		expectedDate := nowCST().AddDate(0, 0, -i).Format("2006-01-02")
		if date == expectedDate {
			continuousDays++
		} else {
			// 如果今天没有打卡，从昨天开始计算
			if i == 0 && date != today {
				continue
			}
			break
		}
	}

	return continuousDays
}

// unlockAchievement 解锁成就
func (s *fartRecord) unlockAchievement(userId uint, achievement model.BreakAchievement) error {
	userAchievement := &model.BreakUserAchievement{
		UserId:          userId,
		AchievementId:   achievement.ID,
		AchievementCode: achievement.AchievementCode,
		UnlockTime:      nowCST(),
		IsViewed:        0,
	}

	// 插入用户成就表
	if err := global.GVA_DB.Create(userAchievement).Error; err != nil {
		return err
	}

	// 增加用户经验值
	global.GVA_DB.Model(&model.WxUser{}).
		Where("id = ?", userId).
		Update("experience", gorm.Expr("experience + ?", achievement.RewardExp))

	return nil
}

// checkLevelUp 检查等级升级
func (s *fartRecord) checkLevelUp(userId uint) bool {
	// 获取用户信息
	var user model.WxUser
	if err := global.GVA_DB.Where("id = ?", userId).First(&user).Error; err != nil {
		return false
	}

	// 获取打卡天数
	var checkinDays int64
	global.GVA_DB.Model(&model.BreakUserCheckinDays{}).
		Where("user_id = ?", userId).
		Count(&checkinDays)

	// 查询下一级配置
	var nextLevel model.BreakLevelConfig
	if err := global.GVA_DB.Where("level = ?", user.Level+1).First(&nextLevel).Error; err != nil {
		return false // 已经是最高等级
	}

	// 检查是否满足升级条件（三重门槛）
	if user.Experience >= nextLevel.RequiredExp &&
		user.TotalFarts >= nextLevel.RequiredFarts &&
		int(checkinDays) >= nextLevel.RequiredDays {

		// 升级：更新等级和等级名称
		global.GVA_DB.Model(&user).Updates(map[string]interface{}{
			"level":      nextLevel.Level,
			"level_name": nextLevel.LevelName,
		})

		global.GVA_LOG.Sugar().Infof("用户 %d 升级到 %d 级 (%s)", userId, nextLevel.Level, nextLevel.LevelName)
		return true
	}

	return false
}

// GetTodayRecords 获取今日记录
func (s *fartRecord) GetTodayRecords(ctx context.Context, userId uint) (*TodayRecordsResponse, error) {
	// 使用东八区日期作为“今天”
	today := nowCST().Format("2006-01-02")

	var records []model.BreakFartRecord
	if err := global.GVA_DB.Where("user_id = ? AND fart_date = ?", userId, today).
		Order("fart_time DESC").
		Find(&records).Error; err != nil {
		return nil, err
	}

	response := &TodayRecordsResponse{
		TodayCount: len(records),
		Records:    records,
	}

	// 最近一次记录
	if len(records) > 0 {
		lastRecord := records[0]

		// 提取纯时间部分（HH:MM:SS）
		fartTimeStr := lastRecord.FartTime
		// 如果包含日期部分（可能是完整时间戳），只保留时间部分
		if len(fartTimeStr) > 8 && (fartTimeStr[10] == 'T' || fartTimeStr[10] == ' ') {
			// 格式可能是 "2025-10-21T21:19:54+08:00" 或类似格式
			parts := strings.Split(fartTimeStr, "T")
			if len(parts) > 1 {
				// 取T后面的部分，然后去掉时区信息
				timePart := parts[1]
				// 去掉 +08:00 或 -08:00 这样的时区后缀
				if idx := strings.IndexAny(timePart, "+-"); idx > 0 {
					fartTimeStr = timePart[:idx]
				} else {
					fartTimeStr = timePart
				}
			}
		}
		// 确保只保留 HH:MM:SS 格式
		if len(fartTimeStr) > 8 {
			fartTimeStr = fartTimeStr[:8]
		}

		response.LastRecord = &LastRecordInfo{
			Id:       lastRecord.ID,
			FartTime: fartTimeStr,
			FartType: lastRecord.FartType,
			Mood:     lastRecord.Mood,
		}
	}

	return response, nil
}

// GetTodayLastRecord 获取今日最近一次记录
func (s *fartRecord) GetTodayLastRecord(ctx context.Context, userId uint) (*LastRecordInfo, error) {
	// 使用东八区日期作为“今天”
	today := nowCST().Format("2006-01-02")

	var record model.BreakFartRecord
	if err := global.GVA_DB.Where("user_id = ? AND fart_date = ?", userId, today).
		Order("fart_time DESC").
		First(&record).Error; err != nil {
		// 如果没有记录，返回 nil（不是错误）
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	// 提取纯时间部分（HH:MM:SS）
	fartTimeStr := record.FartTime
	// 如果包含日期部分（可能是完整时间戳），只保留时间部分
	if len(fartTimeStr) > 8 && (fartTimeStr[10] == 'T' || fartTimeStr[10] == ' ') {
		// 格式可能是 "2025-10-21T21:19:54+08:00" 或类似格式
		parts := strings.Split(fartTimeStr, "T")
		if len(parts) > 1 {
			// 取T后面的部分，然后去掉时区信息
			timePart := parts[1]
			// 去掉 +08:00 或 -08:00 这样的时区后缀
			if idx := strings.IndexAny(timePart, "+-"); idx > 0 {
				fartTimeStr = timePart[:idx]
			} else {
				fartTimeStr = timePart
			}
		}
	}
	// 确保只保留 HH:MM:SS 格式
	if len(fartTimeStr) > 8 {
		fartTimeStr = fartTimeStr[:8]
	}

	response := &LastRecordInfo{
		Id:       record.ID,
		FartTime: fartTimeStr,
		FartType: record.FartType,
		Mood:     record.Mood,
	}

	return response, nil
}

// MakeupFartRecordRequest 补卡请求结构体（在api包中定义，这里重新声明用于service层）
type MakeupFartRecordRequest struct {
	FartType   string
	SmellLevel int
	Mood       string
	Note       string
	FartTime   string // HH:mm（日期使用当前日期）
}

// MakeupFartRecordWithDate 补卡记录（使用当前日期+自定义时间）
func (s *fartRecord) MakeupFartRecordWithDate(ctx context.Context, userId uint, req *MakeupFartRecordRequest) (*CreateFartRecordResponse, error) {
	// 前端只传入时间：fartTime = "HH:mm"
	// 后端使用当前日期

	// 1. 使用当前日期（东八区）
	now := nowCST()
	fartDateStr := now.Format("2006-01-02") // 2025-10-22

	// 2. 处理时间：补充秒数
	fartTimeStr := req.FartTime
	if len(fartTimeStr) == 5 && fartTimeStr[2] == ':' {
		fartTimeStr = fartTimeStr + ":00" // 09:13:00
	}

	// 3. 验证并解析日期
	parsedDate, err := time.Parse("2006-01-02", fartDateStr)
	if err != nil {
		return nil, fmt.Errorf("日期格式错误: %v", err)
	}

	// 4. 解析时间以获取小时和时间段
	fartTime, err := time.Parse("15:04:05", fartTimeStr)
	if err != nil {
		return nil, fmt.Errorf("时间格式错误: %v", err)
	}

	// 5. 构建完整的记录对象
	record := &model.BreakFartRecord{
		UserId:     userId,
		FartType:   req.FartType,
		SmellLevel: req.SmellLevel,
		Mood:       req.Mood,
		Note:       req.Note,
		FartDate:   model.DateOnly(parsedDate),
		FartTime:   fartDateStr + " " + fartTimeStr, // 2025-10-22 09:13:00
		HourOfDay:  fartTime.Hour(),
		TimePeriod: getTimePeriod(fartTime),
	}

	// 开启事务
	tx := global.GVA_DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. 保存记录
	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 2. 更新用户统计
	var user model.WxUser
	if err := tx.Where("id = ?", record.UserId).First(&user).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 更新总次数和经验值
	updates := map[string]interface{}{
		"total_farts": gorm.Expr("total_farts + ?", 1),
		"experience":  gorm.Expr("experience + ?", 1),
	}

	if err := tx.Model(&user).Updates(updates).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 3. 记录打卡天数（用于升级判断）
	checkin := &model.BreakUserCheckinDays{
		UserId:      record.UserId,
		CheckinDate: fartDateStr,
	}
	// 使用 FirstOrCreate 避免重复插入同一天
	tx.Where("user_id = ? AND checkin_date = ?", record.UserId, fartDateStr).FirstOrCreate(&checkin)

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// 4. 同步检查成就
	newAchievements := s.checkAchievements(record.UserId, record)

	// 5. 异步检查升级（升级不需要立即反馈给前端）
	go s.checkLevelUp(record.UserId)

	// 6. 构建响应
	response := &CreateFartRecordResponse{
		RecordId:        record.ID,
		TodayCount:      s.getTodayCount(record.UserId, fartDateStr),
		NewAchievements: newAchievements,
	}

	return response, nil
}

// 响应结构体
type CreateFartRecordResponse struct {
	RecordId        uint                     `json:"recordId"`
	TodayCount      int                      `json:"todayCount"`
	NewAchievements []model.BreakAchievement `json:"newAchievements,omitempty"`
}

type TodayRecordsResponse struct {
	TodayCount int                     `json:"todayCount"`
	LastRecord *LastRecordInfo         `json:"lastRecord,omitempty"`
	Records    []model.BreakFartRecord `json:"records"`
}

type LastRecordInfo struct {
	Id       uint   `json:"id"`
	FartTime string `json:"fartTime"`
	FartType string `json:"fartType"`
	Mood     string `json:"mood"`
}
