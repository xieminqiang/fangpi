package service

import (
	"context"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"go.uber.org/zap"
)

type AiReviewService struct{}

// AiReviewResponse AI点评响应结构
type AiReviewResponse struct {
	ReviewText      string `json:"reviewText"`      // AI点评文本
	Emoji           string `json:"emoji"`           // 相关表情符号
	Timestamp       int64  `json:"timestamp"`       // 生成时间戳
	HealthScore     int    `json:"healthScore"`     // 健康评分 (0-100)
	PatencyIndex    int    `json:"patencyIndex"`    // 肠道通畅指数 (0-100)
	AirflowActivity int    `json:"airflowActivity"` // 气流活跃度 (0-100)
	DietAdvice      string `json:"dietAdvice"`      // 饮食建议
	LifestyleTip    string `json:"lifestyleTip"`    // 生活建议
}

// IntestinalHealthAnalysis 肠道状态评估
type IntestinalHealthAnalysis struct {
	PatencyIndex    int      `json:"patencyIndex"`    // 肠道通畅指数 (0-100)
	PatencyLevel    string   `json:"patencyLevel"`    // 通畅等级：顺滑/正常/堵车
	AirflowActivity int      `json:"airflowActivity"` // 气流活跃度 (0-100)
	AirflowLevel    string   `json:"airflowLevel"`    // 活跃度等级：微风/正常/强风预警
	PotentialIssues []string `json:"potentialIssues"` // 潜在状况提示
	OverallStatus   string   `json:"overallStatus"`   // 整体状态描述
}

// DietAnalysis 饮食习惯分析
type DietAnalysis struct {
	DietPattern     string   `json:"dietPattern"`     // 饮食模式描述
	DietAdvice      []string `json:"dietAdvice"`      // 饮食建议列表
	FunnyComment    string   `json:"funnyComment"`    // 趣味吐槽
	FoodPreferences []string `json:"foodPreferences"` // 推测的食物偏好
}

// LifestyleAdvice 生活方式建议
type LifestyleAdvice struct {
	ScheduleTips    []string `json:"scheduleTips"`    // 作息提示
	RelaxAdvice     []string `json:"relaxAdvice"`     // 放松建议
	ActivityTips    []string `json:"activityTips"`    // 活动建议
	ImprovementTips []string `json:"improvementTips"` // 改善指引
}

// PersonalityTag 趣味人格标签
type PersonalityTag struct {
	TagName  string `json:"tagName"`  // 标签名称
	TagDesc  string `json:"tagDesc"`  // 标签描述
	TagEmoji string `json:"tagEmoji"` // 标签表情
}

// UserStatsForAI 用于AI分析的用户统计数据
type UserStatsForAI struct {
	TotalFarts   int    `json:"totalFarts"`   // 总放屁次数
	Level        int    `json:"level"`        // 当前等级
	LevelName    string `json:"levelName"`    // 等级名称
	Experience   int    `json:"experience"`   // 经验值
	WeekCount    int    `json:"weekCount"`    // 本周次数
	DailyAverage int    `json:"dailyAverage"` // 日均次数
	MostType     string `json:"mostType"`     // 最常见的类型
	MaxSmell     string `json:"maxSmell"`     // 最大气味强度
	RecentTrend  string `json:"recentTrend"`  // 最近趋势
	Nickname     string `json:"nickname"`     // 用户昵称
	HealthScore  int    `json:"healthScore"`  // 健康评分 (1-100)
	DietAdvice   string `json:"dietAdvice"`   // 饮食建议
	LifestyleTip string `json:"lifestyleTip"` // 生活建议
}

// GetPersonalityReview 获取AI个性点评
func (s *AiReviewService) GetPersonalityReview(ctx context.Context, userID uint) (*AiReviewResponse, error) {
	// 获取用户统计数据
	userStats, err := s.getUserStatsForAI(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("获取用户统计数据失败: %v", err)
	}

	// 获取详细的多维数据
	detailedStats, err := s.getDetailedStatsForAI(ctx, userID)
	if err != nil {
		global.GVA_LOG.Warn("获取详细统计数据失败，使用基础数据", zap.Error(err))
		detailedStats = s.getDefaultDetailedStats(userStats)
	}

	// 使用AI生成点评和评分
	openaiService := NewOpenAIService()
	aiResult, err := openaiService.GenerateHealthAnalysis(ctx, userStats, detailedStats)
	if err != nil {
		global.GVA_LOG.Warn("AI生成分析失败，使用模板生成", zap.Error(err))
		// 回退到模板生成
		reviewText, emoji := s.generatePersonalityReview(userStats)
		return &AiReviewResponse{
			ReviewText:      reviewText,
			Emoji:           emoji,
			Timestamp:       time.Now().Unix(),
			HealthScore:     userStats.HealthScore,
			PatencyIndex:    70,
			AirflowActivity: 70,
			DietAdvice:      userStats.DietAdvice,
			LifestyleTip:    userStats.LifestyleTip,
		}, nil
	}

	return &AiReviewResponse{
		ReviewText:      aiResult.ReviewText,
		Emoji:           aiResult.Emoji,
		Timestamp:       time.Now().Unix(),
		HealthScore:     aiResult.HealthScore,
		PatencyIndex:    aiResult.PatencyIndex,
		AirflowActivity: aiResult.AirflowActivity,
		DietAdvice:      aiResult.DietAdvice,
		LifestyleTip:    aiResult.LifestyleTip,
	}, nil
}

// RefreshPersonalityReview 刷新AI个性点评
func (s *AiReviewService) RefreshPersonalityReview(ctx context.Context, userID uint) (*AiReviewResponse, error) {
	// 直接调用GetPersonalityReview，因为刷新逻辑相同
	return s.GetPersonalityReview(ctx, userID)
}

