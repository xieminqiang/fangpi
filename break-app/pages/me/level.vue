<template>
  <view class="level-page">
    <scroll-view class="level-container" scroll-y="true">

      <!-- 当前等级卡片 -->
      <view class="current-level-card">
      <view class="current-level-content">
        <!-- 等级图标/图片 -->
        <view v-if="currentUserLevel.levelImage" class="current-level-image-wrapper">
          <image :src="currentUserLevel.levelImage" class="current-level-image" mode="aspectFit" />
        </view>
        
        <text class="level-desc">当前等级</text>
        <text class="level-name-current">{{ currentUserLevel.levelName || '新手屁民' }}</text>
        
        <view class="stats-section">
          <view class="stat-item">
            <text class="stat-label">累计次数</text>
            <text class="stat-value">{{ totalFarts }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">经验值</text>
            <text class="stat-value">{{ userExperience }}</text>
          </view>
        </view>
      </view>
    </view>


      <!-- 等级列表标题 -->
      <view class="section-header">
        <text class="section-title">全部等级</text>
        <text class="section-subtitle">共 {{ levelList.length }} 个等级</text>
      </view>

      <!-- 等级列表 -->
      <view class="level-list">
        <!-- 空状态提示 -->
        <view v-if="levelList.length === 0" class="empty-state">
          <text class="empty-emoji">📋</text>
          <text class="empty-text">暂无等级配置</text>
        </view>

        <view 
          v-for="(level, index) in levelList" 
          :key="level.id || index"
          class="level-item"
          :class="{ 
           
            'level-item-unlocked': isUnlocked(level.level),
            'level-item-locked': !isUnlocked(level.level)
          }"
        >
          <!-- 等级序号 -->
          <view class="level-number">
            <text class="number-text">Lv.{{ level.level || 0 }}</text>
          </view>

          <!-- 等级图标 -->
          <view class="level-icon-wrapper">
            <view v-if="level.levelImage" class="level-image-container">
              <image :src="level.levelImage" class="level-image" mode="aspectFit" />
            </view>
            <view v-else class="level-emoji-container" :class="`level-bg-${index % 4}`">
              <text class="level-emoji">{{ level.levelEmoji || '❓' }}</text>
            </view>
        
          
          <!-- 已解锁标记 -->
          <view v-if="isUnlocked(level.level)" class="unlocked-badge">
            <text class="unlocked-icon">✓</text>
          </view>
          
          <!-- 锁定标记 -->
          <view v-else class="locked-overlay">
            <text class="locked-icon">🔒</text>
          </view>
        </view>

          <!-- 等级信息 -->
          <view class="level-info">
            <text class="level-name">{{ level.levelName || '未命名' }}</text>
            
            <view class="level-requirements">
              <view class="requirement-item">
                <text class="requirement-icon">⭐</text>
                <text class="requirement-text">{{ level.requiredExp || 0 }} 经验</text>
              </view>
              <view class="requirement-item">
                <text class="requirement-icon">💨</text>
                <text class="requirement-text">{{ level.requiredFarts || 0 }} 次</text>
              </view>
              <view class="requirement-item">
                <text class="requirement-icon">📅</text>
                <text class="requirement-text">{{ level.requiredDays || 0 }} 天</text>
              </view>
            </view>
          </view>

          <!-- 状态标签 -->
          <view class="level-status">
        
            <view v-if="isUnlocked(level.level)" class="status-tag status-unlocked">
              <text class="status-text">已达成</text>
            </view>
            <view v-else class="status-tag status-locked">
              <text class="status-text">未解锁</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="bottom-tips">
        <text class="tip-icon">💡</text>
        <text class="tip-text">每次打卡都能获得经验值，坚持打卡解锁更多等级称号吧！</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getAllLevelConfigsAPI } from '@/src/api/level.js'
import { useUserStore } from '@/src/stores/user.js'

// 使用 user store
const userStore = useUserStore()

// 等级列表
const levelList = ref([])

// 用户当前等级和经验
const userLevel = computed(() => userStore.level || 1)
const userExperience = computed(() => userStore.experience || 0)
const totalFarts = computed(() => userStore.totalFarts || 0)

// 当前等级信息
const currentUserLevel = computed(() => {
  return levelList.value.find(item => item.level === userLevel.value) || {}
})

// 是否已达到最高等级
const isMaxLevel = computed(() => {
  if (!levelList.value || levelList.value.length === 0) return false
  const maxLevel = Math.max(...levelList.value.map(item => item.level || 0))
  return userLevel.value >= maxLevel
})

// 下一等级所需经验
const nextLevelExp = computed(() => {
  const nextLevel = levelList.value.find(item => item.level === userLevel.value + 1)
  return nextLevel ? nextLevel.requiredExp : userExperience.value
})

// 经验进度百分比
const expProgress = computed(() => {
  if (isMaxLevel.value) return 100
  if (nextLevelExp.value === 0) return 100
  const progress = (userExperience.value / nextLevelExp.value) * 100
  return Math.min(progress, 100)
})

// 判断是否为当前等级
const isCurrentLevel = (level) => {
  return level === userLevel.value
}

// 判断是否已解锁
const isUnlocked = (level) => {
  return level <= userLevel.value
}

