package service

import (
	"context"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"go.uber.org/zap"
)

var Statistics = new(statistics)

type statistics struct{}

// GetTrendData 获取趋势数据（日/周/月）
func (s *statistics) GetTrendData(ctx context.Context, userId uint, statType string) (*TrendDataResponse, error) {
	var response *TrendDataResponse

	switch statType {
	case "day":
		response = s.getDayTrend(userId)
	case "week":
		response = s.getWeekTrend(userId)
	case "month":
		response = s.getMonthTrend(userId)
	default:
		response = s.getDayTrend(userId)
	}

	return response, nil
}

// getDayTrend 获取日趋势（按时间段统计）
func (s *statistics) getDayTrend(userId uint) *TrendDataResponse {
	today := time.Now().Format("2006-01-02")

	// 添加调试日志
	global.GVA_LOG.Info("getDayTrend",
		zap.Uint("userId", userId),
		zap.String("today", today))

	// 查询今日所有记录
	var records []model.BreakFartRecord
	global.GVA_DB.Where("user_id = ? AND fart_date = ?", userId, today).
		Find(&records)

	global.GVA_LOG.Info("getDayTrend records", zap.Int("count", len(records)))

	// 打印前几条记录的日期，用于调试
	for i, record := range records {
		if i < 3 {
			global.GVA_LOG.Info("getDayTrend record",
				zap.Uint("id", record.ID),
				zap.String("fartDate", record.FartDate.Format("2006-01-02")),
				zap.String("timePeriod", record.TimePeriod))
		}
	}

	// 按时间段统计
	timePeriodData := map[string]int{
		"dawn":      0, // 凌晨
		"morning":   0, // 上午
		"afternoon": 0, // 下午
		"evening":   0, // 晚上
	}

	for _, record := range records {
		timePeriodData[record.TimePeriod]++
	}

	// 构建响应
	response := &TrendDataResponse{
		Type: "day",
		Date: today,
		TimePeriodData: TimePeriodData{
			Dawn:      timePeriodData["dawn"],
			Morning:   timePeriodData["morning"],
			Afternoon: timePeriodData["afternoon"],
			Evening:   timePeriodData["evening"],
		},
	}

	return response
}

// getWeekTrend 获取周趋势（本周周一到周日）
func (s *statistics) getWeekTrend(userId uint) *TrendDataResponse {
	now := time.Now()

	// 计算本周周一的日期
	weekday := now.Weekday()
	if weekday == time.Sunday {
		weekday = 7 // 将周日设为7
	}
	// 往回推到本周周一
	daysFromMonday := int(weekday) - 1
	startDate := now.AddDate(0, 0, -daysFromMonday)

	// 本周周日的日期
	endDate := startDate.AddDate(0, 0, 6)

	startDateStr := startDate.Format("2006-01-02")
	endDateStr := endDate.Format("2006-01-02")

	// 添加调试日志
	global.GVA_LOG.Info("getWeekTrend",
		zap.Uint("userId", userId),
		zap.String("startDate", startDateStr),
		zap.String("endDate", endDateStr),
		zap.String("today", now.Format("2006-01-02")))

	// 先查询用户所有记录用于调试
	var allRecords []model.BreakFartRecord
	global.GVA_DB.Where("user_id = ?", userId).Limit(5).Find(&allRecords)
	for i, r := range allRecords {
		global.GVA_LOG.Info("user all records sample",
			zap.Int("index", i),
			zap.String("fartDate", r.FartDate.Format("2006-01-02")),
			zap.String("timePeriod", r.TimePeriod))
	}

	// 查询本周的所有记录（周一到周日）
	var records []model.BreakFartRecord
	global.GVA_DB.Where("user_id = ? AND fart_date >= ? AND fart_date <= ?",
		userId,
		startDateStr,
		endDateStr).
		Find(&records)

	global.GVA_LOG.Info("getWeekTrend records", zap.Int("count", len(records)))

	// 打印查询到的记录
	for i, r := range records {
		if i < 3 {
			global.GVA_LOG.Info("getWeekTrend record",
				zap.String("fartDate", r.FartDate.Format("2006-01-02")),
				zap.String("timePeriod", r.TimePeriod))
		}
	}

	// 按日期统计
	dailyCount := make(map[string]int)
	for _, record := range records {
		dateStr := record.FartDate.Format("2006-01-02")
		dailyCount[dateStr]++
	}

	// 构建本周7天的数据（周一到周日）
	weekData := make([]int, 7)
	weekLabels := []string{"周一", "周二", "周三", "周四", "周五", "周六", "周日"}

	for i := 0; i < 7; i++ {
		date := startDate.AddDate(0, 0, i)
		dateStr := date.Format("2006-01-02")
		weekData[i] = dailyCount[dateStr]
	}

	response := &TrendDataResponse{
		Type:       "week",
		Date:       now.Format("2006-01-02"),
		WeekData:   weekData,
		WeekLabels: weekLabels,
	}

	return response
}

