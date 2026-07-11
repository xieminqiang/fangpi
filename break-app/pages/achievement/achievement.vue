<template>
  <view class="achievement-page">
    <scroll-view 
      class="scroll-container" 
      scroll-y="true" 
      :enhanced="true"
      :show-scrollbar="false"
      :enable-flex="true"
    >
      <!-- 页面标题 -->
      <view class="page-header">
        <image class="decoration-img decoration-2" src="/static/emj/wusheng.png" mode="aspectFit"></image>
        <text class="page-subtitle">解锁更多成就，成为放屁大师！</text>
      </view>

      <!-- 成就统计 -->
      <view class="achievement-stats">
        <view class="stats-grid">
          <view class="stat-card stat-card-1">
            <text class="stat-number">{{ achievementData.unlockedCount }}</text>
            <text class="stat-label">已解锁</text>
          </view>
          <view class="stat-card stat-card-2">
            <text class="stat-number">{{ achievementData.totalCount }}</text>
            <text class="stat-label">总成就</text>
          </view>
          <view class="stat-card stat-card-3">
            <text class="stat-number">{{ completionRate }}%</text>
            <text class="stat-label">完成度</text>
          </view>
        </view>
      </view>

      <!-- 成就列表 -->
      <view class="achievement-section">
        <text class="section-title">成就列表</text>
        <view class="achievement-grid">
          <view 
            v-for="achievement in achievementData.achievements" 
            :key="achievement.id"
            class="achievement-card"
            :class="{ 'unlocked': achievement.isUnlocked, 'locked': !achievement.isUnlocked }"
            @click="showAchievementDetail(achievement)"
          >
            <!-- 成就图标 -->
            <view class="achievement-icon-container">
              <image 
                v-if="achievement.achievementIcon" 
                :src="achievement.achievementIcon" 
                class="achievement-icon"
                mode="aspectFit"
              />
              <view v-else class="achievement-emoji-fallback">
                <text class="achievement-emoji">{{ achievement.achievementEmoji }}</text>
              </view>
              
              <!-- 解锁状态指示器 -->
              <view v-if="achievement.isUnlocked" class="unlock-indicator">
                <image class="unlock-icon" src="/static/img/yiwancheng.png" mode="aspectFit" />
              </view>
              <view v-else class="progress-indicator">
                <text class="progress-text">{{ achievement.progress }}%</text>
              </view>
            </view>

            <!-- 成就信息 -->
            <view class="achievement-info">
              <text class="achievement-name">{{ achievement.achievementName }}</text>
              <text class="achievement-desc">{{ achievement.achievementDesc }}</text>
              
              <!-- 进度条 -->
              <view class="progress-container">
                <view class="progress-bar">
                  <view 
                    class="progress-fill" 
                    :style="{ width: achievement.progress + '%' }"
                    :class="{ 'completed': achievement.isUnlocked }"
                  ></view>
                </view>
                <text class="progress-label">{{ achievement.progress }}%</text>
              </view>
              
              <!-- 奖励经验 -->
              <view class="reward-container">
               
                <text class="reward-text">+{{ achievement.rewardExp }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 成就详情弹窗 -->
    <uni-popup ref="achievementPopup" type="center" :mask-click="false">
      <view class="achievement-detail-popup">
        <view class="popup-header">
          <text class="popup-title">{{ selectedAchievement && selectedAchievement.isUnlocked ? `恭喜您已获得了"${selectedAchievement.achievementName}"` : '您还未解锁该成就' }}</text>
          <text class="popup-close" @click="closeAchievementDetail">✕</text>
        </view>
        
        <view v-if="selectedAchievement" class="popup-content">
          <view class="detail-gif-container">
            <image 
              v-if="selectedAchievement.achievementGif" 
              :src="selectedAchievement.achievementGif" 
              class="detail-gif"
              mode="aspectFit"
            />
            <image 
              v-else-if="selectedAchievement.achievementIcon" 
              :src="selectedAchievement.achievementIcon" 
              class="detail-gif"
              mode="aspectFit"
            />
            <text v-else class="detail-emoji">{{ selectedAchievement.achievementEmoji }}</text>
          </view>
          
          <view class="detail-info">
            <text class="detail-name">{{ selectedAchievement.achievementName }}</text>
            <text class="detail-desc">{{ selectedAchievement.achievementDesc }}</text>
            
            <view class="detail-progress">
              <text class="progress-label">进度：</text>
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: selectedAchievement.progress + '%' }"
                  :class="{ 'completed': selectedAchievement.isUnlocked }"
                ></view>
              </view>
              <text class="progress-value">{{ selectedAchievement.progress }}%</text>
            </view>
            
            <view class="detail-reward">
              <text class="reward-label">奖励经验：</text>
              <text class="reward-value">+{{ selectedAchievement.rewardExp }}</text>
            </view>
            
            <view v-if="selectedAchievement.isUnlocked" class="detail-unlock-time">
              <text class="unlock-label">解锁时间：</text>
              <text class="unlock-value">{{ formatTime(selectedAchievement.unlockTime) }}</text>
            </view>
          </view>
          
          <view class="popup-actions">
            <button 
              v-if="selectedAchievement.isUnlocked"
              class="action-btn primary" 
              open-type="share"
              @click="handleShare"
            >
              <text class="btn-icon">🎉</text>
              <text>分享</text>
            </button>
            <button 
              v-else
              class="action-btn disabled" 
              disabled
            >
              <text class="btn-icon">🔒</text>
              <text>未解锁</text>
            </button>
            <button class="action-btn secondary" @click="closeAchievementDetail">
              关闭
            </button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner">
        <image class="loading-img" src="/static/emj/wusheng.png" mode="aspectFit"></image>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { getUserAchievementsAPI } from '@/src/api/achievement.js'
