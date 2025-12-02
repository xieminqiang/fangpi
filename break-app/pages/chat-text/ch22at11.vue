<template>
	<view class="chat-container">
		<!-- 顶部导航栏 -->
		<view class="chat-header">
			<view class="header-left" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<view class="header-center">
				<text class="role-avatar">{{ roleAvatar }}</text>
				<text class="role-name">{{ roleName }}</text>
			</view>
			<view class="header-right" @click="clearHistory">
				<text class="clear-icon">🗑️</text>
			</view>
		</view>

		<!-- 聊天消息列表 -->
		<scroll-view 
			class="chat-messages"
			scroll-y
			:scroll-into-view="scrollIntoView"
			:scroll-with-animation="true"
		>
			<view 
				v-for="(msg, index) in messages" 
				:key="index" 
				:id="'msg-' + index"
				class="message-wrapper"
				:class="msg.role === 'user' ? 'user-message' : 'ai-message'"
			>
				<!-- AI消息 -->
				<view v-if="msg.role === 'assistant'" class="message-item">
					<view class="avatar">{{ roleAvatar }}</view>
					<view class="message-content">
						<view v-if="msg.thinking" class="thinking-content">
							<text class="thinking-label">💭 思考中...</text>
							<text class="thinking-text">{{ msg.thinking }}</text>
						</view>
						<view class="text-content">{{ msg.content }}</view>
					</view>
				</view>

				<!-- 用户消息 -->
				<view v-else class="message-item">
					<view class="message-content">
						<text class="text-content">{{ msg.content }}</text>
					</view>
					<view class="avatar user-avatar">👤</view>
				</view>
			</view>

			<!-- 加载中提示 -->
			<view v-if="isLoading" class="loading-indicator">
				<text class="loading-text">{{ loadingText }}</text>
			</view>
		</scroll-view>

		<!-- 输入框 -->
		<view class="chat-input-wrapper">
			<view class="input-container">
				<textarea 
					v-model="inputMessage"
					class="message-input"
					:placeholder="'和' + roleName + '聊聊吧...'"
					:maxlength="500"
					:auto-height="true"
					:adjust-position="true"
					@focus="onInputFocus"
				/>
				<view 
					class="send-button"
					:class="{ 'disabled': !canSend }"
					@click="sendMessage"
				>
					<text class="send-icon">{{ canSend ? '发送' : '...' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useUserStore } from '@/src/stores/user'
import { getAiChatWebSocketUrl, clearAiChatHistoryAPI } from '@/src/api/ai.js'

// 获取URL参数
const roleId = ref('')
const roleName = ref('')
const roleAvatar = ref('')

// 状态管理
const userStore = useUserStore()
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const loadingText = ref('思考中...')
const scrollIntoView = ref('')
const ws = ref(null)
const currentAiMessage = ref(null)
const isConnected = ref(false) // 新增：WebSocket 连接状态

// 计算属性
const canSend = computed(() => {
	return inputMessage.value.trim().length > 0 && !isLoading.value && ws.value && isConnected.value
})

// 初始化WebSocket连接
const initWebSocket = () => {
	try {
		const token = userStore.token || uni.getStorageSync('token')
		if (!token) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}

		// 使用API函数获取WebSocket URL
		const wsUrl = getAiChatWebSocketUrl(roleId.value, token)

		console.log('连接WebSocket:', wsUrl)

		// 创建 WebSocket 连接并立即设置监听器
		ws.value = uni.connectSocket({
			url: wsUrl,
			success: () => {
				console.log('WebSocket连接请求发送成功')
			},
			fail: (error) => {
				console.error('WebSocket连接请求失败:', error)
				uni.showToast({
					title: '连接失败',
					icon: 'none'
				})
			}
		})

		// 立即设置监听器（uni.connectSocket 同步返回 SocketTask）
		if (ws.value) {
			// 监听连接打开
			ws.value.onOpen((res) => {
				console.log('WebSocket连接成功')
				isConnected.value = true
				uni.showToast({
					title: '连接成功',
					icon: 'success',
					duration: 1000
				})
			})

			// 监听接收消息
			ws.value.onMessage((res) => {
				try {
					console.log('收到原始消息:', res.data)
					const response = JSON.parse(res.data)
					handleStreamResponse(response)
				} catch (error) {
					console.error('解析消息失败:', error, res.data)
				}
			})

			// 监听错误
			ws.value.onError((error) => {
				console.error('WebSocket错误:', error)
				isConnected.value = false
				isLoading.value = false
				uni.showToast({
					title: '连接失败，请重试',
					icon: 'none'
				})
			})

			// 监听关闭
			ws.value.onClose(() => {
				console.log('WebSocket连接关闭')
				isConnected.value = false
				isLoading.value = false
			})
		} else {
			console.error('WebSocket创建失败，socketTask为null')
		}
		
	} catch (error) {
		console.error('创建WebSocket失败:', error)
		uni.showToast({
			title: '连接失败',
			icon: 'none'
		})
	}
}

// 处理流式响应
const handleStreamResponse = (response) => {
	console.log('收到消息:', response)

	switch (response.type) {
		case 'thinking':
			// 思考过程
			if (!currentAiMessage.value) {
				currentAiMessage.value = {
					role: 'assistant',
					content: '',
					thinking: ''
				}
				messages.value.push(currentAiMessage.value)
			}
			currentAiMessage.value.thinking += response.content
			loadingText.value = '思考中...'
			scrollToBottom()
			break

		case 'content':
			// 回复内容
			if (!currentAiMessage.value) {
				currentAiMessage.value = {
					role: 'assistant',
					content: '',
					thinking: ''
				}
				messages.value.push(currentAiMessage.value)
			}
			currentAiMessage.value.content += response.content
			loadingText.value = '回复中...'
			scrollToBottom()
			break

		case 'done':
			// 完成
			isLoading.value = false
			currentAiMessage.value = null
			loadingText.value = '思考中...'
			scrollToBottom()
			break

		case 'error':
			// 错误
			isLoading.value = false
			currentAiMessage.value = null
			uni.showToast({
				title: response.content || '发送失败',
				icon: 'none'
			})
			break
	}
}

