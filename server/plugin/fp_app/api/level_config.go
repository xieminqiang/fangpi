package api

import (
	"strconv"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var LevelConfig = new(levelConfig)

type levelConfig struct{}

// CreateLevelConfig 创建等级配置
// @Tags BreakApp
// @Summary 创建等级配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakLevelConfig true "等级配置信息"
// @Success 200 {object} response.Response{data=model.BreakLevelConfig,msg=string} "创建成功"
// @Router /break/levelConfig [post]
func (a *levelConfig) CreateLevelConfig(c *gin.Context) {
	var levelConfig model.BreakLevelConfig
	err := c.ShouldBindJSON(&levelConfig)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	result, err := service.Service.LevelConfig.CreateLevelConfig(c.Request.Context(), &levelConfig)
	if err != nil {
		global.GVA_LOG.Error("创建等级配置失败", zap.Error(err))
		response.FailWithMessage("创建失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "创建成功", c)
}

// DeleteLevelConfig 删除等级配置
// @Tags BreakApp
// @Summary 删除等级配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "等级配置ID"
// @Success 200 {object} response.Response{msg=string} "删除成功"
// @Router /break/levelConfig/{id} [delete]
func (a *levelConfig) DeleteLevelConfig(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	err = service.Service.LevelConfig.DeleteLevelConfig(c.Request.Context(), uint(id))
	if err != nil {
		global.GVA_LOG.Error("删除等级配置失败", zap.Error(err))
		response.FailWithMessage("删除失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// UpdateLevelConfig 更新等级配置
// @Tags BreakApp
// @Summary 更新等级配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakLevelConfig true "等级配置信息"
// @Success 200 {object} response.Response{data=model.BreakLevelConfig,msg=string} "更新成功"
// @Router /break/levelConfig [put]
func (a *levelConfig) UpdateLevelConfig(c *gin.Context) {
	var levelConfig model.BreakLevelConfig
	err := c.ShouldBindJSON(&levelConfig)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	result, err := service.Service.LevelConfig.UpdateLevelConfig(c.Request.Context(), &levelConfig)
	if err != nil {
		global.GVA_LOG.Error("更新等级配置失败", zap.Error(err))
		response.FailWithMessage("更新失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "更新成功", c)
}

// GetLevelConfig 根据ID获取等级配置
// @Tags BreakApp
// @Summary 根据ID获取等级配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "等级配置ID"
// @Success 200 {object} response.Response{data=model.BreakLevelConfig,msg=string} "获取成功"
// @Router /break/levelConfig/{id} [get]
func (a *levelConfig) GetLevelConfig(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	result, err := service.Service.LevelConfig.GetLevelConfig(c.Request.Context(), uint(id))
	if err != nil {
		global.GVA_LOG.Error("获取等级配置失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "获取成功", c)
}

// GetLevelConfigList 分页获取等级配置列表
// @Tags BreakApp
// @Summary 分页获取等级配置列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body request.LevelConfigSearch true "分页获取等级配置列表"
// @Success 200 {object} response.Response{data=response.PageResult{list=[]model.BreakLevelConfig},msg=string} "获取成功"
// @Router /break/levelConfig/list [post]
func (a *levelConfig) GetLevelConfigList(c *gin.Context) {
	var pageInfo request.LevelConfigSearch
	err := c.ShouldBindJSON(&pageInfo)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	list, total, err := service.Service.LevelConfig.GetLevelConfigList(c.Request.Context(), &pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取等级配置列表失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取成功", c)
}

// GetAllLevelConfigs 获取所有等级配置
// @Tags BreakApp
// @Summary 获取所有等级配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=[]model.BreakLevelConfig,msg=string} "获取成功"
// @Router /break/levelConfig/all [get]
func (a *levelConfig) GetAllLevelConfigs(c *gin.Context) {
	list, err := service.Service.LevelConfig.GetAllLevelConfigs(c.Request.Context())
	if err != nil {
		global.GVA_LOG.Error("获取所有等级配置失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(list, "获取成功", c)
}
