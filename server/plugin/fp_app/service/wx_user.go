package service

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var WxUser = new(wxuser)

type wxuser struct{}

// getChineseFirstLetter 获取中文拼音首字母
// 对于这30个特定的昵称，使用映射表确保准确性
func getChineseFirstLetter(text string) string {
	if len(text) == 0 {
		return ""
	}

	// 30个昵称的首字母映射表
	levelNameLetterMap := map[string]string{
		"气浪狐": "Q", "尾气喵": "W", "噗闪狼": "P", "屁屁熊": "P", "放屁兔": "F",
		"臭气鼠": "C", "响屁虎": "X", "屁王龙": "P", "气爆鸡": "Q", "屁神猴": "P",
		"臭屁狗": "C", "响屁猫": "X", "屁力鸭": "P", "气浪鸟": "Q", "屁星人": "P",
		"臭气侠": "C", "响屁王": "X", "屁力士": "P", "气爆君": "Q", "屁神兽": "P",
		"屁气侠": "P", "响屁星": "X", "气爆龙": "Q", "臭屁神": "C", "屁力王": "P",
		"气浪侠": "Q", "响屁君": "X", "屁神猫": "P", "气爆狗": "Q", "臭气龙": "C",
	}

	// 从映射表中获取首字母
	if letter, ok := levelNameLetterMap[text]; ok {
		return letter
	}

	// 理论上不会走到这里，但为了安全起见返回空字符串
	return ""
}

// WxRegister 微信用户注册
// Author [yourname](https://github.com/yourname)
func (s *wxuser) WxRegister(wxu *model.WxUser) (wxUser *model.WxUser, err error) {
	err = s.CreateWxUser(wxu)
	if err != nil {
		return nil, err
	}
	user, err := s.GetWxUserByOpenid(*wxu.Openid)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// WxLogin 微信用户登录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) WxLogin(wxu *model.WxUser) (wxures *model.WxUser, err error) {
	if nil == global.GVA_DB {
		return nil, fmt.Errorf("db not init")
	}
	user, err := s.GetWxUserByOpenid(*wxu.Openid)
	if err != nil {
		// 判断用户是否未注册
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("用户未注册")
		}
		return nil, err
	}
	return &user, nil
}

