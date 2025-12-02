package service

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"go.uber.org/zap"
)

type OpenAIService struct {
	client *openai.Client
}

// NewOpenAIService 创建OpenAI服务实例
func NewOpenAIService() *OpenAIService {
	// 从环境变量获取API Key
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		global.GVA_LOG.Warn("OpenAI API Key not found in environment variable, using default key")
		apiKey = "sk-38da2ed6c20a45a38808019fccc11bd1" // 默认API Key
	}

	// 创建OpenAI客户端
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
		option.WithBaseURL("https://dashscope.aliyuncs.com/compatible-mode/v1/"), // 通义千问API地址
	)

	return &OpenAIService{
		client: &client,
	}
}

// GeneratePersonalityReview 使用AI生成个性化点评
func (s *OpenAIService) GeneratePersonalityReview(ctx context.Context, userStats *UserStatsForAI) (string, error) {
	// 构建提示词
	prompt := s.buildPrompt(userStats)

	// 调用OpenAI API
	chatCompletion, err := s.client.Chat.Completions.New(
		ctx,
		openai.ChatCompletionNewParams{
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.UserMessage(prompt),
			},
			Model: "qwen-plus", // 使用通义千问模型
		},
	)

	if err != nil {
		global.GVA_LOG.Error("OpenAI API调用失败", zap.Error(err))
		return "", fmt.Errorf("AI生成失败: %v", err)
	}

	if len(chatCompletion.Choices) == 0 {
		return "", fmt.Errorf("AI未返回有效结果")
	}

	reviewText := chatCompletion.Choices[0].Message.Content
	global.GVA_LOG.Info("AI生成点评成功", zap.String("review", reviewText))

	return reviewText, nil
}

// buildPrompt 构建AI提示词
func (s *OpenAIService) buildPrompt(userStats *UserStatsForAI) string {
	// 根据等级确定健康建议重点
	var healthFocus string
	switch {
	case userStats.Level <= 3:
		healthFocus = "新手用户，重点给予鼓励和基础健康建议"
	case userStats.Level <= 6:
		healthFocus = "中级用户，关注肠道健康和饮食调整"
	default:
		healthFocus = "高级用户，强调均衡饮食和微生态平衡"
	}

	return fmt.Sprintf(`你是一个专业的肠道健康AI助手，专门为用户提供个性化的放屁点评和健康建议。请根据以下用户数据生成一段专业、温馨的点评：

用户信息：
- 昵称：%s
- 总放屁次数：%d
- 当前等级：%d级 (%s)
- 经验值：%d
- 本周放屁次数：%d
- 日均放屁次数：%d
- 最常见的放屁类型：%s
- 最大气味强度：%s
- 最近趋势：%s

健康知识背景：
- 正常成年人每天放屁10-20次是正常的
- 放屁是肠道健康的正常表现，有助于排出体内气体
- 气味浓烈可能与饮食、消化功能、肠道菌群有关
- 放屁频率变化可以反映肠道健康状况
- 豆类、洋葱、高纤维食物会增加放屁频率
- 益生菌有助于改善肠道菌群平衡

要求：
1. 结合肠道健康知识，给出专业的点评
2. 根据用户等级(%s)提供相应的健康建议
3. 语言要温馨友好，既专业又亲切
4. 长度控制在80字以内
5. 可以适当使用表情符号
6. 包含具体的健康建议，如饮食、运动、生活习惯等

请直接返回点评内容，不要包含其他解释：`,
		userStats.Nickname,
		userStats.TotalFarts,
		userStats.Level,
		userStats.LevelName,
		userStats.Experience,
		userStats.WeekCount,
		userStats.DailyAverage,
		userStats.MostType,
		userStats.MaxSmell,
		userStats.RecentTrend,
		healthFocus,
	)
}

// GenerateEmoji 生成相关表情符号
func (s *OpenAIService) GenerateEmoji(ctx context.Context, userStats *UserStatsForAI) (string, error) {
	prompt := fmt.Sprintf(`根据用户的放屁数据生成一个合适的表情符号：

用户等级：%d级 (%s)
总放屁次数：%d
最近趋势：%s

请从以下表情符号中选择一个最合适的：💨🎵🎭🎨🎶✨🌟💫🌱👶🎈💰😴🚀

只返回一个表情符号，不要其他内容：`,
		userStats.Level,
		userStats.LevelName,
		userStats.TotalFarts,
		userStats.RecentTrend,
	)

	chatCompletion, err := s.client.Chat.Completions.New(
		ctx,
		openai.ChatCompletionNewParams{
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.UserMessage(prompt),
			},
			Model: "qwen-plus",
		},
	)

	if err != nil {
		global.GVA_LOG.Error("生成表情符号失败", zap.Error(err))
		return "💨", nil // 返回默认表情
	}

	if len(chatCompletion.Choices) == 0 {
		return "💨", nil
	}

	emoji := chatCompletion.Choices[0].Message.Content
	global.GVA_LOG.Info("AI生成表情符号", zap.String("emoji", emoji))

	return emoji, nil
}

