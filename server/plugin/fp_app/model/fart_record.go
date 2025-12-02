package model

import (
	"database/sql/driver"
	"fmt"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// DateOnly 自定义日期类型，只包含日期部分（YYYY-MM-DD）
type DateOnly time.Time

// UnmarshalJSON 实现 JSON 反序列化
func (d *DateOnly) UnmarshalJSON(data []byte) error {
	// 去掉引号
	str := string(data)
	if str == "null" || str == `""` {
		return nil
	}
	str = str[1 : len(str)-1] // 去掉前后的引号

	// 解析日期字符串
	t, err := time.Parse("2006-01-02", str)
	if err != nil {
		return err
	}
	*d = DateOnly(t)
	return nil
}

// MarshalJSON 实现 JSON 序列化
func (d DateOnly) MarshalJSON() ([]byte, error) {
	t := time.Time(d)
	if t.IsZero() {
		return []byte(`""`), nil
	}
	return []byte(fmt.Sprintf(`"%s"`, t.Format("2006-01-02"))), nil
}

// Value 实现 driver.Valuer 接口，用于写入数据库
func (d DateOnly) Value() (driver.Value, error) {
	t := time.Time(d)
	if t.IsZero() {
		return nil, nil
	}
	return t.Format("2006-01-02"), nil
}

// Scan 实现 sql.Scanner 接口，用于从数据库读取
func (d *DateOnly) Scan(value interface{}) error {
	if value == nil {
		*d = DateOnly(time.Time{})
		return nil
	}

	switch v := value.(type) {
	case time.Time:
		*d = DateOnly(v)
		return nil
	case []byte:
		t, err := time.Parse("2006-01-02", string(v))
		if err != nil {
			return err
		}
		*d = DateOnly(t)
		return nil
	case string:
		t, err := time.Parse("2006-01-02", v)
		if err != nil {
			return err
		}
		*d = DateOnly(t)
		return nil
	default:
		return fmt.Errorf("cannot scan type %T into DateOnly", value)
	}
}

// Time 转换为 time.Time
func (d DateOnly) Time() time.Time {
	return time.Time(d)
}

// Format 格式化日期
func (d DateOnly) Format(layout string) string {
	return time.Time(d).Format(layout)
}

// BreakFartRecord 放屁记录 结构体
type BreakFartRecord struct {
	global.GVA_MODEL
	UserId     uint     `json:"userId" form:"userId" gorm:"not null;index;comment:用户ID"`                                                 //用户ID
	FartType   string   `json:"fartType" form:"fartType" gorm:"size:20;not null;comment:屁屁类型" binding:"required,oneof=loud soft silent"` //屁屁类型：loud-响亮型，soft-轻柔型，silent-无声型
	SmellLevel int      `json:"smellLevel" form:"smellLevel" gorm:"not null;comment:气味等级" binding:"required,min=1,max=3"`                //气味等级：1-清香，2-一般，3-浓烈
	Mood       string   `json:"mood" form:"mood" gorm:"size:20;not null;comment:心情" binding:"required,oneof=happy normal embarrassed"`   //心情：happy-开心，normal-一般，embarrassed-尴尬
	Note       string   `json:"note" form:"note" gorm:"size:500;comment:备注"`                                                             //备注（饮食、心情描述）
	FartDate   DateOnly `json:"fartDate" form:"fartDate" gorm:"type:date;not null;index;comment:放屁日期" binding:"required"`                //放屁日期
	FartTime   string   `json:"fartTime" form:"fartTime" gorm:"type:time;not null;comment:放屁时间" binding:"required"`                      //放屁时间
	HourOfDay  int      `json:"hourOfDay" form:"hourOfDay" gorm:"not null;comment:小时(0-23)"`                                             //小时（0-23）
	TimePeriod string   `json:"timePeriod" form:"timePeriod" gorm:"size:10;not null;index;comment:时间段"`                                  //时间段：dawn-凌晨，morning-上午，afternoon-下午，evening-晚上
}

// TableName 放屁记录 BreakFartRecord自定义表名 break_fart_record
func (BreakFartRecord) TableName() string {
	return "break_fart_record"
}

// BreakAchievement 成就配置 结构体
type BreakAchievement struct {
	global.GVA_MODEL
	AchievementCode  string `json:"achievementCode" form:"achievementCode" gorm:"size:50;not null;uniqueIndex;comment:成就编码"` //成就编码
	AchievementName  string `json:"achievementName" form:"achievementName" gorm:"size:100;not null;comment:成就名称"`            //成就名称
	AchievementDesc  string `json:"achievementDesc" form:"achievementDesc" gorm:"size:500;comment:成就描述"`                     //成就描述
	AchievementIcon  string `json:"achievementIcon" form:"achievementIcon" gorm:"size:500;comment:成就图标"`                     //成就图标
	AchievementEmoji string `json:"achievementEmoji" form:"achievementEmoji" gorm:"size:10;comment:成就emoji"`                 //成就emoji
	AchievementGif   string `json:"achievementGif" form:"achievementGif" gorm:"size:500;comment:成就GIF动画"`                    //成就GIF动画
	UnlockCondition  string `json:"unlockCondition" form:"unlockCondition" gorm:"type:json;comment:解锁条件(JSON)"`              //解锁条件（JSON格式）
	RewardExp        int    `json:"rewardExp" form:"rewardExp" gorm:"default:0;comment:奖励经验值"`                               //奖励经验值
	SortOrder        int    `json:"sortOrder" form:"sortOrder" gorm:"default:0;comment:排序"`                                  //排序
	Status           int    `json:"status" form:"status" gorm:"default:1;comment:状态:1-启用,0-禁用"`                              //状态：1-启用，0-禁用
}

// TableName 成就配置 BreakAchievement自定义表名 break_achievement
func (BreakAchievement) TableName() string {
	return "break_achievement"
}

// BreakUserAchievement 用户成就 结构体
type BreakUserAchievement struct {
	global.GVA_MODEL
	UserId          uint      `json:"userId" form:"userId" gorm:"not null;index;comment:用户ID"`                     //用户ID
	AchievementId   uint      `json:"achievementId" form:"achievementId" gorm:"not null;comment:成就ID"`             //成就ID
	AchievementCode string    `json:"achievementCode" form:"achievementCode" gorm:"size:50;not null;comment:成就编码"` //成就编码
	UnlockTime      time.Time `json:"unlockTime" form:"unlockTime" gorm:"not null;index;comment:解锁时间"`             //解锁时间
	IsViewed        int       `json:"isViewed" form:"isViewed" gorm:"default:0;comment:是否已查看:0-未查看,1-已查看"`         //是否已查看
}

// TableName 用户成就 BreakUserAchievement自定义表名 break_user_achievement
func (BreakUserAchievement) TableName() string {
	return "break_user_achievement"
}

// BreakLevelConfig 等级配置 结构体
type BreakLevelConfig struct {
	global.GVA_MODEL
	Level         int    `json:"level" form:"level" gorm:"not null;uniqueIndex;comment:等级"`                 //等级
	LevelName     string `json:"levelName" form:"levelName" gorm:"size:50;not null;comment:等级名称"`           //等级名称
	LevelEmoji    string `json:"levelEmoji" form:"levelEmoji" gorm:"size:10;comment:等级emoji"`               //等级emoji
	LevelImage    string `json:"levelImage" form:"levelImage" gorm:"size:500;comment:等级图片URL"`              //等级图片URL
	RequiredExp   int    `json:"requiredExp" form:"requiredExp" gorm:"not null;comment:所需经验值"`              //所需经验值
	RequiredFarts int    `json:"requiredFarts" form:"requiredFarts" gorm:"not null;comment:所需放屁次数"`         //所需放屁次数
	RequiredDays  int    `json:"requiredDays" form:"requiredDays" gorm:"not null;default:0;comment:所需打卡天数"` //所需打卡天数
}

// TableName 等级配置 BreakLevelConfig自定义表名 break_level_config
func (BreakLevelConfig) TableName() string {
	return "break_level_config"
}

// BreakUserCheckinDays 用户打卡天数 结构体
type BreakUserCheckinDays struct {
	global.GVA_MODEL
	UserId      uint   `json:"userId" form:"userId" gorm:"not null;index;comment:用户ID"`               //用户ID
	CheckinDate string `json:"checkinDate" form:"checkinDate" gorm:"type:date;not null;comment:打卡日期"` //打卡日期
}

// TableName 用户打卡天数 BreakUserCheckinDays自定义表名 break_user_checkin_days
func (BreakUserCheckinDays) TableName() string {
	return "break_user_checkin_days"
}
