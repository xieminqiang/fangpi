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
type WxUserResponse struct {
	User      model.WxUser `json:"user"`
	Token     string       `json:"token"`
	ExpiresAt int64        `json:"expiresAt"`
}
