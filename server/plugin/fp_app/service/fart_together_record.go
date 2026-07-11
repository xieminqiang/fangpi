package service

import (
	"context"
	"fmt"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var FartTogetherRecord = new(fartTogetherRecord)

type fartTogetherRecord struct{}

// LastFartTogetherRecordResponse 最近一次屁友一起打屁记录响应
type LastFartTogetherRecordResponse struct {
	ID                uint                 `json:"id"`
	InviterId         uint                 `json:"inviterId"`
	InviteeId         uint                 `json:"inviteeId"`
	InviterSex        int                  `json:"inviterSex"` // 1为男，2为女
	InviteeSex        int                  `json:"inviteeSex"` // 1为男，2为女
	InviterRecordId   uint                 `json:"inviterRecordId"`
	InviteeRecordId   uint                 `json:"inviteeRecordId"`
	InviterRecordInfo model.FartRecordInfo `json:"inviterRecordInfo"`
	InviteeRecordInfo model.FartRecordInfo `json:"inviteeRecordInfo"`
	InviterInfo       *model.WxUser        `json:"inviterInfo,omitempty"` // 邀请人信息
	InviteeInfo       *model.WxUser        `json:"inviteeInfo,omitempty"` // 被邀请人信息
	CreatedAt         string               `json:"createdAt"`
}

// GetLastFartTogetherRecord 获取用户最近一次屁友一起打屁记录
// 只返回当前用户作为邀请人（inviterId）的记录，即当前用户邀请的屁友记录
// 只返回今天最近的一条记录（按 created_at 排序）
func (s *fartTogetherRecord) GetLastFartTogetherRecord(ctx context.Context, userId uint) (*LastFartTogetherRecordResponse, error) {
	var record model.BreakFartTogetherRecord

	// 计算今天的开始时间（00:00:00）和明天的开始时间（00:00:00）
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	tomorrowStart := todayStart.AddDate(0, 0, 1)

	// 只查询当前用户作为邀请人的今天最近一次记录
	err := global.GVA_DB.Where("inviter_id = ? AND created_at >= ? AND created_at < ?", userId, todayStart, tomorrowStart).
		Order("created_at DESC").
		First(&record).Error

	if err != nil {
		// 如果没有记录，返回 nil（不是错误）
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	// 获取邀请人和被邀请人的信息
	var inviterInfo, inviteeInfo model.WxUser

	// 获取邀请人信息
	if err := global.GVA_DB.Where("id = ?", record.InviterId).First(&inviterInfo).Error; err != nil {
		global.GVA_LOG.Warn("获取邀请人信息失败", zap.Error(err))
	}

	// 获取被邀请人信息
	if err := global.GVA_DB.Where("id = ?", record.InviteeId).First(&inviteeInfo).Error; err != nil {
		global.GVA_LOG.Warn("获取被邀请人信息失败", zap.Error(err))
	}

	response := &LastFartTogetherRecordResponse{
		ID:                record.ID,
		InviterId:         record.InviterId,
		InviteeId:         record.InviteeId,
		InviterSex:        record.InviterSex,
		InviteeSex:        record.InviteeSex,
		InviterRecordId:   record.InviterRecordId,
		InviteeRecordId:   record.InviteeRecordId,
		InviterRecordInfo: record.InviterRecordInfo,
		InviteeRecordInfo: record.InviteeRecordInfo,
		CreatedAt:         record.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	// 如果成功获取到用户信息，则添加到响应中
	if inviterInfo.ID > 0 {
		response.InviterInfo = &inviterInfo
	}
	if inviteeInfo.ID > 0 {
		response.InviteeInfo = &inviteeInfo
	}

	return response, nil
}

// GetFartTogetherRecordById 根据ID获取一起打屁记录
func (s *fartTogetherRecord) GetFartTogetherRecordById(ctx context.Context, recordId uint) (*LastFartTogetherRecordResponse, error) {
	var record model.BreakFartTogetherRecord

	// 根据ID查询记录
	err := global.GVA_DB.Where("id = ?", recordId).First(&record).Error

	if err != nil {
		// 如果没有记录，返回 nil（不是错误）
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	// 获取邀请人和被邀请人的信息
	var inviterInfo, inviteeInfo model.WxUser

	// 获取邀请人信息
	if err := global.GVA_DB.Where("id = ?", record.InviterId).First(&inviterInfo).Error; err != nil {
		global.GVA_LOG.Warn("获取邀请人信息失败", zap.Error(err))
	}

	// 获取被邀请人信息
	if err := global.GVA_DB.Where("id = ?", record.InviteeId).First(&inviteeInfo).Error; err != nil {
		global.GVA_LOG.Warn("获取被邀请人信息失败", zap.Error(err))
	}

	response := &LastFartTogetherRecordResponse{
		ID:                record.ID,
		InviterId:         record.InviterId,
		InviteeId:         record.InviteeId,
		InviterSex:        record.InviterSex,
		InviteeSex:        record.InviteeSex,
		InviterRecordId:   record.InviterRecordId,
		InviteeRecordId:   record.InviteeRecordId,
		InviterRecordInfo: record.InviterRecordInfo,
		InviteeRecordInfo: record.InviteeRecordInfo,
		CreatedAt:         record.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	// 如果成功获取到用户信息，则添加到响应中
	if inviterInfo.ID > 0 {
		response.InviterInfo = &inviterInfo
	}
	if inviteeInfo.ID > 0 {
		response.InviteeInfo = &inviteeInfo
	}

	return response, nil
}

// CreateFartTogetherRecordRequest 创建一起打屁记录请求
type CreateFartTogetherRecordRequest struct {
	InviteeId         uint                 `json:"inviteeId"`         // 被邀请人的用户ID
	InviterSex        int                  `json:"inviterSex"`        // 邀请人的性别：1为男，2为女
	InviteeSex        int                  `json:"inviteeSex"`        // 被邀请人的性别：1为男，2为女
	InviterRecordInfo model.FartRecordInfo `json:"inviterRecordInfo"` // 邀请人的放屁记录信息
	InviteeRecordInfo model.FartRecordInfo `json:"inviteeRecordInfo"` // 被邀请人的放屁记录信息
}

// CreateFartTogetherRecord 创建一起打屁记录
func (s *fartTogetherRecord) CreateFartTogetherRecord(ctx context.Context, inviterId uint, req *CreateFartTogetherRecordRequest) error {
	record := &model.BreakFartTogetherRecord{
		InviterId:         inviterId,
		InviteeId:         req.InviteeId,
		InviterSex:        req.InviterSex,
		InviteeSex:        req.InviteeSex,
		InviterRecordId:   0, // 不需要填
		InviteeRecordId:   0, // 不需要填
		InviterRecordInfo: req.InviterRecordInfo,
		InviteeRecordInfo: req.InviteeRecordInfo,
	}

	return global.GVA_DB.Create(record).Error
}

// UpdateFartTogetherRecordRequest 更新一起打屁记录请求
type UpdateFartTogetherRecordRequest struct {
	InviteeRecordInfo model.FartRecordInfo `json:"inviteeRecordInfo"` // 被邀请人的放屁记录信息
	InviterSex        int                  `json:"inviterSex"`        // 邀请人的性别：1为男，2为女（0表示不更新）
	InviteeSex        int                  `json:"inviteeSex"`        // 被邀请人的性别：1为男，2为女（0表示不更新）
}

// UpdateFartTogetherRecord 更新一起打屁记录（更新被邀请人的记录信息）
func (s *fartTogetherRecord) UpdateFartTogetherRecord(ctx context.Context, recordId uint, userId uint, req *UpdateFartTogetherRecordRequest) error {
	var record model.BreakFartTogetherRecord

	// 查询记录
	err := global.GVA_DB.Where("id = ?", recordId).First(&record).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("记录不存在")
		}
		return err
	}

	// 验证用户是否有权限更新
	// 1. 如果是邀请人，可以更新
	// 2. 如果是被邀请人（record.InviteeId == userId），可以更新
	// 3. 如果记录中的 inviteeId 为 0（还没有设置被邀请人），允许当前用户更新（通过分享链接进入的新用户）
	if record.InviterId != userId && record.InviteeId != userId && record.InviteeId != 0 {
		return fmt.Errorf("无权限更新此记录")
	}

	// 如果记录中的 inviteeId 为 0，说明还没有设置被邀请人，此时应该设置为当前用户ID
	if record.InviteeId == 0 {
		record.InviteeId = userId
	}

	// 更新被邀请人的记录信息（只有当提供了记录信息时才更新）
	if req.InviteeRecordInfo.FartType != "" || req.InviteeRecordInfo.Mood != "" || req.InviteeRecordInfo.SmellLevel != 0 || req.InviteeRecordInfo.VolumeLevel != "" {
		record.InviteeRecordInfo = req.InviteeRecordInfo
	}

	// 如果提供了性别字段（不为0），则更新
	if req.InviterSex != 0 {
		record.InviterSex = req.InviterSex
	}
	if req.InviteeSex != 0 {
		record.InviteeSex = req.InviteeSex
	}

	return global.GVA_DB.Save(&record).Error
}

// UpdateFartTogetherRecordSex 只更新性别字段，不改变其他任何数据
func (s *fartTogetherRecord) UpdateFartTogetherRecordSex(ctx context.Context, recordId uint, userId uint, inviterSex int, inviteeSex int) error {
	// 验证用户是否有权限更新
	var record model.BreakFartTogetherRecord
	err := global.GVA_DB.Where("id = ?", recordId).First(&record).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			global.GVA_LOG.Error("更新性别字段失败：记录不存在", zap.Uint("recordId", recordId))
			return fmt.Errorf("记录不存在")
		}
		global.GVA_LOG.Error("更新性别字段失败：查询记录错误", zap.Error(err), zap.Uint("recordId", recordId))
		return err
	}

	// 验证用户是否有权限更新
	// 1. 如果是邀请人，可以更新
	// 2. 如果是被邀请人（record.InviteeId == userId），可以更新
	if record.InviterId != userId && record.InviteeId != userId && record.InviteeId != 0 {
		global.GVA_LOG.Error("更新性别字段失败：无权限",
			zap.Uint("recordId", recordId),
			zap.Uint("userId", userId),
			zap.Uint("inviterId", record.InviterId),
			zap.Uint("inviteeId", record.InviteeId))
		return fmt.Errorf("无权限更新此记录")
	}

	// 只更新性别字段，使用 Updates 和 Select 确保只更新这两个字段
	// 构建更新数据
	updateData := map[string]interface{}{}
	hasUpdate := false

	if inviterSex != 0 {
		updateData["InviterSex"] = inviterSex
		hasUpdate = true
	}
	if inviteeSex != 0 {
		updateData["InviteeSex"] = inviteeSex
		hasUpdate = true
	}

	if !hasUpdate {
		return fmt.Errorf("没有需要更新的字段")
	}

	// 使用 Updates 和 Select 只更新指定字段，不改变其他任何数据
	// Select 可以接受多个字段作为参数，使用结构体字段名
	query := global.GVA_DB.Model(&model.BreakFartTogetherRecord{}).
		Where("id = ?", recordId)

	// 根据要更新的字段动态构建 Select
	if inviterSex != 0 && inviteeSex != 0 {
		// 两个字段都更新
		query = query.Select("InviterSex", "InviteeSex")
	} else if inviterSex != 0 {
		// 只更新 InviterSex
		query = query.Select("InviterSex")
	} else if inviteeSex != 0 {
		// 只更新 InviteeSex
		query = query.Select("InviteeSex")
	}

	// 执行更新
	result := query.Updates(updateData)
	if result.Error != nil {
		global.GVA_LOG.Error("更新性别字段失败：数据库更新错误",
			zap.Error(result.Error),
			zap.Uint("recordId", recordId),
			zap.Any("updateData", updateData))
		return result.Error
	}

	// 检查是否有行被更新
	if result.RowsAffected == 0 {
		global.GVA_LOG.Warn("更新性别字段：没有行被更新",
			zap.Uint("recordId", recordId),
			zap.Any("updateData", updateData))
		return fmt.Errorf("没有行被更新，可能记录不存在或数据未变化")
	}

	global.GVA_LOG.Info("更新性别字段成功",
		zap.Uint("recordId", recordId),
		zap.Int64("rowsAffected", result.RowsAffected),
		zap.Any("updateData", updateData))

	return nil
}
