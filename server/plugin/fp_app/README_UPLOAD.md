# FP_APP 图片上传功能说明

## 功能概述

在 `fp_app` 插件中添加了图片上传功能，支持单张和批量上传图片到阿里云 OSS。

## 后端实现

### 1. API 接口

#### 上传单张图片
- **路径**: `POST /upload/image`
- **参数**: 
  - `file`: 图片文件 (multipart/form-data)
- **返回**:
```json
{
  "code": 0,
  "msg": "上传成功",
  "data": {
    "url": "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2024-01-01/example.jpg",
    "filePath": "fp-wx/uploads/2024-01-01/example.jpg"
  }
}
```

#### 批量上传图片
- **路径**: `POST /upload/images`
- **参数**: 
  - `files`: 多个图片文件 (multipart/form-data)
- **限制**:
  - 单次最多上传 9 张图片
  - 单张图片大小不超过 5MB
  - 支持格式: jpg, png, gif, webp

### 2. 文件结构

```
server/plugin/fp_app/
├── api/
│   ├── enter.go          # API 入口
│   ├── upload.go         # 上传 API 实现（新增）
│   └── wx_user.go
├── router/
│   ├── enter.go          # 路由入口
│   ├── upload.go         # 上传路由（新增）
│   └── wx_user.go
└── initialize/
    └── router.go         # 路由初始化
```

### 3. 配置说明

在 `config.yaml` 中配置了阿里云 OSS：

```yaml
aliyun-oss:
    endpoint: "https://oss-cn-shenzhen.aliyuncs.com"
    access-key-id: "LTAI5t8mSVRCRVPBqxRzaM2M"
    access-key-secret: "lWk3VKO7oNuaioG5hMIAOdGRSzMbZC"
    bucket-name: "sbx-server"
    bucket-url: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com"
    base-path: "fp-wx"

system:
    oss-type: aliyun-oss  # 使用阿里云 OSS
```

## 前端实现

### 1. API 调用

在 `break-app/src/api/upload.js` 中封装了上传接口：

```javascript
import { uploadImageAPI, uploadImagesAPI } from '@/src/api/upload.js'

// 上传单张图片
const result = await uploadImageAPI(filePath)

// 上传多张图片
const results = await uploadImagesAPI([filePath1, filePath2, ...])
```

### 2. 使用示例

在 `break-app/pages/index/index.vue` 中提供了完整的使用示例：

```vue
<template>
  <view class="card">
    <text class="card-title">图片上传示例</text>
    
    <!-- 图片预览 -->
    <view v-if="uploadedImages.length > 0" class="image-preview">
      <view v-for="(image, index) in uploadedImages" :key="index" class="image-item">
        <image :src="image.url" mode="aspectFill" class="preview-image"></image>
        <text class="image-url">{{ image.url }}</text>
      </view>
    </view>
    
    <!-- 上传按钮 -->
    <button class="upload-btn" @click="handleUploadSingle">
      <text class="btn-text">📷 上传单张图片</text>
    </button>
    <button class="upload-btn secondary" @click="handleUploadMultiple">
      <text class="btn-text">🖼️ 上传多张图片</text>
    </button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { uploadImageAPI } from '@/src/api/upload.js'

const uploadedImages = ref([])

// 上传单张图片
const handleUploadSingle = async () => {
  const chooseRes = await uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera']
  })
  
  const result = await uploadImageAPI(chooseRes.tempFilePaths[0])
  
  if (result.code === 0) {
    uploadedImages.value.unshift({
      url: result.data.url,
      filePath: result.data.filePath
    })
  }
}
</script>
```

## 功能特性

### 1. 后端特性
- ✅ 自动使用系统配置的 OSS（支持阿里云/腾讯云/七牛云等）
- ✅ 文件类型验证（仅支持图片格式）
- ✅ 文件大小限制（5MB）
- ✅ 批量上传支持（最多 9 张）
- ✅ 详细的错误提示
- ✅ 操作日志记录

### 2. 前端特性
- ✅ 单张/批量上传
- ✅ 实时上传进度提示
- ✅ 图片预览展示
- ✅ 友好的错误提示
- ✅ 自动压缩图片

## 测试步骤

### 1. 启动后端服务
```bash
cd server
go run main.go
```

### 2. 运行前端应用
```bash
cd break-app
npm run dev:mp-weixin  # 微信小程序
# 或
npm run dev:app        # App
```

### 3. 测试上传功能
1. 打开首页
2. 滚动到"图片上传示例"卡片
3. 点击"上传单张图片"或"上传多张图片"
4. 选择图片进行上传
5. 查看上传结果和图片预览

## API 端点

所有上传接口都是公开的（不需要认证），如果需要添加认证，可以修改 `router/upload.go`：

```go
// 修改为需要认证的私有路由
func (r *uploadRouter) Init(public *gin.RouterGroup, private *gin.RouterGroup) {
    // 使用 private 路由组
    group := private.Group("upload").Use(middleware.OperationRecord())
    group.POST("image", apiUpload.UploadImage)
    group.POST("images", apiUpload.UploadImages)
}
```

## 注意事项

1. **OSS 配置**: 确保 `config.yaml` 中的阿里云 OSS 配置正确
2. **文件大小**: 当前限制单个文件最大 5MB，可在 `api/upload.go` 中修改
3. **文件格式**: 仅支持图片格式（jpg, png, gif, webp）
4. **批量上传**: 单次最多上传 9 张图片
5. **路径规则**: 上传的文件会按日期分组存储在 `fp-wx/uploads/YYYY-MM-DD/` 目录下

## 扩展建议

1. **添加图片裁剪**: 可以在前端添加图片裁剪功能
2. **添加水印**: 在后端上传后添加水印处理
3. **CDN 加速**: 配置 OSS 的 CDN 加速提高访问速度
4. **缩略图生成**: 自动生成缩略图以提高加载速度
5. **上传队列**: 实现上传队列管理，支持暂停、恢复等功能

