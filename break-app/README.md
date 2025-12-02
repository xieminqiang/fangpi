# Love App - 简化版

一个基于 Vue 3 + uni-app 的简化多端应用，专注于简单的界面展示。

## 🚀 技术栈

- **框架**: Vue 3 (组合式 API)
- **多端框架**: uni-app
- **状态管理**: Pinia
- **样式**: SCSS

## 📁 项目结构

```
love-app/
├── src/                          # 源代码目录
│   ├── api/                      # API 接口
│   │   └── index.js             # 简化的请求封装
│   ├── stores/                   # 状态管理
│   │   └── index.js             # 简化的状态管理
│   ├── components/               # 组件库
│   │   ├── SimpleCard.vue       # 简单卡片组件
│   │   └── index.js             # 组件导出
│   └── styles/                   # 样式文件
│       └── index.scss           # 全局样式
├── pages/                        # 页面文件
│   └── index/                    # 首页
│       └── index.vue            # 首页组件
├── static/                       # 静态资源
├── App.vue                       # 应用入口
├── main.js                       # 主入口文件
└── package.json                  # 依赖配置
```

## 🛠️ 开发指南

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发命令

```bash
# 微信小程序开发
npm run dev:mp-weixin

# App 开发
npm run dev:app

# H5 开发
npm run dev:h5
```

### 构建命令

```bash
# 构建微信小程序
npm run build:mp-weixin

# 构建 App
npm run build:app

# 构建 H5
npm run build:h5
```

## 🎯 功能特性

- ✅ 简洁的界面设计
- ✅ 响应式布局
- ✅ 多端适配
- ✅ 组件化开发
- ✅ 状态管理

## 📱 界面展示

应用包含以下主要界面：

1. **首页** - 展示应用介绍和功能特色
2. **简单卡片组件** - 可复用的内容展示组件

## 🔧 配置说明

### API 配置

在 `src/api/index.js` 中配置 API 基础地址：

```javascript
const baseURL = 'https://api.love-app.com/v1'
```

### 样式配置

在 `src/styles/index.scss` 中配置主题色彩和样式变量。

## 📝 开发规范

### 代码规范

- 使用 Vue 3 组合式 API
- 遵循 uni-app 开发规范
- 统一的命名规范

### 组件开发

- 使用 `<script setup>` 语法
- 合理使用 props 和 emits
- 保持组件的单一职责

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！