// getUserStatsForAI 获取用于AI分析的用户统计数据
func (s *AiReviewService) getUserStatsForAI(ctx context.Context, userID uint) (*UserStatsForAI, error) {
	// 获取用户基本信息
	var user model.WxUser
	if err := global.GVA_DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("获取用户信息失败: %v", err)
	}

	// 获取用户统计数据
	var totalFarts int64
	if err := global.GVA_DB.Model(&model.BreakFartRecord{}).Where("user_id = ?", userID).Count(&totalFarts).Error; err != nil {
		global.GVA_LOG.Warn("获取总放屁次数失败", zap.Error(err))
		totalFarts = 0
	}

	// 获取本周数据
	weekStart := time.Now().AddDate(0, 0, -int(time.Now().Weekday()))
	var weekCount int64
	if err := global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND created_at >= ?", userID, weekStart).
		Count(&weekCount).Error; err != nil {
		global.GVA_LOG.Warn("获取本周数据失败", zap.Error(err))
		weekCount = 0
	}

	// 计算日均次数
	dailyAverage := 0
	if totalFarts > 0 {
		// 假设用户注册时间，这里简化处理
		daysSinceStart := int(time.Since(user.CreatedAt).Hours() / 24)
		if daysSinceStart > 0 {
			dailyAverage = int(totalFarts) / daysSinceStart
		}
	}

	// 获取最常见的放屁类型
	var mostType string
	type result struct {
		FartType string `gorm:"column:fart_type"`
		Count    int64  `gorm:"column:count"`
	}
	var typeResult result
	if err := global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ?", userID).
		Select("fart_type, COUNT(*) as count").
		Group("fart_type").
		Order("count DESC").
		Limit(1).
		Scan(&typeResult).Error; err != nil {
		mostType = "普通型"
	} else {
		mostType = typeResult.FartType
	}

	// 获取最大气味强度
	var maxSmell string
	if err := global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ?", userID).
		Select("smell_level").
		Order("smell_level DESC").
		Limit(1).
		Scan(&maxSmell).Error; err != nil {
		maxSmell = "中等"
	}

	// 分析最近趋势
	recentTrend := s.analyzeRecentTrend(ctx, userID)

	// 计算健康评分
	healthScore := s.calculateHealthScore(dailyAverage, maxSmell, recentTrend)

	// 生成饮食建议
	dietAdvice := s.generateDietAdvice(dailyAverage, maxSmell, mostType)

	// 生成生活建议
	lifestyleTip := s.generateLifestyleTip(healthScore, recentTrend)

	return &UserStatsForAI{
		TotalFarts:   int(totalFarts),
		Level:        user.Level,
		LevelName:    user.LevelName,
		Experience:   user.Experience,
		WeekCount:    int(weekCount),
		DailyAverage: dailyAverage,
		MostType:     mostType,
		MaxSmell:     maxSmell,
		RecentTrend:  recentTrend,
		Nickname:     *user.Nickname,
		HealthScore:  healthScore,
		DietAdvice:   dietAdvice,
		LifestyleTip: lifestyleTip,
	}, nil
}

// analyzeRecentTrend 分析最近趋势
func (s *AiReviewService) analyzeRecentTrend(ctx context.Context, userID uint) string {
	// 获取最近7天的数据
	recentDays := 7
	recentStart := time.Now().AddDate(0, 0, -recentDays)

	var recentCount int64
	if err := global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND created_at >= ?", userID, recentStart).
		Count(&recentCount).Error; err != nil {
		return "稳定"
	}

	// 获取前7天的数据
	previousStart := time.Now().AddDate(0, 0, -recentDays*2)
	previousEnd := recentStart

	var previousCount int64
	if err := global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND created_at >= ? AND created_at < ?", userID, previousStart, previousEnd).
		Count(&previousCount).Error; err != nil {
		return "稳定"
	}

	// 比较趋势
	if recentCount > previousCount {
		return "上升"
	} else if recentCount < previousCount {
		return "下降"
	}
	return "稳定"
}

// generatePersonalityReview 生成AI个性点评
func (s *AiReviewService) generatePersonalityReview(stats *UserStatsForAI) (string, string) {
	// 尝试使用OpenAI生成点评
	openaiService := NewOpenAIService()
	ctx := context.Background()

	// 使用OpenAI生成点评
	reviewText, err := openaiService.GeneratePersonalityReview(ctx, stats)
	if err != nil {
		global.GVA_LOG.Warn("OpenAI生成点评失败，使用模板生成", zap.Error(err))
		// 如果OpenAI失败，回退到模板生成
		reviewTemplates := s.getReviewTemplates(stats)
		rand.Seed(time.Now().UnixNano())
		reviewText = reviewTemplates[rand.Intn(len(reviewTemplates))]
	}

	// 生成表情符号
	emoji, err := openaiService.GenerateEmoji(ctx, stats)
	if err != nil {
		global.GVA_LOG.Warn("OpenAI生成表情符号失败，使用默认", zap.Error(err))
		emoji = s.generateEmoji(stats)
	}

	return reviewText, emoji
}

