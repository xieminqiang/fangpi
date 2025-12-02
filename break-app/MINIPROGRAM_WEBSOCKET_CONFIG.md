# 微信小程序 WebSocket 配置指南

## 问题：WebSocket 连接失败

如果你看到以下错误：
```
WebSocket connection to 'ws://localhost:8881/...' failed
WebSocket错误: {errMsg: "未完成的操作"}
```

## 解决方案

### 1. 检查后端服务器

确保后端服务正在运行：

```bash
cd server
./server
```

或者检查服务是否运行：
```bash
lsof -i :8881
```

应该看到类似的输出：
```
COMMAND   PID      USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
server   72411 xiaoqiang   41u  IPv6 0x3a401ba6e714d627      0t0  TCP *:8881 (LISTEN)
```

### 2. 配置微信开发者工具

**重要！** 在微信开发者工具中，必须开启以下选项：

1. 点击右上角 **详情** 按钮
2. 在 **本地设置** 标签页中
3. 勾选：**不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**

![微信开发者工具设置](https://img.alicdn.com/imgextra/i1/O1CN01oXKKvW1YqXQJZqZwF_!!6000000003109-2-tps-1920-1080.png)

### 3. 使用局域网 IP（推荐）

如果 `localhost` 不工作，需要使用局域网 IP 地址。

#### 修改 WebSocket URL 配置

编辑文件：`src/api/ai.js`

```javascript
export const getAiChatWebSocketUrl = (roleType, token) => {
  // 使用局域网 IP 而不是 localhost
  let baseUrl = 'ws://192.168.1.15:8881'  // 替换为你的本机 IP
  
  // #ifdef H5
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    baseUrl = `${protocol}//${host}`
  }
  // #endif
  
  return `${baseUrl}/break/ai/chat/ws?roleType=${roleType}&token=${token}`
}
```

#### 如何获取本机 IP

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

查找 `192.168.x.x` 格式的 IP 地址。

### 4. 验证配置

#### A. 测试 HTTP 接口

在浏览器中访问：
```
http://192.168.1.15:8881/break/ai/chat/roles
```

应该看到类似的响应：
```json
{
  "code": 0,
  "data": [...],
  "msg": "操作成功"
}
```

#### B. 测试 WebSocket 连接

可以使用 Postman 或在线 WebSocket 测试工具测试：
```
ws://192.168.1.15:8881/break/ai/chat/ws?roleType=ppjl&token=your-token
```

### 5. 常见问题排查

#### Q1: 仍然连接失败？

**检查防火墙：**
```bash
# macOS 检查防火墙状态
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 临时关闭防火墙（仅用于测试）
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

#### Q2: Token 无效？

确保你已经登录，并且 token 存在：
```javascript
// 在小程序控制台检查
const userStore = useUserStore()
console.log('Token:', userStore.token)
```

#### Q3: 端口被占用？

检查 8881 端口是否被其他程序占用：
```bash
lsof -i :8881
```

如果被占用，可以：
1. 停止占用端口的程序
2. 或者修改 `server/config.yaml` 中的端口配置

#### Q4: 需要修改端口？

修改后端配置文件 `server/config.yaml`:
```yaml
system:
  addr: 8881  # 修改为其他端口，如 9000
```

同时修改前端配置：
- `src/util/config.js` - HTTP 请求端口
- `src/api/ai.js` - WebSocket 连接端口

### 6. 完整配置检查清单

- [ ] 后端服务已启动（端口 8881）
- [ ] 微信开发者工具已开启"不校验合法域名"
- [ ] WebSocket URL 使用正确的 IP 和端口
- [ ] HTTP 请求 baseUrl 配置正确
- [ ] 已登录并有有效 token
- [ ] 防火墙没有阻止连接
- [ ] 手机和电脑在同一局域网（真机调试时）

### 7. 生产环境配置

生产环境需要配置合法的域名：

1. **申请域名和 SSL 证书**

2. **配置后端 HTTPS**
   ```yaml
   # server/config.yaml
   system:
     addr: 443
     use-https: true
   ```

3. **在微信公众平台配置服务器域名**
   - 登录 [微信公众平台](https://mp.weixin.qq.com/)
   - 开发 → 开发管理 → 开发设置
   - 配置服务器域名：
     - request 合法域名：`https://your-domain.com`
     - socket 合法域名：`wss://your-domain.com`

4. **修改前端生产环境配置**
   ```javascript
   // src/util/config.js
   production: {
     baseUrl: 'https://your-domain.com'
   }
   
   // src/api/ai.js
   export const getAiChatWebSocketUrl = (roleType, token) => {
     let baseUrl = 'ws://localhost:8881'  // 开发环境
     
     // #ifdef H5
     if (typeof window !== 'undefined') {
       const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
       const host = window.location.host
       baseUrl = `${protocol}//${host}`  // 生产环境会自动使用 wss://your-domain.com
     }
     // #endif
     
     return `${baseUrl}/break/ai/chat/ws?roleType=${roleType}&token=${token}`
   }
   ```

### 8. 调试技巧

#### 开启详细日志

在聊天页面 `chat.vue` 中：
```javascript
// 连接时
console.log('连接WebSocket:', wsUrl)
console.log('Token:', token)

// 接收消息时
ws.value.onMessage((res) => {
  console.log('收到原始数据:', res.data)
  const response = JSON.parse(res.data)
  console.log('解析后数据:', response)
})

// 错误时
ws.value.onError((error) => {
  console.error('WebSocket详细错误:', error)
})
```

#### 使用网络面板

微信开发者工具 → 调试器 → Network → WS 标签
- 可以看到 WebSocket 连接状态
- 查看发送和接收的消息

## 总结

最常见的问题是：
1. ✅ **已修复：端口已改为 8881**
2. ⚠️  **需要配置：开启"不校验合法域名"**
3. 💡 **建议：使用局域网 IP 替代 localhost**

如果按照以上步骤操作后仍有问题，请检查：
- 后端日志：`server/server.log`
- 小程序控制台：微信开发者工具 → 调试器 → Console
- 网络请求：微信开发者工具 → 调试器 → Network

## 相关文档

- [WebSocket 兼容性指南](../WEBSOCKET_MINIPROGRAM_GUIDE.md)
- [API 使用文档](./src/api/AI_API_USAGE.md)
- [AI 聊天功能文档](../AI_CHAT_README.md)

