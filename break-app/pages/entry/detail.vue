<template>
  <view class="detail-page">
    <scroll-view 
      class="scroll-content" 
      scroll-y="true" 
      :enhanced="true" 
      :show-scrollbar="false"
    >
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <view class="pulse"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 详情内容 -->
      <view v-else-if="itemData" class="detail-content">
        <!-- 头部图片区域 -->
        <view class="header-image-section">
          <view class="image-wrapper">
            <image
              v-if="itemData.image"
              :src="itemData.image"
              class="detail-image"
              mode="aspectFill"
            />
            <view v-else class="detail-image placeholder">
              <text class="placeholder-emoji">💨</text>
            </view>
          </view>
          <!-- 播放按钮 -->
          <view class="play-button-wrapper" v-if="itemData.url">
            <view 
              class="play-button" 
              :class="{ playing: isPlaying }" 
              @click="!isPlaying && togglePlay()"
            >
              <image 
                v-if="!isPlaying"
                class="play-icon" 
                src="/static/img/24gl-playCircle.png"
                mode="aspectFit"
              />
              <image 
                v-else
                class="play-icon" 
                src="/static/img/24gf-pause2.png"
                mode="aspectFit"
              />
            </view>
          </view>
        </view>

        <!-- 信息卡片 -->
        <view class="info-card">
          <!-- 分类标签和删除按钮 -->
          <view class="class-section" v-if="itemData.class_name">
            <view class="class-header">
              <view class="class-badge-large">
                <text class="class-icon">📚</text>
                <text class="class-name">{{ itemData.class_name }}</text>
              </view>
              <!-- 删除按钮（只有"自己放的屁"分类才显示） -->
              <view 
                v-if="itemData.class_name === '自己放的屁'" 
                class="delete-btn"
                @click="handleDelete"
              >
                <text class="delete-icon">🗑️</text>
                <text class="delete-text">删除</text>
              </view>
            </view>
          </view>

          <!-- 标题 -->
          <view class="title-section">
            <text class="detail-title">{{ itemData.name }}</text>
            <text v-if="itemData.badge" class="detail-badge">{{ itemData.badge }}</text>
          </view>

          <!-- 描述 -->
          <view class="desc-section" v-if="itemData.description">
            <text class="desc-content">{{ itemData.description }}</text>
          </view>

          <!-- 标签区域 -->
          <view class="tags-section" v-if="itemData.tags && itemData.tags.length">
        
            <view class="tags-list">
              <view class="tag-item" v-for="tag in itemData.tags" :key="tag">
                <text class="tag-text">{{ tag }}</text>
              </view>
            </view>
          </view>

        </view>

        <!-- 底部间距 -->
        <view class="footer-spacer"></view>
      </view>

      <!-- 错误状态 -->
      <view v-else class="error-container">
        <text class="error-emoji">😅</text>
        <text class="error-text">数据加载失败</text>
        <button class="retry-btn" @click="goBack">返回列表</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { deleteAudioLibraryAPI } from '@/src/api/audio.js'

const loading = ref(true)
const itemData = ref(null)
const isPlaying = ref(false)
let innerAudioContext = null

// 获取页面参数并解析数据
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  if (options.data) {
    try {
      const decodedData = decodeURIComponent(options.data)
      itemData.value = JSON.parse(decodedData)
    } catch (error) {
      console.error('解析数据失败:', error)
      itemData.value = null
    }
  } else {
    itemData.value = null
  }
  
  loading.value = false
})