// getReviewTemplates 根据用户数据获取点评模板
func (s *AiReviewService) getReviewTemplates(stats *UserStatsForAI) []string {
	templates := []string{}

	// 根据等级生成不同风格的点评和健康建议
	switch {
	case stats.Level <= 2:
		// 新手屁民
		templates = append(templates,
			fmt.Sprintf("欢迎加入'放屁档案'的大家庭！你刚开始记录自己的放屁数据，可能会发现自己的屁次数有点高。别担心，身体正通过这种方式排放气体，适应过程中这些都很正常。"),
			fmt.Sprintf("%s，作为新手屁民，你的%d次放屁记录很不错！身体正在适应新的记录方式，保持耐心～", stats.Nickname, stats.TotalFarts),
		)
	case stats.Level <= 4:
		// 见习屁师
		templates = append(templates,
			fmt.Sprintf("你已经记录了%d次放屁，数据趋势很稳定！现在是时候更加关注你的肠道健康了。放屁是肠道健康的表现，但如果有异味，可能是某些食物或生活习惯的影响。", stats.TotalFarts),
			fmt.Sprintf("%s，你已经是个见习屁师了！🎵 最近%s趋势，继续保持～", stats.Nickname, stats.RecentTrend),
		)
	case stats.Level <= 6:
		// 熟练屁匠
		templates = append(templates,
			fmt.Sprintf("很高兴看到你已经进入'熟练屁匠'的行列！你的放屁次数保持在合理范围内，这意味着你在饮食和健康管理上做得不错。保持这样的节奏，记得肠道健康和心理状态是相互关联的。"),
			fmt.Sprintf("哇！%s的放屁技术越来越成熟了！日均%d次，节奏很稳定呢～", stats.Nickname, stats.DailyAverage),
		)
	case stats.Level <= 8:
		// 专业屁王
		templates = append(templates,
			fmt.Sprintf("恭喜你达到了'专业屁王'级别！你的肠道已经非常健康，放屁次数和质量都在合理范围。这个阶段，保持良好的饮食习惯和规律的生活作息对你的健康至关重要。"),
			fmt.Sprintf("%s大师！🎭 你的%d次放屁记录让人叹为观止！最近%s趋势，不愧是%s级的高手～", stats.Nickname, stats.TotalFarts, stats.RecentTrend, stats.LevelName),
		)
	case stats.Level <= 10:
		// 传说屁神
		templates = append(templates,
			fmt.Sprintf("作为'传说屁神'，你的放屁数据稳定且规律，肠道健康处于最佳状态。你已经掌握了如何管理自己的健康，保持现状非常重要。"),
			fmt.Sprintf("放屁艺术家%s！🎨 你的技术已经炉火纯青，日均%d次，节奏完美～", stats.Nickname, stats.DailyAverage),
		)
	default:
		// 终极屁宗
		templates = append(templates,
			fmt.Sprintf("恭喜你，达到了'终极屁宗'！你的肠道健康几乎达到完美，放屁次数、气味和健康状态都在理想范围内。你已经是放屁管理的高手，继续保持健康的生活习惯。"),
			fmt.Sprintf("%s，你已经达到了放屁管理的巅峰！🌟 继续保持这个完美的状态～", stats.Nickname),
		)
	}

	// 根据气味强度添加健康建议
	if stats.MaxSmell == "浓烈" || stats.MaxSmell == "极强" {
		templates = append(templates,
			"最近气味偏浓，建议减少豆类、洋葱等产气食物，多喝水促进肠道健康～💧",
			"气味有点重，可能是消化不完全，建议多吃清淡食物，增加膳食纤维～🥗",
		)
	}

	// 根据类型添加个性化点评
	switch stats.MostType {
	case "响亮型":
		templates = append(templates, "你是个节奏稳定的放屁艺术家，肠道排气很顺畅！🎵")
	case "闷声型":
		templates = append(templates, "你的放屁风格很内敛，肠道功能正常，闷声发大财～💰")
	case "连续型":
		templates = append(templates, "连续放屁说明肠道蠕动活跃，节奏感超强！🎶")
	}

	// 根据本周表现添加点评
	if stats.WeekCount > stats.DailyAverage*7 {
		templates = append(templates, "本周表现很活跃，放屁频率明显提升！注意饮食平衡，保持肠道健康～🚀")
	} else if stats.WeekCount < stats.DailyAverage*5 {
		templates = append(templates, "本周比较安静，可能是饮食调整的结果，继续保持～😴")
	}

	return templates
}

// calculateHealthScore 计算健康评分
func (s *AiReviewService) calculateHealthScore(dailyAverage int, maxSmell string, recentTrend string) int {
	score := 70 // 基础分

	// 根据日均次数评分 (正常范围10-20次)
	if dailyAverage >= 10 && dailyAverage <= 20 {
		score += 20 // 正常范围
	} else if dailyAverage >= 5 && dailyAverage <= 30 {
		score += 10 // 可接受范围
	} else {
		score -= 10 // 异常范围
	}

	// 根据气味强度评分
	switch maxSmell {
	case "轻微":
		score += 10
	case "中等":
		score += 5
	case "浓烈":
		score -= 5
	case "极强":
		score -= 10
	}

	// 根据趋势评分
	switch recentTrend {
	case "稳定":
		score += 5
	case "上升":
		score -= 5
	case "下降":
		score -= 10
	}

	// 确保分数在1-100范围内
	if score > 100 {
		score = 100
	} else if score < 1 {
		score = 1
	}

	return score
}

// generateDietAdvice 生成饮食建议
func (s *AiReviewService) generateDietAdvice(dailyAverage int, maxSmell string, mostType string) string {
	advice := ""

	// 根据放屁频率给出建议
	if dailyAverage > 20 {
		advice += "放屁频率偏高，建议减少豆类、洋葱、高纤维食物摄入，多喝水促进消化。"
	} else if dailyAverage < 5 {
		advice += "放屁频率偏低，建议增加膳食纤维，多吃蔬菜水果，促进肠道蠕动。"
	} else {
		advice += "放屁频率正常，继续保持均衡饮食，适量摄入益生菌食物。"
	}

	// 根据气味强度给出建议
	if maxSmell == "浓烈" || maxSmell == "极强" {
		advice += " 气味较重时，建议少吃辛辣、油腻食物，多吃清淡易消化的食物。"
	}

	// 根据放屁类型给出建议
	switch mostType {
	case "响亮型":
		advice += " 肠道排气顺畅，继续保持良好的饮食习惯。"
	case "闷声型":
		advice += " 建议增加运动，促进肠道蠕动和气体排出。"
	case "连续型":
		advice += " 肠道蠕动活跃，注意饮食规律，避免暴饮暴食。"
	}

	return advice
}

