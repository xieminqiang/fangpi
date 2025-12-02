package api

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var AppConfig = new(appConfig)

type appConfig struct{}

// GetShowFartEncyclopediaEntry 获取是否显示"屁的全家族大全"入口
// @Tags BreakApp
// @Summary 获取是否显示"屁的全家族大全"入口
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=bool,msg=string} "获取成功"
// @Router /break/appConfig/showFartEncyclopediaEntry [get]
func (a *appConfig) GetShowFartEncyclopediaEntry(c *gin.Context) {
	show, err := service.Service.AppConfig.GetShowFartEncyclopediaEntry(c.Request.Context())
	if err != nil {
		global.GVA_LOG.Error("获取配置失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}
	response.OkWithDetailed(show, "获取成功", c)
}

// SetShowFartEncyclopediaEntry 设置是否显示"屁的全家族大全"入口
// @Tags BreakApp
// @Summary 设置是否显示"屁的全家族大全"入口
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param show body bool true "是否显示"
// @Success 200 {object} response.Response{msg=string} "设置成功"
// @Router /break/appConfig/showFartEncyclopediaEntry [put]
func (a *appConfig) SetShowFartEncyclopediaEntry(c *gin.Context) {
	var req struct {
		Show bool `json:"show"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	err := service.Service.AppConfig.SetShowFartEncyclopediaEntry(c.Request.Context(), req.Show)
	if err != nil {
		global.GVA_LOG.Error("设置配置失败", zap.Error(err))
		response.FailWithMessage("设置失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("设置成功", c)
}

