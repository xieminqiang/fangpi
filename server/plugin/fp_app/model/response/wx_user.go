package response

import (
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
)

type WxLoginResponse struct {
	OpenID     string `json:"openID"`
	SessionKey string `json:"sessionKey"`
}
type WxSessionResponse struct {
	OpenID     string `json:"openid"`
	SessionKey string `json:"session_key"`
	ErrCode    int    `json:"errcode"`
	ErrMsg     string `json:"errmsg"`
}

// XhsTokenResponse 小红书获取 access_token 响应
type XhsTokenResponse struct {
	Data    XhsTokenData `json:"data"`
	Success bool         `json:"success"`
	Msg     string       `json:"msg"`
	Code    int          `json:"code"`
}
type XhsTokenData struct {
	AccessToken string `json:"access_token"`
	ExpireIn    int    `json:"expire_in"`
}

// XhsSessionResponse 小红书 session 响应（openid + session_key）
type XhsSessionResponse struct {
	Data    XhsSessionData `json:"data"`
	Success bool           `json:"success"`
	Msg     string         `json:"msg"`
	Code    int            `json:"code"`
}
type XhsSessionData struct {
	OpenID     string `json:"openid"`
	SessionKey string `json:"session_key"`
}
type WxUserResponse struct {
	User      model.WxUser `json:"user"`
	Token     string       `json:"token"`
	ExpiresAt int64        `json:"expiresAt"`
}
