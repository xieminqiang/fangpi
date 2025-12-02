package service

var Service = new(service)

type service struct {
	WxUser       wxuser
	FartRecord   fartRecord
	Statistics   statistics
	Achievement  achievement
	LevelConfig  levelConfig
	AiReview     AiReviewService
	AudioLibrary audioLibrary
	AppConfig    appConfig
}
