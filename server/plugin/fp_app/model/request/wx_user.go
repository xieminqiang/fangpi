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
	request.PageInfo
}
type WxLoginRequest struct {
	Code string `json:"code" form:"code" binding:"required"`
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
