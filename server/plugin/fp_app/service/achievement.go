package service

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var Achievement = new(achievement)

type achievement struct{}

// CreateAchievement 创建成就配置
func (s *achievement) CreateAchievement(ctx context.Context, achievement *model.BreakAchievement) (*model.BreakAchievement, error) {
	// 检查成就编码是否已存在
	var existingAchievement model.BreakAchievement
	if err := global.GVA_DB.Where("achievement_code = ?", achievement.AchievementCode).First(&existingAchievement).Error; err == nil {
		return nil, errors.New("该成就编码已存在")
	}

	// 确保时间字段被正确设置
	now := time.Now()
	achievement.CreatedAt = now
	achievement.UpdatedAt = now
	achievement.ID = 0 // 确保ID为0，让数据库自动生成

	// 创建成就配置
	if err := global.GVA_DB.Create(achievement).Error; err != nil {
		return nil, err
	}

	return achievement, nil
}

// DeleteAchievement 删除成就配置
func (s *achievement) DeleteAchievement(ctx context.Context, id uint) error {
	// 检查是否有用户已获得该成就
	var userAchievementCount int64
	if err := global.GVA_DB.Model(&model.BreakUserAchievement{}).Where("achievement_id = ?", id).Count(&userAchievementCount).Error; err != nil {
		return err
	}
	if userAchievementCount > 0 {
		return errors.New("该成就已被用户获得，无法删除")
	}

	// 删除成就配置
	if err := global.GVA_DB.Delete(&model.BreakAchievement{}, id).Error; err != nil {
		return err
	}

	return nil
}

// UpdateAchievement 更新成就配置
func (s *achievement) UpdateAchievement(ctx context.Context, achievement *model.BreakAchievement) (*model.BreakAchievement, error) {
	// 检查成就编码是否已存在（排除自己）
	var existingAchievement model.BreakAchievement
	if err := global.GVA_DB.Where("achievement_code = ? AND id != ?", achievement.AchievementCode, achievement.ID).First(&existingAchievement).Error; err == nil {
		return nil, errors.New("该成就编码已存在")
	}

	// 使用 Updates 方法而不是 Save，避免时间字段问题
	updates := map[string]interface{}{
		"achievement_code":  achievement.AchievementCode,
		"achievement_name":  achievement.AchievementName,
		"achievement_desc":  achievement.AchievementDesc,
		"achievement_icon":  achievement.AchievementIcon,
		"achievement_emoji": achievement.AchievementEmoji,
		"achievement_gif":   achievement.AchievementGif,
		"unlock_condition":  achievement.UnlockCondition,
		"reward_exp":        achievement.RewardExp,
		"sort_order":        achievement.SortOrder,
		"status":            achievement.Status,
		"updated_at":        time.Now(),
	}

	// 更新成就配置
	if err := global.GVA_DB.Model(&model.BreakAchievement{}).Where("id = ?", achievement.ID).Updates(updates).Error; err != nil {
		return nil, err
	}

	// 重新查询更新后的数据
	if err := global.GVA_DB.Where("id = ?", achievement.ID).First(achievement).Error; err != nil {
		return nil, err
	}

	return achievement, nil
}

// GetAchievement 根据ID获取成就配置
func (s *achievement) GetAchievement(ctx context.Context, id uint) (*model.BreakAchievement, error) {
	var achievement model.BreakAchievement
	if err := global.GVA_DB.Where("id = ?", id).First(&achievement).Error; err != nil {
		return nil, err
	}

	return &achievement, nil
}