// 创建音频上下文
const ensureAudioContext = () => {
  if (!innerAudioContext && itemData.value?.url) {
    try {
      innerAudioContext = uni.createInnerAudioContext()
      if (!innerAudioContext) {
        throw new Error('无法创建音频上下文')
      }
      innerAudioContext.autoplay = false
      innerAudioContext.obeyMuteSwitch = false
      
      innerAudioContext.onEnded(() => {
        isPlaying.value = false
      })
      
      innerAudioContext.onStop(() => {
        isPlaying.value = false
      })
      
      innerAudioContext.onError((err) => {
        console.error('音频播放错误:', err)
        isPlaying.value = false
        
        let errorMsg = '音频播放失败'
        if (err && typeof err === 'object' && err.errMsg) {
          const errMsgLower = err.errMsg.toLowerCase()
          if (errMsgLower.includes('decode') || errMsgLower.includes('解码')) {
            errorMsg = '该手机不支持此音频播放'
          } else if (errMsgLower.includes('network') || errMsgLower.includes('网络')) {
            errorMsg = '网络错误，请检查网络连接'
          } else if (errMsgLower.includes('404') || errMsgLower.includes('not found')) {
            errorMsg = '音频文件不存在'
          }
        }
        
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2500
        })
        
        try {
          if (innerAudioContext) {
            innerAudioContext.destroy()
          }
        } catch (e) {
          console.error('清理音频上下文失败:', e)
        }
        innerAudioContext = null
      })
    } catch (error) {
      console.error('创建音频上下文失败:', error)
      uni.showToast({
        title: '音频初始化失败',
        icon: 'none',
        duration: 2000
      })
      innerAudioContext = null
    }
  }
}

// 验证 URL 是否有效
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false
  }
  try {
    new URL(url)
    return true
  } catch {
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')
  }
}

