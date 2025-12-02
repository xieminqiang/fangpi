package service

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sync"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	openai "github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"go.uber.org/zap"
)

type AiChatService struct {
	client *openai.Client
	// 存储每个用户的对话历史，key: userId_roleType, value: messages
	conversationStore sync.Map
}

// ChatMessage 聊天消息结构
type ChatMessage struct {
	Role    string `json:"role"`    // user, assistant
	Content string `json:"content"` // 消息内容
}

// ChatRequest 聊天请求
type ChatRequest struct {
	RoleType string `json:"roleType"` // 角色类型：ppjl(屁屁精灵) or cbos(肠博士)
	Message  string `json:"message"`  // 用户消息
}

// StreamResponse 流式响应
type StreamResponse struct {
	Type    string `json:"type"`    // thinking, content, done, error
	Content string `json:"content"` // 内容
	Done    bool   `json:"done"`    // 是否完成
}

// RoleConfig 角色配置
type RoleConfig struct {
	Name         string
	SystemPrompt string
}

var roleConfigs = map[string]RoleConfig{
	"ppjl": {
		Name: "屁屁精灵",
		SystemPrompt: `你是"屁屁精灵"，一个活泼可爱、充满活力的肠道健康小助手！🌟

你的特点：
- 性格活泼开朗，说话轻松幽默，喜欢用可爱的语气和表情符号
- 专注于肠道健康、消化系统、放屁相关的科普知识
- 用通俗易懂的方式解释医学知识，让用户轻松理解
- 经常使用"哦~""呀~""呢~"等可爱的语气词
- 喜欢用比喻和生动的例子来解释问题

你的使命：
- 帮助用户了解肠道健康知识
- 解答关于放屁、消化等问题
- 提供健康饮食建议
- 用轻松的方式传播健康理念

回答风格：
- 简洁明了，每次回答控制在150字以内
- 多使用表情符号💨🌟💪✨等
- 语气亲切温柔，像朋友聊天一样`,
	},
	"cbos": {
		Name: "肠博士",
		SystemPrompt: `你是"肠博士"，一位专业严谨的肠道健康专家！👨‍⚕️

你的特点：
- 专业权威，具有丰富的医学知识
- 讲解详细准确，注重科学依据
- 态度温和耐心，善于倾听和解答
- 会用医学术语，但也会用通俗语言解释

你的专长：
- 消化系统疾病的预防和保健
- 肠道菌群平衡与调理
- 饮食营养与肠道健康的关系
- 提供专业的健康建议和就医指导

回答风格：
- 结构清晰，先总述后分点
- 专业但不失亲和力
- 适度使用医学术语，并做解释
- 每次回答控制在200字以内
- 适当使用表情符号📋🔬💊等`,
	},
}

// NewAiChatService 创建AI聊天服务实例
func NewAiChatService() *AiChatService {
	// 获取OpenAI配置，优先使用环境变量
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		apiKey = "sk-38da2ed6c20a45a38808019fccc11bd1" // 默认API Key
	}

	// 创建OpenAI客户端
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
		option.WithBaseURL("https://dashscope.aliyuncs.com/compatible-mode/v1/"),
	)

	return &AiChatService{
		client: &client,
	}
}

// GetConversationKey 获取对话存储key
func (s *AiChatService) GetConversationKey(userID uint, roleType string) string {
	return fmt.Sprintf("%d_%s", userID, roleType)
}

// GetMessages 获取对话历史
func (s *AiChatService) GetMessages(userID uint, roleType string) []ChatMessage {
	key := s.GetConversationKey(userID, roleType)
	if val, ok := s.conversationStore.Load(key); ok {
		if messages, ok := val.([]ChatMessage); ok {
			return messages
		}
	}
	return []ChatMessage{}
}

// AddMessage 添加消息到对话历史
func (s *AiChatService) AddMessage(userID uint, roleType string, message ChatMessage) {
	key := s.GetConversationKey(userID, roleType)
	messages := s.GetMessages(userID, roleType)
	messages = append(messages, message)
	s.conversationStore.Store(key, messages)
}

