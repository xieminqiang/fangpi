package service

import (
	"context"
	"errors"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"gorm.io/gorm"
)

var LevelConfig = new(levelConfig)

type levelConfig struct{}

// CreateLevelConfig 创建等级配置
func (s *levelConfig) CreateLevelConfig(ctx context.Context, levelConfig *model.BreakLevelConfig) (*model.BreakLevelConfig, error) {
	// 检查等级是否已存在
	var existingConfig model.BreakLevelConfig
	if err := global.GVA_DB.Where("level = ?", levelConfig.Level).First(&existingConfig).Error; err == nil {
		return nil, errors.New("该等级已存在")
	}

	// 确保时间字段被正确设置
	now := time.Now()
	levelConfig.CreatedAt = now
	levelConfig.UpdatedAt = now
	levelConfig.ID = 0 // 确保ID为0，让数据库自动生成

	// 创建等级配置
	if err := global.GVA_DB.Create(levelConfig).Error; err != nil {
		return nil, err
	}

	return levelConfig, nil
}

// DeleteLevelConfig 删除等级配置
func (s *levelConfig) DeleteLevelConfig(ctx context.Context, id uint) error {
	// 检查是否有用户正在使用该等级
	var userCount int64
	if err := global.GVA_DB.Model(&model.WxUser{}).Where("level = ?", id).Count(&userCount).Error; err != nil {
		return err
	}
	if userCount > 0 {
		return errors.New("该等级正在被用户使用，无法删除")
	}

	// 删除等级配置
	if err := global.GVA_DB.Delete(&model.BreakLevelConfig{}, id).Error; err != nil {
		return err
	}

	return nil
}

// UpdateLevelConfig 更新等级配置
func (s *levelConfig) UpdateLevelConfig(ctx context.Context, levelConfig *model.BreakLevelConfig) (*model.BreakLevelConfig, error) {
	// 检查等级是否已存在（排除自己）
	var existingConfig model.BreakLevelConfig
	if err := global.GVA_DB.Where("level = ? AND id != ?", levelConfig.Level, levelConfig.ID).First(&existingConfig).Error; err == nil {
		return nil, errors.New("该等级已存在")
	}

	// 使用 Updates 方法而不是 Save，避免时间字段问题
	updates := map[string]interface{}{
		"level":          levelConfig.Level,
		"level_name":     levelConfig.LevelName,
		"level_emoji":    levelConfig.LevelEmoji,
		"level_image":    levelConfig.LevelImage,
		"required_exp":   levelConfig.RequiredExp,
		"required_farts": levelConfig.RequiredFarts,
		"required_days":  levelConfig.RequiredDays,
		"updated_at":     time.Now(),
	}

	// 更新等级配置
	if err := global.GVA_DB.Model(&model.BreakLevelConfig{}).Where("id = ?", levelConfig.ID).Updates(updates).Error; err != nil {
		return nil, err
	}

	// 重新查询更新后的数据
	if err := global.GVA_DB.Where("id = ?", levelConfig.ID).First(levelConfig).Error; err != nil {
		return nil, err
	}

	return levelConfig, nil
}

// GetLevelConfig 根据ID获取等级配置
func (s *levelConfig) GetLevelConfig(ctx context.Context, id uint) (*model.BreakLevelConfig, error) {
	var levelConfig model.BreakLevelConfig
	if err := global.GVA_DB.Where("id = ?", id).First(&levelConfig).Error; err != nil {
		return nil, err
	}

	return &levelConfig, nil
}

// GetLevelConfigList 分页获取等级配置列表
func (s *levelConfig) GetLevelConfigList(ctx context.Context, pageInfo *request.LevelConfigSearch) (list []model.BreakLevelConfig, total int64, err error) {
	limit := pageInfo.PageSize
	offset := pageInfo.PageSize * (pageInfo.Page - 1)
	db := global.GVA_DB.Model(&model.BreakLevelConfig{})

	// 构建查询条件
	if pageInfo.Level > 0 {
		db = db.Where("level = ?", pageInfo.Level)
	}
	if pageInfo.LevelName != "" {
		db = db.Where("level_name LIKE ?", "%"+pageInfo.LevelName+"%")
	}
	if pageInfo.RequiredExp > 0 {
		db = db.Where("required_exp = ?", pageInfo.RequiredExp)
	}
	if pageInfo.RequiredFarts > 0 {
		db = db.Where("required_farts = ?", pageInfo.RequiredFarts)
	}
	if pageInfo.RequiredDays > 0 {
		db = db.Where("required_days = ?", pageInfo.RequiredDays)
	}

	// 获取总数
	if err = db.Count(&total).Error; err != nil {
		return
	}

	// 获取列表
	err = db.Limit(limit).Offset(offset).Order("level ASC").Find(&list).Error
	return list, total, err
}

// GetAllLevelConfigs 获取所有等级配置
func (s *levelConfig) GetAllLevelConfigs(ctx context.Context) ([]model.BreakLevelConfig, error) {
	var list []model.BreakLevelConfig
	if err := global.GVA_DB.Order("level ASC").Find(&list).Error; err != nil {
		return nil, err
	}

	return list, nil
}

// GetLevelConfigByLevel 根据等级获取配置
func (s *levelConfig) GetLevelConfigByLevel(ctx context.Context, level int) (*model.BreakLevelConfig, error) {
	var levelConfig model.BreakLevelConfig
	if err := global.GVA_DB.Where("level = ?", level).First(&levelConfig).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("等级配置不存在")
		}
		return nil, err
	}

	return &levelConfig, nil
}
