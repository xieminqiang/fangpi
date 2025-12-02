package router

import "github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/api"

var (
	Router          = new(router)
	apiWxUser       = api.Api.WxUser
	apiUpload       = api.Api.Upload
	apiFartRecord   = api.Api.FartRecord
	apiStatistics   = api.Api.Statistics
	apiAchievement  = api.Api.Achievement
	apiLevelConfig  = api.Api.LevelConfig
	apiAiReview     = api.Api.AiReview
	apiAiChat       = api.Api.AiChat
	apiAudioLibrary = api.Api.AudioLibrary
	apiAppConfig    = api.Api.AppConfig
)

type router struct {
	WxUser wxuser
	Upload uploadRouter
	Break  breakRouter
}