// ClearConversation 清空对话历史
func (s *AiChatService) ClearConversation(userID uint, roleType string) {
	key := s.GetConversationKey(userID, roleType)
	s.conversationStore.Delete(key)
}

// StreamChat 流式对话
func (s *AiChatService) StreamChat(ctx context.Context, userID uint, roleType string, userMessage string, responseChan chan<- StreamResponse) {
	defer close(responseChan)

	// 验证角色类型
	roleConfig, ok := roleConfigs[roleType]
	if !ok {
		responseChan <- StreamResponse{
			Type:    "error",
			Content: "无效的角色类型",
			Done:    true,
		}
		return
	}

	// 添加用户消息到历史
	s.AddMessage(userID, roleType, ChatMessage{
		Role:    "user",
		Content: userMessage,
	})

	// 获取对话历史
	messages := s.GetMessages(userID, roleType)

	// 构建OpenAI消息格式
	openaiMessages := []openai.ChatCompletionMessageParamUnion{
		openai.SystemMessage(roleConfig.SystemPrompt),
	}

	for _, msg := range messages {
		if msg.Role == "user" {
			openaiMessages = append(openaiMessages, openai.UserMessage(msg.Content))
		} else if msg.Role == "assistant" {
			openaiMessages = append(openaiMessages, openai.AssistantMessage(msg.Content))
		}
	}

	global.GVA_LOG.Info("开始AI流式对话",
		zap.Uint("userId", userID),
		zap.String("roleType", roleType),
		zap.String("message", userMessage),
	)

	// 调用OpenAI流式API
	stream := s.client.Chat.Completions.NewStreaming(
		ctx,
		openai.ChatCompletionNewParams{
			Messages: openaiMessages,
			Model:    "qwen-plus",
		},
	)

	var answerContent string

	// 处理流式响应
	for stream.Next() {
		chunk := stream.Current()

		if len(chunk.Choices) == 0 {
			continue
		}

		delta := chunk.Choices[0].Delta

		// 发送回复内容
		if delta.Content != "" {
			answerContent += delta.Content
			responseChan <- StreamResponse{
				Type:    "content",
				Content: delta.Content,
				Done:    false,
			}
		}
	}

	if err := stream.Err(); err != nil {
		global.GVA_LOG.Error("AI流式对话失败", zap.Error(err))
		responseChan <- StreamResponse{
			Type:    "error",
			Content: "AI回复失败: " + err.Error(),
			Done:    true,
		}
		return
	}

	// 保存助手回复到历史
	s.AddMessage(userID, roleType, ChatMessage{
		Role:    "assistant",
		Content: answerContent,
	})

	// 发送完成信号
	responseChan <- StreamResponse{
		Type:    "done",
		Content: "",
		Done:    true,
	}

	global.GVA_LOG.Info("AI流式对话完成",
		zap.Uint("userId", userID),
		zap.String("roleType", roleType),
		zap.Int("answerLength", len(answerContent)),
	)
}

// GetRoleList 获取角色列表
func (s *AiChatService) GetRoleList() []map[string]interface{} {
	return []map[string]interface{}{
		{
			"id":          "ppjl",
			"name":        "屁屁精灵",
			"avatar":      "💨",
			"description": "活泼可爱的肠道健康小助手，用轻松幽默的方式帮你了解肠道健康知识～",
			"tags":        []string{"可爱", "活泼", "轻松"},
		},
		{
			"id":          "cbos",
			"name":        "肠博士",
			"avatar":      "👨‍⚕️",
			"description": "专业严谨的肠道健康专家，为你提供权威的健康建议和科学指导。",
			"tags":        []string{"专业", "权威", "严谨"},
		},
	}
}

// FormatMessageToJSON 将消息格式化为JSON
func FormatMessageToJSON(msg StreamResponse) string {
	data, err := json.Marshal(msg)
	if err != nil {
		return `{"type":"error","content":"消息格式化失败","done":true}`
	}
	return string(data)
}