// GetAchievementList 分页获取成就配置列表
func (s *achievement) GetAchievementList(ctx context.Context, pageInfo *request.AchievementSearch) (list []model.BreakAchievement, total int64, err error) {
	limit := pageInfo.PageSize
	offset := pageInfo.PageSize * (pageInfo.Page - 1)
	db := global.GVA_DB.Model(&model.BreakAchievement{})

	// 构建查询条件
	if pageInfo.AchievementCode != "" {
		db = db.Where("achievement_code LIKE ?", "%"+pageInfo.AchievementCode+"%")
	}
	if pageInfo.AchievementName != "" {
		db = db.Where("achievement_name LIKE ?", "%"+pageInfo.AchievementName+"%")
	}
	// 修复：只有当明确传递了status参数时才进行过滤
	// 如果没有传递status参数，默认查询所有状态的记录
	if pageInfo.Status > 0 {
		db = db.Where("status = ?", pageInfo.Status)
	}
	if pageInfo.RewardExp > 0 {
		db = db.Where("reward_exp = ?", pageInfo.RewardExp)
	}

	// 获取总数
	if err = db.Count(&total).Error; err != nil {
		return
	}

	// 获取列表
	err = db.Limit(limit).Offset(offset).Order("sort_order ASC, id ASC").Find(&list).Error
	return list, total, err
}

// GetAllAchievements 获取所有成就配置
func (s *achievement) GetAllAchievements(ctx context.Context) ([]model.BreakAchievement, error) {
	var list []model.BreakAchievement
	if err := global.GVA_DB.Where("status = ?", 1).Order("sort_order ASC, id ASC").Find(&list).Error; err != nil {
		return nil, err
	}

	return list, nil
}

// GetAchievementByCode 根据成就编码获取配置
func (s *achievement) GetAchievementByCode(ctx context.Context, code string) (*model.BreakAchievement, error) {
	var achievement model.BreakAchievement
	if err := global.GVA_DB.Where("achievement_code = ? AND status = ?", code, 1).First(&achievement).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("成就配置不存在")
		}
		return nil, err
	}

	return &achievement, nil
}

// AchievementItem 统一的成就项结构
type AchievementItem struct {
	ID               uint   `json:"id"`
	AchievementCode  string `json:"achievementCode"`
	AchievementName  string `json:"achievementName"`
	AchievementDesc  string `json:"achievementDesc"`
	AchievementIcon  string `json:"achievementIcon"`
	AchievementEmoji string `json:"achievementEmoji"`
	AchievementGif   string `json:"achievementGif"`
	UnlockCondition  string `json:"unlockCondition"`
	RewardExp        int    `json:"rewardExp"`
	SortOrder        int    `json:"sortOrder"`
	Status           int    `json:"status"`
	IsUnlocked       bool   `json:"isUnlocked"`
	Progress         int    `json:"progress"`   // 进度百分比 0-100
	UnlockTime       string `json:"unlockTime"` // 解锁时间，未解锁为空
	IsViewed         int    `json:"isViewed"`   // 是否已查看，仅对已解锁成就有效
}

// UserAchievementResponse 用户成就响应结构
type UserAchievementResponse struct {
	Achievements  []AchievementItem `json:"achievements"`
	TotalCount    int               `json:"totalCount"`
	UnlockedCount int               `json:"unlockedCount"`
}

// GetUserAchievements 获取用户成就列表
func (s *achievement) GetUserAchievements(ctx context.Context, userID uint) (*UserAchievementResponse, error) {
	// 1. 获取所有启用的成就配置
	var allAchievements []model.BreakAchievement
	if err := global.GVA_DB.Where("status = ?", 1).Order("sort_order ASC, id ASC").Find(&allAchievements).Error; err != nil {
		return nil, err
	}

	// 2. 获取用户已解锁的成就
	var userAchievements []model.BreakUserAchievement
	if err := global.GVA_DB.Where("user_id = ?", userID).Order("unlock_time DESC").Find(&userAchievements).Error; err != nil {
		return nil, err
	}

	// 3. 构建已解锁成就的映射
	unlockedMap := make(map[uint]model.BreakUserAchievement)
	for _, ua := range userAchievements {
		unlockedMap[ua.AchievementId] = ua
	}

	// 4. 构建统一的成就列表
	var achievements []AchievementItem
	unlockedCount := 0

	for _, achievement := range allAchievements {
		item := AchievementItem{
			ID:               achievement.ID,
			AchievementCode:  achievement.AchievementCode,
			AchievementName:  achievement.AchievementName,
			AchievementDesc:  achievement.AchievementDesc,
			AchievementIcon:  achievement.AchievementIcon,
			AchievementEmoji: achievement.AchievementEmoji,
			AchievementGif:   achievement.AchievementGif,
			UnlockCondition:  achievement.UnlockCondition,
			RewardExp:        achievement.RewardExp,
			SortOrder:        achievement.SortOrder,
			Status:           achievement.Status,
		}

		// 检查是否已解锁
		if userAchievement, exists := unlockedMap[achievement.ID]; exists {
			item.IsUnlocked = true
			item.Progress = 100
			item.UnlockTime = userAchievement.UnlockTime.Format("2006-01-02 15:04:05")
			item.IsViewed = userAchievement.IsViewed
			unlockedCount++
		} else {
			item.IsUnlocked = false
			item.Progress = s.calculateAchievementProgress(ctx, userID, achievement)
			item.UnlockTime = ""
			item.IsViewed = 0
		}

		achievements = append(achievements, item)
	}

	return &UserAchievementResponse{
		Achievements:  achievements,
		TotalCount:    len(allAchievements),
		UnlockedCount: unlockedCount,
	}, nil
}