// HealthAnalysisResult AI健康分析结果
type HealthAnalysisResult struct {
	ReviewText      string `json:"reviewText"`      // 点评文本
	Emoji           string `json:"emoji"`           // 表情符号
	HealthScore     int    `json:"healthScore"`     // 健康评分 (0-100)
	PatencyIndex    int    `json:"patencyIndex"`    // 肠道通畅指数 (0-100)
	AirflowActivity int    `json:"airflowActivity"` // 气流活跃度 (0-100)
	DietAdvice      string `json:"dietAdvice"`      // 饮食建议
	LifestyleTip    string `json:"lifestyleTip"`    // 生活建议
}

// GenerateHealthAnalysis 使用AI生成完整的健康分析（包括评分）
func (s *OpenAIService) GenerateHealthAnalysis(ctx context.Context, userStats *UserStatsForAI, detailedStats *DetailedStatsForAI) (*HealthAnalysisResult, error) {
	prompt := s.buildHealthAnalysisPrompt(userStats, detailedStats)

	chatCompletion, err := s.client.Chat.Completions.New(
		ctx,
		openai.ChatCompletionNewParams{
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.UserMessage(prompt),
			},
			Model: "qwen-plus",
		},
	)

	if err != nil {
		global.GVA_LOG.Error("AI健康分析调用失败", zap.Error(err))
		return nil, fmt.Errorf("AI生成失败: %v", err)
	}

	if len(chatCompletion.Choices) == 0 {
		return nil, fmt.Errorf("AI未返回有效结果")
	}

	responseText := chatCompletion.Choices[0].Message.Content
	global.GVA_LOG.Info("AI生成健康分析成功", zap.String("response", responseText))

	// 解析AI返回的JSON结果
	result, err := s.parseHealthAnalysisResponse(responseText)
	if err != nil {
		global.GVA_LOG.Warn("解析AI返回结果失败，尝试提取关键信息", zap.Error(err))
		// 如果解析失败，尝试从文本中提取信息
		result = s.extractHealthInfoFromText(responseText, userStats)
	}

	return result, nil
}

// buildHealthAnalysisPrompt 构建健康分析提示词
func (s *OpenAIService) buildHealthAnalysisPrompt(userStats *UserStatsForAI, detailedStats *DetailedStatsForAI) string {
	// 构建备注信息摘要
	noteSummary := ""
	if detailedStats.NoteAnalysis != nil && detailedStats.NoteAnalysis.HasNotes {
		if len(detailedStats.NoteAnalysis.Foods) > 0 {
			foodCount := 5
			if len(detailedStats.NoteAnalysis.Foods) < foodCount {
				foodCount = len(detailedStats.NoteAnalysis.Foods)
			}
			noteSummary += fmt.Sprintf("备注中提到的食物：%s。", strings.Join(detailedStats.NoteAnalysis.Foods[:foodCount], "、"))
		}
		if len(detailedStats.NoteAnalysis.HealthIssues) > 0 {
			issueCount := 3
			if len(detailedStats.NoteAnalysis.HealthIssues) < issueCount {
				issueCount = len(detailedStats.NoteAnalysis.HealthIssues)
			}
			noteSummary += fmt.Sprintf("健康相关记录：%s。", strings.Join(detailedStats.NoteAnalysis.HealthIssues[:issueCount], "、"))
		}
	}

	return fmt.Sprintf(`你是一个专业的肠道健康AI分析专家。请根据以下用户数据，生成一份完整的健康分析报告，并以JSON格式返回。

用户数据：
- 昵称：%s
- 总放屁次数：%d
- 当前等级：%d级 (%s)
- 本周放屁次数：%d
- 日均放屁次数：%d
- 最常见的放屁类型：%s
- 最大气味强度：%s
- 最近趋势：%s
- 平均气味等级：%.1f
%s

健康知识参考：
- 正常成年人每天放屁10-20次属于正常范围
- 放屁频率过高（>25次/天）可能表示饮食不当或消化问题
- 放屁频率过低（<5次/天）可能表示肠道蠕动不足
- 气味浓烈可能与高蛋白食物、消化不完全、肠道菌群失衡有关
- 肠道通畅指数反映肠道排气是否顺畅
- 气流活跃度反映肠道气体产生的频率和强度

请返回JSON格式，包含以下字段：
{
  "reviewText": "一段80字以内的专业点评，语言温馨友好",
  "emoji": "一个合适的表情符号",
  "healthScore": 0-100的整数，表示整体肠道健康评分（正常范围70-90分）,
  "patencyIndex": 0-100的整数，表示肠道通畅指数（正常范围60-85分）,
  "airflowActivity": 0-100的整数，表示气流活跃度（正常范围50-80分）,
  "dietAdvice": "一段饮食建议，50字以内",
  "lifestyleTip": "一段生活建议，50字以内"
}

评分标准：
- healthScore: 基于日均次数、气味强度、趋势综合评估（正常70-90，偏高/偏低60-70，异常<60或>90）
- patencyIndex: 基于放屁类型和频率评估（响亮型且频率正常=高分，闷声型或频率异常=低分）
- airflowActivity: 基于日均次数和趋势评估（频率正常且稳定=中等，频率高或上升=高分，频率低或下降=低分）

请只返回JSON，不要包含其他解释：`,
		userStats.Nickname,
		userStats.TotalFarts,
		userStats.Level,
		userStats.LevelName,
		userStats.WeekCount,
		userStats.DailyAverage,
		userStats.MostType,
		userStats.MaxSmell,
		userStats.RecentTrend,
		detailedStats.AvgSmellLevel,
		noteSummary,
	)
}

