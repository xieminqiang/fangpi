package service

var Service = new(service)

type service struct {
	WxUser             wxuser
	FartRecord         fartRecord
	FartTogetherRecord fartTogetherRecord
	Statistics         statistics
	Achievement        achievement
	LevelConfig        levelConfig
	AiReview           AiReviewService
	AudioLibrary       audioLibrary
	AppConfig          appConfig
	NicknameTemplate   nicknameTemplate
}
