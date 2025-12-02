package router

import (
	api "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
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
		group.GET("getWxUserList", apiWxUser.GetWxUserList) // 获取微信用户列表
		group.GET("findWxUser", apiWxUser.FindWxUser)       // 根据ID获取微信用户
	}
	{
		// 需要JWT认证的用户接口（添加JWT中间件）
		group := public.Group("wxuser").Use(middleware.JWTAuth()) // ✅ 添加JWT中间件
		group.GET("getUserInfo", apiWxUser.GetUserInfo)           // 获取当前登录用户信息
		group.POST("updateUserInfo", apiWxUser.UpdateUserInfo)   // 更新用户信息（小程序用户端）
		group.POST("setUserAudioUrl", apiWxUser.SetUserAudioUrl)  // 设置用户放屁音频URL
	}
	{
		group := public.Group("wxuser")
		group.GET("getWxUserPublic", apiWxUser.GetWxUserPublic)            // 微信用户开放接口
		group.POST("wxLogin", apiWxUser.WxLogin)                           // 微信用户登录
		group.POST("wxQuickLogin", apiWxUser.WxQuickLogin)                 // 微信快速登录（自动注册）
		group.POST("openidLogin", apiWxUser.OpenidLogin)                   // OpenID 快速登录
		group.POST("wxRegister", apiWxUser.WxRegister)                     // 微信用户注册
		group.POST("uploadAvatar", exaFileUploadAndDownloadApi.UploadFile) // 上传用户头像
	}
}