import { useUserStore } from '@/src/stores/user.js'

// 响应式数据
const loading = ref(false)
const achievementData = ref({
  achievements: [],
  totalCount: 0,
  unlockedCount: 0
})
const selectedAchievement = ref(null)
const achievementPopup = ref(null)
const isSharing = ref(false)

// 计算属性
const completionRate = computed(() => {
  if (achievementData.value.totalCount === 0) return 0
  return Math.round((achievementData.value.unlockedCount / achievementData.value.totalCount) * 100)
})

// 生命周期
onMounted(() => {
  // 检查是否已经有 token（已登录状态）
  // 从 userStore 中读取 token，而不是从 storage
  const userStore = useUserStore()
  if (userStore.token) {
    console.log('已有 token，直接加载成就数据')
    loadAchievements()
  } else {
    console.log('暂无 token，等待登录完成...')
  }
  
  // 监听登录成功事件
  uni.$on('loginSuccess', onLoginSuccess)
  
  // 监听打卡成功事件，刷新成就数据
  uni.$on('userInfoUpdated', () => {
    console.log('收到用户信息更新事件，刷新成就数据...')
    loadAchievements()
  })
})

// 登录成功回调
const onLoginSuccess = () => {
  console.log('收到 loginSuccess 事件，开始加载成就数据')
  loadAchievements()
}

onShow(() => {
  // 每次显示页面时刷新数据
  console.log('成就页面显示，刷新数据...')
  loadAchievements()
})

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('loginSuccess', onLoginSuccess)
  uni.$off('userInfoUpdated')
})