// generateLifestyleTip 生成生活建议
func (s *AiReviewService) generateLifestyleTip(healthScore int, recentTrend string) string {
	if healthScore >= 80 {
		return "肠道健康状态良好！继续保持规律作息，适量运动，定期体检。"
	} else if healthScore >= 60 {
		return "肠道健康状态一般，建议调整饮食结构，增加运动，保持良好作息。"
	} else {
		return "肠道健康需要关注，建议咨询医生，调整生活方式，必要时进行专业检查。"
	}
}

// generateEmoji 根据用户数据生成表情符号
func (s *AiReviewService) generateEmoji(stats *UserStatsForAI) string {
	emojis := []string{"💨", "🎵", "🎭", "🎨", "🎶", "✨", "🌟", "💫"}

	// 根据等级选择不同的表情
	switch {
	case stats.Level <= 3:
		emojis = []string{"💨", "🌱", "👶", "🎈"}
	case stats.Level <= 6:
		emojis = []string{"💨", "🎵", "🎭", "✨"}
	default:
		emojis = []string{"💨", "🎭", "🎨", "🌟", "💫"}
	}

	rand.Seed(time.Now().UnixNano())
	return emojis[rand.Intn(len(emojis))]
}

// DetailedStatsForAI 详细统计数据
type DetailedStatsForAI struct {
	TotalFarts             int            // 总次数
	DailyAverage           int            // 日均次数
	WeekCount              int            // 本周次数
	TypeDistribution       map[string]int // 类型分布：loud/soft/silent
	SmellDistribution      map[int]int    // 气味分布：1/2/3
	MoodDistribution       map[string]int // 心情分布：happy/normal/embarrassed
	TimePeriodDistribution map[string]int // 时间段分布：dawn/morning/afternoon/evening
	HourDistribution       map[int]int    // 小时分布：0-23
	AvgSmellLevel          float64        // 平均气味等级
	MostType               string         // 最常见类型
	MostMood               string         // 最常见心情
	MostTimePeriod         string         // 最常见时间段
	RecentTrend            string         // 最近趋势
	Notes                  []string       // 所有备注列表
	NoteAnalysis           *NoteAnalysis  // 备注分析结果
}

// NoteAnalysis 备注分析结果
type NoteAnalysis struct {
	Foods         []string       // 提取的食物列表
	Feelings      []string       // 提取的感受描述
	Scenarios     []string       // 提取的场景描述
	HealthIssues  []string       // 提取的健康相关问题
	FoodFrequency map[string]int // 食物出现频率
	HasNotes      bool           // 是否有备注
	NoteCount     int            // 有备注的记录数
}

// getDetailedStatsForAI 获取详细的多维统计数据
func (s *AiReviewService) getDetailedStatsForAI(ctx context.Context, userID uint) (*DetailedStatsForAI, error) {
	stats := &DetailedStatsForAI{
		TypeDistribution:       make(map[string]int),
		SmellDistribution:      make(map[int]int),
		MoodDistribution:       make(map[string]int),
		TimePeriodDistribution: make(map[string]int),
		HourDistribution:       make(map[int]int),
	}

	// 获取所有记录（最近30天）
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	var records []model.BreakFartRecord
	if err := global.GVA_DB.Where("user_id = ? AND created_at >= ?", userID, thirtyDaysAgo).
		Find(&records).Error; err != nil {
		return nil, err
	}

	stats.TotalFarts = len(records)
	if stats.TotalFarts == 0 {
		return s.getDefaultDetailedStats(nil), nil
	}

	// 统计各项数据
	smellSum := 0
	notes := []string{}
	for _, record := range records {
		stats.TypeDistribution[record.FartType]++
		stats.SmellDistribution[record.SmellLevel]++
		stats.MoodDistribution[record.Mood]++
		stats.TimePeriodDistribution[record.TimePeriod]++
		stats.HourDistribution[record.HourOfDay]++
		smellSum += record.SmellLevel

		// 收集备注（只收集非空备注）
		if record.Note != "" && len(record.Note) > 0 {
			notes = append(notes, record.Note)
		}
	}

	stats.Notes = notes
	// 分析备注
	stats.NoteAnalysis = s.analyzeNotes(notes)

	// 计算平均值
	stats.AvgSmellLevel = float64(smellSum) / float64(stats.TotalFarts)

	// 计算日均次数
	daysSinceStart := int(time.Since(thirtyDaysAgo).Hours() / 24)
	if daysSinceStart > 0 {
		stats.DailyAverage = stats.TotalFarts / daysSinceStart
	}

	// 获取本周数据
	weekStart := time.Now().AddDate(0, 0, -int(time.Now().Weekday()))
	var weekCount int64
	global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND created_at >= ?", userID, weekStart).
		Count(&weekCount)
	stats.WeekCount = int(weekCount)

	// 找出最常见的类型
	maxTypeCount := 0
	for t, count := range stats.TypeDistribution {
		if count > maxTypeCount {
			maxTypeCount = count
			stats.MostType = t
		}
	}

	// 找出最常见的心情
	maxMoodCount := 0
	for m, count := range stats.MoodDistribution {
		if count > maxMoodCount {
			maxMoodCount = count
			stats.MostMood = m
		}
	}

	// 找出最常见的时间段
	maxPeriodCount := 0
	for p, count := range stats.TimePeriodDistribution {
		if count > maxPeriodCount {
			maxPeriodCount = count
			stats.MostTimePeriod = p
		}
	}

	// 分析趋势
	recent7Days := time.Now().AddDate(0, 0, -7)
	var recentCount int64
	global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND created_at >= ?", userID, recent7Days).
		Count(&recentCount)

	previous7DaysStart := time.Now().AddDate(0, 0, -14)
	previous7DaysEnd := recent7Days
	var previousCount int64
	global.GVA_DB.Model(&model.BreakFartRecord{}).
		Where("user_id = ? AND created_at >= ? AND created_at < ?", userID, previous7DaysStart, previous7DaysEnd).
		Count(&previousCount)

	if recentCount > previousCount {
		stats.RecentTrend = "上升"
	} else if recentCount < previousCount {
		stats.RecentTrend = "下降"
	} else {
		stats.RecentTrend = "稳定"
	}

	return stats, nil
}

