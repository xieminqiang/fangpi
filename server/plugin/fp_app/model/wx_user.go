package model

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// 用户类型常量：1=微信用户 2=小红书用户
const (
	UserTypeWechat   = 1
	UserTypeXiaohongshu = 2
)

// WxUser Break用户 结构体
type WxUser struct {
	global.GVA_MODEL
	Openid     *string `json:"openid" form:"openid" gorm:"comment:用户凭证(微信/小红书等);column:openid;size:128;" binding:"required"` // 微信约28位、小红书64位，预留128
	UserType   int     `json:"userType" form:"userType" gorm:"default:1;column:user_type;comment:用户类型 1微信 2小红书"`       //用户类型，默认1微信
	Nickname   *string `json:"nickname" form:"nickname" gorm:"default:默认昵称;column:nickname;size:30;"`                  //用户昵称
	Avatar     string  `json:"avatar" form:"avatar" gorm:"column:avatar;size:200;"`                                    //头像
	Phone      *string `json:"phone" form:"phone" gorm:"column:phone;size:11;"`                                        //手机号
	Status     *string `json:"status" form:"status" gorm:"column:status;size:2;"`                                      //用户状态
	Gender     *string `json:"gender" form:"gender" gorm:"column:gender;"`                                             //性别
	Level      int     `json:"level" form:"level" gorm:"default:1;column:level;comment:屁格等级"`                          //屁格等级
	LevelName  string  `json:"levelName" form:"levelName" gorm:"default:新手屁民;column:level_name;size:50;comment:等级名称"` //等级名称
	Letter     string  `json:"letter" form:"letter" gorm:"column:letter;size:1;comment:等级名称首字母"`                      //等级名称首字母
	TotalFarts int     `json:"totalFarts" form:"totalFarts" gorm:"default:0;column:total_farts;comment:累计放屁次数"`        //累计放屁次数
	Experience int     `json:"experience" form:"experience" gorm:"default:0;column:experience;comment:经验值"`            //经验值
	AudioUrl   string  `json:"audioUrl" form:"audioUrl" gorm:"column:audio_url;size:500;comment:放屁音频URL"`              //放屁音频URL
	Points     int     `json:"points" form:"points" gorm:"default:0;column:points;comment:用户积分"`                        //用户积分
}
type PhoneNumberData struct {
	PhoneNumber     string    `json:"phoneNumber"`
	PurePhoneNumber string    `json:"purePhoneNumber"`
	CountryCode     string    `json:"countryCode"`
	Watermark       Watermark `json:"watermark"`
}
type Watermark struct {
	AppID     string `json:"appid"`
	Timestamp int    `json:"timestamp"`
}

// TableName Break用户 WxUser自定义表名 break_user
func (WxUser) TableName() string {
	return "break_user"
}
