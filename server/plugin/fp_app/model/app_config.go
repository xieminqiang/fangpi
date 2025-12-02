package model

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// BreakAppConfig 小程序配置 结构体
type BreakAppConfig struct {
	global.GVA_MODEL
	ConfigKey   string `json:"config_key" form:"config_key" gorm:"size:100;not null;uniqueIndex;comment:配置键"`   // 配置键
	ConfigValue string `json:"config_value" form:"config_value" gorm:"type:text;comment:配置值"`                  // 配置值
	Description string `json:"description" form:"description" gorm:"size:500;comment:配置描述"`                    // 配置描述
}

// TableName 小程序配置 BreakAppConfig自定义表名 break_app_config
func (BreakAppConfig) TableName() string {
	return "break_app_config"
}