// MarkAchievementViewed 标记成就为已查看
func (s *achievement) MarkAchievementViewed(ctx context.Context, userID uint, achievementID uint) error {
	return global.GVA_DB.Model(&model.BreakUserAchievement{}).
		Where("user_id = ? AND achievement_id = ?", userID, achievementID).
		Update("is_viewed", 1).Error
}

// calculateAchievementProgress 计算成就进度
func (s *achievement) calculateAchievementProgress(ctx context.Context, userID uint, achievement model.BreakAchievement) int {
	// 解析解锁条件
	var condition map[string]interface{}
	if err := json.Unmarshal([]byte(achievement.UnlockCondition), &condition); err != nil {
		global.GVA_LOG.Error("解析成就解锁条件失败", zap.Error(err))
		return 0
	}

	conditionType, ok := condition["type"].(string)
	if !ok {
		return 0
	}

	switch conditionType {
	case "fart_type_count":
		// 特定类型放屁次数
		fartType, _ := condition["fart_type"].(string)
		targetCount := int(condition["count"].(float64))

		var count int64
		global.GVA_DB.Model(&model.BreakFartRecord{}).
			Where("user_id = ? AND fart_type = ?", userID, fartType).
			Count(&count)

		progress := int(float64(count) / float64(targetCount) * 100)
		if progress > 100 {
			progress = 100
		}
		return progress

	case "smell_level_count":
		// 特定气味等级次数
		smellLevel := int(condition["smell_level"].(float64))
		targetCount := int(condition["count"].(float64))

		var count int64
		global.GVA_DB.Model(&model.BreakFartRecord{}).
			Where("user_id = ? AND smell_level = ?", userID, smellLevel).
			Count(&count)

		progress := int(float64(count) / float64(targetCount) * 100)
		if progress > 100 {
			progress = 100
		}
		return progress

	case "mood_count":
		// 特定心情次数
		mood, _ := condition["mood"].(string)
		targetCount := int(condition["count"].(float64))

		var count int64
		global.GVA_DB.Model(&model.BreakFartRecord{}).
			Where("user_id = ? AND mood = ?", userID, mood).
			Count(&count)

		progress := int(float64(count) / float64(targetCount) * 100)
		if progress > 100 {
			progress = 100
		}
		return progress

	case "total_farts":
		// 总放屁次数
		targetCount := int(condition["count"].(float64))

		var count int64
		global.GVA_DB.Model(&model.BreakFartRecord{}).
			Where("user_id = ?", userID).
			Count(&count)

		progress := int(float64(count) / float64(targetCount) * 100)
		if progress > 100 {
			progress = 100
		}
		return progress

	case "continuous_days":
		// 连续天数
		targetDays := int(condition["days"].(float64))

		// 计算连续天数逻辑
		continuousDays := s.calculateContinuousDays(ctx, userID)

		progress := int(float64(continuousDays) / float64(targetDays) * 100)
		if progress > 100 {
			progress = 100
		}
		return progress

	default:
		return 0
	}
}

