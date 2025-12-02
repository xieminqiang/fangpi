<template>
  <view class="page-container">
    <!-- 头部区域 -->
    <view class="header">
      <text class="title">Love App</text>
      <text class="subtitle">记录我们的美好时光</text>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y="true">
      <view class="card">
        <text class="card-title">欢迎使用 Love App</text>
        <text class="card-text">这是一个简化的爱情应用界面</text>
      </view>
      
      <view class="card">
        <text class="card-title">功能特色</text>
        <view class="feature-list">
          <text class="feature-item">💕 记录美好时光</text>
          <text class="feature-item">📅 重要纪念日</text>
          <text class="feature-item">👫 情侣空间</text>
          <text class="feature-item">💝 爱情测试</text>
        </view>
      </view>
      
      <view class="card">
        <text class="card-title">关于我们</text>
        <text class="card-text">基于 Vue 3 + uni-app 构建的现代化多端应用</text>
      </view>
	  <view class="card">
	    <text class="card-title">开始使用</text>
	    <text class="card-text">立即登录，体验完整功能</text>
	    <button class="login-btn" @click="handleWxLogin">
	      <text class="btn-text">微信登录</text>
	    </button>
	    <button class="login-btn secondary" @click="goToLogin">
	      <text class="btn-text">手机号登录</text>
	    </button>
	  </view>
	  
	  <view class="card">
	    <text class="card-title">图片上传示例</text>
	    <text class="card-text">点击按钮选择并上传图片</text>
	    
	    <!-- 上传的图片预览 -->
	    <view v-if="uploadedImages.length > 0" class="image-preview">
	      <view v-for="(image, index) in uploadedImages" :key="index" class="image-item">
	        <image :src="image.url" mode="aspectFill" class="preview-image"></image>
	        <text class="image-url">{{ image.url }}</text>
	      </view>
	    </view>
	    
	    <button class="upload-btn" @click="handleUploadSingle">
	      <text class="btn-text">📷 上传单张图片</text>
	    </button>
	    <button class="upload-btn secondary" @click="handleUploadMultiple">
	      <text class="btn-text">🖼️ 上传多张图片</text>
	    </button>
	  </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { wxUserLoginAPI } from '@/src/api/user.js'
import { uploadImageAPI, uploadImagesAPI } from '@/src/api/upload.js'
import { useUserStore } from '@/src/stores/user.js'

const userStore = useUserStore()
const uploadedImages = ref([])

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

// 微信登录
const handleWxLogin = async () => {
  try {
    uni.showLoading({
      title: '登录中...'
    })
    
    // 获取微信登录code
    const loginRes = await uni.login()
    const code = loginRes.code
    
    console.log('获取到的code:', code)
    
    // 调用微信登录接口
    const { data } = await wxUserLoginAPI(code)
    
    console.log('登录结果:', data)
    
    uni.hideLoading()
    
    if (data.code === 0) {
      // 保存用户信息到store
      userStore.setUserInfo(data.data)
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: data.msg || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('微信登录失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  }
}

// 上传单张图片
const handleUploadSingle = async () => {
  try {
    // 选择图片
    const chooseRes = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    
    const tempFilePath = chooseRes.tempFilePaths[0]
    
    uni.showLoading({
      title: '上传中...'
    })
    
    // 上传图片
    const result = await uploadImageAPI(tempFilePath)
    
    uni.hideLoading()
    
    if (result.code === 0) {
      // 添加到已上传列表
      uploadedImages.value.unshift({
        url: result.data.url,
        filePath: result.data.filePath
      })
      
      uni.showToast({
        title: '上传成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: result.msg || '上传失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    })
  }
}

// 上传多张图片
const handleUploadMultiple = async () => {
  try {
    // 选择图片（最多9张）
    const chooseRes = await uni.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    
    const tempFilePaths = chooseRes.tempFilePaths
    
    if (tempFilePaths.length === 0) {
      return
    }
    
    uni.showLoading({
      title: `上传中 0/${tempFilePaths.length}`
    })
    
    // 逐个上传图片
    const uploadedList = []
    for (let i = 0; i < tempFilePaths.length; i++) {
      try {
        uni.showLoading({
          title: `上传中 ${i + 1}/${tempFilePaths.length}`
        })
        
        const result = await uploadImageAPI(tempFilePaths[i])
        
        if (result.code === 0) {
          uploadedList.push({
            url: result.data.url,
            filePath: result.data.filePath
          })
        }
      } catch (err) {
        console.error('上传单张图片失败:', err)
      }
    }
    
    uni.hideLoading()
    
    if (uploadedList.length > 0) {
      // 添加到已上传列表（新上传的放在前面）
      uploadedImages.value = [...uploadedList, ...uploadedImages.value]
      
      uni.showToast({
        title: `成功上传${uploadedList.length}张图片`,
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '所有图片上传失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('选择图片失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 40px;
}

.title {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}

.subtitle {
  display: block;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.card-text {
  display: block;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: block;
  font-size: 16px;
  color: #333;
  padding: 8px 0;
}

.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #26BF6E 0%, #20A55A 100%);
  border-radius: 24px;
  border: none;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(38, 191, 110, 0.3);
  position: relative;
  overflow: hidden;
  
  &::after {
    border: none;
  }
  
  .btn-text {
    font-size: 16px;
    font-weight: 500;
    color: #FFFFFF;
    letter-spacing: 1px;
  }
  
  // 按钮点击效果
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(38, 191, 110, 0.4);
  }
  
  // 次要按钮样式
  &.secondary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    margin-top: 12px;
    
    &:active {
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    }
  }
}

// 上传按钮样式
.upload-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  border-radius: 24px;
  border: none;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
  
  &::after {
    border: none;
  }
  
  .btn-text {
    font-size: 16px;
    font-weight: 500;
    color: #FFFFFF;
    letter-spacing: 1px;
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
  }
  
  &.secondary {
    background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
    box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
    margin-top: 12px;
    
    &:active {
      box-shadow: 0 2px 8px rgba(78, 205, 196, 0.4);
    }
  }
}

// 图片预览样式
.image-preview {
  margin-top: 16px;
  margin-bottom: 8px;
}

.image-item {
  margin-bottom: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.preview-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #e0e0e0;
}

.image-url {
  display: block;
  font-size: 12px;
  color: #999;
  word-break: break-all;
  line-height: 1.4;
}
</style>