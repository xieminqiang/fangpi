package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// StringArray 字符串数组类型，用于存储音频标签
type StringArray []string

// Value 实现 driver.Valuer 接口，用于写入数据库
func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "[]", nil
	}
	return json.Marshal(a)
}

// Scan 实现 sql.Scanner 接口，用于从数据库读取
func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = StringArray{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("failed to unmarshal StringArray value")
	}

	return json.Unmarshal(bytes, a)
}

// BreakAudioLibrary 放屁音频库 结构体
type BreakAudioLibrary struct {
	global.GVA_MODEL
	Name        string     `json:"name" form:"name" gorm:"column:name;size:100;comment:音频名字"`                    // 音频名字
	Url         string     `json:"url" form:"url" gorm:"column:url;size:500;comment:音频URL"`                      // 音频URL
	Tags        StringArray `json:"tags" form:"tags" gorm:"type:json;column:tags;comment:音频标签"`                  // 音频标签（多个）
	Image       string     `json:"image" form:"image" gorm:"column:image;size:500;comment:音频图片"`                 // 音频图片
	Description string     `json:"description" form:"description" gorm:"column:description;type:text;comment:音频描述"` // 音频描述
	ClassName   string     `json:"class_name" form:"class_name" gorm:"column:class_name;size:50;comment:分类名称"`  // 分类名称
}

// TableName 放屁音频库 BreakAudioLibrary自定义表名 break_audio_library
func (BreakAudioLibrary) TableName() string {
	return "break_audio_library"
}

