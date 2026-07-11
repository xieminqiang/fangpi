<template>
  <view class="create-page">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-content">

        <text class="subtitle">录制你的专属放屁音效</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view class="scroll-content" scroll-y>
      <!-- 录音区域 -->
      <view class="record-section">
        <view class="record-card">
          <!-- 录音状态显示 -->
          <view class="record-status">
            <view v-if="!isRecording && !recordFilePath" class="record-placeholder">
              <image class="record-icon" src="/static/img/jqr.png" mode="aspectFit"></image>
              <text class="record-hint">点击下方按钮开始录音</text>
            </view>
            
            <!-- 录音中状态 -->
            <view v-if="isRecording" class="recording-indicator">
              <view class="recording-animation">
                <view class="wave wave-1"></view>
                <view class="wave wave-2"></view>
                <view class="wave wave-3"></view>
              </view>
              <text class="recording-text">正在录音中...</text>
              <text class="recording-time">{{ formatTime(recordDuration) }}</text>
            </view>
            
            <!-- 录音完成状态 -->
            <view v-if="!isRecording && recordFilePath" class="record-complete">
              <image class="complete-icon" src="/static/img/jqr.png" mode="aspectFit"></image>
              <text class="complete-text">录音完成</text>
              <text class="record-time">{{ formatTime(recordDuration) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮区域 -->
      <view class="action-section">
        <!-- 录音/停止按钮 -->
        <view v-if="!recordFilePath" class="action-buttons">
          <button 
            v-if="!isRecording"
            class="record-btn start-btn" 
            @click="startRecord"
            :disabled="isUploading"
          >
            <image class="btn-icon-img" src="/static/img/yinpin.png" mode="aspectFit"></image>
            <text class="btn-text">开始录音</text>
          </button>
          
          <button 
            v-else
            class="record-btn stop-btn" 
            @click="stopRecord"
          >
            <text class="btn-text">停止录音</text>
          </button>
        </view>

        <!-- 播放/重新录音按钮 -->
        <view v-else class="action-buttons">
          <button 
            class="play-btn" 
            @click="togglePlay"
            :disabled="isUploading"
          >
            <text class="btn-text">{{ isPlaying ? '暂停' : '播放' }}</text>
          </button>
          
          <button 
            class="re-record-btn" 
            @click="resetRecord"
            :disabled="isUploading"
          >
            <text class="btn-text">重新录音</text>
          </button>
        </view>
      </view>

      <!-- 提示信息 -->
      <view class="tips-section">
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <text class="tip-text">录音时长建议在1-5秒之间</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">📝</text>
          <text class="tip-text">录音完成后点击上传保存</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部固定上传按钮 -->
    <view class="bottom-upload-section">
      <button 
        class="upload-btn" 
        @click="uploadAndCreate"
        :disabled="!recordFilePath || isUploading"
      >
        <text class="upload-text">{{ isUploading ? '上传中...' : '上传并保存' }}</text>
      </button>
    </view>

    <!-- 屁币不足弹窗 -->
    <uni-popup ref="pointsInsufficientPopup" type="center" :mask-click="false">
      <view class="points-insufficient-popup">
        <view class="popup-header">
          <view class="popup-icon-wrapper">
            <image class="popup-icon" src="/static/img/jifen.png" mode="aspectFit"></image>
          </view>
          <text class="popup-title">屁币不足</text>
        </view>
        
        <view class="popup-content">
          <view class="points-info-card">
            <view class="points-info-row">
              <text class="points-label">创建专属放屁音效需要</text>
              <view class="points-value-wrapper">
                <text class="points-value">5</text>
                <text class="points-unit">屁币</text>
              </view>
            </view>
            
            <view class="points-info-row current">
              <text class="points-label">当前屁币</text>
              <view class="points-value-wrapper">
                <text class="points-value current">{{ currentPointsForPopup }}</text>
                <text class="points-unit">屁币</text>
              </view>
            </view>
            
            <view class="points-diff">
              <text class="diff-text">还差 <text class="diff-value">{{ 5 - currentPointsForPopup }}</text> 屁币</text>
            </view>
          </view>
          
          <view class="points-tip">
            <text class="tip-icon">✨</text>
            <text class="tip-text">观看一个视频就能获得30屁币，轻松解锁这个功能哦~</text>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="action-btn secondary" @click="closePointsInsufficientPopup">
            <text>稍后再说</text>
          </button>
          <button class="action-btn primary" @click="goToPointsFromPopup">
            <text class="btn-icon">🎁</text>
            <text>去赚屁币</text>
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { createMyAudioAPI, uploadAudioAPI } from '@/src/api/audio.js'
import { getUserInfoAPI, updateUserPointsAPI } from '@/src/api/user.js'
import { useUserStore } from '@/src/stores/user.js'

const userStore = useUserStore()

// 获取用户屁币
const points = computed(() => userStore.points || 0)

// 屁币不足弹窗相关
const pointsInsufficientPopup = ref(null)
const currentPointsForPopup = ref(0)

// 录音相关
const isRecording = ref(false)
const recordFilePath = ref('')
const recordDuration = ref(0)
const recordTimer = ref(null)
const recorderManager = ref(null)

// 播放相关
const isPlaying = ref(false)
const audioContext = ref(null)

// 上传相关
const isUploading = ref(false)

// 激励视频广告实例（用于赚取屁币）
let videoAdForPoints = null

// 初始化录音管理器
const initRecorder = () => {
  recorderManager.value = uni.getRecorderManager()
  
  recorderManager.value.onStart(() => {
    console.log('录音开始')
    isRecording.value = true
    recordDuration.value = 0
    startTimer()
  })
  
  recorderManager.value.onStop((res) => {
    console.log('录音停止', res)
    isRecording.value = false
    stopTimer()
    recordFilePath.value = res.tempFilePath
    recordDuration.value = Math.floor(res.duration / 1000) // 转换为秒
  })
  
  recorderManager.value.onError((err) => {
    console.error('录音错误', err)
    isRecording.value = false
    stopTimer()
    uni.showToast({
      title: '录音失败，请重试',
      icon: 'none'
    })
  })
}

// 开始录音
const startRecord = () => {
  // 检查屁币是否足够（需要5屁币）
  const currentPoints = points.value
  if (currentPoints < 5) {
    currentPointsForPopup.value = currentPoints
    pointsInsufficientPopup.value?.open()
    return
  }
  
  if (!recorderManager.value) {
    initRecorder()
  }
  
  // 检查权限
  uni.authorize({
    scope: 'scope.record',
    success: () => {
      recorderManager.value.start({
        duration: 60000, // 最长60秒
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3'
      })
    },
    fail: () => {
      uni.showModal({
        title: '需要录音权限',
        content: '请在设置中开启录音权限',
        showCancel: true,
        success: (res) => {
          if (res.confirm) {
            uni.openSetting()
          }
        }
      })
    }
  })
}

// 停止录音
const stopRecord = () => {
  if (recorderManager.value) {
    recorderManager.value.stop()
  }
}

// 开始计时器
const startTimer = () => {
  recordTimer.value = setInterval(() => {
    recordDuration.value++
  }, 1000)
}

// 停止计时器
const stopTimer = () => {
  if (recordTimer.value) {
    clearInterval(recordTimer.value)
    recordTimer.value = null
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 播放/暂停
const togglePlay = () => {
  if (!recordFilePath.value) return
  
  if (isPlaying.value) {
    // 暂停
    if (audioContext.value) {
      audioContext.value.pause()
      isPlaying.value = false
    }
  } else {
    // 播放
    if (audioContext.value) {
      audioContext.value.play()
      isPlaying.value = true
    } else {
      audioContext.value = uni.createInnerAudioContext()
      audioContext.value.src = recordFilePath.value
      audioContext.value.onPlay(() => {
        isPlaying.value = true
      })
      audioContext.value.onEnded(() => {
        isPlaying.value = false
      })
      audioContext.value.onError((err) => {
        console.error('播放失败', err)
        isPlaying.value = false
        uni.showToast({
          title: '播放失败',
          icon: 'none'
        })
      })
      audioContext.value.play()
    }
  }
}

// 重新录音
const resetRecord = () => {
  uni.showModal({
    title: '确认重新录音',
    content: '重新录音将删除当前录音，是否继续？',
    success: (res) => {
      if (res.confirm) {
        // 停止播放
        if (audioContext.value) {
          audioContext.value.stop()
          audioContext.value.destroy()
          audioContext.value = null
        }
        isPlaying.value = false
        
        // 重置录音数据
        recordFilePath.value = ''
        recordDuration.value = 0
      }
    }
  })
}

// 上传并创建
const uploadAndCreate = async () => {
  if (!recordFilePath.value) {
    uni.showToast({
      title: '请先录音',
      icon: 'none'
    })
    return
  }
  
  // 检查是否登录
  if (!userStore.userInfo?.ID) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  try {
    isUploading.value = true
    
    // 先上传音频文件
    uni.showLoading({
      title: '上传中...'
    })
    
    const uploadRes = await uploadAudioAPI(recordFilePath.value)
    
    if (uploadRes.data.code !== 0) {
      throw new Error(uploadRes.data.msg || '上传失败')
    }
    
    const audioUrl = uploadRes.data.data.url
    
    // 创建音频库记录
    const createRes = await createMyAudioAPI({
      url: audioUrl,
      class_name: '自己放的屁',
      name: '我的专属放屁音效'
    })
    
    uni.hideLoading()
    
    if (createRes.data.code === 0) {
      // 扣除5屁币
      try {
        const { data: pointsData } = await updateUserPointsAPI({
          points: 5,
          pointsType: 2, // 2代表扣除屁币
          remark: '创建专属放屁音效'
        })
        
        if (pointsData.code === 0) {
          // 更新store中的用户信息
          userStore.setUserInfo(pointsData.data)
          console.log('屁币扣除成功，当前屁币:', pointsData.data.points)
        }
      } catch (error) {
        console.error('扣除屁币失败:', error)
        // 屁币扣除失败不影响创建成功，只记录日志
      }
      
      uni.showToast({
        title: '创建成功 ✅',
        icon: 'none',
        duration: 2000
      })
      
      // 发送事件通知其他页面刷新
      uni.$emit('audioLibraryUpdated')
      
      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 2000)
    } else {
      throw new Error(createRes.data.msg || '创建失败')
    }
  } catch (error) {
    uni.hideLoading()
    console.error('上传失败:', error)
    uni.showToast({
      title: error.message || '上传失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    isUploading.value = false
  }
}

// 加载用户信息（刷新屁币）
const loadUserInfo = async () => {
  try {
    const { data } = await getUserInfoAPI()
    if (data.code === 0) {
      // 更新store中的用户信息
      userStore.setUserInfo(data.data)
      
      console.log('用户信息已更新:', data.data)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 关闭屁币不足弹窗
const closePointsInsufficientPopup = () => {
  pointsInsufficientPopup.value?.close()
}

// 从弹窗直接观看广告赚取屁币
const goToPointsFromPopup = () => {
  watchAdForPoints()
}

// 初始化赚取屁币的激励视频广告
const initRewardedVideoAdForPoints = () => {
  // #ifdef MP-WEIXIN
  if (wx.createRewardedVideoAd) {
    videoAdForPoints = wx.createRewardedVideoAd({
      adUnitId: 'adunit-2ec9fad091c1156c'
    })

    videoAdForPoints.onLoad(() => {
      console.log('赚取屁币激励视频广告加载成功')
    })

    videoAdForPoints.onError((err) => {
      console.error('赚取屁币激励视频广告加载失败', err)
      if (err.errCode === 1004) {
        uni.showToast({
          title: '暂时没有可用的视频，请稍后再试',
          icon: 'none'
        })
      }
    })

    // 监听广告关闭事件
    videoAdForPoints.onClose(async (res) => {
      if (res && res.isEnded) {
        // 用户看完了激励视频广告，更新屁币
        console.log('用户看完了赚取屁币激励视频广告')
        await updatePointsForPopup(30, '观看激励视频广告奖励')
        // 关闭弹窗
        closePointsInsufficientPopup()
      } else {
        // 用户提前关闭了广告
        console.log('用户提前关闭了赚取屁币激励视频广告')
        uni.showToast({
          title: '需要看完视频才能获得屁币哦~',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
  // #endif
}

// 观看广告赚取屁币
const watchAdForPoints = () => {
  // #ifdef MP-WEIXIN
  if (!videoAdForPoints) {
    uni.showToast({
      title: '视频未准备好，请稍后再试',
      icon: 'none'
    })
    return
  }

  // 先尝试显示广告
  videoAdForPoints.show()
    .catch(err => {
      console.error('广告显示失败，尝试重新加载', err)
      
      // 如果显示失败，尝试重新加载
      videoAdForPoints.load()
        .then(() => {
          // 加载成功后再次尝试显示
          return videoAdForPoints.show()
        })
        .catch(loadErr => {
          console.error('广告加载或显示失败', loadErr)
          
          // 根据错误码判断
          if (loadErr.errCode === 1004) {
            uni.showToast({
              title: '暂时没有可用的视频，请稍后再试',
              icon: 'none'
            })
          } else {
            uni.showToast({
              title: '视频加载失败，请稍后再试',
              icon: 'none'
            })
          }
        })
    })
  // #endif
  
  // #ifndef MP-WEIXIN
  // 非微信小程序平台，模拟更新屁币
  updatePointsForPopup(30, '观看激励视频广告奖励')
  closePointsInsufficientPopup()
  // #endif
}

// 更新屁币（用于弹窗）
const updatePointsForPopup = async (points, remark) => {
  try {
    const { data } = await updateUserPointsAPI({
      points: points,
      pointsType: 1, // 1代表增加屁币
      remark: remark
    })
    
    if (data.code === 0) {
      console.log('屁币更新成功，当前屁币:', data.data.points)
      // 更新store中的用户信息
      userStore.setUserInfo(data.data)
      
      // 显示屁币奖励提示
      uni.showToast({
        title: `🎉 获得${points}屁币！当前屁币：${data.data.points}`,
        icon: 'none',
        duration: 2500
      })
    } else {
      console.error('屁币更新失败:', data.msg)
      uni.showToast({
        title: data.msg || '屁币更新失败，请稍后重试',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('更新屁币失败:', error)
    uni.showToast({
      title: '屁币更新失败，请稍后重试',
      icon: 'none'
    })
  }
}

// 页面加载时初始化广告
onMounted(() => {
  initRewardedVideoAdForPoints()
})

// 页面显示时刷新用户信息（确保屁币是最新的）
onShow(() => {
  loadUserInfo()
})

// 页面卸载时清理
onUnmounted(() => {
  // 停止录音
  if (recorderManager.value && isRecording.value) {
    recorderManager.value.stop()
  }
  
  // 停止播放
  if (audioContext.value) {
    audioContext.value.stop()
    audioContext.value.destroy()
    audioContext.value = null
  }
  
  // 清理计时器
  stopTimer()
  
  // 清理广告实例
  // #ifdef MP-WEIXIN
  if (videoAdForPoints) {
    videoAdForPoints.destroy()
    videoAdForPoints = null
  }
  // #endif
})
</script>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8f7 0%, #e8f5e8 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.header {
  padding: 40rpx 32rpx 24rpx;
  background: transparent;
}

.header-content {
  text-align: center;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #0d1b14;
  margin-bottom: 8rpx;
}

.subtitle {
  display: block;
  font-size: 24rpx;
  color: #739a4c;
  opacity: 0.8;
}

.scroll-content {
  flex: 1;
  padding: 0 32rpx;
  padding-bottom: 140rpx; /* 为底部按钮留出空间 */
  box-sizing: border-box;
}

.record-section {
  margin-top: 40rpx;
}

.record-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  min-height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-status {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.record-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.record-icon {
  width: 120rpx;
  height: 120rpx;
  opacity: 0.6;
}

.record-hint {
  font-size: 28rpx;
  color: #999;
}

.recording-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.recording-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
}

.wave {
  width: 8rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  border-radius: 4rpx;
  animation: wave-animation 1.2s ease-in-out infinite;
}

.wave-1 {
  height: 40rpx;
  animation-delay: 0s;
}

.wave-2 {
  height: 60rpx;
  animation-delay: 0.2s;
}

.wave-3 {
  height: 40rpx;
  animation-delay: 0.4s;
}

@keyframes wave-animation {
  0%, 100% {
    transform: scaleY(0.5);
    opacity: 0.7;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.recording-text {
  font-size: 32rpx;
  color: #FF6B9D;
  font-weight: 600;
}

.recording-time {
  font-size: 48rpx;
  color: #333;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.record-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.complete-icon {
  width: 120rpx;
  height: 120rpx;
}

.complete-text {
  font-size: 32rpx;
  color: #739a4c;
  font-weight: 600;
}

.record-time {
  font-size: 36rpx;
  color: #666;
  font-family: 'Courier New', monospace;
}

.action-section {
  margin-top: 40rpx;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  justify-content: center;
}

.record-btn,
.play-btn,
.re-record-btn {
  flex: 1;
  height: 100rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  font-size: 0;
  transition: all 0.3s ease;
}

.record-btn::after,
.play-btn::after,
.re-record-btn::after {
  border: none;
}

.start-btn {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.3);
}

.start-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.stop-btn {
  background: linear-gradient(135deg, #FF4444 0%, #FF6666 100%);
  box-shadow: 0 8rpx 24rpx rgba(255, 68, 68, 0.3);
}

.stop-btn:active {
  transform: scale(0.95);
}

.play-btn {
  background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.play-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.re-record-btn {
  background: #fffbfa;
  border: 2rpx solid #e8e8e8;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.re-record-btn:active:not(:disabled) {
  transform: scale(0.95);
  background: #f5f5f5;
}

.btn-icon {
  font-size: 36rpx;
}

.btn-icon-img {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.btn-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.re-record-btn .btn-text {
  color: #333;
}

.record-btn:disabled,
.play-btn:disabled,
.re-record-btn:disabled {
  opacity: 0.6;
  pointer-events: none;
}

.tips-section {
  margin-top: 60rpx;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.bottom-upload-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.upload-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.3);
  border: none;
  transition: all 0.3s ease;
}

.upload-btn::after {
  border: none;
}

.upload-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.upload-btn:disabled {
  opacity: 0.6;
  background: linear-gradient(135deg, #d0d0d0 0%, #b0b0b0 100%);
  pointer-events: none;
}

.upload-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

/* 屁币不足弹窗样式 */
.points-insufficient-popup {
  width: 650rpx;
  background: #f6f8f7;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

.points-insufficient-popup .popup-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #FFD3B6 0%, #FFB6C1 100%);
  border-bottom: none;
}

.popup-icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.popup-icon {
  width: 60rpx;
  height: 60rpx;
}

.points-insufficient-popup .popup-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #0d1b14;
  text-align: center;
}

.points-insufficient-popup .popup-content {
  padding: 40rpx 32rpx;
}

.points-info-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.points-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.points-info-row:last-child {
  margin-bottom: 0;
}

.points-info-row.current {
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.08);
}

.points-label {
  font-size: 28rpx;
  color: #5D5D5D;
  font-weight: 500;
}

.points-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.points-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B9D;
  line-height: 1;
}

.points-value.current {
  color: #4CAF50;
}

.points-unit {
  font-size: 24rpx;
  color: #999;
  font-weight: 500;
}

.points-diff {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx dashed rgba(255, 107, 157, 0.3);
  text-align: center;
}

.diff-text {
  font-size: 26rpx;
  color: #666;
}

.diff-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B9D;
  margin: 0 4rpx;
}

.points-tip {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 211, 182, 0.1) 100%);
  border-radius: 16rpx;
  border-left: 4rpx solid #FFB6C1;
}

.tip-icon {
  font-size: 32rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.points-tip .tip-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  flex: 1;
}

.points-insufficient-popup .popup-actions {
  padding: 0 32rpx 32rpx;
  gap: 16rpx;
  display: flex;
}

.points-insufficient-popup .action-btn {
  flex: 1;
  padding: 20rpx 30rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.points-insufficient-popup .action-btn::after {
  border: none;
}

.points-insufficient-popup .action-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  border: 2rpx solid #e0e0e0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.points-insufficient-popup .action-btn.secondary:active {
  background: #f5f5f5;
  transform: scale(0.98);
}

.points-insufficient-popup .action-btn.primary {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.3);
}

.points-insufficient-popup .action-btn.primary:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 10rpx rgba(76, 175, 80, 0.4);
}

.points-insufficient-popup .btn-icon {
  font-size: 28rpx;
}
</style>
