package request

import (
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
)

type WxUserSearch struct {
	CreatedAtRange []time.Time `json:"createdAtRange" form:"createdAtRange[]"`
	Nickname       *string     `json:"nickname" form:"nickname"`
	Phone          *string     `json:"phone" form:"phone"`
	Status         *string     `json:"status" form:"status"`
	Gender         *string     `json:"gender" form:"gender"`
	Level          *int        `json:"level" form:"level"`
	UserType       *int        `json:"userType" form:"userType"`
	request.PageInfo
}
type WxLoginRequest struct {
	Code string `json:"code" form:"code" binding:"required"`
}

// XhsLoginRequest 小红书快速登录请求（与微信快速登录一致，传 code）
type XhsLoginRequest struct {
	Code string `json:"code" form:"code" binding:"required"` // xhs.login 获取的 code
}

// OpenidLoginRequest OpenID 登录请求
type OpenidLoginRequest struct {
	Openid string `json:"openid" form:"openid" binding:"required"` // 微信 openid
}

type WxRegisterRequest struct {
	Code     string `json:"code" form:"code" binding:"required"`
	Nickname string `json:"nickname" form:"nickname"`
	Avatar   string `json:"avatar" form:"avatar"`
	GetPhoneNumberRequest
}
type GetPhoneNumberRequest struct {
	Openid        string `json:"openid"`
	EncryptedData string `json:"encryptedData"`
	IV            string `json:"iv"`
}

// SetUserAudioUrlRequest 设置用户音频URL请求
type SetUserAudioUrlRequest struct {
	AudioUrl string `json:"audioUrl" form:"audioUrl" binding:"required"` // 音频URL
}

// UpdateUserInfoRequest 更新用户信息请求（小程序用户端）
type UpdateUserInfoRequest struct {
	Nickname *string `json:"nickname" form:"nickname"` // 昵称
	Avatar   string  `json:"avatar" form:"avatar"`     // 头像URL
}

// UpdateUserPointsRequest 更新用户积分请求
type UpdateUserPointsRequest struct {
	Points    int    `json:"points" form:"points" binding:"required"`     // 积分数量（正数表示增加，负数表示扣除）
	PointsType int   `json:"pointsType" form:"pointsType" binding:"required"` // 积分类型:1-增加积分,2-扣除积分
	Remark    string `json:"remark" form:"remark"`                        // 备注说明
}

// CreatePointsRecordRequest 创建积分记录请求
type CreatePointsRecordRequest struct {
	UserId    uint   `json:"userId" form:"userId" binding:"required"`    // 用户ID
	Points    int    `json:"points" form:"points" binding:"required"`    // 积分数量（扣除或增加）
	PointsType int   `json:"pointsType" form:"pointsType" binding:"required"` // 积分类型:1-增加积分,2-扣除积分
	Remark    string `json:"remark" form:"remark"`                        // 备注说明
}

// GetPointsRecordsRequest 获取积分记录请求
type GetPointsRecordsRequest struct {
	Page     int `json:"page" form:"page"`         // 页码
	PageSize int `json:"pageSize" form:"pageSize"` // 每页数量
	request.PageInfo
}
