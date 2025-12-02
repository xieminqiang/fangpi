package api

import (
	"strconv"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	fpRequest "github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var AudioLibrary = new(audioLibrary)

type audioLibrary struct{}

// CreateAudioLibrary 创建音频库
// @Tags BreakApp
// @Summary 创建音频库
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakAudioLibrary true "音频库信息"
// @Success 200 {object} response.Response{data=model.BreakAudioLibrary,msg=string} "创建成功"
// @Router /break/audioLibrary [post]
func (a *audioLibrary) CreateAudioLibrary(c *gin.Context) {
	var audioLibrary model.BreakAudioLibrary
	err := c.ShouldBindJSON(&audioLibrary)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	result, err := service.Service.AudioLibrary.CreateAudioLibrary(c.Request.Context(), &audioLibrary)
	if err != nil {
		global.GVA_LOG.Error("创建音频库失败", zap.Error(err))
		response.FailWithMessage("创建失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "创建成功", c)
}

// DeleteAudioLibrary 删除音频库
// @Tags BreakApp
// @Summary 删除音频库
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "音频库ID"
// @Success 200 {object} response.Response{msg=string} "删除成功"
// @Router /break/audioLibrary/{id} [delete]
func (a *audioLibrary) DeleteAudioLibrary(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	err = service.Service.AudioLibrary.DeleteAudioLibrary(c.Request.Context(), uint(id))
	if err != nil {
		global.GVA_LOG.Error("删除音频库失败", zap.Error(err))
		response.FailWithMessage("删除失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// UpdateAudioLibrary 更新音频库
// @Tags BreakApp
// @Summary 更新音频库
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakAudioLibrary true "音频库信息"
// @Success 200 {object} response.Response{data=model.BreakAudioLibrary,msg=string} "更新成功"
// @Router /break/audioLibrary [put]
func (a *audioLibrary) UpdateAudioLibrary(c *gin.Context) {
	var audioLibrary model.BreakAudioLibrary
	err := c.ShouldBindJSON(&audioLibrary)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	result, err := service.Service.AudioLibrary.UpdateAudioLibrary(c.Request.Context(), &audioLibrary)
	if err != nil {
		global.GVA_LOG.Error("更新音频库失败", zap.Error(err))
		response.FailWithMessage("更新失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "更新成功", c)
}

// GetAudioLibrary 根据ID获取音频库
// @Tags BreakApp
// @Summary 根据ID获取音频库
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "音频库ID"
// @Success 200 {object} response.Response{data=model.BreakAudioLibrary,msg=string} "获取成功"
// @Router /break/audioLibrary/{id} [get]
func (a *audioLibrary) GetAudioLibrary(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	result, err := service.Service.AudioLibrary.GetAudioLibrary(c.Request.Context(), uint(id))
	if err != nil {
		global.GVA_LOG.Error("获取音频库失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "获取成功", c)
}

// GetAudioLibraryList 分页获取音频库列表
// @Tags BreakApp
// @Summary 分页获取音频库列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body fpRequest.AudioLibrarySearch true "分页获取音频库列表"
// @Success 200 {object} response.Response{data=response.PageResult{list=[]model.BreakAudioLibrary},msg=string} "获取成功"
// @Router /break/audioLibrary/list [post]
func (a *audioLibrary) GetAudioLibraryList(c *gin.Context) {
	var pageInfo fpRequest.AudioLibrarySearch
	err := c.ShouldBindJSON(&pageInfo)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	list, total, err := service.Service.AudioLibrary.GetAudioLibraryList(c.Request.Context(), &pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取音频库列表失败", zap.Error(err))
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

// GetAllAudioLibraries 获取所有音频库
// @Tags BreakApp
// @Summary 获取所有音频库
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=[]model.BreakAudioLibrary,msg=string} "获取成功"
// @Router /break/audioLibrary/all [get]
func (a *audioLibrary) GetAllAudioLibraries(c *gin.Context) {
	list, err := service.Service.AudioLibrary.GetAllAudioLibraries(c.Request.Context())
	if err != nil {
		global.GVA_LOG.Error("获取所有音频库失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(list, "获取成功", c)
}

// GetAudioLibraryFeed 获取屁趣音效小程序的音频库列表（支持分页）
// @Tags BreakApp
// @Summary 获取屁趣音效小程序的音频库列表（支持分页）
// @Accept application/json
// @Produce application/json
// @Param page query int false "页码，默认1"
// @Param pageSize query int false "每页数量，默认20"
// @Success 200 {object} response.Response{data=service.AudioFeedResponse,msg=string} "获取成功"
// @Router /break/audioLibrary/feed [get]
func (a *audioLibrary) GetAudioLibraryFeed(c *gin.Context) {
	var pageInfo request.PageInfo
	if err := c.ShouldBindQuery(&pageInfo); err != nil {
		// 如果参数解析失败，使用默认值
		pageInfo.Page = 1
		pageInfo.PageSize = 20
	}
	
	// 设置默认值
	if pageInfo.Page <= 0 {
		pageInfo.Page = 1
	}
	if pageInfo.PageSize <= 0 {
		pageInfo.PageSize = 20
	}
	// 限制最大每页数量
	if pageInfo.PageSize > 100 {
		pageInfo.PageSize = 100
	}

	feed, err := service.Service.AudioLibrary.GetAudioLibraryFeed(c.Request.Context(), pageInfo.Page, pageInfo.PageSize)
	if err != nil {
		global.GVA_LOG.Error("获取屁趣音效音频库失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(feed, "获取成功", c)
}