// 方法
const loadAchievements = async () => {
  loading.value = true
  try {
    const response = await getUserAchievementsAPI()
    console.log('response', response)
    if (response.data.code === 0) {
      achievementData.value = response.data.data
    } 
  } catch (error) {
    console.error('加载成就数据失败:', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const showAchievementDetail = (achievement) => {
  selectedAchievement.value = achievement
  achievementPopup.value.open()
}

const closeAchievementDetail = () => {
  achievementPopup.value.close()
  selectedAchievement.value = null
}


const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 处理分享按钮点击
const handleShare = () => {
  if (!selectedAchievement.value || !selectedAchievement.value.isUnlocked) {
    uni.showToast({
      title: '该成就尚未解锁',
      icon: 'none'
    })
    return
  }
  
  isSharing.value = true
  console.log('准备分享成就:', selectedAchievement.value.achievementName)
}

// 配置分享内容
onShareAppMessage(() => {
  if (selectedAchievement.value && selectedAchievement.value.isUnlocked) {
    return {
      title: `我解锁了「${selectedAchievement.value.achievementName}」成就！🎉`,
      path: '/pages/index/index',
      imageUrl: selectedAchievement.value.achievementIcon || selectedAchievement.value.achievementGif || ''
    }
  }
  
  // 默认分享内容
  return {
    title: '快来一起记录放屁，解锁成就吧！💨',
    path: '/pages/index/index'
  }
})
</script>

<style lang="scss" scoped>
.achievement-page {
  height: 100vh;
  background: linear-gradient(180deg, #A8E6CF 0%, #FFFACD 100%);
  position: relative;
  overflow: hidden;
}

.scroll-container {
  height: 100%;
  padding: 0;
}

/* 重置按钮样式 */
button {
  border: none;
  outline: none;
  background: none;
  padding: 0;
  margin: 0;
  box-shadow: none;
}

button::after {
  border: none;
}

/* Header Area */
.page-header {
  padding: 50rpx 48rpx 32rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.decoration-emoji {
  position: absolute;
  color: rgba(255, 255, 255, 0.2);
  opacity: 0.5;
}

.decoration-img {
  position: absolute;
  opacity: 0.3;
}

.decoration-2 {
  bottom: -64rpx;
  right: -32rpx;
  width: 160rpx;
  height: 160rpx;
  transform: rotate(12deg);
}

.page-subtitle {
  color: #739a4c;
  font-size: 24rpx;
  font-weight: 400;
  opacity: 0.8;
  display: block;
}

/* Statistics Section */
.achievement-stats {
  padding: 0 32rpx 32rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 32rpx;
  text-align: center;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.stat-card-1 {
  background: linear-gradient(135deg, #FFD3B6, #FFC3A0);
}

.stat-card-2 {
  background: linear-gradient(135deg, #A8E6CF, #8af5bf);
}

.stat-card-3 {
  background: linear-gradient(135deg, #FFC3A0, #FFD3B6);
}

.stat-number {
  font-size: 40rpx;
  font-weight: bold;
  color: white;
  display: block;
}

.stat-label {
  font-size: 28rpx;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}


/* Achievement Section */
.achievement-section {
  padding: 0 32rpx 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #5D5D5D;
  margin-bottom: 24rpx;
  padding: 0 16rpx;
  display: block;
}

.achievement-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32rpx;
}

.achievement-card {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.unlocked {
    border: 3rpx solid #4CAF50;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%);
  }
  
  &.locked {
    border: 3rpx solid #FF9800;
    opacity: 0.8;
  }
}

.achievement-icon-container {
  position: relative;
  width: 100%;
  height: 120rpx;
  margin-bottom: 16rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #A8E6CF 0%, #FFD3B6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .achievement-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
  }
  
  .achievement-emoji-fallback {
    .achievement-emoji {
      font-size: 60rpx;
    }
  }
  
  .unlock-indicator {
    position: absolute;
    top: 0rpx;
    right: 0rpx;
    width: 35rpx;
    height: 35rpx;
 
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FF9800;
    
    .unlock-icon {
      width: 20rpx;
      height: 20rpx;
    
      
    }
  }
  
  .progress-indicator {
    position: absolute;
    top: 0rpx;
    right: 0rpx;
    width: 35rpx;
    height: 35rpx;
    background: #FF9800;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3rpx solid #fff;
    box-shadow: 0 2rpx 8rpx rgba(255, 152, 0, 0.3);
    
    .progress-text {
      font-size: 16rpx;
      color: #fff;
      font-weight: bold;
    }
  }
}

.achievement-info {
  flex: 1;
  text-align: center;
  
  .achievement-name {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: #0d1b14;
    margin-bottom: 8rpx;
  }
  
  .achievement-desc {
    display: block;
    font-size: 24rpx;
    color: #5D5D5D;
    margin-bottom: 16rpx;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .progress-container {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    
    .progress-bar {
      flex: 1;
      height: 8rpx;
      background: rgba(115, 154, 76, 0.2);
      border-radius: 4rpx;
      overflow: hidden;
      margin-right: 12rpx;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #A8E6CF 0%, #8af5bf 100%);
        border-radius: 4rpx;
        transition: width 0.3s ease;
        
        &.completed {
          background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
        }
      }
    }
    
    .progress-label {
      font-size: 20rpx;
      color: #739a4c;
      font-weight: bold;
      min-width: 50rpx;
    }
  }
  
  .reward-container {
    display: flex;
    align-items: center;
    justify-content: center;
    
    .reward-icon {
      font-size: 20rpx;
      margin-right: 6rpx;
    }
    
    .reward-text {
      font-size: 20rpx;
      color: #739a4c;
      font-weight: bold;
    }
  }
}

.achievement-detail-popup {
  width: 650rpx;
  background: #f6f8f7;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
    
    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #0d1b14;
    }
    
    .popup-close {
      font-size: 40rpx;
      color: #0d1b14;
      padding: 10rpx;
    }
  }
  
  .popup-content {
    padding: 40rpx;
    
    .detail-gif-container {
      text-align: center;
      margin-bottom: 30rpx;
      
      .detail-gif {
        width: 200rpx;
        height: 200rpx;
        border-radius: 20rpx;
      }
      
      .detail-emoji {
        font-size: 120rpx;
      }
    }
    
    .detail-info {
      text-align: center;
      margin-bottom: 40rpx;
      
      .detail-name {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #0d1b14;
        margin-bottom: 15rpx;
      }
      
      .detail-desc {
        display: block;
        font-size: 28rpx;
        color: #5D5D5D;
        line-height: 1.5;
        margin-bottom: 25rpx;
      }
      
      .detail-progress {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20rpx;
        
        .progress-label {
          font-size: 26rpx;
          color: #5D5D5D;
          margin-right: 15rpx;
        }
        
        .progress-bar {
          width: 200rpx;
          height: 12rpx;
          background: rgba(115, 154, 76, 0.2);
          border-radius: 6rpx;
          overflow: hidden;
          margin-right: 15rpx;
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #A8E6CF 0%, #8af5bf 100%);
            border-radius: 6rpx;
            transition: width 0.3s ease;
            
            &.completed {
              background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
            }
          }
        }
        
        .progress-value {
          font-size: 26rpx;
          color: #739a4c;
          font-weight: bold;
        }
      }
      
      .detail-reward, .detail-unlock-time {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 15rpx;
        
        .reward-label, .unlock-label {
          font-size: 26rpx;
          color: #5D5D5D;
          margin-right: 10rpx;
        }
        
        .reward-value {
          font-size: 26rpx;
          color: #739a4c;
          font-weight: bold;
        }
        
        .unlock-value {
          font-size: 26rpx;
          color: #0d1b14;
        }
      }
    }
  }
  
  .popup-actions {
    display: flex;
    gap: 20rpx;
    justify-content: center;
    
    .action-btn {
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
      
      .btn-icon {
        font-size: 28rpx;
      }
      
      &.primary {
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
        color: #fff;
        box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.3);
        
        &:active {
          transform: scale(0.95);
          box-shadow: 0 4rpx 10rpx rgba(76, 175, 80, 0.4);
        }
      }
      
      &.secondary {
        background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
        color: #0d1b14;
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
        
        &:active {
          transform: scale(0.95);
          box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
        }
      }
      
      &.disabled {
        background: linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%);
        color: #9E9E9E;
        box-shadow: none;
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

/* 加载状态样式 */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(246, 248, 247, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-spinner {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .loading-img {
      width: 80rpx;
      height: 80rpx;
      margin-bottom: 20rpx;
      animation: spin 2s linear infinite;
    }
    
    .loading-text {
      font-size: 28rpx;
      color: #739a4c;
      font-weight: bold;
    }
  }
}

/* 动画定义 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .achievement-grid {
    grid-template-columns: 1fr;
    gap: 24rpx;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 24rpx;
  }
  
  .achievement-detail-popup {
    width: 90%;
    margin: 0 5%;
  }
}
</style>