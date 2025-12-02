package service

import (
	"context"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
)

var AppConfig = new(appConfig)

type appConfig struct{}

// GetConfig 获取配置值
func (s *appConfig) GetConfig(ctx context.Context, configKey string) (string, error) {
	var config model.BreakAppConfig
	err := global.GVA_DB.Where("config_key = ?", configKey).First(&config).Error
	if err != nil {
		// 如果配置不存在，返回默认值
		if configKey == "show_fart_encyclopedia_entry" {
			return "true", nil // 默认显示
		}
		return "", err
	}
	return config.ConfigValue, nil
}

// SetConfig 设置配置值
func (s *appConfig) SetConfig(ctx context.Context, configKey, configValue, description string) error {
	var config model.BreakAppConfig
	
	// 先查询是否存在
	err := global.GVA_DB.Where("config_key = ?", configKey).First(&config).Error
	if err != nil {
		// 不存在则创建
		config = model.BreakAppConfig{
			ConfigKey:   configKey,
			ConfigValue: configValue,
			Description: description,
		}
		return global.GVA_DB.Create(&config).Error
	}
	
	// 存在则更新
	config.ConfigValue = configValue
	if description != "" {
		config.Description = description
	}
	return global.GVA_DB.Save(&config).Error
}

// GetShowFartEncyclopediaEntry 获取是否显示"屁的全家族大全"入口
func (s *appConfig) GetShowFartEncyclopediaEntry(ctx context.Context) (bool, error) {
	value, err := s.GetConfig(ctx, "show_fart_encyclopedia_entry")
	if err != nil {
		return true, nil // 默认显示
	}
	return value == "true", nil
}

// SetShowFartEncyclopediaEntry 设置是否显示"屁的全家族大全"入口
func (s *appConfig) SetShowFartEncyclopediaEntry(ctx context.Context, show bool) error {
	value := "false"
	if show {
		value = "true"
	}
	return s.SetConfig(ctx, "show_fart_encyclopedia_entry", value, "是否在小程序'我的'页面显示'屁的全家族大全'入口")
}

