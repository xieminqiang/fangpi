package api

import (
	"fmt"
	"strconv"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var Achievement = new(achievement)

type achievement struct{}

// CreateAchievement 创建成就配置
// @Tags BreakApp
// @Summary 创建成就配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakAchievement true "成就配置信息"
// @Success 200 {object} response.Response{data=model.BreakAchievement,msg=string} "创建成功"
// @Router /break/achievement [post]
func (a *achievement) CreateAchievement(c *gin.Context) {
	var achievement model.BreakAchievement
	err := c.ShouldBindJSON(&achievement)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	result, err := service.Service.Achievement.CreateAchievement(c.Request.Context(), &achievement)
	if err != nil {
		global.GVA_LOG.Error("创建成就配置失败", zap.Error(err))
		response.FailWithMessage("创建失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "创建成功", c)
}

// DeleteAchievement 删除成就配置
// @Tags BreakApp
// @Summary 删除成就配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "成就配置ID"
// @Success 200 {object} response.Response{msg=string} "删除成功"
// @Router /break/achievement/{id} [delete]
func (a *achievement) DeleteAchievement(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	err = service.Service.Achievement.DeleteAchievement(c.Request.Context(), uint(id))
	if err != nil {
		global.GVA_LOG.Error("删除成就配置失败", zap.Error(err))
		response.FailWithMessage("删除失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("删除成功", c)
}

// UpdateAchievement 更新成就配置
// @Tags BreakApp
// @Summary 更新成就配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakAchievement true "成就配置信息"
// @Success 200 {object} response.Response{data=model.BreakAchievement,msg=string} "更新成功"
// @Router /break/achievement [put]
func (a *achievement) UpdateAchievement(c *gin.Context) {
	var achievement model.BreakAchievement
	err := c.ShouldBindJSON(&achievement)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层
	result, err := service.Service.Achievement.UpdateAchievement(c.Request.Context(), &achievement)
	if err != nil {
		global.GVA_LOG.Error("更新成就配置失败", zap.Error(err))
		response.FailWithMessage("更新失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "更新成功", c)
}

// GetAchievement 根据ID获取成就配置
// @Tags BreakApp
// @Summary 根据ID获取成就配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "成就配置ID"
// @Success 200 {object} response.Response{data=model.BreakAchievement,msg=string} "获取成功"
// @Router /break/achievement/{id} [get]
func (a *achievement) GetAchievement(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	result, err := service.Service.Achievement.GetAchievement(c.Request.Context(), uint(id))
	if err != nil {
		global.GVA_LOG.Error("获取成就配置失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "获取成功", c)
}

// GetAchievementList 分页获取成就配置列表
// @Tags BreakApp
// @Summary 分页获取成就配置列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body request.AchievementSearch true "分页获取成就配置列表"
// @Success 200 {object} response.Response{data=response.PageResult{list=[]model.BreakAchievement},msg=string} "获取成功"
// @Router /break/achievement/list [post]
func (a *achievement) GetAchievementList(c *gin.Context) {
	var pageInfo request.AchievementSearch
	err := c.ShouldBindJSON(&pageInfo)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	list, total, err := service.Service.Achievement.GetAchievementList(c.Request.Context(), &pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取成就配置列表失败", zap.Error(err))
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

// GetAllAchievements 获取所有成就配置
// @Tags BreakApp
// @Summary 获取所有成就配置
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=[]model.BreakAchievement,msg=string} "获取成功"
// @Router /break/achievement/all [get]
func (a *achievement) GetAllAchievements(c *gin.Context) {
	list, err := service.Service.Achievement.GetAllAchievements(c.Request.Context())
	if err != nil {
		global.GVA_LOG.Error("获取所有成就配置失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(list, "获取成功", c)
}

// GetUserAchievements 获取用户成就列表
// @Tags BreakApp
// @Summary 获取用户成就列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=service.UserAchievementResponse,msg=string} "获取成功"
// @Router /break/achievements [get]
func (a *achievement) GetUserAchievements(c *gin.Context) {
	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 调用服务层
	result, err := service.Service.Achievement.GetUserAchievements(c.Request.Context(), userID)
	if err != nil {
		global.GVA_LOG.Error("获取用户成就列表失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "获取成功", c)
}

// MarkAchievementViewed 标记成就为已查看
// @Tags BreakApp
// @Summary 标记成就为已查看
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param achievementId path uint true "成就ID"
// @Success 200 {object} response.Response{msg=string} "标记成功"
// @Router /break/achievements/{achievementId}/view [post]
func (a *achievement) MarkAchievementViewed(c *gin.Context) {
	achievementId, err := strconv.ParseUint(c.Param("achievementId"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 调用服务层
	err = service.Service.Achievement.MarkAchievementViewed(c.Request.Context(), userID, uint(achievementId))
	if err != nil {
		global.GVA_LOG.Error("标记成就查看失败", zap.Error(err))
		response.FailWithMessage("标记失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("标记成功", c)
}

// GetAchievementProgress 获取成就进度
// @Tags BreakApp
// @Summary 获取成就进度
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param achievementId path uint true "成就ID"
// @Success 200 {object} response.Response{data=service.AchievementProgressResponse,msg=string} "获取成功"
// @Router /break/achievements/{achievementId}/progress [get]
func (a *achievement) GetAchievementProgress(c *gin.Context) {
	achievementId, err := strconv.ParseUint(c.Param("achievementId"), 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 调用服务层
	result, err := service.Service.Achievement.GetAchievementProgress(c.Request.Context(), userID, uint(achievementId))
	if err != nil {
		global.GVA_LOG.Error("获取成就进度失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "获取成功", c)
}

// BackfillCheckinDays 回填用户打卡天数数据
// @Tags BreakApp
// @Summary 回填用户打卡天数数据（从历史放屁记录中提取）
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{msg=string} "回填成功"
// @Router /break/achievement/backfill-checkin [post]
func (a *achievement) BackfillCheckinDays(c *gin.Context) {
	// 调用服务层回填函数
	err := service.Service.Achievement.BackfillCheckinDays(c.Request.Context())
	if err != nil {
		global.GVA_LOG.Error("回填打卡天数数据失败", zap.Error(err))
		response.FailWithMessage("回填失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("回填成功", c)
}

// TestContinuousDays 测试连续天数计算（临时调试接口）
// @Tags BreakApp
// @Summary 测试连续天数计算
// @Accept application/json
// @Produce application/json
// @Param userId query uint true "用户ID"
// @Success 200 {object} response.Response "测试结果"
// @Router /break/test-continuous-days [get]
func (a *achievement) TestContinuousDays(c *gin.Context) {
	userIDStr := c.Query("userId")
	if userIDStr == "" {
		userIDStr = "4" // 默认用户ID
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	// 查询打卡记录
	var results []struct {
		CheckinDate string
	}
	global.GVA_DB.Model(&model.BreakUserCheckinDays{}).
		Where("user_id = ?", uint(userID)).
		Select("checkin_date").
		Order("checkin_date DESC").
		Find(&results)

	var checkinDates []string
	for _, r := range results {
		// 提取日期部分（格式：YYYY-MM-DD）
		date := r.CheckinDate
		if len(date) >= 10 {
			date = date[:10] // 截取前10个字符
		}
		checkinDates = append(checkinDates, date)
	}

	// 计算连续天数
	continuousDays := 0
	today := time.Now().Format("2006-01-02")

	debugInfo := []string{}
	for i, date := range checkinDates {
		expectedDate := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		debugMsg := fmt.Sprintf("i=%d, date=%s, expected=%s", i, date, expectedDate)

		if date == expectedDate {
			continuousDays++
			debugMsg += fmt.Sprintf(" ✓ match, count=%d", continuousDays)
		} else {
			if i == 0 && date != today {
				debugMsg += " (today not checked, continue)"
				debugInfo = append(debugInfo, debugMsg)
				continue
			}
			debugMsg += " ✗ break"
			debugInfo = append(debugInfo, debugMsg)
			break
		}
		debugInfo = append(debugInfo, debugMsg)
	}

	result := map[string]interface{}{
		"userId":         uint(userID),
		"today":          today,
		"checkinDates":   checkinDates,
		"continuousDays": continuousDays,
		"progress7Days":  fmt.Sprintf("%d%%", continuousDays*100/7),
		"progress30Days": fmt.Sprintf("%d%%", continuousDays*100/30),
		"debugInfo":      debugInfo,
	}

	response.OkWithDetailed(result, "测试成功", c)
}

// ManualCheckLevelUp 手动检查并触发等级升级（临时调试接口）
// @Tags BreakApp
// @Summary 手动检查等级升级
// @Accept application/json
// @Produce application/json
// @Param userId query uint true "用户ID"
// @Success 200 {object} response.Response "检查结果"
// @Router /break/manual-level-up [post]
func (a *achievement) ManualCheckLevelUp(c *gin.Context) {
	userIDStr := c.Query("userId")
	if userIDStr == "" {
		userIDStr = "4" // 默认用户ID
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	// 获取用户信息
	var user model.WxUser
	if err := global.GVA_DB.Where("id = ?", uint(userID)).First(&user).Error; err != nil {
		response.FailWithMessage("用户不存在", c)
		return
	}

	// 获取打卡天数
	var checkinDays int64
	global.GVA_DB.Model(&model.BreakUserCheckinDays{}).
		Where("user_id = ?", uint(userID)).
		Count(&checkinDays)

	// 循环检查所有可能的升级
	upgradedLevels := []string{}
	currentLevel := user.Level

	for {
		// 查询下一级配置
		var nextLevel model.BreakLevelConfig
		if err := global.GVA_DB.Where("level = ?", currentLevel+1).First(&nextLevel).Error; err != nil {
			break // 已经是最高等级
		}

		// 检查是否满足升级条件
		if user.Experience >= nextLevel.RequiredExp &&
			user.TotalFarts >= nextLevel.RequiredFarts &&
			int(checkinDays) >= nextLevel.RequiredDays {

			// 升级：更新等级和等级名称
			global.GVA_DB.Model(&user).Updates(map[string]interface{}{
				"level":      nextLevel.Level,
				"level_name": nextLevel.LevelName,
			})

			upgradedLevels = append(upgradedLevels, fmt.Sprintf("等级%d: %s", nextLevel.Level, nextLevel.LevelName))
			currentLevel = nextLevel.Level

			// 重新查询用户信息
			global.GVA_DB.Where("id = ?", uint(userID)).First(&user)
		} else {
			break
		}
	}

	result := map[string]interface{}{
		"userId":         uint(userID),
		"originalLevel":  user.Level,
		"currentLevel":   currentLevel,
		"totalFarts":     user.TotalFarts,
		"experience":     user.Experience,
		"checkinDays":    checkinDays,
		"upgradedLevels": upgradedLevels,
		"upgraded":       len(upgradedLevels) > 0,
	}

	response.OkWithDetailed(result, "升级检查完成", c)
}

// TestUserInfo 测试用户信息（临时调试接口）
// @Tags BreakApp
// @Summary 测试用户信息
// @Accept application/json
// @Produce application/json
// @Param userId query uint true "用户ID"
// @Success 200 {object} response.Response "测试结果"
// @Router /break/test-user-info [get]
func (a *achievement) TestUserInfo(c *gin.Context) {
	userIDStr := c.Query("userId")
	if userIDStr == "" {
		userIDStr = "4" // 默认用户ID
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	// 获取用户信息
	var user model.WxUser
	if err := global.GVA_DB.Where("id = ?", uint(userID)).First(&user).Error; err != nil {
		response.FailWithMessage("用户不存在", c)
		return
	}

	result := map[string]interface{}{
		"userId":     user.ID,
		"nickname":   *user.Nickname,
		"level":      user.Level,
		"levelName":  user.LevelName,
		"totalFarts": user.TotalFarts,
		"experience": user.Experience,
	}

	response.OkWithDetailed(result, "查询成功", c)
}