// calculateContinuousDays 计算连续天数
func (s *achievement) calculateContinuousDays(ctx context.Context, userID uint) int {
	// 获取用户所有打卡记录，按日期倒序排列
	var results []struct {
		CheckinDate string
	}
	global.GVA_DB.Model(&model.BreakUserCheckinDays{}).
		Where("user_id = ?", userID).
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

	// 计算连续天数
	continuousDays := 0
	today := time.Now().Format("2006-01-02")

	// 从今天开始往前计算
	for i, date := range checkinDates {
		expectedDate := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
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

// AchievementProgressResponse 成就进度响应
type AchievementProgressResponse struct {
	AchievementID   uint   `json:"achievementId"`
	AchievementCode string `json:"achievementCode"`
	AchievementName string `json:"achievementName"`
	IsUnlocked      bool   `json:"isUnlocked"`
	Progress        int    `json:"progress"`
	Target          int    `json:"target"`
	ProgressPercent int    `json:"progressPercent"`
}

// GetAchievementProgress 获取成就进度
func (s *achievement) GetAchievementProgress(ctx context.Context, userID uint, achievementID uint) (*AchievementProgressResponse, error) {
	// 获取成就配置
	achievement, err := s.GetAchievement(ctx, achievementID)
	if err != nil {
		return nil, err
	}

	// 检查是否已解锁
	var userAchievement model.BreakUserAchievement
	isUnlocked := global.GVA_DB.Where("user_id = ? AND achievement_id = ?", userID, achievementID).
		First(&userAchievement).Error == nil

	// 计算进度（这里需要根据实际的解锁条件来计算）
	progress := 0
	target := 100

	// TODO: 根据 achievement.UnlockCondition 计算实际进度
	// 这里需要根据具体的业务逻辑来实现

	progressPercent := 0
	if target > 0 {
		progressPercent = (progress * 100) / target
	}

	return &AchievementProgressResponse{
		AchievementID:   achievement.ID,
		AchievementCode: achievement.AchievementCode,
		AchievementName: achievement.AchievementName,
		IsUnlocked:      isUnlocked,
		Progress:        progress,
		Target:          target,
		ProgressPercent: progressPercent,
	}, nil
}

// BackfillCheckinDays 回填用户打卡天数数据
// 从 BreakFartRecord 表中提取历史记录的日期，插入到 BreakUserCheckinDays 表
func (s *achievement) BackfillCheckinDays(ctx context.Context) error {
	global.GVA_LOG.Info("开始回填用户打卡天数数据...")

	// 查询所有用户的放屁记录，按用户ID和日期分组
	type CheckinRecord struct {
		UserId      uint   `gorm:"column:user_id"`
		CheckinDate string `gorm:"column:checkin_date"`
	}

	var records []CheckinRecord
	err := global.GVA_DB.Model(&model.BreakFartRecord{}).
		Select("user_id, DATE(fart_date) as checkin_date").
		Group("user_id, DATE(fart_date)").
		Order("user_id, checkin_date").
		Find(&records).Error

	if err != nil {
		global.GVA_LOG.Error("查询放屁记录失败", zap.Error(err))
		return err
	}

	global.GVA_LOG.Info("找到打卡记录", zap.Int("count", len(records)))

	// 批量插入打卡记录（使用 FirstOrCreate 避免重复）
	successCount := 0
	for _, record := range records {
		checkin := &model.BreakUserCheckinDays{
			UserId:      record.UserId,
			CheckinDate: record.CheckinDate,
		}

		// 使用 FirstOrCreate 避免重复插入
		result := global.GVA_DB.Where("user_id = ? AND checkin_date = ?", record.UserId, record.CheckinDate).
			FirstOrCreate(&checkin)

		if result.Error != nil {
			global.GVA_LOG.Error("插入打卡记录失败",
				zap.Uint("userId", record.UserId),
				zap.String("date", record.CheckinDate),
				zap.Error(result.Error))
			continue
		}

		successCount++
	}

	global.GVA_LOG.Info("回填用户打卡天数数据完成",
		zap.Int("total", len(records)),
		zap.Int("success", successCount))

	return nil
}
