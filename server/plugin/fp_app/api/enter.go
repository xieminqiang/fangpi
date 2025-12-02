package api

import "github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"

var (
	Api                 = new(api)
	serviceWxUser       = service.Service.WxUser
	serviceFartRecord   = service.Service.FartRecord
	serviceStatistics   = service.Service.Statistics
	serviceAchievement  = service.Service.Achievement
	serviceLevelConfig  = service.Service.LevelConfig
	serviceAiReview     = service.Service.AiReview
	serviceAudioLibrary = service.Service.AudioLibrary
	serviceAppConfig    = service.Service.AppConfig
)

type api struct {
	WxUser       wxuser
	Upload       uploadApi
	FartRecord   fartRecord
	Statistics   statisticsApi
	Achievement  achievement
	LevelConfig  levelConfig
	AiReview     aiReviewApi
	AiChat       aiChatApi
	AudioLibrary audioLibrary
	AppConfig    appConfig
}
