package middleware

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/utils"
	"github.com/gin-gonic/gin"
)

// WxJWTAuth 小程序/用户端 JWT 鉴权（解析 wxuser/xhsQuickLogin 等颁发的 token，与后台 JWTAuth 的 claims 结构不同）
func WxJWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Request.Header.Get("x-token")
		if token == "" {
			token, _ = c.Cookie("x-token")
		}
		if token == "" {
			response.NoAuth("未登录或非法访问，请登录", c)
			c.Abort()
			return
		}
		j := utils.NewJWT()
		claims, err := j.ParseToken(token)
		if err != nil {
			response.NoAuth("登录已过期或无效，请重新登录", c)
			c.Abort()
			return
		}
		c.Set("claims", claims)
		c.Next()
	}
}

// GetWxClaims 从 context 获取小程序端 claims（仅在与 WxJWTAuth 配合使用时有效）
func GetWxClaims(c *gin.Context) (*request.CustomClaims, bool) {
	v, ok := c.Get("claims")
	if !ok {
		return nil, false
	}
	claims, ok := v.(*request.CustomClaims)
	return claims, ok
}