// 页面加载
onMounted(() => {
  // 检查是否已经有 token（已登录状态）
  // 从 userStore 中读取 token，而不是从 storage
  if (userStore.token) {
    console.log('已有 token，直接加载等级配置')
    loadLevelConfigs()
  } else {
    console.log('暂无 token，等待登录完成...')
  }
  
  // 监听登录成功事件
  uni.$on('loginSuccess', onLoginSuccess)
})

// 登录成功回调
const onLoginSuccess = () => {
  console.log('收到 loginSuccess 事件，开始加载等级配置')
  loadLevelConfigs()
}

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('loginSuccess', onLoginSuccess)
})

// 加载等级配置
const loadLevelConfigs = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const response = await getAllLevelConfigsAPI()
    
    if (response.data.code === 0) {
      const rawData = response.data.data
      
      // 按等级排序
      if (Array.isArray(rawData)) {
        levelList.value = rawData.sort((a, b) => a.level - b.level)
        console.log('✅ 等级配置加载成功', levelList.value)
      } else {
        console.error('❌ 返回的数据不是数组:', rawData)
        uni.showToast({
          title: '数据格式错误',
          icon: 'error'
        })
      }
    } else {
      console.error('❌ API 返回错误:', response.data.msg)
      uni.showToast({
        title: response.data.msg || '加载失败',
        icon: 'error'
      })
    }
  } catch (error) {
    console.error('❌ 加载等级配置失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'error'
    })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped>
.level-page {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.level-container {
  height: 100%;
  width: 100%;
  background: linear-gradient(180deg, #A8E6CF 0%, #FFFACD 100%);
  padding: 32rpx;
  box-sizing: border-box;
}

/* 当前等级卡片 */
.current-level-card {
  background: linear-gradient(135deg, #FFD3B6, #FFC3A0);
  border-radius: 32rpx;
  padding: 48rpx 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.card-decoration {
  position: absolute;
  font-size: 120rpx;
  opacity: 0.2;
}

.card-decoration.decoration-1 {
  top: -30rpx;
  left: -30rpx;
}

.card-decoration.decoration-2 {
  bottom: -30rpx;
  right: -30rpx;
  transform: rotate(15deg);
}

.current-level-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.current-level-image-wrapper {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-level-image {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.level-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10rpx;
}

.level-name-current {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 32rpx;
}

.stats-section {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 20rpx 32rpx;
  backdrop-filter: blur(10px);
  min-width: 140rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.stat-value {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

/* 区块标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #5D5D5D;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999;
}

/* 等级列表 */
.level-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

/* 空状态 */
.empty-state {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  padding: 80rpx 40rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.empty-emoji {
  font-size: 100rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.level-item {
  background: white;
  border-radius: 24rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.level-item-current {
  background: linear-gradient(135deg, #A8E6CF, #8af5bf);
  box-shadow: 0 8rpx 20rpx rgba(168, 230, 207, 0.4);
}

.level-item-unlocked {
  background: white;
}

.level-item-locked {
  background: #f5f5f5;
  opacity: 0.7;
}

/* 等级序号 */
.level-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  background: rgba(93, 93, 93, 0.1);
  border-radius: 16rpx;
  flex-shrink: 0;
}

.level-item-current .level-number {
  background: rgba(255, 255, 255, 0.3);
}

.number-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #5D5D5D;
}

.level-item-current .number-text {
  color: white;
}

/* 等级图标 */
.level-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.level-image-container {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
}

.level-emoji-container {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.level-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.level-bg-0 {
  background: linear-gradient(135deg, #FFD3B6, #FFC3A0);
}

.level-bg-1 {
  background: linear-gradient(135deg, #A8E6CF, #8af5bf);
}

.level-bg-2 {
  background: linear-gradient(135deg, #FFFACD, #ffd966);
}

.level-bg-3 {
  background: linear-gradient(135deg, #D4A5FF, #B794F6);
}

.level-emoji {
  font-size: 60rpx;
}

/* 标记 */
.current-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(255, 107, 107, 0.3);
}

.current-badge-text {
  font-size: 20rpx;
  color: white;
  font-weight: bold;
}

.unlocked-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(76, 175, 80, 0.3);
}

.unlocked-icon {
  font-size: 24rpx;
  color: white;
  font-weight: bold;
}

.locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.locked-icon {
  font-size: 40rpx;
}

/* 等级信息 */
.level-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.level-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #5D5D5D;
}

.level-item-current .level-name {
  color: white;
}

.level-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(93, 93, 93, 0.05);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.level-item-current .requirement-item {
  background: rgba(255, 255, 255, 0.2);
}

.requirement-icon {
  font-size: 24rpx;
}

.requirement-text {
  font-size: 22rpx;
  color: #666;
}

.level-item-current .requirement-text {
  color: rgba(255, 255, 255, 0.9);
}

/* 状态标签 */
.level-status {
  flex-shrink: 0;
}

.status-tag {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-current {
  background: rgba(255, 255, 255, 0.3);
}

.status-unlocked {
  background: rgba(76, 175, 80, 0.1);
}

.status-locked {
  background: rgba(0, 0, 0, 0.05);
}

.status-text {
  font-size: 22rpx;
  font-weight: 600;
}

.status-current .status-text {
  color: white;
}

.status-unlocked .status-text {
  color: #4CAF50;
}

.status-locked .status-text {
  color: #999;
}

/* 底部提示 */
.bottom-tips {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  backdrop-filter: blur(10px);
  margin-bottom: 32rpx;
}

.tip-icon {
  font-size: 36rpx;
  flex-shrink: 0;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  flex: 1;
}
</style>
