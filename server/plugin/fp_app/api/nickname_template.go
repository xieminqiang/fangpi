package api

import (
	"strconv"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	modelRequest "github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var NicknameTemplate = new(nicknameTemplate)

type nicknameTemplate struct{}

// CreateNicknameTemplate 创建昵称模板
// @Tags BreakApp
// @Summary 创建昵称模板
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakNicknameTemplate true "昵称模板信息"
// @Success 200 {object} response.Response{data=model.BreakNicknameTemplate,msg=string} "创建成功"
// @Router /break/nicknameTemplate [post]
func (a *nicknameTemplate) CreateNicknameTemplate(c *gin.Context) {
	var template model.BreakNicknameTemplate
	err := c.ShouldBindJSON(&template)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	result, err := service.Service.NicknameTemplate.CreateNicknameTemplate(c.Request.Context(), &template)
	if err != nil {
		global.GVA_LOG.Error("创建昵称模板失败", zap.Error(err))
		response.FailWithMessage("创建失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "创建成功", c)
}

// DeleteNicknameTemplate 删除昵称模板
// @Tags BreakApp
// @Summary 删除昵称模板
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "昵称模板ID"
// @Success 200 {object} response.Response{msg=string} "删除成功"
// @Router /break/nicknameTemplate/{id} [delete]
func (a *nicknameTemplate) DeleteNicknameTemplate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	err = service.Service.NicknameTemplate.DeleteNicknameTemplate(c.Request.Context(), uint(id))
	if err != nil {
		global.GVA_LOG.Error("删除昵称模板失败", zap.Error(err))
		response.FailWithMessage("删除失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// DeleteNicknameTemplateByIds 批量删除昵称模板
// @Tags BreakApp
// @Summary 批量删除昵称模板
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param ids body request.IdsReq true "昵称模板ID列表"
// @Success 200 {object} response.Response{msg=string} "批量删除成功"
// @Router /break/nicknameTemplate/deleteByIds [delete]
func (a *nicknameTemplate) DeleteNicknameTemplateByIds(c *gin.Context) {
	var idsReq request.IdsReq
	err := c.ShouldBindJSON(&idsReq)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 将 []int 转换为 []uint
	ids := make([]uint, len(idsReq.Ids))
	for i, id := range idsReq.Ids {
		ids[i] = uint(id)
	}

	err = service.Service.NicknameTemplate.DeleteNicknameTemplateByIds(c.Request.Context(), ids)
	if err != nil {
		global.GVA_LOG.Error("批量删除昵称模板失败", zap.Error(err))
		response.FailWithMessage("批量删除失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("批量删除成功", c)
}

// UpdateNicknameTemplate 更新昵称模板
// @Tags BreakApp
// @Summary 更新昵称模板
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakNicknameTemplate true "昵称模板信息"
// @Success 200 {object} response.Response{data=model.BreakNicknameTemplate,msg=string} "更新成功"
// @Router /break/nicknameTemplate [put]
func (a *nicknameTemplate) UpdateNicknameTemplate(c *gin.Context) {
	var template model.BreakNicknameTemplate
	err := c.ShouldBindJSON(&template)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	result, err := service.Service.NicknameTemplate.UpdateNicknameTemplate(c.Request.Context(), &template)
	if err != nil {
		global.GVA_LOG.Error("更新昵称模板失败", zap.Error(err))
		response.FailWithMessage("更新失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "更新成功", c)
}

// GetNicknameTemplateList 分页获取昵称模板列表
// @Tags BreakApp
// @Summary 分页获取昵称模板列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页数量" default(10)
// @Param name query string false "昵称名称（模糊搜索）"
// @Success 200 {object} response.Response{data=response.PageResult{list=[]model.BreakNicknameTemplate},msg=string} "获取成功"
// @Router /break/nicknameTemplate/list [get]
func (a *nicknameTemplate) GetNicknameTemplateList(c *gin.Context) {
	var pageInfo modelRequest.NicknameTemplateSearch
	// 从查询参数获取分页信息
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("pageSize", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	pageInfo.Page = page
	pageInfo.PageSize = pageSize
	pageInfo.Name = c.Query("name")

	list, total, err := service.Service.NicknameTemplate.GetNicknameTemplateList(c.Request.Context(), &pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取昵称模板列表失败", zap.Error(err))
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
