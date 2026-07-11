package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// FartRecordInfo 放屁记录信息结构
type FartRecordInfo struct {
	ID          int    `json:"id"`
	FartType    string `json:"fartType"`
	Mood        string `json:"mood"`
	SmellLevel  int    `json:"smellLevel"`
	VolumeLevel string `json:"volumeLevel,omitempty"` // 放屁当量：large-大当量、medium-中当量、small-小当量、micro-微单量
}

// Value 实现 driver.Valuer 接口，用于写入数据库
func (f FartRecordInfo) Value() (driver.Value, error) {
	return json.Marshal(f)
}

// Scan 实现 sql.Scanner 接口，用于从数据库读取
func (f *FartRecordInfo) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to unmarshal FartRecordInfo value")
	}

	return json.Unmarshal(bytes, f)
}

// BreakFartTogetherRecord 屁友一起打屁记录 结构体
type BreakFartTogetherRecord struct {
	global.GVA_MODEL
	InviterId         uint           `json:"inviterId" form:"inviterId" gorm:"not null;index;comment:邀请人的用户ID"`                        //邀请人的用户ID
	InviteeId         uint           `json:"inviteeId" form:"inviteeId" gorm:"not null;index;comment:被邀请人的用户ID"`                       //被邀请人的用户ID
	InviterSex        int            `json:"inviterSex" form:"inviterSex" gorm:"not null;comment:邀请人的性别：1为男，2为女"`                      //邀请人的性别：1为男，2为女
	InviteeSex        int            `json:"inviteeSex" form:"inviteeSex" gorm:"not null;comment:被邀请人的性别：1为男，2为女"`                     //被邀请人的性别：1为男，2为女
	InviterRecordId   uint           `json:"inviterRecordId" form:"inviterRecordId" gorm:"not null;comment:邀请人的放屁记录ID"`                //邀请人的放屁记录ID
	InviteeRecordId   uint           `json:"inviteeRecordId" form:"inviteeRecordId" gorm:"not null;comment:被邀请人的放屁记录ID"`               //被邀请人的放屁记录ID
	InviterRecordInfo FartRecordInfo `json:"inviterRecordInfo" form:"inviterRecordInfo" gorm:"type:json;not null;comment:邀请人的放屁记录信息"`  //邀请人的放屁记录信息，JSON格式
	InviteeRecordInfo FartRecordInfo `json:"inviteeRecordInfo" form:"inviteeRecordInfo" gorm:"type:json;not null;comment:被邀请人的放屁记录信息"` //被邀请人的放屁记录信息，JSON格式
}

// TableName 屁友一起打屁记录 BreakFartTogetherRecord自定义表名 break_fart_together_record
func (BreakFartTogetherRecord) TableName() string {
	return "break_fart_together_record"
}
