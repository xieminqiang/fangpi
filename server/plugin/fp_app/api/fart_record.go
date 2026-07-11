package api

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	systemReq "github.com/flipped-aurora/gin-vue-admin/server/model/system/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	fpReq "github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

var FartRecord = new(fartRecord)

type fartRecord struct{}

// CreateFartRecord 创建放屁记录
// @Tags BreakApp
// @Summary 创建放屁记录（打卡）
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakFartRecord true "记录信息"
// @Success 200 {object} response.Response{data=service.CreateFartRecordResponse,msg=string} "创建成功"
// @Router /break/record [post]
func (a *fartRecord) CreateFartRecord(c *gin.Context) {
	var record model.BreakFartRecord
	err := c.ShouldBindJSON(&record)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}
	record.UserId = userID

	// 调用服务层
	result, err := service.Service.FartRecord.CreateFartRecord(c.Request.Context(), &record)
	
	if err != nil {
		global.GVA_LOG.Error("创建放屁记录失败", zap.Error(err))
		response.FailWithMessage("打卡失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "打卡成功", c)
}

// GetTodayRecords 获取今日记录
// @Tags BreakApp
// @Summary 获取今日所有记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=service.TodayRecordsResponse,msg=string} "获取成功"
// @Router /break/today [get]
func (a *fartRecord) GetTodayRecords(c *gin.Context) {
	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 调用服务层
	result, err := service.Service.FartRecord.GetTodayRecords(c.Request.Context(), userID)
	if err != nil {
		global.GVA_LOG.Error("获取今日记录失败", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}

	response.OkWithData(result, c)
}

// GetTodayLastRecord 获取今日最近一次记录
// @Tags BreakApp
// @Summary 获取今日最近一次放屁记录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=service.LastRecordInfo,msg=string} "获取成功，如果没有记录则data为null"
// @Router /break/today/last [get]
func (a *fartRecord) GetTodayLastRecord(c *gin.Context) {
	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 调用服务层
	result, err := service.Service.FartRecord.GetTodayLastRecord(c.Request.Context(), userID)
	if err != nil {
		global.GVA_LOG.Error("获取今日最近一次记录失败", zap.Error(err))
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

// MakeupFartRecordRequest 补卡请求结构体
type MakeupFartRecordRequest struct {
	FartType   string `json:"fartType" binding:"required,oneof=loud soft silent"`     // 屁屁类型
	SmellLevel int    `json:"smellLevel" binding:"required,min=1,max=3"`              // 气味等级
	Mood       string `json:"mood" binding:"required,oneof=happy normal embarrassed"` // 心情
	Note       string `json:"note"`                                                   // 备注
	FartTime   string `json:"fartTime" binding:"required"`                            // 时间 HH:mm（日期由后端自动使用当前日期）
}

// MakeupFartRecord 补卡记录
// @Tags BreakApp
// @Summary 补卡记录（补录历史记录）
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body MakeupFartRecordRequest true "补卡信息"
// @Success 200 {object} response.Response{data=service.CreateFartRecordResponse,msg=string} "补卡成功"
// @Router /break/makeup [post]
func (a *fartRecord) MakeupFartRecord(c *gin.Context) {
	var req MakeupFartRecordRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 获取用户ID
	userID := getWxUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 转换为service层的请求结构体
	serviceReq := &service.MakeupFartRecordRequest{
		FartType:   req.FartType,
		SmellLevel: req.SmellLevel,
		Mood:       req.Mood,
		Note:       req.Note,
		FartTime:   req.FartTime,
	}

	// 调用服务层
	result, err := service.Service.FartRecord.MakeupFartRecordWithDate(c.Request.Context(), userID, serviceReq)
	if err != nil {
		global.GVA_LOG.Error("补卡失败", zap.Error(err))
		response.FailWithMessage("补卡失败: "+err.Error(), c)
		return
	}

	response.OkWithDetailed(result, "补卡成功", c)
}

// getWxUserIdFromToken 从Token中获取用户ID（辅助函数）
func getWxUserIdFromToken(c *gin.Context) uint {
	token := c.Request.Header.Get("x-token")
	if token == "" {
		token, _ = c.Cookie("x-token")
	}

	if token == "" {
		return 0
	}

	// 先尝试解析插件token
	pluginClaims := &fpReq.CustomClaims{}
	jwtToken, err := jwt.ParseWithClaims(token, pluginClaims, func(token *jwt.Token) (interface{}, error) {
		return []byte(global.GVA_CONFIG.JWT.SigningKey), nil
	})

	if err == nil && jwtToken.Valid {
		if c, ok := jwtToken.Claims.(*fpReq.CustomClaims); ok {
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