// getMonthTrend 获取月趋势（本月：月初、月中、月底）
func (s *statistics) getMonthTrend(userId uint) *TrendDataResponse {
	now := time.Now()

	// 获取本月的第一天和最后一天
	year, month, _ := now.Date()
	startDate := time.Date(year, month, 1, 0, 0, 0, 0, now.Location())
	endDate := startDate.AddDate(0, 1, -1) // 本月最后一天

	// 查询本月的所有记录
	var records []model.BreakFartRecord
	global.GVA_DB.Where("user_id = ? AND fart_date >= ? AND fart_date <= ?",
		userId,
		startDate.Format("2006-01-02"),
		endDate.Format("2006-01-02")).
		Find(&records)

	// 按日期统计
	dailyCount := make(map[string]int)
	for _, record := range records {
		dateStr := record.FartDate.Format("2006-01-02")
		dailyCount[dateStr]++
	}

	// 分为三个时间段：月初(1-10)、月中(11-20)、月底(21-月末)
	monthData := make([]int, 3)
	monthLabels := []string{"月初", "月中", "月底"}

	// 月初：1-10号
	for day := 1; day <= 10; day++ {
		date := time.Date(year, month, day, 0, 0, 0, 0, now.Location())
		if date.After(endDate) {
			break
		}
		dateStr := date.Format("2006-01-02")
		monthData[0] += dailyCount[dateStr]
	}

	// 月中：11-20号
	for day := 11; day <= 20; day++ {
		date := time.Date(year, month, day, 0, 0, 0, 0, now.Location())
		if date.After(endDate) {
			break
		}
		dateStr := date.Format("2006-01-02")
		monthData[1] += dailyCount[dateStr]
	}

	// 月底：21号-月末
	lastDay := endDate.Day()
	for day := 21; day <= lastDay; day++ {
		date := time.Date(year, month, day, 0, 0, 0, 0, now.Location())
		dateStr := date.Format("2006-01-02")
		monthData[2] += dailyCount[dateStr]
	}

	response := &TrendDataResponse{
		Type:        "month",
		Date:        now.Format("2006-01-02"),
		MonthData:   monthData,
		MonthLabels: monthLabels,
	}

	return response
}