// WxQuickLogin 微信快速登录（自动注册）
// 通过 code 获取 openid，如果用户不存在则自动注册
// Author [yourname](https://github.com/yourname)
func (s *wxuser) WxQuickLogin(wxu *model.WxUser) (wxures *model.WxUser, err error) {
	if nil == global.GVA_DB {
		return nil, fmt.Errorf("db not init")
	}

	// 尝试获取用户
	user, err := s.GetWxUserByOpenid(*wxu.Openid)
	if err != nil {
		// 如果用户不存在，则自动注册
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 从昵称模板表中随机获取昵称和图片
			ctx := context.Background()
			nicknameTemplate, err := NicknameTemplate.GetRandomNicknameTemplate(ctx)

			// 如果获取失败，使用默认值作为fallback
			defaultImage := "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png"
			var randomNickname string
			var avatar string

			if err != nil || nicknameTemplate == nil {
				// 如果从表获取失败，使用硬编码的默认昵称列表作为fallback
				nicknameList := []string{
					"气浪狐", "尾气喵", "噗闪狼", "屁屁熊", "放屁兔",
					"臭气鼠", "响屁虎", "屁王龙", "气爆鸡", "屁神猴",
					"臭屁狗", "响屁猫", "屁力鸭", "气浪鸟", "屁星人",
					"臭气侠", "响屁王", "屁力士", "气爆君", "屁神兽",
					"屁气侠", "响屁星", "气爆龙", "臭屁神", "屁力王",
					"气浪侠", "响屁君", "屁神猫", "气爆狗", "臭气龙",
				}
				rng := rand.New(rand.NewSource(time.Now().UnixNano()))
				randomNickname = nicknameList[rng.Intn(len(nicknameList))]
				avatar = defaultImage
			} else {
				// 使用从表中获取的昵称和图片
				randomNickname = nicknameTemplate.Name
				if nicknameTemplate.Image != "" {
					avatar = nicknameTemplate.Image
				} else {
					avatar = defaultImage
				}
			}

			// 获取 openid 的后三位作为昵称后缀
			openidSuffix := ""
			if wxu.Openid != nil && len(*wxu.Openid) >= 3 {
				openidSuffix = "_" + (*wxu.Openid)[len(*wxu.Openid)-3:]
			} else if wxu.Openid != nil && len(*wxu.Openid) > 0 {
				// 如果 openid 长度不足3位，使用全部字符
				openidSuffix = "_" + *wxu.Openid
			}
			defaultNickname := randomNickname + openidSuffix
			defaultPhone := ""
			defaultStatus := "1"
			defaultLevelName := "新手屁民"
			userType := wxu.UserType
			if userType == 0 {
				userType = model.UserTypeWechat
			}

			newUser := &model.WxUser{
				Openid:    wxu.Openid,
				UserType:  userType,
				Nickname:  &defaultNickname,
				Avatar:    avatar,
				Phone:     &defaultPhone,
				Status:    &defaultStatus,
				Level:     1,
				LevelName: defaultLevelName,
			}

			// 创建新用户
			err = s.CreateWxUser(newUser)
			if err != nil {
				return nil, fmt.Errorf("自动注册用户失败: %v", err)
			}

			// 重新获取用户信息
			user, err = s.GetWxUserByOpenid(*wxu.Openid)
			if err != nil {
				return nil, fmt.Errorf("获取新注册用户失败: %v", err)
			}

			return &user, nil
		}
		return nil, err
	}

	// 用户已存在，直接返回
	return &user, nil
}

// OpenidLogin 通过 OpenID 登录
// 适用于已登录过的用户，使用保存的 openid 快速登录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) OpenidLogin(openid string) (wxures *model.WxUser, err error) {
	if nil == global.GVA_DB {
		return nil, fmt.Errorf("db not init")
	}

	// 通过 openid 获取用户
	user, err := s.GetWxUserByOpenid(openid)
	if err != nil {
		// 判断用户是否未找到
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("用户不存在，请重新登录")
		}
		return nil, err
	}

	// 检查用户状态
	if user.Status != nil && *user.Status != "1" {
		return nil, fmt.Errorf("用户已被禁用")
	}

	return &user, nil
}

// CreateWxUser 创建微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) CreateWxUser(wxuser *model.WxUser) (err error) {
	err = global.GVA_DB.Create(wxuser).Error
	return err
}

// DeleteWxUser 删除微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) DeleteWxUser(ctx context.Context, ID string) (err error) {
	err = global.GVA_DB.Delete(&model.WxUser{}, "id = ?", ID).Error
	return err
}

// DeleteWxUserByIds 批量删除微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) DeleteWxUserByIds(ctx context.Context, IDs []string) (err error) {
	err = global.GVA_DB.Delete(&[]model.WxUser{}, "id in ?", IDs).Error
	return err
}