// parseHealthAnalysisResponse 解析AI返回的JSON响应
func (s *OpenAIService) parseHealthAnalysisResponse(responseText string) (*HealthAnalysisResult, error) {
	// 尝试提取JSON部分（去除可能的markdown代码块标记）
	jsonText := responseText
	if strings.Contains(jsonText, "```json") {
		start := strings.Index(jsonText, "```json")
		end := strings.Index(jsonText[start:], "```")
		if end > 0 {
			jsonText = jsonText[start+7 : start+end]
		}
	} else if strings.Contains(jsonText, "```") {
		start := strings.Index(jsonText, "```")
		end := strings.LastIndex(jsonText, "```")
		if end > start {
			jsonText = jsonText[start+3 : end]
		}
	}

	jsonText = strings.TrimSpace(jsonText)

	// 尝试找到JSON对象的开始和结束位置
	startIdx := strings.Index(jsonText, "{")
	endIdx := strings.LastIndex(jsonText, "}")
	if startIdx < 0 || endIdx < startIdx {
		return nil, fmt.Errorf("无法找到有效的JSON对象")
	}

	jsonText = jsonText[startIdx : endIdx+1]

	// 使用encoding/json解析
	var result HealthAnalysisResult
	if err := json.Unmarshal([]byte(jsonText), &result); err != nil {
		return nil, fmt.Errorf("JSON解析失败: %v", err)
	}

	// 验证结果
	if result.ReviewText == "" {
		return nil, fmt.Errorf("reviewText为空")
	}

	// 确保评分在合理范围内
	if result.HealthScore < 0 || result.HealthScore > 100 {
		result.HealthScore = 75
	}
	if result.PatencyIndex < 0 || result.PatencyIndex > 100 {
		result.PatencyIndex = 70
	}
	if result.AirflowActivity < 0 || result.AirflowActivity > 100 {
		result.AirflowActivity = 70
	}

	// 设置默认值
	if result.Emoji == "" {
		result.Emoji = "💨"
	}
	if result.DietAdvice == "" {
		result.DietAdvice = "保持均衡饮食，适量摄入膳食纤维"
	}
	if result.LifestyleTip == "" {
		result.LifestyleTip = "保持规律作息，适量运动"
	}

	return &result, nil
}

// extractHealthInfoFromText 从文本中提取健康信息（备用方案）
func (s *OpenAIService) extractHealthInfoFromText(text string, userStats *UserStatsForAI) *HealthAnalysisResult {
	result := &HealthAnalysisResult{
		ReviewText:      text,
		Emoji:           "💨",
		HealthScore:     75,
		PatencyIndex:    70,
		AirflowActivity: 70,
		DietAdvice:      "保持均衡饮食，适量摄入膳食纤维",
		LifestyleTip:    "保持规律作息，适量运动",
	}

	// 根据用户数据估算评分
	if userStats.DailyAverage >= 10 && userStats.DailyAverage <= 20 {
		result.HealthScore = 80
		result.PatencyIndex = 75
		result.AirflowActivity = 70
	} else if userStats.DailyAverage > 20 {
		result.HealthScore = 70
		result.PatencyIndex = 80
		result.AirflowActivity = 85
	} else {
		result.HealthScore = 70
		result.PatencyIndex = 65
		result.AirflowActivity = 60
	}

	return result
}
