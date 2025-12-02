# AI 聊天 API 使用说明

## API 文件位置
`/src/api/ai.js`

## 可用接口

### 1. 获取AI角色列表

获取所有可用的AI聊天角色（屁屁精灵、肠博士）。

**函数**: `getAiChatRolesAPI()`

**返回**: Promise

**使用示例**:
```javascript
import { getAiChatRolesAPI } from '@/src/api/ai.js'

// 获取角色列表
const getRoles = async () => {
  try {
    const res = await getAiChatRolesAPI()
    if (res.code === 0) {
      const roles = res.data
      // roles 是一个数组，包含所有角色信息
      console.log(roles)
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}
```

**返回数据格式**:
```javascript
{
  "code": 0,
  "data": [
    {
      "id": "ppjl",                    // 角色ID
      "name": "屁屁精灵",              // 角色名称
      "avatar": "💨",                  // 角色头像
      "description": "活泼可爱的...",  // 角色描述
      "tags": ["可爱", "活泼", "轻松"] // 角色标签
    },
    {
      "id": "cbos",
      "name": "肠博士",
      "avatar": "👨‍⚕️",
      "description": "专业严谨的...",
      "tags": ["专业", "权威", "严谨"]
    }
  ],
  "msg": "操作成功"
}
```

---

### 2. 清空对话历史

清空指定角色的对话历史记录。

**函数**: `clearAiChatHistoryAPI(roleType)`

**参数**:
- `roleType` (String): 角色类型
  - `"ppjl"` - 屁屁精灵
  - `"cbos"` - 肠博士

**返回**: Promise

**使用示例**:
```javascript
import { clearAiChatHistoryAPI } from '@/src/api/ai.js'

// 清空屁屁精灵的对话历史
const clearHistory = async () => {
  try {
    const res = await clearAiChatHistoryAPI('ppjl')
    if (res.code === 0) {
      console.log('清空成功')
    }
  } catch (error) {
    console.error('清空失败:', error)
  }
}
```

**返回数据格式**:
```javascript
{
  "code": 0,
  "msg": "对话历史已清空"
}
```

---

### 3. 获取WebSocket连接URL

生成WebSocket连接URL，用于建立AI聊天的实时连接。

**函数**: `getAiChatWebSocketUrl(roleType, token)`

**参数**:
- `roleType` (String): 角色类型 (`"ppjl"` 或 `"cbos"`)
- `token` (String): 用户认证token

**返回**: String (WebSocket URL)

**使用示例**:
```javascript
import { getAiChatWebSocketUrl } from '@/src/api/ai.js'
import { useUserStore } from '@/src/stores/user'

// 建立WebSocket连接（兼容微信小程序）
const connectWebSocket = () => {
  const userStore = useUserStore()
  const token = userStore.token
  const roleType = 'ppjl'  // 屁屁精灵
  
  // 获取WebSocket URL
  const wsUrl = getAiChatWebSocketUrl(roleType, token)
  
  // 使用 uni.connectSocket 兼容小程序环境
  const ws = uni.connectSocket({
    url: wsUrl,
    success: () => {
      console.log('WebSocket连接请求成功')
    }
  })
  
  // 监听连接打开
  ws.onOpen(() => {
    console.log('WebSocket连接成功')
  })
  
  // 监听接收消息
  ws.onMessage((res) => {
    const response = JSON.parse(res.data)
    console.log('收到消息:', response)
  })
  
  // 监听错误
  ws.onError((error) => {
    console.error('WebSocket错误:', error)
  })
  
  // 监听关闭
  ws.onClose(() => {
    console.log('WebSocket连接关闭')
  })
  
  return ws
}
```

**生成的URL格式**:
```
// 开发环境
ws://localhost:8888/break/ai/chat/ws?roleType=ppjl&token=your-token

// 生产环境 (HTTP)
ws://your-domain.com/break/ai/chat/ws?roleType=ppjl&token=your-token

// 生产环境 (HTTPS)
wss://your-domain.com/break/ai/chat/ws?roleType=ppjl&token=your-token
```

---

## WebSocket 消息格式

### 发送消息

**微信小程序环境**:
```javascript
const message = {
  message: "你好，我最近肠胃不太舒服",
  roleType: "ppjl"
}

// 使用 uni.sendSocketMessage 兼容小程序环境
uni.sendSocketMessage({
  data: JSON.stringify(message),
  success: () => {
    console.log('消息发送成功')
  },
  fail: (error) => {
    console.error('消息发送失败:', error)
  }
})
```