// UpdateWxUser 更新微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) UpdateWxUser(ctx context.Context, wxuser model.WxUser) (err error) {
	// 构建更新字段映射，只更新非零值字段
	updates := make(map[string]interface{})

	if wxuser.Nickname != nil {
		updates["nickname"] = wxuser.Nickname
	}
	if wxuser.Avatar != "" {
		updates["avatar"] = wxuser.Avatar
	}
	if wxuser.Phone != nil {
		updates["phone"] = wxuser.Phone
	}
	if wxuser.Status != nil {
		updates["status"] = wxuser.Status
	}
	if wxuser.Gender != nil {
		updates["gender"] = wxuser.Gender
	}
	if wxuser.Level > 0 {
		updates["level"] = wxuser.Level
	}
	if wxuser.LevelName != "" {
		updates["level_name"] = wxuser.LevelName
	}
	if wxuser.Letter != "" {
		updates["letter"] = wxuser.Letter
	}
	if wxuser.AudioUrl != "" {
		updates["audio_url"] = wxuser.AudioUrl
	}
	// 允许手动修复 total_farts 和 experience（用于数据修复场景）
	// 使用 -1 作为哨兵值表示"不更新此字段"
	// 当值为 -1 时，表示该字段未在请求中提供，不应更新
	// 当值 != -1 时（通常是 >= 0），表示显式设置的值（包括0），应该更新
	// 在管理后台修复时，会传入需要修复的 total_farts 和 experience（>= 0）
	// 在客户端更新时（UpdateUserInfo），会传入 -1 表示不更新这些字段
	if wxuser.TotalFarts != -1 { // -1 是哨兵值，表示不更新；其他值（包括0）表示显式设置，应该更新
		updates["total_farts"] = wxuser.TotalFarts
	}
	if wxuser.Experience != -1 { // -1 是哨兵值，表示不更新；其他值（包括0）表示显式设置，应该更新
		updates["experience"] = wxuser.Experience
	}
	if wxuser.Points != -1 { // -1 是哨兵值，表示不更新；其他值（包括0）表示显式设置，应该更新
		updates["points"] = wxuser.Points
	}

	if len(updates) == 0 {
		return nil // 没有需要更新的字段
	}

	err = global.GVA_DB.Model(&model.WxUser{}).Where("id = ?", wxuser.ID).Updates(updates).Error
	return err
}

// GetWxUser 根据ID获取微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetWxUser(ctx context.Context, ID string) (wxuser model.WxUser, err error) {
	err = global.GVA_DB.Where("id = ?", ID).First(&wxuser).Error
	return
}

// GetWechatMallUserByOpenid 根据openid获取wechatMallUser表记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetWxUserByOpenid(openid string) (wxuser model.WxUser, err error) {
	err = global.GVA_DB.Where("openid = ?", openid).First(&wxuser).Error
	return
}

// GetWxUserByID 根据ID获取用户信息
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetWxUserByID(id uint) (wxuser model.WxUser, err error) {
	err = global.GVA_DB.Where("id = ?", id).First(&wxuser).Error
	return
}

// SetUserAudioUrl 设置用户放屁音频URL
// Author [yourname](https://github.com/yourname)
func (s *wxuser) SetUserAudioUrl(ctx context.Context, userID uint, audioUrl string) error {
	return global.GVA_DB.Model(&model.WxUser{}).Where("id = ?", userID).Update("audio_url", audioUrl).Error
}

// GetWxUserInfoList 分页获取微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetWxUserInfoList(ctx context.Context, info request.WxUserSearch) (list []model.WxUser, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	// 创建db
	db := global.GVA_DB.Model(&model.WxUser{})
	var wxusers []model.WxUser
	// 如果有条件搜索 下方会自动创建搜索语句
	if len(info.CreatedAtRange) == 2 {
		db = db.Where("created_at BETWEEN ? AND ?", info.CreatedAtRange[0], info.CreatedAtRange[1])
	}

	if info.Nickname != nil && *info.Nickname != "" {
		db = db.Where("nickname LIKE ?", "%"+*info.Nickname+"%")
	}
	if info.Phone != nil && *info.Phone != "" {
		db = db.Where("phone LIKE ?", "%"+*info.Phone+"%")
	}
	if info.Status != nil && *info.Status != "" {
		db = db.Where("status = ?", *info.Status)
	}
	if info.Gender != nil && *info.Gender != "" {
		db = db.Where("gender = ?", *info.Gender)
	}
	if info.Level != nil {
		db = db.Where("level = ?", *info.Level)
	}
	if info.UserType != nil {
		db = db.Where("user_type = ?", *info.UserType)
	}
	err = db.Count(&total).Error
	if err != nil {
		return
	}

	if limit != 0 {
		db = db.Limit(limit).Offset(offset)
	}
	err = db.Find(&wxusers).Error
	return wxusers, total, err
}

