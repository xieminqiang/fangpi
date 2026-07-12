package api

import (
	"fmt"
	"strconv"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var FartTogetherRecord = new(fartTogetherRecord)

type fartTogetherRecord struct{}

// GetLastFartTogetherRecord 获取最近一次屁友一起打屁记录
// @Tags BreakApp
// @Summary 获取最近一次屁友一起打屁记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=service.LastFartTogetherRecordResponse,msg=string} "获取成功，如果没有记录则data为null"
// @Router /break/together/last [get]
func (a *fartTogetherRecord) GetLastFartTogetherRecord(c *gin.Context) {
	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 调用服务层
	result, err := service.Service.FartTogetherRecord.GetLastFartTogetherRecord(c.Request.Context(), userID)
	if err != nil {
		global.GVA_LOG.Error("获取最近一次屁友一起打屁记录失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	// 如果没有记录，返回 null
	if result == nil {
		response.OkWithData(nil, c)
		return
	}

	response.OkWithData(result, c)
}

// GetFartTogetherRecordById 根据ID获取一起打屁记录
// @Tags BreakApp
// @Summary 根据ID获取一起打屁记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "记录ID"
// @Success 200 {object} response.Response{data=service.LastFartTogetherRecordResponse,msg=string} "获取成功，如果没有记录则data为null"
// @Router /break/together/:id [get]
func (a *fartTogetherRecord) GetFartTogetherRecordById(c *gin.Context) {
	// 获取记录ID
	recordId := c.Param("id")
	if recordId == "" {
		response.FailWithMessage("记录ID不能为空", c)
		return
	}

	var id uint
	if _, err := fmt.Sscanf(recordId, "%d", &id); err != nil {
		response.FailWithMessage("记录ID格式错误", c)
		return
	}

	// 调用服务层
	result, err := service.Service.FartTogetherRecord.GetFartTogetherRecordById(c.Request.Context(), id)
	if err != nil {
		global.GVA_LOG.Error("获取一起打屁记录失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	// 如果没有记录，返回 null
	if result == nil {
		response.OkWithData(nil, c)
		return
	}

	response.OkWithData(result, c)
}

// CreateFartTogetherRecordRequest 创建一起打屁记录请求
type CreateFartTogetherRecordRequest struct {
	InviterId         uint                 `json:"inviterId"`         // 邀请人的用户ID（可选，如果不提供则使用token中的用户ID）
	InviteeId         uint                 `json:"inviteeId"`         // 被邀请人的用户ID（选填）
	InviterSex        int                  `json:"inviterSex"`        // 邀请人的性别：1为男，2为女（选填）
	InviteeSex        int                  `json:"inviteeSex"`        // 被邀请人的性别：1为男，2为女（选填）
	InviterRecordInfo model.FartRecordInfo `json:"inviterRecordInfo"` // 邀请人的放屁记录信息（选填）
	InviteeRecordInfo model.FartRecordInfo `json:"inviteeRecordInfo"` // 被邀请人的放屁记录信息（选填）
}

// CreateFartTogetherRecord 创建一起打屁记录
// @Tags BreakApp
// @Summary 创建一起打屁记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body CreateFartTogetherRecordRequest true "记录信息"
// @Success 200 {object} response.Response{msg=string} "创建成功"
// @Router /break/together [post]
func (a *fartTogetherRecord) CreateFartTogetherRecord(c *gin.Context) {
	var req CreateFartTogetherRecordRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 获取用户ID（邀请人）
	// 如果请求中提供了inviterId，使用提供的；否则使用token中的（当前用户）
	inviterId := req.InviterId
	if inviterId == 0 {
		inviterId = getWxUserIdFromToken(c)
		if inviterId == 0 {
			response.FailWithMessage("未登录或Token无效", c)
			return
		}
	}

	// 转换为服务层请求
	serviceReq := &service.CreateFartTogetherRecordRequest{
		InviteeId:  req.InviteeId,
		InviterSex: req.InviterSex,
		InviteeSex: req.InviteeSex,
		InviterRecordInfo: model.FartRecordInfo{
			ID:          req.InviterRecordInfo.ID,
			FartType:    req.InviterRecordInfo.FartType,
			Mood:        req.InviterRecordInfo.Mood,
			SmellLevel:  req.InviterRecordInfo.SmellLevel,
			VolumeLevel: req.InviterRecordInfo.VolumeLevel,
		},
		InviteeRecordInfo: model.FartRecordInfo{
			ID:          req.InviteeRecordInfo.ID,
			FartType:    req.InviteeRecordInfo.FartType,
			Mood:        req.InviteeRecordInfo.Mood,
			SmellLevel:  req.InviteeRecordInfo.SmellLevel,
			VolumeLevel: req.InviteeRecordInfo.VolumeLevel,
		},
	}

	// 调用服务层
	err = service.Service.FartTogetherRecord.CreateFartTogetherRecord(c.Request.Context(), inviterId, serviceReq)
	if err != nil {
		global.GVA_LOG.Error("创建一起打屁记录失败", zap.Error(err))
		response.FailWithMessage("创建失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("创建成功", c)
}

// UpdateFartTogetherRecordRequest 更新一起打屁记录请求
type UpdateFartTogetherRecordRequest struct {
	InviteeRecordInfo model.FartRecordInfo `json:"inviteeRecordInfo"` // 被邀请人的放屁记录信息
	InviterSex        *int                 `json:"inviterSex"`        // 邀请人的性别：1为男，2为女（可选）
	InviteeSex        *int                 `json:"inviteeSex"`        // 被邀请人的性别：1为男，2为女（可选）
}

// UpdateFartTogetherRecord 更新一起打屁记录
// @Tags BreakApp
// @Summary 更新一起打屁记录（更新被邀请人的记录信息）
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "记录ID"
// @Param data body UpdateFartTogetherRecordRequest true "更新信息"
// @Success 200 {object} response.Response{msg=string} "更新成功"
// @Router /break/together/:id [put]
func (a *fartTogetherRecord) UpdateFartTogetherRecord(c *gin.Context) {
	// 获取记录ID
	recordId := c.Param("id")
	if recordId == "" {
		response.FailWithMessage("记录ID不能为空", c)
		return
	}

	var id uint
	if _, err := fmt.Sscanf(recordId, "%d", &id); err != nil {
		response.FailWithMessage("记录ID格式错误", c)
		return
	}

	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	var req UpdateFartTogetherRecordRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	updateReq := &service.UpdateFartTogetherRecordRequest{
		InviteeRecordInfo: model.FartRecordInfo{},
	}
	// 如果提供了记录信息字段，则更新
	if req.InviteeRecordInfo.FartType != "" || req.InviteeRecordInfo.Mood != "" || req.InviteeRecordInfo.SmellLevel != 0 || req.InviteeRecordInfo.VolumeLevel != "" {
		updateReq.InviteeRecordInfo = model.FartRecordInfo{
			ID:          req.InviteeRecordInfo.ID,
			FartType:    req.InviteeRecordInfo.FartType,
			Mood:        req.InviteeRecordInfo.Mood,
			SmellLevel:  req.InviteeRecordInfo.SmellLevel,
			VolumeLevel: req.InviteeRecordInfo.VolumeLevel,
		}
	}
	// 如果提供了性别字段，则更新
	if req.InviterSex != nil {
		updateReq.InviterSex = *req.InviterSex
	}
	if req.InviteeSex != nil {
		updateReq.InviteeSex = *req.InviteeSex
	}
	err = service.Service.FartTogetherRecord.UpdateFartTogetherRecord(c.Request.Context(), id, userID, updateReq)
	if err != nil {
		global.GVA_LOG.Error("更新一起打屁记录失败", zap.Error(err))
		response.FailWithMessage("更新失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// UpdateFartTogetherRecordSexRequest 只更新性别字段的请求
type UpdateFartTogetherRecordSexRequest struct {
	ID         uint `json:"id" binding:"required"`         // 记录ID
	InviterSex int  `json:"inviterSex" binding:"required"` // 邀请人的性别：1为男，2为女
	InviteeSex int  `json:"inviteeSex" binding:"required"` // 被邀请人的性别：1为男，2为女
}

// UpdateFartTogetherRecordSex 只更新性别字段，不改变其他任何数据
// @Tags BreakApp
// @Summary 只更新性别字段
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body UpdateFartTogetherRecordSexRequest true "性别信息（包含记录ID）"
// @Success 200 {object} response.Response{msg=string} "更新成功"
// @Router /break/together/sex [post]
func (a *fartTogetherRecord) UpdateFartTogetherRecordSex(c *gin.Context) {
	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	var req UpdateFartTogetherRecordSexRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 验证必填字段
	if req.ID == 0 {
		response.FailWithMessage("记录ID不能为空", c)
		return
	}
	if req.InviterSex == 0 {
		response.FailWithMessage("邀请人性别不能为空", c)
		return
	}
	if req.InviteeSex == 0 {
		response.FailWithMessage("被邀请人性别不能为空", c)
		return
	}

	// 调用服务层，只更新性别字段
	err = service.Service.FartTogetherRecord.UpdateFartTogetherRecordSex(c.Request.Context(), req.ID, userID, req.InviterSex, req.InviteeSex)
	if err != nil {
		global.GVA_LOG.Error("更新性别字段失败", zap.Error(err))
		response.FailWithMessage("更新失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// GetFartTogetherRecordList 管理端分页获取邀请放屁记录
// @Tags BreakApp
// @Summary 管理端分页获取邀请放屁记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body request.FartTogetherRecordSearch true "分页获取邀请放屁记录"
// @Success 200 {object} response.Response{data=object,msg=string} "获取成功"
// @Router /break/fartTogetherRecord/list [post]
func (a *fartTogetherRecord) GetFartTogetherRecordList(c *gin.Context) {
	var pageInfo request.FartTogetherRecordSearch
	if err := c.ShouldBindJSON(&pageInfo); err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	list, total, summary, err := service.Service.FartTogetherRecord.GetFartTogetherRecordList(c.Request.Context(), &pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取邀请放屁记录列表失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(gin.H{
		"list":     list,
		"total":    total,
		"page":     pageInfo.Page,
		"pageSize": pageInfo.PageSize,
		"summary":  summary,
	}, "获取成功", c)
}

// GetFartTogetherRecord 管理端根据ID获取邀请放屁记录
// @Tags BreakApp
// @Summary 管理端根据ID获取邀请放屁记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "记录ID"
// @Success 200 {object} response.Response{data=service.FartTogetherRecordAdminItem,msg=string} "获取成功"
// @Router /break/fartTogetherRecord/{id} [get]
func (a *fartTogetherRecord) GetFartTogetherRecord(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	result, err := service.Service.FartTogetherRecord.GetFartTogetherRecord(c.Request.Context(), uint(id))
	if err != nil {
		global.GVA_LOG.Error("获取邀请放屁记录失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "获取成功", c)
}

// DeleteFartTogetherRecord 管理端删除邀请放屁记录
// @Tags BreakApp
// @Summary 管理端删除邀请放屁记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "记录ID"
// @Success 200 {object} response.Response{msg=string} "删除成功"
// @Router /break/fartTogetherRecord/{id} [delete]
func (a *fartTogetherRecord) DeleteFartTogetherRecord(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	if err = service.Service.FartTogetherRecord.DeleteFartTogetherRecord(c.Request.Context(), uint(id)); err != nil {
		global.GVA_LOG.Error("删除邀请放屁记录失败", zap.Error(err))
		response.FailWithMessage("删除失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// DeleteFartTogetherRecordByIds 管理端批量删除邀请放屁记录
// @Tags BreakApp
// @Summary 管理端批量删除邀请放屁记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "记录ID列表"
// @Success 200 {object} response.Response{msg=string} "删除成功"
// @Router /break/fartTogetherRecord/deleteByIds [delete]
func (a *fartTogetherRecord) DeleteFartTogetherRecordByIds(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}
	if len(req.IDs) == 0 {
		response.FailWithMessage("请选择要删除的记录", c)
		return
	}

	if err := service.Service.FartTogetherRecord.DeleteFartTogetherRecordByIds(c.Request.Context(), req.IDs); err != nil {
		global.GVA_LOG.Error("批量删除邀请放屁记录失败", zap.Error(err))
		response.FailWithMessage("删除失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}
