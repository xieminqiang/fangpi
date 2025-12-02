package api

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	systemReq "github.com/flipped-aurora/gin-vue-admin/server/model/system/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

var AiReviewApi = new(aiReviewApi)

type aiReviewApi struct{}

// GetAiPersonalityReview 获取AI个性点评
// @Tags BreakApp
// @Summary 获取AI个性点评
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=service.AiReviewResponse,msg=string} "获取成功"
// @Router /break/ai/review [get]
func (a *aiReviewApi) GetAiPersonalityReview(c *gin.Context) {
	// 获取用户ID
	userID := getAiReviewUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 调用服务层获取AI点评
	result, err := service.Service.AiReview.GetPersonalityReview(c.Request.Context(), userID)
	if err != nil {
		global.GVA_LOG.Error("获取AI个性点评失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithData(result, c)
}

// RefreshAiPersonalityReview 刷新AI个性点评
// @Tags BreakApp
// @Summary 刷新AI个性点评
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=service.AiReviewResponse,msg=string} "刷新成功"
// @Router /break/ai/review/refresh [post]
func (a *aiReviewApi) RefreshAiPersonalityReview(c *gin.Context) {
	// 获取用户ID
	userID := getAiReviewUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 调用服务层刷新AI点评
	result, err := service.Service.AiReview.RefreshPersonalityReview(c.Request.Context(), userID)
	if err != nil {
		global.GVA_LOG.Error("刷新AI个性点评失败", zap.Error(err))
		response.FailWithMessage("刷新失败: "+err.Error(), c)
		return
	}

	response.OkWithData(result, c)
}

// getAiReviewUserIdFromToken 从Token中获取用户ID（辅助函数）
func getAiReviewUserIdFromToken(c *gin.Context) uint {
	token := c.Request.Header.Get("x-token")
	if token == "" {
		token, _ = c.Cookie("x-token")
	}

	if token == "" {
		return 0
	}

	// 先尝试解析插件token
	pluginClaims := &request.CustomClaims{}
	jwtToken, err := jwt.ParseWithClaims(token, pluginClaims, func(token *jwt.Token) (interface{}, error) {
		return []byte(global.GVA_CONFIG.JWT.SigningKey), nil
	})

	if err == nil && jwtToken.Valid {
		if c, ok := jwtToken.Claims.(*request.CustomClaims); ok {
			// 如果是用户端token，使用WxClaims.UserId
			if c.WxClaims.UserId > 0 {
				return c.WxClaims.UserId
			}
		}
	}

	// 如果插件token解析失败，尝试解析系统token
	systemClaims := &systemReq.CustomClaims{}
	jwtToken, err = jwt.ParseWithClaims(token, systemClaims, func(token *jwt.Token) (interface{}, error) {
		return []byte(global.GVA_CONFIG.JWT.SigningKey), nil
	})

	if err == nil && jwtToken.Valid {
		if c, ok := jwtToken.Claims.(*systemReq.CustomClaims); ok {
			// 如果是管理后台token，使用BaseClaims.ID
			if c.BaseClaims.ID > 0 {
				return c.BaseClaims.ID
			}
		}
	}

	return 0
}