func (s *wxuser) GetWxUserPublic(ctx context.Context) {

}

// ValidateFartCounts 校验用户打屁次数（第一步：快速校验）
// 通过 break_fart_record 表统计每个用户的打屁总数，与 total_farts 字段对比
// 返回所有 total_farts 不对的用户列表（不包含经验值信息）
func (s *wxuser) ValidateFartCounts(ctx context.Context) ([]ValidateFartCountResult, error) {
	var results []ValidateFartCountResult

	// 查询所有用户
	var users []model.WxUser
	if err := global.GVA_DB.Find(&users).Error; err != nil {
		return nil, err
	}

	// 对每个用户进行校验（只校验打屁次数，不校验经验值）
	for _, user := range users {
		// 统计该用户在 break_fart_record 表中的打屁总数
		var actualCount int64
		err := global.GVA_DB.Model(&model.BreakFartRecord{}).
			Where("user_id = ? AND deleted_at IS NULL", user.ID).
			Count(&actualCount).Error

		if err != nil {
			global.GVA_LOG.Error("统计打屁次数失败", zap.Error(err), zap.Uint("user_id", user.ID))
			continue
		}

		// 对比实际统计数和用户表中的 total_farts
		if int64(user.TotalFarts) != actualCount {
			results = append(results, ValidateFartCountResult{
				UserID:      user.ID,
				Nickname:    getStringValue(user.Nickname),
				Openid:      getStringValue(user.Openid),
				TotalFarts:  user.TotalFarts,
				ActualCount: int(actualCount),
				Difference:  int(actualCount) - user.TotalFarts,
				// 经验值相关字段暂时不填充，等待第二步校验
				Experience:       0,
				ActualExperience: 0,
				ExperienceDiff:   0,
				AchievementExp:   0,
			})
		}
	}

	return results, nil
}

// ValidateSpecificUsers 校验指定用户的打屁次数和经验值（完整校验）
// 针对指定的用户ID列表，同时校验打屁次数和经验值
func (s *wxuser) ValidateSpecificUsers(ctx context.Context, userIDs []uint) ([]ValidateFartCountResult, error) {
	var results []ValidateFartCountResult

	if len(userIDs) == 0 {
		return results, nil
	}

	// 查询这些用户的信息
	var users []model.WxUser
	if err := global.GVA_DB.Where("id IN ?", userIDs).Find(&users).Error; err != nil {
		return nil, err
	}

	// 对每个用户进行完整校验
	for _, user := range users {
		// 统计该用户在 break_fart_record 表中的打屁总数
		var actualCount int64
		err := global.GVA_DB.Model(&model.BreakFartRecord{}).
			Where("user_id = ? AND deleted_at IS NULL", user.ID).
			Count(&actualCount).Error

		if err != nil {
			global.GVA_LOG.Error("统计打屁次数失败", zap.Error(err), zap.Uint("user_id", user.ID))
			continue
		}

		// 统计该用户从成就获得的经验值总和
		var userAchievements []model.BreakUserAchievement
		err = global.GVA_DB.Where("user_id = ? AND deleted_at IS NULL", user.ID).
			Find(&userAchievements).Error

		if err != nil {
			global.GVA_LOG.Error("查询用户成就失败", zap.Error(err), zap.Uint("user_id", user.ID))
			continue
		}

		// 统计成就经验值总和
		var achievementExpSum int64 = 0
		if len(userAchievements) > 0 {
			// 获取所有成就ID
			var achievementIds []uint
			for _, ua := range userAchievements {
				achievementIds = append(achievementIds, ua.AchievementId)
			}

			// 查询这些成就的奖励经验值
			var achievements []model.BreakAchievement
			err = global.GVA_DB.Where("id IN ? AND deleted_at IS NULL", achievementIds).
				Find(&achievements).Error

			if err != nil {
				global.GVA_LOG.Error("查询成就配置失败", zap.Error(err), zap.Uint("user_id", user.ID))
				continue
			}

			// 累加经验值
			for _, achievement := range achievements {
				achievementExpSum += int64(achievement.RewardExp)
			}
		}

		// 计算实际经验值 = 打屁次数 + 成就经验值
		actualExperience := int(actualCount) + int(achievementExpSum)

		// 返回完整结果（无论是否正确都返回，用于查看）
		results = append(results, ValidateFartCountResult{
			UserID:           user.ID,
			Nickname:         getStringValue(user.Nickname),
			Openid:           getStringValue(user.Openid),
			TotalFarts:       user.TotalFarts,
			ActualCount:      int(actualCount),
			Difference:       int(actualCount) - user.TotalFarts,
			Experience:       user.Experience,
			ActualExperience: actualExperience,
			ExperienceDiff:   actualExperience - user.Experience,
			AchievementExp:   int(achievementExpSum),
		})
	}

	return results, nil
}

