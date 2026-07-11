package router

import (
	api "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	fpMiddleware "github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/middleware"
	"github.com/gin-gonic/gin"
)

var WxUser = new(wxuser)

type wxuser struct{}

var (
	exaFileUploadAndDownloadApi = api.ApiGroupApp.ExampleApiGroup.FileUploadAndDownloadApi
)

// Init 初始化 微信用户 路由信息
func (r *wxuser) Init(public *gin.RouterGroup, private *gin.RouterGroup) {
	{
		group := private.Group("wxuser").Use(middleware.OperationRecord())
		// group.POST("createWxUser", apiWxUser.CreateWxUser)   // 新建微信用户
		group.DELETE("deleteWxUser", apiWxUser.DeleteWxUser)           // 删除微信用户
		group.DELETE("deleteWxUserByIds", apiWxUser.DeleteWxUserByIds) // 批量删除微信用户
		group.PUT("updateWxUser", apiWxUser.UpdateWxUser)              // 更新微信用户
	}
	{
		group := private.Group("wxuser")
		group.GET("getWxUserList", apiWxUser.GetWxUserList)                  // 获取微信用户列表
		group.GET("findWxUser", apiWxUser.FindWxUser)                        // 根据ID获取微信用户
		group.GET("validateFartCounts", apiWxUser.ValidateFartCounts)        // 校验打屁次数（第一步）
		group.POST("validateExperience", apiWxUser.ValidateExperience)       // 校验经验值（第二步）
		group.POST("validateSpecificUsers", apiWxUser.ValidateSpecificUsers) // 校验指定用户（完整校验）
	}
	{
		// 需要JWT认证的用户接口（使用小程序端 JWT，与 xhsQuickLogin/wxQuickLogin 颁发的 token 一致）
		group := public.Group("wxuser").Use(fpMiddleware.WxJWTAuth())
		group.GET("getUserInfo", apiWxUser.GetUserInfo)           // 获取当前登录用户信息
		group.POST("updateUserInfo", apiWxUser.UpdateUserInfo)    // 更新用户信息（小程序用户端）
		group.POST("setUserAudioUrl", apiWxUser.SetUserAudioUrl)  // 设置用户放屁音频URL
		group.POST("updateUserPoints", apiWxUser.UpdateUserPoints) // 更新用户积分
		group.POST("createPointsRecord", apiWxUser.CreatePointsRecord) // 创建积分记录
		group.GET("getPointsRecords", apiWxUser.GetPointsRecords) // 获取积分记录列表
	}
	{
		group := public.Group("wxuser")
		group.GET("getWxUserPublic", apiWxUser.GetWxUserPublic)            // 微信用户开放接口
		group.GET("getUserInfoById", apiWxUser.GetUserInfoById)            // 根据用户ID获取用户信息（公开接口）
		group.POST("wxLogin", apiWxUser.WxLogin)                           // 微信用户登录
		group.POST("wxQuickLogin", apiWxUser.WxQuickLogin)                 // 微信快速登录（自动注册）
		group.POST("xhsQuickLogin", apiWxUser.XhsQuickLogin)               // 小红书快速登录（自动注册，与微信逻辑一致）
		group.POST("openidLogin", apiWxUser.OpenidLogin)                   // OpenID 快速登录
		group.POST("wxRegister", apiWxUser.WxRegister)                     // 微信用户注册
		group.POST("uploadAvatar", exaFileUploadAndDownloadApi.UploadFile) // 上传用户头像
	}
}