// 发送消息
const sendMessage = () => {
	if (!canSend.value) {
		return
	}

	const message = inputMessage.value.trim()
	if (!message) {
		return
	}

	// 添加用户消息
	messages.value.push({
		role: 'user',
		content: message
	})

	// 清空输入框
	inputMessage.value = ''

	// 设置加载状态
	isLoading.value = true
	currentAiMessage.value = null

	// 发送到WebSocket
	try {
		if (!ws.value) {
			throw new Error('WebSocket 未连接')
		}

		const data = {
			message: message,
			roleType: roleId.value
		}
		
		// 使用 socketTask 实例发送消息
		ws.value.send({
			data: JSON.stringify(data),
			success: () => {
				console.log('消息发送成功')
				scrollToBottom()
			},
			fail: (error) => {
				console.error('发送消息失败:', error)
				isLoading.value = false
				uni.showToast({
					title: '发送失败，请重试',
					icon: 'none'
				})
			}
		})
	} catch (error) {
		console.error('发送消息失败:', error)
		isLoading.value = false
		uni.showToast({
			title: '发送失败，请重试',
			icon: 'none'
		})
	}
}

// 清空聊天历史
const clearHistory = () => {
	uni.showModal({
		title: '提示',
		content: '确定要清空聊天记录吗？',
		success: async (res) => {
			if (res.confirm) {
				messages.value = []
				// 通知后端清空历史
				try {
					const result = await clearAiChatHistoryAPI(roleId.value)
					if (result.data && result.data.code === 0) {
						uni.showToast({
							title: '已清空',
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: result.data?.msg || '清空失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('清空历史失败:', error)
					uni.showToast({
						title: '清空失败',
						icon: 'none'
					})
				}
			}
		}
	})
}

// 滚动到底部
const scrollToBottom = () => {
	nextTick(() => {
		if (messages.value.length > 0) {
			scrollIntoView.value = 'msg-' + (messages.value.length - 1)
		}
	})
}

// 输入框聚焦
const onInputFocus = () => {
	setTimeout(() => {
		scrollToBottom()
	}, 300)
}

// 返回
const goBack = () => {
	uni.navigateBack()
}

// 页面加载
onMounted(() => {
	// 获取URL参数
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const options = currentPage.options || currentPage.$route.query
	
	roleId.value = options.roleId || 'ppjl'
	roleName.value = decodeURIComponent(options.roleName || '屁屁精灵')
	roleAvatar.value = decodeURIComponent(options.roleAvatar || '💨')

	console.log('角色信息:', { roleId: roleId.value, roleName: roleName.value, roleAvatar: roleAvatar.value })

	// 初始化WebSocket
	initWebSocket()
})

// 页面卸载
onUnmounted(() => {
	if (ws.value) {
		// 使用 socketTask 实例关闭连接
		ws.value.close({
			success: () => {
				console.log('WebSocket已关闭')
			}
		})
		ws.value = null
		isConnected.value = false
	}
})
</script>

<style lang="scss" scoped>
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #f5f5f5;
}

.chat-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 32rpx;
	background: white;
	border-bottom: 1rpx solid #eee;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.header-left, .header-right {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 44rpx;
	color: #333;
}

.clear-icon {
	font-size: 36rpx;
}

.header-center {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
}

.role-avatar {
	font-size: 40rpx;
}

.role-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.chat-messages {
	flex: 1;
	padding: 32rpx;
	overflow-y: auto;
}

.message-wrapper {
	margin-bottom: 32rpx;
}

.message-item {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
}

.user-message .message-item {
	flex-direction: row-reverse;
}

.avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
	flex-shrink: 0;
}

.user-avatar {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-content {
	max-width: 70%;
}

.thinking-content {
	background: #fff8e1;
	padding: 16rpx 24rpx;
	border-radius: 16rpx;
	margin-bottom: 12rpx;
	border: 1rpx solid #ffd54f;
}

.thinking-label {
	display: block;
	font-size: 24rpx;
	color: #f57c00;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.thinking-text {
	font-size: 24rpx;
	color: #666;
	line-height: 1.6;
	white-space: pre-wrap;
	word-break: break-all;
}

.text-content {
	background: white;
	padding: 24rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
	color: #333;
	line-height: 1.6;
	word-break: break-all;
	white-space: pre-wrap;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.user-message .text-content {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
}

.loading-indicator {
	display: flex;
	justify-content: center;
	padding: 32rpx;
}

.loading-text {
	font-size: 28rpx;
	color: #999;
}

.chat-input-wrapper {
	background: white;
	border-top: 1rpx solid #eee;
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.input-container {
	display: flex;
	align-items: flex-end;
	gap: 16rpx;
}

.message-input {
	flex: 1;
	min-height: 80rpx;
	max-height: 200rpx;
	padding: 16rpx 24rpx;
	background: #f5f5f5;
	border-radius: 24rpx;
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
}

.send-button {
	width: 120rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
	
	&.disabled {
		opacity: 0.5;
		background: #ccc;
	}
	
	&:active:not(.disabled) {
		transform: scale(0.95);
	}
}

.send-icon {
	color: white;
	font-size: 28rpx;
	font-weight: bold;
}
</style>