// ValidateExperience 校验指定用户的经验值（第二步：详细校验）
// 通过 break_user_achievement 和 break_achievement 表统计成就经验值
// 计算实际经验值 = 打屁次数 + 成就经验值，与 experience 字段对比
func (s *wxuser) ValidateExperience(ctx context.Context, userIDs []uint) (map[uint]ExperienceValidationResult, error) {
	results := make(map[uint]ExperienceValidationResult)

	if len(userIDs) == 0 {
		return results, nil
	}

	// 查询这些用户的信息
	var users []model.WxUser
	if err := global.GVA_DB.Where("id IN ?", userIDs).Find(&users).Error; err != nil {
		return nil, err
	}

	// 对每个用户进行经验值校验
	for _, user := range users {
		// 统计该用户在 break_fart_record 表中的打屁总数
		var actualCount int64
		err := global.GVA_DB.Model(&model.BreakFartRecord{}).
			Where("user_id = ? AND deleted_at IS NULL", user.ID).
			Count(&actualCount).Error

		if err != nil {
			global.GVA_LOG.Error("统计打屁次数失败", zap.Error(err), zap.Uint("user_id", user.ID))
			continue
		}

		// 统计该用户从成就获得的经验值总和
		var userAchievements []model.BreakUserAchievement
		err = global.GVA_DB.Where("user_id = ? AND deleted_at IS NULL", user.ID).
			Find(&userAchievements).Error

		if err != nil {
			global.GVA_LOG.Error("查询用户成就失败", zap.Error(err), zap.Uint("user_id", user.ID))
			continue
		}

		// 统计成就经验值总和
		var achievementExpSum int64 = 0
		if len(userAchievements) > 0 {
			// 获取所有成就ID
			var achievementIds []uint
			for _, ua := range userAchievements {
				achievementIds = append(achievementIds, ua.AchievementId)
			}

			// 查询这些成就的奖励经验值
			var achievements []model.BreakAchievement
			err = global.GVA_DB.Where("id IN ? AND deleted_at IS NULL", achievementIds).
				Find(&achievements).Error

			if err != nil {
				global.GVA_LOG.Error("查询成就配置失败", zap.Error(err), zap.Uint("user_id", user.ID))
				continue
			}

			// 累加经验值
			for _, achievement := range achievements {
				achievementExpSum += int64(achievement.RewardExp)
			}
		}

		// 计算实际经验值 = 打屁次数 + 成就经验值
		actualExperience := int(actualCount) + int(achievementExpSum)

		results[user.ID] = ExperienceValidationResult{
			Experience:       user.Experience,
			ActualExperience: actualExperience,
			ExperienceDiff:   actualExperience - user.Experience,
			AchievementExp:   int(achievementExpSum),
		}
	}

	return results, nil
}

