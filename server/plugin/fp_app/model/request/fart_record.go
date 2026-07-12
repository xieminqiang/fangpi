package request

import (
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
)

// FartRecordSearch 放屁记录搜索结构体
type FartRecordSearch struct {
	request.PageInfo
	UserId         *uint      `json:"userId" form:"userId"`
	FartType       string     `json:"fartType" form:"fartType"`
	SmellLevel     *int       `json:"smellLevel" form:"smellLevel"`
	Mood           string     `json:"mood" form:"mood"`
	VolumeLevel    string     `json:"volumeLevel" form:"volumeLevel"`
	TimePeriod     string     `json:"timePeriod" form:"timePeriod"`
	NoteStatus     string     `json:"noteStatus" form:"noteStatus"` // with-有备注, without-无备注
	FartDateRange  []string   `json:"fartDateRange" form:"fartDateRange[]"`
	CreatedAtRange []time.Time `json:"createdAtRange" form:"createdAtRange[]"`
}

// FartTogetherRecordSearch 邀请放屁记录搜索结构体
type FartTogetherRecordSearch struct {
	request.PageInfo
	InviterId      *uint      `json:"inviterId" form:"inviterId"`
	InviteeId      *uint      `json:"inviteeId" form:"inviteeId"`
	Status         string     `json:"status" form:"status"` // pending-待加入, completed-已完成
	CreatedAtRange []time.Time `json:"createdAtRange" form:"createdAtRange[]"`
}
