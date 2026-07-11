package router

import (
	"github.com/gin-gonic/gin"
)

var UploadRouter = new(uploadRouter)

type uploadRouter struct{}

// Init 初始化上传路由
func (r *uploadRouter) Init(public *gin.RouterGroup, private *gin.RouterGroup) {
	{
		// 公开路由 - 不需要认证即可上传
		group := public.Group("upload")
		group.POST("image", apiUpload.UploadImage)               // 单图上传
		group.POST("images", apiUpload.UploadImages)             // 批量上传
		group.GET("downloadProxy", apiUpload.DownloadImageProxy) // 代理下载图片（解决CORS）
		group.POST("audio", apiUpload.UploadAudio)               // 音频上传
	}
	{
		// 私有路由 - 需要认证才能上传（如果需要的话可以使用这个）
		// group := private.Group("upload").Use(middleware.OperationRecord())
		// group.POST("image", apiUpload.UploadImage)
		// group.POST("images", apiUpload.UploadImages)
	}
}
