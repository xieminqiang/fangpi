package api

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/utils"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var AiChatApi = new(aiChatApi)

type aiChatApi struct{}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // 允许跨域
	},
}

// GetRoleList 获取AI角色列表
// @Tags BreakApp
// @Summary 获取AI角色列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=[]map[string]interface{},msg=string} "获取成功"
// @Router /break/ai/chat/roles [get]
func (a *aiChatApi) GetRoleList(c *gin.Context) {
	chatService := service.NewAiChatService()
	roles := chatService.GetRoleList()
	response.OkWithData(roles, c)
}

// ClearConversation 清空对话历史
// @Tags BreakApp
// @Summary 清空对话历史
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param roleType query string true "角色类型"
// @Success 200 {object} response.Response{msg=string} "清空成功"
// @Router /break/ai/chat/clear [post]
func (a *aiChatApi) ClearConversation(c *gin.Context) {
	roleType := c.Query("roleType")
	if roleType == "" {
		response.FailWithMessage("角色类型不能为空", c)
		return
	}

	userID := getUserIdFromToken(c)
	if userID == 0 {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	chatService := service.NewAiChatService()
	chatService.ClearConversation(userID, roleType)
	response.OkWithMessage("对话历史已清空", c)
}

// ChatWebSocket WebSocket聊天接口
// @Tags BreakApp
// @Summary WebSocket AI聊天
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param roleType query string true "角色类型"
// @Router /break/ai/chat/ws [get]
func (a *aiChatApi) ChatWebSocket(c *gin.Context) {
	roleType := c.Query("roleType")
	if roleType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "角色类型不能为空"})
		return
	}

	// 从token获取用户ID
	userID := getUserIdFromToken(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录或Token无效"})
		return
	}

	// 升级为WebSocket连接
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		global.GVA_LOG.Error("WebSocket升级失败", zap.Error(err))
		return
	}
	defer conn.Close()

	global.GVA_LOG.Info("WebSocket连接建立",
		zap.Uint("userId", userID),
		zap.String("roleType", roleType),
	)

	chatService := service.NewAiChatService()

	// 设置连接超时
	conn.SetReadDeadline(time.Now().Add(300 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(300 * time.Second))
		return nil
	})

	// 启动心跳检测
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
			}
		}
	}()

	// 处理消息循环
	for {
		// 读取客户端消息
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				global.GVA_LOG.Error("WebSocket读取消息失败", zap.Error(err))
			}
			break
		}

		if messageType != websocket.TextMessage {
			continue
		}

		// 解析消息
		var chatReq service.ChatRequest
		if err := json.Unmarshal(message, &chatReq); err != nil {
			global.GVA_LOG.Error("解析消息失败", zap.Error(err))
			conn.WriteJSON(service.StreamResponse{
				Type:    "error",
				Content: "消息格式错误",
				Done:    true,
			})
			continue
		}

		// 验证消息
		if chatReq.Message == "" {
			conn.WriteJSON(service.StreamResponse{
				Type:    "error",
				Content: "消息内容不能为空",
				Done:    true,
			})
			continue
		}

		// 创建响应通道
		responseChan := make(chan service.StreamResponse, 100)

		// 启动流式对话
		go chatService.StreamChat(ctx, userID, roleType, chatReq.Message, responseChan)

		// 发送流式响应
		for resp := range responseChan {
			if err := conn.WriteJSON(resp); err != nil {
				global.GVA_LOG.Error("发送消息失败", zap.Error(err))
				break
			}

			// 如果是完成或错误消息，等待一下再继续
			if resp.Done {
				time.Sleep(100 * time.Millisecond)
				break
			}
		}
	}

	global.GVA_LOG.Info("WebSocket连接关闭",
		zap.Uint("userId", userID),
		zap.String("roleType", roleType),
	)
}

// getUserIdFromToken 从token中获取用户ID
func getUserIdFromToken(c *gin.Context) uint {
	token := c.GetHeader("x-token")
	if token == "" {
		// 尝试从query获取
		token = c.Query("token")
	}

	if token == "" {
		return 0
	}

	// 解析token
	j := utils.NewJWT()
	claims, err := j.ParseToken(token)
	if err != nil {
		return 0
	}

	// 从claims中获取用户ID
	return claims.WxClaims.UserId
}