// GetStatisticsSummary 获取统计小结
func (s *statistics) GetStatisticsSummary(ctx context.Context, userId uint, statType string) (*StatisticsSummaryResponse, error) {
	var startDate, endDate time.Time
	now := time.Now()

	switch statType {
	case "day":
		// 今日
		startDate = now
		endDate = now
	case "week":
		// 本周（周一到周日）
		weekday := now.Weekday()
		if weekday == time.Sunday {
			weekday = 7
		}
		daysFromMonday := int(weekday) - 1
		startDate = now.AddDate(0, 0, -daysFromMonday)
		endDate = startDate.AddDate(0, 0, 6)
	case "month":
		// 本月（1号到月末）
		year, month, _ := now.Date()
		startDate = time.Date(year, month, 1, 0, 0, 0, 0, now.Location())
		endDate = startDate.AddDate(0, 1, -1)
	default:
		// 默认今日
		startDate = now
		endDate = now
	}

	// 查询该时间段的所有记录
	var records []model.BreakFartRecord
	global.GVA_DB.Where("user_id = ? AND fart_date >= ? AND fart_date <= ?",
		userId,
		startDate.Format("2006-01-02"),
		endDate.Format("2006-01-02")).
		Find(&records)

	// 统计分析
	totalCount := len(records)
	typeCount := map[string]int{"loud": 0, "soft": 0, "silent": 0}
	smellSum := 0
	moodCount := map[string]int{"happy": 0, "normal": 0, "embarrassed": 0}

	for _, record := range records {
		typeCount[record.FartType]++
		smellSum += record.SmellLevel
		moodCount[record.Mood]++
	}

	// 最多的类型
	mostType := "loud"
	maxTypeCount := 0
	for t, count := range typeCount {
		if count > maxTypeCount {
			maxTypeCount = count
			mostType = t
		}
	}

	// 类型名称映射
	typeNames := map[string]string{
		"loud":   "响亮型",
		"soft":   "轻柔型",
		"silent": "无声型",
	}

	// 平均气味
	avgSmell := 2.0
	if totalCount > 0 {
		avgSmell = float64(smellSum) / float64(totalCount)
	}

	smellLevelName := "一般"
	if avgSmell < 1.5 {
		smellLevelName = "清香"
	} else if avgSmell > 2.5 {
		smellLevelName = "浓烈"
	}

	// 最多的心情
	mostMood := "happy"
	maxMoodCount := 0
	for m, count := range moodCount {
		if count > maxMoodCount {
			maxMoodCount = count
			mostMood = m
		}
	}

	moodNames := map[string]string{
		"happy":       "开心",
		"normal":      "放松",
		"embarrassed": "尴尬",
	}

	moodEmojis := map[string]string{
		"happy":       "🤣",
		"normal":      "😌",
		"embarrassed": "😖",
	}

	// 构建响应
	response := &StatisticsSummaryResponse{
		TotalCount: totalCount,
		MostCommonType: TypeInfo{
			Type:     mostType,
			TypeName: typeNames[mostType],
			Count:    maxTypeCount,
		},
		AverageSmell: SmellInfo{
			Level:     int(avgSmell + 0.5), // 四舍五入
			LevelName: smellLevelName,
		},
		MostCommonMood: MoodInfo{
			Mood:      mostMood,
			MoodName:  moodNames[mostMood],
			MoodEmoji: moodEmojis[mostMood],
			Count:     maxMoodCount,
		},
		TypeDistribution: TypeDistribution{
			Loud:   typeCount["loud"],
			Soft:   typeCount["soft"],
			Silent: typeCount["silent"],
		},
	}

	return response, nil
}

// 响应结构体
type TrendDataResponse struct {
	Type           string         `json:"type"`                     // day/week/month
	Date           string         `json:"date"`                     // 当前日期
	TimePeriodData TimePeriodData `json:"timePeriodData,omitempty"` // 日统计：时间段数据
	WeekData       []int          `json:"weekData,omitempty"`       // 周统计：7天数据
	WeekLabels     []string       `json:"weekLabels,omitempty"`     // 周统计：日期标签
	MonthData      []int          `json:"monthData,omitempty"`      // 月统计：6周数据
	MonthLabels    []string       `json:"monthLabels,omitempty"`    // 月统计：周标签
}

type TimePeriodData struct {
	Dawn      int `json:"dawn"`      // 凌晨 00:00-06:00
	Morning   int `json:"morning"`   // 上午 06:00-12:00
	Afternoon int `json:"afternoon"` // 下午 12:00-18:00
	Evening   int `json:"evening"`   // 晚上 18:00-24:00
}

type StatisticsSummaryResponse struct {
	TotalCount       int              `json:"totalCount"`
	MostCommonType   TypeInfo         `json:"mostCommonType"`
	AverageSmell     SmellInfo        `json:"averageSmell"`
	MostCommonMood   MoodInfo         `json:"mostCommonMood"`
	TypeDistribution TypeDistribution `json:"typeDistribution"`
}

type TypeInfo struct {
	Type     string `json:"type"`
	TypeName string `json:"typeName"`
	Count    int    `json:"count"`
}

type SmellInfo struct {
	Level     int    `json:"level"`
	LevelName string `json:"levelName"`
}

type MoodInfo struct {
	Mood      string `json:"mood"`
	MoodName  string `json:"moodName"`
	MoodEmoji string `json:"moodEmoji"`
	Count     int    `json:"count"`
}

type TypeDistribution struct {
	Loud   int `json:"loud"`
	Soft   int `json:"soft"`
	Silent int `json:"silent"`
}
