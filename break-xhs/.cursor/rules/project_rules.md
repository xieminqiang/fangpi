# 放屁档案 · 小红书小组件开发规范

## 项目概述

`break-xhs` 是「放屁档案」的**小红书桌面小组件**，提供今日打卡、统计展示等轻量能力。  
完整版微信小程序在 `break-app/`（Vue 3 + uni-app）。两端共用 GVA 后端 `server/plugin/fp_app`。

## 技术栈

- **运行时**：小红书原生小组件（非 uni-app）
- **模板**：`.xhsml`（类 wxml）
- **逻辑**：`Page()` / `App()`（CommonJS `require`）
- **网络**：`xhs.request` + `util/http.js` 封装
- **存储**：`xhs.getStorageSync` / `xhs.setStorageSync`

## 目录结构

```
break-xhs/
├── project.config.json    # 小红书 IDE 工程配置
├── app.json               # 应用页面与窗口（⚠️ 小组件不支持 tabBar）
├── app.js                 # 全局登录与 globalData
├── app.css
├── util/
│   ├── config.js          # 环境 API 配置（必读）
│   └── http.js            # 请求封装
├── api/
│   ├── user.js            # 用户登录
│   └── fart.js            # 放屁记录
├── pages/index/           # 小组件主页面
│   ├── index.xhsml
│   ├── index.js
│   ├── index.json
│   └── index.css
└── utils/util.js          # 通用工具（可选）
```

## 配置文件说明

### 1. `util/config.js`（核心）

| 字段 | 说明 |
|------|------|
| `development.baseUrl` | 本地 / 预览调试 API 根路径 |
| `production.baseUrl` | 正式环境 API 根路径 |
| `currentEnv` | 当前环境：`development` \| `production` |
| `baseUrl` | 导出给 `http.js` 使用的最终地址 |

**必须与 `break-app/src/util/config.js` 使用同一后端**，当前为：

```
https://fangpi.mqcode.cn/api
```

环境切换：修改 `currentEnv`，小红书无 Vite 的 `NODE_ENV` 自动注入。

### 2. `util/http.js`

- 相对路径自动拼接 `baseUrl`
- 请求头固定：`content-type: application/json`
- 来源标识：`source-client: xhs-widget`（后端据此区分平台）
- 鉴权：从 storage 读取 `token`，写入 `x-token`
- 超时默认 60000ms

### 3. `project.config.json`

| 字段 | 说明 |
|------|------|
| `appid` | 小红书小程序 AppID |
| `setting.urlCheck` | 开发时可 `false`，上线前在后台配好合法域名后建议 `true` |
| `setting.minified` | 发布压缩 |
| `libVersion` | 基础库版本 |

### 4. `app.json`

- `pages`：目前仅 `pages/index/index`（单页应用）
- `window`：导航栏标题「今日放屁」，背景 `#f6f8f7`
- **不支持 `tabBar`**：小红书小组件无原生底部栏，首页/我的切换在 `pages/index/index` 内用自定义 `custom-tabbar` 实现
- `componentFramework`：`glass-easel`
- `lazyCodeLoading`：`requiredComponents`

### 5. 页面内 Tab 切换

小组件文档见 [小红书小组件开发文档](https://miniapp.xiaohongshu.com/doc/DC602239)，不支持 `app.json` 的 `tabBar`。

在 `pages/index/index` 单页内实现：

| 字段 / 方法 | 说明 |
|-------------|------|
| `activeTab` | `home` \| `me`，控制显示打卡区或个人中心 |
| `switchTab` | 切换 tab，并更新导航栏标题 |
| `.custom-tabbar` | 固定底部自定义切换栏 |

### 5. `api/*.js`

接口路径与 `break-app/src/api/` **保持一致**，仅登录入口不同：

| 能力 | break-xhs | break-app |
|------|-----------|-----------|
| 快速登录 | `POST /wxuser/xhsQuickLogin` | `POST /wxuser/wxQuickLogin` |
| OpenID 恢复 | `POST /wxuser/openidLogin` | 同左 |
| 今日记录 | `GET /break/today` | 同左 |
| 打卡 | `POST /break/record` | 同左 |
| 统计 | `GET /break/statistics/summary` | 同左 |

## 登录流程（`app.js`）

1. 启动时创建 `loginReady` Promise
2. 优先 `openid` 调用 `openidLoginAPI`
3. 失败则 `xhs.login` 取 `code` → `xhsQuickLoginAPI`
4. 成功写入 `token`、`userInfo`、`openid` 到 storage 与 `globalData`

页面 `onLoad` 应 `await getApp().loginReady` 后再请求业务接口。

## 与 break-app 的差异

| 项目 | break-app | break-xhs |
|------|-----------|-----------|
| 框架 | uni-app + Vue 3 | 原生 Page |
| 模块 | ES Module `import` | CommonJS `require` |
| 状态 | Pinia | `globalData` + storage |
| 页面数 | 多页 + tabBar | 单页小组件 |
| source-client | `miniapp` | `xhs-widget` |

**禁止**在 break-xhs 引入 uni-app 或 Vue 依赖；需要复用逻辑时复制并改为 CommonJS。

## 样式规范

- 主色与微信端对齐：`#26BF6E` / `#20A55A`
- 背景：`#F8F8F8` 或 `#f6f8f7`
- 单位使用 `rpx`（与微信一致）
- 样式写在 `index.css`，避免内联

## 开发注意事项

1. 注释与文档使用中文
2. 修改 API 时同步检查 `break-app` 与后端 Swagger
3. 静态资源 URL 建议集中到 `config.js` 的 `assets` 对象
4. 不将 AppSecret、密钥写入仓库
5. 小组件包体尽量小，避免大图未压缩

## 部署检查

- [ ] `util/config.js` 的 `currentEnv` 为 `production`
- [ ] `baseUrl` 与 break-app 生产环境一致
- [ ] 小红书后台已配置 request 合法域名
- [ ] `project.config.json` 中 `appid` 正确
- [ ] 真机验证登录 + 打卡 + 今日统计
