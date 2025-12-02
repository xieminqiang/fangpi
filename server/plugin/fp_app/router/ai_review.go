package router

import (
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/api"
	"github.com/gin-gonic/gin"
)

type AiReviewRouter struct{}

// InitAiReviewRouter 初始化AI点评路由
func (s *AiReviewRouter) InitAiReviewRouter(Router *gin.RouterGroup) {
	aiReviewRouter := Router.Group("ai")
	{
		aiReviewRouter.GET("review", api.Api.AiReview.GetAiPersonalityReview)              // 获取AI个性点评
		aiReviewRouter.POST("review/refresh", api.Api.AiReview.RefreshAiPersonalityReview) // 刷新AI个性点评
	}
}