// getDefaultDetailedStats 获取默认详细统计数据
func (s *AiReviewService) getDefaultDetailedStats(userStats *UserStatsForAI) *DetailedStatsForAI {
	return &DetailedStatsForAI{
		TotalFarts:             0,
		DailyAverage:           0,
		WeekCount:              0,
		TypeDistribution:       make(map[string]int),
		SmellDistribution:      make(map[int]int),
		MoodDistribution:       make(map[string]int),
		TimePeriodDistribution: make(map[string]int),
		HourDistribution:       make(map[int]int),
		AvgSmellLevel:          2.0,
		MostType:               "loud",
		MostMood:               "normal",
		MostTimePeriod:         "afternoon",
		RecentTrend:            "稳定",
		Notes:                  []string{},
		NoteAnalysis: &NoteAnalysis{
			Foods:         []string{},
			Feelings:      []string{},
			Scenarios:     []string{},
			HealthIssues:  []string{},
			FoodFrequency: make(map[string]int),
			HasNotes:      false,
			NoteCount:     0,
		},
	}
}

// analyzeIntestinalHealth 分析肠道健康状态
func (s *AiReviewService) analyzeIntestinalHealth(detailedStats *DetailedStatsForAI, userStats *UserStatsForAI) *IntestinalHealthAnalysis {
	// 计算通畅指数（基于频率和类型）
	patencyIndex := 70 // 基础分
	if detailedStats.DailyAverage >= 10 && detailedStats.DailyAverage <= 20 {
		patencyIndex += 20
	} else if detailedStats.DailyAverage >= 5 && detailedStats.DailyAverage <= 30 {
		patencyIndex += 10
	} else {
		patencyIndex -= 10
	}

	// 根据类型调整
	if detailedStats.MostType == "loud" {
		patencyIndex += 5 // 响亮型表示排气顺畅
	} else if detailedStats.MostType == "silent" {
		patencyIndex -= 5
	}

	if patencyIndex > 100 {
		patencyIndex = 100
	} else if patencyIndex < 0 {
		patencyIndex = 0
	}

	patencyLevel := "正常"
	if patencyIndex >= 85 {
		patencyLevel = "顺滑"
	} else if patencyIndex < 60 {
		patencyLevel = "堵车"
	}

	// 计算气流活跃度（基于频率和趋势）
	airflowActivity := 70
	if detailedStats.DailyAverage >= 10 && detailedStats.DailyAverage <= 20 {
		airflowActivity += 15
	} else if detailedStats.DailyAverage > 20 {
		airflowActivity += 10
	} else {
		airflowActivity -= 10
	}

	if detailedStats.RecentTrend == "上升" {
		airflowActivity += 10
	} else if detailedStats.RecentTrend == "下降" {
		airflowActivity -= 10
	}

	if airflowActivity > 100 {
		airflowActivity = 100
	} else if airflowActivity < 0 {
		airflowActivity = 0
	}

	airflowLevel := "正常"
	if airflowActivity >= 80 {
		airflowLevel = "强风预警"
	} else if airflowActivity < 50 {
		airflowLevel = "微风"
	}

	// 潜在状况提示
	potentialIssues := []string{}
	if detailedStats.AvgSmellLevel > 2.5 {
		potentialIssues = append(potentialIssues, "气味偏重，可能是消化不完全或饮食影响")
	}
	if detailedStats.DailyAverage > 25 {
		potentialIssues = append(potentialIssues, "放屁频率偏高，注意饮食结构")
	}
	if detailedStats.DailyAverage < 5 {
		potentialIssues = append(potentialIssues, "放屁频率偏低，建议增加膳食纤维")
	}
	if len(potentialIssues) == 0 {
		potentialIssues = append(potentialIssues, "肠道状态良好，继续保持")
	}

	overallStatus := fmt.Sprintf("你的肠道%s，气流活跃度为%s。%s", patencyLevel, airflowLevel, potentialIssues[0])

	return &IntestinalHealthAnalysis{
		PatencyIndex:    patencyIndex,
		PatencyLevel:    patencyLevel,
		AirflowActivity: airflowActivity,
		AirflowLevel:    airflowLevel,
		PotentialIssues: potentialIssues,
		OverallStatus:   overallStatus,
	}
}

