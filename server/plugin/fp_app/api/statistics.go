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

var StatisticsApi = new(statisticsApi)

type statisticsApi struct{}

// GetTrendData 获取趋势数据
// @Tags BreakApp
// @Summary 获取趋势数据（日/周/月）
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param type query string false "统计类型：day-日，week-周，month-月" default(day)
// @Success 200 {object} response.Response{data=service.TrendDataResponse,msg=string} "获取成功"
// @Router /break/statistics/trend [get]
func (a *statisticsApi) GetTrendData(c *gin.Context) {
	// 获取用户ID
	userID := getStatUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 获取统计类型（默认为day）
	statType := c.DefaultQuery("type", "day")

	// 调用服务层
	result, err := service.Service.Statistics.GetTrendData(c.Request.Context(), userID, statType)
	if err != nil {
		global.GVA_LOG.Error("获取趋势数据失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithData(result, c)
}

// GetStatisticsSummary 获取统计小结
// @Tags BreakApp
// @Summary 获取统计小结
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param type query string false "统计类型：day-日，week-周，month-月" default(day)
// @Success 200 {object} response.Response{data=service.StatisticsSummaryResponse,msg=string} "获取成功"
// @Router /break/statistics/summary [get]
func (a *statisticsApi) GetStatisticsSummary(c *gin.Context) {
	// 获取用户ID
	userID := getStatUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 获取统计类型（默认为day）
	statType := c.DefaultQuery("type", "day")

	// 调用服务层
	result, err := service.Service.Statistics.GetStatisticsSummary(c.Request.Context(), userID, statType)
	if err != nil {
		global.GVA_LOG.Error("获取统计小结失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithData(result, c)
}

// getStatUserIdFromToken 从Token中获取用户ID（辅助函数）
func getStatUserIdFromToken(c *gin.Context) uint {
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
