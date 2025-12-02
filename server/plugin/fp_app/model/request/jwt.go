package request

import (
	jwt "github.com/golang-jwt/jwt/v5"
)

// Custom claims structure
type CustomClaims struct {
	WxClaims
	BufferTime int64
	jwt.RegisteredClaims
}

type WxClaims struct {
	UserId   uint
	Openid   string
	NickName string
}