// analyzeNotes 分析备注内容
func (s *AiReviewService) analyzeNotes(notes []string) *NoteAnalysis {
	analysis := &NoteAnalysis{
		Foods:         []string{},
		Feelings:      []string{},
		Scenarios:     []string{},
		HealthIssues:  []string{},
		FoodFrequency: make(map[string]int),
		HasNotes:      len(notes) > 0,
		NoteCount:     len(notes),
	}

	if len(notes) == 0 {
		return analysis
	}

	// 常见食物关键词
	foodKeywords := map[string]string{
		"红薯": "红薯", "地瓜": "红薯", "番薯": "红薯",
		"玉米": "玉米", "苞米": "玉米",
		"饺子": "饺子", "水饺": "饺子",
		"大葱": "大葱", "葱": "大葱",
		"薏米": "薏米", "薏仁": "薏米",
		"土豆": "土豆", "马铃薯": "土豆",
		"黄豆": "黄豆", "炒黄豆": "黄豆",
		"萝卜": "萝卜", "辣萝卜": "萝卜",
		"酸奶":  "酸奶",
		"蓝莓":  "蓝莓",
		"沙琪玛": "沙琪玛",
		"瓜子":  "瓜子",
		"大饼":  "大饼", "烤饼": "大饼", "饼": "大饼",
		"豆类": "豆类", "豆": "豆类",
		"洋葱":  "洋葱",
		"螺蛳粉": "螺蛳粉",
		"健康餐": "健康餐", "超级碗": "健康餐",
	}

	// 感受关键词
	feelingKeywords := []string{"臭", "很臭", "超级臭", "味道", "有味道", "头晕", "晕", "感觉"}

	// 场景关键词
	scenarioKeywords := []string{"电梯", "晚上", "早上", "早上", "七点", "时间"}

	// 健康问题关键词
	healthKeywords := []string{"上大号", "大号", "肠鸣", "出不来", "不能吃", "不会那么臭"}

	// 分析每条备注
	for _, note := range notes {
		noteLower := note

		// 提取食物
		for keyword, foodName := range foodKeywords {
			if strings.Contains(noteLower, keyword) {
				analysis.FoodFrequency[foodName]++
				// 避免重复添加
				found := false
				for _, f := range analysis.Foods {
					if f == foodName {
						found = true
						break
					}
				}
				if !found {
					analysis.Foods = append(analysis.Foods, foodName)
				}
			}
		}

		// 提取感受
		for _, keyword := range feelingKeywords {
			if strings.Contains(noteLower, keyword) {
				// 提取包含关键词的句子片段
				feeling := s.extractContext(noteLower, keyword, 10)
				if feeling != "" {
					found := false
					for _, f := range analysis.Feelings {
						if strings.Contains(f, feeling) || strings.Contains(feeling, f) {
							found = true
							break
						}
					}
					if !found && len(analysis.Feelings) < 5 {
						analysis.Feelings = append(analysis.Feelings, feeling)
					}
				}
			}
		}

		// 提取场景
		for _, keyword := range scenarioKeywords {
			if strings.Contains(noteLower, keyword) {
				scenario := s.extractContext(noteLower, keyword, 15)
				if scenario != "" {
					found := false
					for _, s := range analysis.Scenarios {
						if strings.Contains(s, scenario) || strings.Contains(scenario, s) {
							found = true
							break
						}
					}
					if !found && len(analysis.Scenarios) < 3 {
						analysis.Scenarios = append(analysis.Scenarios, scenario)
					}
				}
			}
		}

		// 提取健康问题
		for _, keyword := range healthKeywords {
			if strings.Contains(noteLower, keyword) {
				healthIssue := s.extractContext(noteLower, keyword, 20)
				if healthIssue != "" {
					found := false
					for _, h := range analysis.HealthIssues {
						if strings.Contains(h, healthIssue) || strings.Contains(healthIssue, h) {
							found = true
							break
						}
					}
					if !found && len(analysis.HealthIssues) < 3 {
						analysis.HealthIssues = append(analysis.HealthIssues, healthIssue)
					}
				}
			}
		}
	}

	return analysis
}

// extractContext 提取关键词周围的上下文
func (s *AiReviewService) extractContext(text, keyword string, maxLen int) string {
	idx := strings.Index(text, keyword)
	if idx == -1 {
		return ""
	}

	start := idx - maxLen
	if start < 0 {
		start = 0
	}
	end := idx + len(keyword) + maxLen
	if end > len(text) {
		end = len(text)
	}

	context := text[start:end]
	// 清理多余的标点
	context = strings.Trim(context, "，。！？、")
	return context
}