// ExperienceValidationResult 经验值校验结果
type ExperienceValidationResult struct {
	Experience       int `json:"experience"`       // 用户表中的经验值
	ActualExperience int `json:"actualExperience"` // 实际计算的经验值（打屁次数 + 成就经验值）
	ExperienceDiff   int `json:"experienceDiff"`   // 经验值差值（实际值 - 用户表值）
	AchievementExp   int `json:"achievementExp"`   // 从成就获得的经验值总和
}

// ValidateFartCountResult 校验结果
type ValidateFartCountResult struct {
	UserID           uint   `json:"userID"`
	Nickname         string `json:"nickname"`
	Openid           string `json:"openid"`
	TotalFarts       int    `json:"totalFarts"`       // 用户表中的打屁次数
	ActualCount      int    `json:"actualCount"`      // 实际统计的打屁次数
	Difference       int    `json:"difference"`       // 打屁次数差值（实际值 - 用户表值）
	Experience       int    `json:"experience"`       // 用户表中的经验值
	ActualExperience int    `json:"actualExperience"` // 实际计算的经验值（打屁次数 + 成就经验值）
	ExperienceDiff   int    `json:"experienceDiff"`   // 经验值差值（实际值 - 用户表值）
	AchievementExp   int    `json:"achievementExp"`   // 从成就获得的经验值总和
}

// getStringValue 安全获取字符串指针的值
func getStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// UpdateUserPoints 更新用户积分（增加或扣除）
// Author [yourname](https://github.com/yourname)
func (s *wxuser) UpdateUserPoints(ctx context.Context, userID uint, points int, pointsType int, remark string) error {
	// 先查询用户当前积分
	var user model.WxUser
	if err := global.GVA_DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return fmt.Errorf("用户不存在: %v", err)
	}

	// 根据积分类型计算新的积分值
	var newPoints int
	if pointsType == 1 {
		// 增加积分
		newPoints = user.Points + points
	} else if pointsType == 2 {
		// 扣除积分
		newPoints = user.Points - points
		// 确保积分不为负数
		if newPoints < 0 {
			newPoints = 0
		}
	} else {
		return fmt.Errorf("无效的积分类型: %d", pointsType)
	}

	// 更新用户积分
	if err := global.GVA_DB.Model(&model.WxUser{}).Where("id = ?", userID).Update("points", newPoints).Error; err != nil {
		return fmt.Errorf("更新用户积分失败: %v", err)
	}

	// 创建积分记录
	pointsRecord := &model.BreakUserPointsRecord{
		UserId:     userID,
		Points:     points,
		PointsType: pointsType,
		Remark:     remark,
	}
	if err := global.GVA_DB.Create(pointsRecord).Error; err != nil {
		global.GVA_LOG.Error("创建积分记录失败", zap.Error(err), zap.Uint("user_id", userID))
		// 记录日志但不返回错误，因为积分已经更新成功
	}

	return nil
}

// CreatePointsRecord 创建积分记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) CreatePointsRecord(ctx context.Context, pointsRecord *model.BreakUserPointsRecord) error {
	return global.GVA_DB.Create(pointsRecord).Error
}

// GetPointsRecords 获取用户积分记录列表
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetPointsRecords(ctx context.Context, userID uint, pageInfo request.GetPointsRecordsRequest) (list []model.BreakUserPointsRecord, total int64, err error) {
	limit := pageInfo.PageSize
	if limit == 0 {
		limit = 20 // 默认每页20条
	}
	offset := limit * (pageInfo.Page - 1)
	if offset < 0 {
		offset = 0
	}

	// 创建db
	db := global.GVA_DB.Model(&model.BreakUserPointsRecord{}).Where("user_id = ?", userID)

	// 统计总数
	err = db.Count(&total).Error
	if err != nil {
		return
	}

	// 查询列表
	var records []model.BreakUserPointsRecord
	err = db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&records).Error
	return records, total, err
}
