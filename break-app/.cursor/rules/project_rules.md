# 放屁档案小程序开发规范

## 项目概述
放屁档案是一个基于 Vue 3 + uni-app 开发的微信小程序，支持多端部署（微信小程序、App、H5）。项目采用组合式 API 和 Pinia 状态管理，提供用户登录、数据记录等核心功能。

## 技术栈
- **前端框架**: Vue 3 (组合式 API)
- **跨端框架**: uni-app
- **状态管理**: Pinia + pinia-plugin-persistedstate
- **样式预处理**: Sass/SCSS
- **构建工具**: Vite
- **加密库**: crypto-js

## Vue 3 组合式 API 开发规范

### 基础规范
```javascript
// ✅ 推荐：使用 setup() 函数
export default {
  name: 'ComponentName',
  setup() {
    const state = ref(0)
    const computedValue = computed(() => state.value * 2)
    
    const handleClick = () => {
      // 处理逻辑
    }
    
    return {
      state,
      computedValue,
      handleClick
    }
  }
}

// ✅ 推荐：使用 <script setup> 语法糖
<script setup>
import { ref, computed, onMounted } from 'vue'

const state = ref(0)
const computedValue = computed(() => state.value * 2)

const handleClick = () => {
  // 处理逻辑
}

onMounted(() => {
  // 初始化逻辑
})
</script>
```

### 状态管理规范
```javascript
// ✅ 使用 Pinia 进行状态管理
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {}
  }),
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    clearUserInfo() {
      this.userInfo = {}
    }
  },
  persist: {
    storage: {
      getItem: (key) => uni.getStorageSync(key),
      setItem: (key, value) => uni.setStorageSync(key, value)
    }
  }
})
```

## 项目文件结构规范

```
break-app/
├── pages/                    // 主包页面
│   ├── index/               // 首页
│   │   └── index.vue
│   └── login/               // 登录页
│       └── index.vue
├── src/                     // 源代码目录
│   ├── api/                 // API 接口
│   │   └── user.js
│   ├── stores/              // Pinia 状态管理
│   │   ├── index.js
│   │   └── user.js
│   ├── styles/              // 样式文件
│   │   └── index.scss
│   └── util/                // 工具函数
│       ├── config.js        // 配置文件
│       └── http.js          // HTTP 请求封装
├── static/                  // 静态资源
│   └── logo.png
├── App.vue                  // 应用入口
├── main.js                  // 主入口文件
├── pages.json               // 页面配置
├── manifest.json            // 应用配置
└── uni.scss                 // 全局样式
```

## UI 样式规范

### Flex 布局工具类
项目使用自定义的 flex 布局工具类，位于 `src/styles/index.scss`：

```scss
// 基础 flex 类
.l-flex          // display: flex; flex-direction: row;
.l-flex-col      // display: flex; flex-direction: column;
.l-flex-wrap     // flex-wrap: wrap;
.l-flex-1        // flex: 1;

// 对齐方式
.l-col-center    // align-items: center;
.l-col-top       // align-items: flex-start;
.l-col-bottom    // align-items: flex-end;
.l-row-center    // justify-content: center;
.l-row-left      // justify-content: flex-start;
.l-row-right     // justify-content: flex-end;
.l-row-between   // justify-content: space-between;

// 便捷组合
.flex-center     // justify-content: center;
.flex-between    // justify-content: space-between;
.flex_vcenter    // align-items: center;
```

### 间距工具类
```scss
// 外边距
.l-m-{size}      // margin: {size}rpx;
.l-m-x-{size}    // margin-left/right: {size}rpx;
.l-m-y-{size}    // margin-top/bottom: {size}rpx;
.l-m-l-{size}    // margin-left: {size}rpx;

// 内边距
.l-p-{size}      // padding: {size}rpx;
.l-p-x-{size}    // padding-left/right: {size}rpx;
.l-p-y-{size}    // padding-top/bottom: {size}rpx;
```

### 颜色规范
- **主色调**: #26BF6E (绿色)
- **辅助色**: #20A55A (深绿色)
- **背景色**: #F8F8F8
- **文字色**: #1A1A1A (主要文字), #666666 (次要文字), #999999 (辅助文字)

## 多端开发规范

### 条件编译
```javascript
// 微信小程序特有功能
// #ifdef MP-WEIXIN
wx.login({
  success: (res) => {
    console.log(res.code)
  }
})
// #endif

// App 特有功能
// #ifdef APP-PLUS
plus.navigator.setStatusBarStyle('dark')
// #endif

// H5 特有功能
// #ifdef H5
document.title = '页面标题'
// #endif
```

### 平台适配
- 优先适配微信小程序
- 支持 iOS/Android App 打包
- 合理使用条件编译处理平台差异
- 避免使用不支持跨端的 API

## API 接口规范

### HTTP 请求封装
```javascript
// 使用项目封装的 http 工具
import { http } from '@/src/util/http.js'

export const wxLoginAPI = (data) => {
  return http({
    method: 'POST',
    url: '/user/login',
    data
  })
}
```

### 接口配置
- 开发环境: `https://booking.aipointer.com/booking/v1`
- 生产环境: `https://booking.aipointer.com/booking/v1`
- 请求头自动添加 `source-client: miniapp`
- 自动处理 token 认证

## 开发最佳实践

### 1. 组件开发
- 使用 Vue 3 组合式 API
- 合理使用 ref 和 reactive
- 通过 computed 实现计算属性
- 使用 watch 和 watchEffect 处理副作用

### 2. 状态管理
- 使用 Pinia 进行全局状态管理
- 合理划分 store 模块
- 使用持久化插件保存用户数据

### 3. 样式开发
- 优先使用项目预设的 flex 工具类
- 避免内联样式
- 使用 SCSS 预处理器
- 遵循移动端设计规范

### 4. 性能优化
- 合理使用分包加载
- 图片资源优化
- 避免不必要的重渲染
- 使用 uni-app 性能优化建议

### 5. 错误处理
- 统一的错误提示机制
- 网络请求错误处理
- 用户操作反馈

## 代码规范

### 命名规范
- 组件名使用 PascalCase: `UserProfile.vue`
- 文件名使用 kebab-case: `user-profile.vue`
- 变量名使用 camelCase: `userInfo`
- 常量使用 UPPER_SNAKE_CASE: `API_BASE_URL`

### 注释规范
```javascript
/**
 * 用户登录接口
 * @param {Object} data - 登录数据
 * @param {string} data.login_code - 微信登录code
 * @param {string} data.phone_code - 手机号授权code
 * @returns {Promise} 登录结果
 */
export const wxLoginAPI = (data) => {
  return http({
    method: 'POST',
    url: '/user/login',
    data
  })
}
```

## 部署配置

### 微信小程序
- AppID: `wx25c9a46425ab7de4`
- 关闭 URL 检查: `urlCheck: false`
- 支持自定义组件: `usingComponents: true`

### App 打包
- 支持 Android 和 iOS
- 配置必要的权限
- 使用自定义 keystore: `loveapp.keystore`

## 开发注意事项

1. **中文优先**: 所有注释和文档使用中文
2. **响应式设计**: 适配不同屏幕尺寸
3. **用户体验**: 提供加载状态和错误提示
4. **数据安全**: 合理处理用户敏感信息
5. **性能监控**: 关注页面加载时间和内存使用
6. **兼容性**: 确保在不同设备和系统版本上正常运行