// analyzeDietPattern 分析饮食习惯
func (s *AiReviewService) analyzeDietPattern(detailedStats *DetailedStatsForAI, userStats *UserStatsForAI) *DietAnalysis {
	dietPattern := "均衡饮食"
	foodPreferences := []string{}
	dietAdvice := []string{}
	funnyComment := ""

	noteAnalysis := detailedStats.NoteAnalysis
	if noteAnalysis == nil {
		noteAnalysis = &NoteAnalysis{}
	}

	// 优先使用备注中的食物信息
	if noteAnalysis.HasNotes && len(noteAnalysis.Foods) > 0 {
		// 根据备注中的食物分析饮食模式
		foodPreferences = noteAnalysis.Foods

		// 找出出现频率最高的食物
		mostFrequentFood := ""
		maxFreq := 0
		for food, freq := range noteAnalysis.FoodFrequency {
			if freq > maxFreq {
				maxFreq = freq
				mostFrequentFood = food
			}
		}

		// 根据高频食物生成饮食模式描述
		if mostFrequentFood != "" {
			if mostFrequentFood == "红薯" || mostFrequentFood == "玉米" || mostFrequentFood == "土豆" {
				dietPattern = fmt.Sprintf("偏好淀粉类食物（如%s）", mostFrequentFood)
				dietAdvice = append(dietAdvice, fmt.Sprintf("你经常吃%s，这是很好的膳食纤维来源", mostFrequentFood))
				if detailedStats.AvgSmellLevel > 2.0 {
					dietAdvice = append(dietAdvice, "但要注意适量，过多可能导致产气增加")
				}
				funnyComment = fmt.Sprintf("你最近是不是%s吃多了？数据已经出卖你了。", mostFrequentFood)
			} else if mostFrequentFood == "饺子" || mostFrequentFood == "大饼" {
				dietPattern = fmt.Sprintf("偏好面食类（如%s）", mostFrequentFood)
				dietAdvice = append(dietAdvice, fmt.Sprintf("你经常吃%s，注意搭配蔬菜", mostFrequentFood))
				if mostFrequentFood == "大饼" && detailedStats.AvgSmellLevel > 2.0 {
					funnyComment = "看来饼类食物可能不太适合你，试试减少一些？"
				} else {
					funnyComment = fmt.Sprintf("你的%s记录很频繁呢～", mostFrequentFood)
				}
			} else if mostFrequentFood == "黄豆" || mostFrequentFood == "豆类" {
				dietPattern = "偏好豆类食物"
				dietAdvice = append(dietAdvice, "豆类富含蛋白质和纤维，但容易产气", "建议适量摄入，充分煮熟")
				funnyComment = "豆类食物是你的常客呢，注意适量哦～"
			} else {
				dietPattern = fmt.Sprintf("饮食中包含%s等食物", strings.Join(noteAnalysis.Foods[:min(3, len(noteAnalysis.Foods))], "、"))
				funnyComment = fmt.Sprintf("你的饮食记录很丰富，%s出现频率很高", mostFrequentFood)
			}
		} else {
			dietPattern = fmt.Sprintf("饮食多样化，包含%s等", strings.Join(noteAnalysis.Foods[:min(3, len(noteAnalysis.Foods))], "、"))
			funnyComment = "你的饮食记录很丰富，继续保持～"
		}

		// 根据备注中的感受生成建议
		if len(noteAnalysis.Feelings) > 0 {
			for _, feeling := range noteAnalysis.Feelings {
				if strings.Contains(feeling, "臭") || strings.Contains(feeling, "味道") {
					dietAdvice = append(dietAdvice, "根据你的记录，气味较重时建议减少产气食物")
					break
				}
			}
		}
	} else {
		// 没有备注时，使用原来的逻辑
		if detailedStats.AvgSmellLevel > 2.5 {
			dietPattern = "可能偏好高蛋白或辛辣食物"
			foodPreferences = append(foodPreferences, "高蛋白食物", "辛辣食物")
			dietAdvice = append(dietAdvice, "建议减少豆类、洋葱等产气食物", "多喝水促进消化")
			funnyComment = "你最近是不是螺蛳粉吃上头了？数据已经出卖你了。"
		} else if detailedStats.AvgSmellLevel < 1.5 {
			dietPattern = "清淡饮食为主"
			foodPreferences = append(foodPreferences, "清淡食物", "蔬菜水果")
			dietAdvice = append(dietAdvice, "继续保持清淡饮食", "适量增加蛋白质摄入")
			funnyComment = "你的饮食很健康，肠道都在为你点赞！"
		} else {
			dietPattern = "均衡饮食"
			foodPreferences = append(foodPreferences, "均衡搭配")
			dietAdvice = append(dietAdvice, "继续保持均衡饮食", "适量摄入益生菌食物")
			funnyComment = "你的饮食习惯很均衡，肠道状态很稳定！"
		}
	}

	// 根据频率调整建议
	if detailedStats.DailyAverage > 20 {
		dietAdvice = append(dietAdvice, "放屁频率偏高，建议减少高纤维食物摄入")
	} else if detailedStats.DailyAverage < 5 {
		dietAdvice = append(dietAdvice, "放屁频率偏低，建议增加膳食纤维，多吃蔬菜水果")
	}

	return &DietAnalysis{
		DietPattern:     dietPattern,
		DietAdvice:      dietAdvice,
		FunnyComment:    funnyComment,
		FoodPreferences: foodPreferences,
	}
}

