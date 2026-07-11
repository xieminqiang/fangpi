package model

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// BreakNicknameTemplate 昵称模板 结构体
type BreakNicknameTemplate struct {
	global.GVA_MODEL
	Name  string `json:"name" form:"name" gorm:"column:name;size:50;comment:昵称名称;not null"` // 昵称名称
	Image string `json:"image" form:"image" gorm:"column:image;size:500;comment:昵称图片"`      // 昵称图片
}

// TableName 昵称模板 BreakNicknameTemplate自定义表名 break_nickname_template
func (BreakNicknameTemplate) TableName() string {
	return "break_nickname_template"
}