// 播放/暂停切换
const togglePlay = () => {
  if (!itemData.value?.url) {
    uni.showToast({
      title: '音频地址缺失',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 验证 URL
  if (!isValidUrl(itemData.value.url)) {
    uni.showToast({
      title: '音频地址格式错误',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 如果正在播放，则暂停
  if (isPlaying.value) {
    try {
      if (innerAudioContext) {
        innerAudioContext.pause()
        isPlaying.value = false
      }
    } catch (error) {
      console.error('暂停音频失败:', error)
      isPlaying.value = false
    }
    return
  }
  
  // 创建或确保音频上下文存在
  ensureAudioContext()
  
  if (!innerAudioContext) {
    uni.showToast({
      title: '音频播放器初始化失败',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  try {
    // 设置音频源
    innerAudioContext.src = itemData.value.url
    isPlaying.value = true
    
    // 延迟播放，给音频一些加载时间
    setTimeout(() => {
      try {
        if (innerAudioContext && 
            isPlaying.value && 
            innerAudioContext.src === itemData.value.url) {
          innerAudioContext.play()
        }
      } catch (playError) {
        console.error('播放音频失败:', playError)
        isPlaying.value = false
        uni.showToast({
          title: '播放失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
        
        try {
          if (innerAudioContext) {
            innerAudioContext.destroy()
          }
        } catch (e) {
          console.error('清理音频上下文失败:', e)
        }
        innerAudioContext = null
      }
    }, 100)
  } catch (error) {
    console.error('设置音频源失败:', error)
    isPlaying.value = false
    uni.showToast({
      title: '播放失败，请稍后重试',
      icon: 'none',
      duration: 2000
    })
    
    try {
      if (innerAudioContext) {
        innerAudioContext.destroy()
      }
    } catch (e) {
      console.error('清理音频上下文失败:', e)
    }
    innerAudioContext = null
  }
}

// 销毁音频资源
const destroyAudio = () => {
  if (innerAudioContext) {
    try {
      innerAudioContext.stop()
      innerAudioContext.destroy()
    } catch (e) {
      console.error('销毁音频上下文失败:', e)
    }
    innerAudioContext = null
  }
  isPlaying.value = false
}

// 返回列表
const goBack = () => {
  destroyAudio()
  uni.navigateBack()
}

// 删除音频
const handleDelete = async () => {
  if (!itemData.value) {
    return
  }
  
  // 确认删除
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${itemData.value.name}"吗？删除后无法恢复。`,
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#ff3b30',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '删除中...'
          })
          
          const { data } = await deleteAudioLibraryAPI(itemData.value.id)
          
          uni.hideLoading()
          
          if (data.code === 0) {
            uni.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1500
            })
            
            // 发送更新事件，通知列表页刷新
            uni.$emit('audioLibraryUpdated')
            
            // 延迟返回，让用户看到成功提示
            setTimeout(() => {
              goBack()
            }, 1500)
          } else {
            uni.showToast({
              title: data.msg || '删除失败',
              icon: 'none',
              duration: 2000
            })
          }
        } catch (error) {
          uni.hideLoading()
          console.error('删除失败:', error)
          uni.showToast({
            title: '删除失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      }
    }
  })
}

// 页面卸载时清理音频资源
onUnmounted(() => {
  destroyAudio()
})
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7fbf7 0%, #ffffff 100%);
}

.scroll-content {
  min-height: 100vh;
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 48rpx;
  min-height: 60vh;
}

.pulse {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #e8f8e8;
  margin-bottom: 24rpx;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.loading-text {
  color: #6b7a5d;
  font-size: 28rpx;
}

// 详情内容
.detail-content {
  padding-bottom: 40rpx;
}

// 头部图片区域
.header-image-section {
  padding: 32rpx 32rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.image-wrapper {
  position: relative;
  width:calc(100vw - 180rpx);
  height: calc((100vw - 180rpx) * 301 / 780); /* 按 780:301 比例计算：500 / (780/301) ≈ 193 */
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.detail-image {
  width: 100%;
  height: 100%;
}

.detail-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f9f9f9 0%, #ececec 100%);
}

.placeholder-emoji {
  font-size: 120rpx;
  opacity: 0.4;
}

// 信息卡片
.info-card {
  margin: 0 32rpx;
  padding: 40rpx;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

// 分类区域
.class-section {
  margin-bottom: 32rpx;
}

.class-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.class-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 28rpx;
  background: linear-gradient(135deg, rgba(158, 135, 71, 0.12) 0%, rgba(158, 135, 71, 0.06) 100%);
  border-radius: 24rpx;
  border: 2rpx solid rgba(158, 135, 71, 0.2);
  flex: 1;
}

// 删除按钮
.delete-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: rgba(255, 59, 48, 0.1);
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 59, 48, 0.2);
  transition: all 0.3s ease;
}

.delete-btn:active {
  transform: scale(0.95);
  background: rgba(255, 59, 48, 0.2);
}

.delete-icon {
  font-size: 28rpx;
}

.delete-text {
  font-size: 24rpx;
  color: #ff3b30;
  font-weight: 600;
}

.class-icon {
  font-size: 32rpx;
}

.class-name {
  font-size: 28rpx;
  color: #9E8747;
  font-weight: 700;
}

// 标题区域
.title-section {
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.detail-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #1f1f1f;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.detail-badge {
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #FFD3B6 0%, #FFECB3 100%);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #9E8747;
  font-weight: 600;
}

// 描述区域
.desc-section {
  margin-bottom: 32rpx;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.desc-content {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

// 标签区域
.tags-section {
  margin-bottom: 32rpx;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.tags-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 12rpx 24rpx;
  background: rgba(158, 135, 71, 0.1);
  border-radius: 24rpx;
  border: 1rpx solid rgba(158, 135, 71, 0.2);
}

.tag-text {
  font-size: 26rpx;
  color: #9E8747;
  font-weight: 500;
}

// 音频区域
.audio-section {
  margin-bottom: 32rpx;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.audio-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.audio-player-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.audio-status {
  padding: 12rpx 24rpx;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #4CAF50;
  font-weight: 600;
}

.audio-hint {
  font-size: 24rpx;
  color: #999;
}

.audio-hint.playing-hint {
  color: #9E8747;
  font-weight: 500;
}

// 播放按钮区域
.play-button-wrapper {
  flex-shrink: 0;
}

.play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  transition: opacity 0.3s ease;
}

.play-button:active:not(.playing) {
  opacity: 0.6;
}

.play-button.playing {
  opacity: 0.5;
  pointer-events: none;
}

.play-icon {
  width: 60rpx;
  height: 60rpx;
  flex-shrink: 0;
}

// 底部间距
.footer-spacer {
  height: 80rpx;
}

// 错误状态
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 48rpx;
  min-height: 60vh;
}

.error-emoji {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.error-text {
  color: #c62828;
  font-size: 28rpx;
  margin-bottom: 32rpx;
  text-align: center;
}

.retry-btn {
  padding: 16rpx 48rpx;
  border-radius: 999rpx;
  background: #ffe4e4;
  color: #c62828;
  border: none;
  font-size: 26rpx;
}

// 按钮样式重置
button {
  border: none;
  background: transparent;
}

button::after {
  border: none;
}
</style>