// min 辅助函数
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// generateLifestyleAdvice 生成生活方式建议
func (s *AiReviewService) generateLifestyleAdvice(detailedStats *DetailedStatsForAI, userStats *UserStatsForAI) *LifestyleAdvice {
	scheduleTips := []string{}
	relaxAdvice := []string{}
	activityTips := []string{}
	improvementTips := []string{}

	noteAnalysis := detailedStats.NoteAnalysis
	if noteAnalysis == nil {
		noteAnalysis = &NoteAnalysis{}
	}

	// 优先使用备注中的场景信息
	if noteAnalysis.HasNotes && len(noteAnalysis.Scenarios) > 0 {
		for _, scenario := range noteAnalysis.Scenarios {
			if strings.Contains(scenario, "晚上") || strings.Contains(scenario, "晚上老是") {
				scheduleTips = append(scheduleTips, "根据你的记录，晚上放屁较多，建议晚餐清淡一些")
				if len(scheduleTips) >= 2 {
					break
				}
			} else if strings.Contains(scenario, "早上") || strings.Contains(scenario, "七点") {
				scheduleTips = append(scheduleTips, "你早上比较活跃，这是正常的肠道蠕动表现")
				if len(scheduleTips) >= 2 {
					break
				}
			} else if strings.Contains(scenario, "电梯") {
				relaxAdvice = append(relaxAdvice, "在电梯里放屁确实有点尴尬，但这是正常现象，放轻松～")
				if len(relaxAdvice) >= 2 {
					break
				}
			}
		}
	}

	// 使用备注中的健康问题信息
	if noteAnalysis.HasNotes && len(noteAnalysis.HealthIssues) > 0 {
		for _, issue := range noteAnalysis.HealthIssues {
			if strings.Contains(issue, "上大号") || strings.Contains(issue, "大号") {
				improvementTips = append(improvementTips, "根据你的记录，建议多喝水，增加膳食纤维，促进排便")
				if len(improvementTips) >= 3 {
					break
				}
			} else if strings.Contains(issue, "肠鸣") {
				improvementTips = append(improvementTips, "肠鸣是肠道蠕动的正常表现，注意饮食规律")
				if len(improvementTips) >= 3 {
					break
				}
			} else if strings.Contains(issue, "不能吃") || strings.Contains(issue, "不会那么臭") {
				// 提取不能吃的食物
				if strings.Contains(issue, "饼") {
					improvementTips = append(improvementTips, "根据你的记录，饼类食物可能不太适合，建议减少摄入")
				} else if strings.Contains(issue, "薏米") {
					improvementTips = append(improvementTips, "你提到薏米可能不太适合，可以尝试其他食物")
				}
				if len(improvementTips) >= 3 {
					break
				}
			}
		}
	}

	// 根据时间段分布分析作息（如果备注中没有相关信息）
	if len(scheduleTips) == 0 {
		morningCount := detailedStats.TimePeriodDistribution["morning"]
		afternoonCount := detailedStats.TimePeriodDistribution["afternoon"]
		eveningCount := detailedStats.TimePeriodDistribution["evening"]
		dawnCount := detailedStats.TimePeriodDistribution["dawn"]

		// 优先检查凌晨记录
		if dawnCount > 0 {
			scheduleTips = append(scheduleTips, "凌晨也有记录，建议调整作息，保证充足睡眠")
		} else if eveningCount > morningCount+afternoonCount {
			// 如果没有凌晨记录，但晚上活动较多
			scheduleTips = append(scheduleTips, "晚上活动较多，注意不要熬夜")
		} else {
			// 只有在没有凌晨记录且作息正常的情况下，才说作息规律
			scheduleTips = append(scheduleTips, "作息规律，继续保持")
		}
	}

	// 根据心情分析（如果备注中没有相关信息）
	if len(relaxAdvice) == 0 {
		if detailedStats.MostMood == "embarrassed" {
			relaxAdvice = append(relaxAdvice, "放屁是正常生理现象，不必尴尬", "保持轻松心态，享受生活")
		} else if detailedStats.MostMood == "happy" {
			relaxAdvice = append(relaxAdvice, "保持愉快心情，这对肠道健康很重要")
		} else {
			relaxAdvice = append(relaxAdvice, "保持平和心态，适度放松")
		}
	}

	// 活动建议
	if detailedStats.DailyAverage < 10 {
		activityTips = append(activityTips, "建议增加适量运动，促进肠道蠕动")
	} else {
		activityTips = append(activityTips, "保持适量运动，维持肠道健康")
	}

	// 改善指引（如果备注中没有相关信息）
	if len(improvementTips) == 0 {
		if detailedStats.AvgSmellLevel > 2.5 {
			improvementTips = append(improvementTips, "减少辛辣油腻食物", "增加清淡易消化食物", "多喝水")
		}
		if detailedStats.DailyAverage > 25 {
			improvementTips = append(improvementTips, "注意饮食结构，避免暴饮暴食")
		}
		if len(improvementTips) == 0 {
			improvementTips = append(improvementTips, "继续保持良好的生活习惯")
		}
	}

	return &LifestyleAdvice{
		ScheduleTips:    scheduleTips,
		RelaxAdvice:     relaxAdvice,
		ActivityTips:    activityTips,
		ImprovementTips: improvementTips,
	}
}

// generatePersonalityTags 生成趣味人格标签
func (s *AiReviewService) generatePersonalityTags(detailedStats *DetailedStatsForAI, userStats *UserStatsForAI) []PersonalityTag {
	tags := []PersonalityTag{}

	// 根据类型生成标签
	switch detailedStats.MostType {
	case "loud":
		tags = append(tags, PersonalityTag{
			TagName:  "节奏大师",
			TagDesc:  "你的放屁风格很响亮，肠道排气顺畅，是个节奏稳定的放屁艺术家！",
			TagEmoji: "🎵",
		})
	case "soft":
		tags = append(tags, PersonalityTag{
			TagName:  "温柔派",
			TagDesc:  "你的放屁风格很轻柔，内敛而优雅，闷声发大财～",
			TagEmoji: "🌸",
		})
	case "silent":
		tags = append(tags, PersonalityTag{
			TagName:  "静音模式",
			TagDesc:  "你的放屁很安静，低调而神秘，深藏不露～",
			TagEmoji: "🤫",
		})
	}

	// 根据频率生成标签
	if detailedStats.DailyAverage >= 15 && detailedStats.DailyAverage <= 20 {
		tags = append(tags, PersonalityTag{
			TagName:  "标准屁民",
			TagDesc:  "你的放屁频率在正常范围内，是标准的健康屁民！",
			TagEmoji: "✅",
		})
	} else if detailedStats.DailyAverage > 20 {
		tags = append(tags, PersonalityTag{
			TagName:  "活跃分子",
			TagDesc:  "你的肠道很活跃，放屁频率较高，是个活跃的屁民！",
			TagEmoji: "🚀",
		})
	}

	// 根据心情生成标签
	if detailedStats.MostMood == "happy" {
		tags = append(tags, PersonalityTag{
			TagName:  "快乐屁民",
			TagDesc:  "你总是以开心的心情记录，是个快乐的屁民！",
			TagEmoji: "😊",
		})
	}

	// 根据时间段生成标签
	if detailedStats.MostTimePeriod == "evening" {
		tags = append(tags, PersonalityTag{
			TagName:  "夜猫子",
			TagDesc:  "你晚上比较活跃，是个夜猫子型的屁民！",
			TagEmoji: "🌙",
		})
	} else if detailedStats.MostTimePeriod == "morning" {
		tags = append(tags, PersonalityTag{
			TagName:  "早起鸟",
			TagDesc:  "你早上比较活跃，是个早起鸟型的屁民！",
			TagEmoji: "🌅",
		})
	}

	// 如果标签太少，添加通用标签
	if len(tags) < 2 {
		tags = append(tags, PersonalityTag{
			TagName:  "记录达人",
			TagDesc:  "你认真记录每一次放屁，是个记录达人！",
			TagEmoji: "📝",
		})
	}

	return tags
}