**H5环境**:
```javascript
const message = {
  message: "你好，我最近肠胃不太舒服",
  roleType: "ppjl"
}

ws.send(JSON.stringify(message))
```

### 接收消息

WebSocket会返回流式消息，类型包括：

#### 1. 内容消息 (content)
```javascript
{
  "type": "content",
  "content": "你好呀～",
  "done": false
}
```

#### 2. 完成信号 (done)
```javascript
{
  "type": "done",
  "content": "",
  "done": true
}
```

#### 3. 错误消息 (error)
```javascript
{
  "type": "error",
  "content": "AI回复失败: xxx",
  "done": true
}
```

---

## 完整使用示例

### 聊天页面组件示例

```vue
<template>
  <view class="chat-page">
    <!-- 消息列表 -->
    <view v-for="(msg, index) in messages" :key="index">
      <text>{{ msg.role }}: {{ msg.content }}</text>
    </view>
    
    <!-- 输入框 -->
    <input v-model="inputMessage" placeholder="输入消息..." />
    <button @click="sendMessage">发送</button>
    <button @click="clearHistory">清空历史</button>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/src/stores/user'
import { 
  getAiChatWebSocketUrl, 
  clearAiChatHistoryAPI 
} from '@/src/api/ai.js'

const userStore = useUserStore()
const messages = ref([])
const inputMessage = ref('')
const ws = ref(null)
const roleType = 'ppjl' // 屁屁精灵

// 初始化WebSocket（兼容微信小程序）
const initWebSocket = () => {
  const token = userStore.token
  const wsUrl = getAiChatWebSocketUrl(roleType, token)
  
  // 使用 uni.connectSocket 兼容小程序环境
  ws.value = uni.connectSocket({
    url: wsUrl,
    success: () => {
      console.log('WebSocket连接请求成功')
    }
  })
  
  // 监听接收消息
  ws.value.onMessage((res) => {
    const response = JSON.parse(res.data)
    
    if (response.type === 'content') {
      // 追加AI回复内容
      if (!messages.value[messages.value.length - 1]?.isAi) {
        messages.value.push({
          role: 'assistant',
          content: response.content,
          isAi: true
        })
      } else {
        messages.value[messages.value.length - 1].content += response.content
      }
    } else if (response.type === 'done') {
      console.log('AI回复完成')
    } else if (response.type === 'error') {
      uni.showToast({
        title: response.content,
        icon: 'none'
      })
    }
  })
}

// 发送消息（兼容微信小程序）
const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: inputMessage.value
  })
  
  // 使用 uni.sendSocketMessage 发送到服务器
  uni.sendSocketMessage({
    data: JSON.stringify({
      message: inputMessage.value,
      roleType: roleType
    }),
    success: () => {
      console.log('消息发送成功')
    }
  })
  
  inputMessage.value = ''
}

// 清空历史
const clearHistory = async () => {
  try {
    const res = await clearAiChatHistoryAPI(roleType)
    if (res.code === 0) {
      messages.value = []
      uni.showToast({
        title: '已清空',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('清空失败:', error)
  }
}

onMounted(() => {
  initWebSocket()
})

onUnmounted(() => {
  if (ws.value) {
    // 使用 uni.closeSocket 兼容小程序环境
    uni.closeSocket({
      success: () => {
        console.log('WebSocket已关闭')
      }
    })
  }
})
</script>
```

---

## 注意事项

1. **Token必需**: 所有API调用都需要有效的用户token
2. **角色类型**: 目前支持两个角色 - `"ppjl"` (屁屁精灵) 和 `"cbos"` (肠博士)
3. **WebSocket连接**: 
   - 在微信小程序中必须使用 `uni.connectSocket()` 而不是 `new WebSocket()`
   - 记得在页面卸载时使用 `uni.closeSocket()` 关闭连接
4. **流式响应**: WebSocket返回的是流式数据，需要累积拼接内容
5. **错误处理**: 建议为所有API调用添加错误处理
6. **响应格式**: API响应数据格式为 `result.data.code` 和 `result.data.data`

---

## 相关文档

- [AI聊天功能实现文档](../../../AI_CHAT_README.md)
- [后端API文档](../../../server/plugin/fp_app/api/ai_chat.go)

