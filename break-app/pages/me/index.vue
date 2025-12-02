<template>
  <scroll-view class="me-container" scroll-y="true">

    <!-- Header Area -->
    <view class="header-area">
      <image 
        class="avatar" 
        :src="avatar"
      mode="aspectFill"
        @click="goToEdit"
      />
      <view class="header-info">
        <view class="nickname-row" @click="goToEdit">
          <text class="nickname">{{ nickname }}</text>
          <image class="nickname-arrow" src="/static/img/arrow-right.png" mode="aspectFill" />
        </view>
        <view class="info-row">
          <view class="info-badge" @click="goToLevel">
            <text class="info-label">累计次数</text>
            <text class="info-value">{{ totalFarts }}</text>
          </view>
          <view class="info-badge" @click="goToLevel">
            <text class="info-label">经验值</text>
            <text class="info-value">{{ experience }}</text>
          </view>
        </view>
        <view class="level-info" @click="goToLevel">
          <image 
            v-if="currentLevelConfig && currentLevelConfig.icon" 
            class="level-icon" 
            :src="currentLevelConfig.icon" 
            mode="aspectFit" 
          />
          <text class="level-name">{{ levelName }}</text>
          <image class="arrow-right" src="/static/img/arrow-right.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- Achievement Badges -->
    <view class="achievement-section">
      <view class="section-header">
        <text class="section-title">成就徽章</text>
		   
        <view class="view-all-btn" @click="goToAchievements">
          <text class="btn-text">查看全部</text>
          <image class="btn-arrow" src="/static/img/arrow-right.png" mode="aspectFit" />
        </view>
      </view>
      <view class="achievement-grid">
        <view 
          v-for="(achievement, index) in firstFourAchievements" 
          :key="achievement.id"
          class="achievement-item"
          @click="showAchievementDetail(achievement)"
        >
          <view 
            class="achievement-badge" 
            :class="{
              'achievement-badge-1': index === 0,
              'achievement-badge-2': index === 1,
              'achievement-badge-3': index === 2,
              'achievement-badge-locked': !achievement.isUnlocked
            }"
          >
            <!-- 成就图标 -->
            <image 
              v-if="achievement.achievementIcon" 
              :src="achievement.achievementIcon" 
              class="achievement-icon"
              mode="aspectFit"
            />
            <text v-else class="achievement-emoji">{{ achievement.achievementEmoji }}</text>
          </view>
          <text class="achievement-label">{{ achievement.achievementName }}</text>
        </view>
      </view>
    </view>

    <!-- 成就详情弹窗 -->
    <uni-popup ref="achievementPopup" type="center" :mask-click="false">
      <view class="achievement-detail-popup">
        <view class="popup-header">
          <text class="popup-title">成就详情</text>
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

    <!-- 智能分析入口 -->
    <view class="ai-entry-section" v-if="showFartEncyclopediaEntry">
      <view class="ai-entry-card" @click="goToAiFx">
        <image class="entry-icon" src="/static/img/jqr.png" mode="aspectFit" />
        <view class="entry-content">
          <text class="entry-title">智能肠道健康分析</text>
          <text class="entry-desc">查看你的专属健康报告</text>
        </view>
        <image class="entry-arrow" src="/static/img/arrow-right.png" mode="aspectFit" />
      </view>
    </view>

    <!-- Fart Encyclopedia Entry -->
    <view class="ai-entry-section" v-if="showFartEncyclopediaEntry">
      <view class="ai-entry-card" @click="goToIndex">
        <image class="entry-icon" src="/static/img/pi.png" mode="aspectFit" />
        <view class="entry-content">
          <text class="entry-title">屁的全家族大全</text>
          <text class="entry-desc">从空心到实心，从凉到烫，你意想不到的屁都在这里</text>
        </view>
        <image class="entry-arrow" src="/static/img/arrow-right.png" mode="aspectFit" />
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { getUserInfoAPI } from '@/src/api/user.js'
import { getUserAchievementsAPI } from '@/src/api/achievement.js'
import { getShowFartEncyclopediaEntryAPI } from '@/src/api/app_config.js'
import { getAllLevelConfigsAPI } from '@/src/api/level.js'
import { useUserStore } from '@/src/stores/user.js'

// 使用 user store
const userStore = useUserStore()

// 用户信息（从store获取，支持响应式）
const userInfo = computed(() => userStore.userInfo)
const nickname = computed(() => userStore.nickname)
const avatar = computed(() => userStore.avatar)
const level = computed(() => userStore.level)
const levelName = computed(() => userStore.levelName)
const totalFarts = computed(() => userStore.totalFarts)
const experience = computed(() => userStore.experience)

// 成就数据
const achievementData = ref({
  achievements: [],
  totalCount: 0,
  unlockedCount: 0
})

// 成就详情弹窗相关
const selectedAchievement = ref(null)
const achievementPopup = ref(null)

// 是否显示"屁的全家族大全"入口
const showFartEncyclopediaEntry = ref(true)

// 等级配置数据
const levelConfigs = ref([])
const currentLevelConfig = computed(() => {
  if (levelConfigs.value.length === 0 || !level.value) {
    return null
  }
  return levelConfigs.value.find(config => config.level === level.value) || null
})

// 计算属性：获取前四个成就
const firstFourAchievements = computed(() => {
  return achievementData.value.achievements.slice(0, 4)
})

// 本周数据（模拟数据，实际应该从接口获取）
const weekCount = ref(42)
const dailyAverage = ref(6)
const mostType = ref('响亮型')
const maxSmell = ref('浓烈')

// 页面加载时获取用户信息
onMounted(() => {
  // 检查是否已经有 token（已登录状态）
  // 从 userStore 中读取 token，而不是从 storage
  if (userStore.token) {
    console.log('已有 token，直接加载用户信息')
    loadUserInfo()
    loadAchievements()
    loadAppConfig()
    loadLevelConfigs()
  } else {
    console.log('暂无 token，等待登录完成...')
  }
  
  // 监听登录成功事件
  uni.$on('loginSuccess', onLoginSuccess)
  
  // 监听打卡成功事件，刷新用户数据
  uni.$on('userInfoUpdated', () => {
    console.log('收到用户信息更新事件，刷新数据...')
    loadUserInfo()
    loadAchievements()
    loadLevelConfigs()
  })
})

// 登录成功回调
const onLoginSuccess = () => {
  console.log('收到 loginSuccess 事件，开始加载用户信息')
  loadUserInfo()
  loadAchievements()
  loadAppConfig()
  loadLevelConfigs()
}

// 页面显示时刷新数据（切换标签页时会触发）
onShow(() => {
  console.log('me页面显示，刷新数据...')
  loadUserInfo()
  loadAchievements()
  loadAppConfig()
  loadLevelConfigs()
})

// 加载应用配置
const loadAppConfig = async () => {
  try {
    const { data } = await getShowFartEncyclopediaEntryAPI()
    if (data.code === 0) {
      showFartEncyclopediaEntry.value = data.data === true || data.data === 'true'
    }
  } catch (error) {
    console.error('获取应用配置失败:', error)
    // 默认显示
    showFartEncyclopediaEntry.value = true
  }
}

// 加载等级配置
const loadLevelConfigs = async () => {
  try {
    const { data } = await getAllLevelConfigsAPI()
    if (data.code === 0) {
      levelConfigs.value = data.data || []
      console.log('等级配置已加载:', levelConfigs.value)
    }
  } catch (error) {
    console.error('获取等级配置失败:', error)
  }
}

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('loginSuccess', onLoginSuccess)
  uni.$off('userInfoUpdated')
})

// 加载用户信息
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

// 加载成就数据
const loadAchievements = async () => {
  try {
    const response = await getUserAchievementsAPI()
    if (response.data.code === 0) {
      achievementData.value = response.data.data
      console.log('成就数据已更新:', response.data.data)
    }
  } catch (error) {
    console.error('获取成就数据失败:', error)
  }
}


// 跳转到成就页面
const goToAchievements = () => {
  uni.navigateTo({
    url: '/pages/achievement/achievement'
  })
}

// 跳转到等级页面
const goToLevel = () => {
  uni.navigateTo({
    url: '/pages/me/level'
  })
}

// 跳转到编辑页面
const goToEdit = () => {
  uni.navigateTo({
    url: '/pages/me/edit'
  })
}

// 跳转到智能分析页面
const goToAiFx = () => {
  uni.navigateTo({
    url: '/pages/me/aiFx'
  })
}

// 跳转到图鉴页面
const goToIndex = () => {
  uni.navigateTo({
    url: '/pages/entry/index'
  })
}

// 显示成就详情
const showAchievementDetail = (achievement) => {
  selectedAchievement.value = achievement
  achievementPopup.value.open()
}

// 关闭成就详情
const closeAchievementDetail = () => {
  achievementPopup.value.close()
  selectedAchievement.value = null
}

// 格式化时间
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

<style scoped>
.me-container {
  height: 100vh;
  background: linear-gradient(180deg, #A8E6CF 0%, #FFFACD 100%);
  position: relative;
}

/* Header Area */
.header-area {
  padding: 110rpx 32rpx 32rpx;
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid white;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.avatar:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.nickname-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.nickname-row:active {
  opacity: 0.7;
}

.nickname {
  font-size: 34rpx;
  font-weight: bold;
  color: #5D5D5D;
 
}

.nickname-arrow {
  width: 38rpx;
  height:38rpx
 
}

.info-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-badge:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.info-label {
  font-size: 22rpx;
  color: #5D5D5D;
  font-weight: 500;
}

.info-value {
  font-size: 22rpx;
  color: #1B5E20;
  font-weight: bold;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  align-self: flex-start;
}

.level-info:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.level-icon {
  width: 32rpx;
  height: 32rpx;
}

.level-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #1B5E20;
}

.arrow-right {
  width: 24rpx;
  height: 24rpx;
  flex-shrink: 0;
}

/* Achievement Section */
.achievement-section {
  padding: 0 32rpx 32rpx;
  margin-top: 50rpx;
}

.section-header {
 
  display: flex;
  justify-content: space-between;
  
  margin-bottom: 24rpx;
}

.view-all-btn {
  background: rgba(255, 255, 255, 0.8);

  border-radius: 9999rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding-left: 20rpx;
  padding-right: 10rpx;
}

.view-all-btn::after {
  border: none;
}

.view-all-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.9);
}

.btn-text {
  font-size: 20rpx;
  color: #5D5D5D;
  font-weight: 500;
}

.btn-arrow {
  width: 24rpx;
  height: 24rpx;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx;
  text-align: center;
  margin-bottom: 40rpx;
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  transition: all 0.3s ease;
}

.achievement-item:active {
  transform: scale(0.95);
}

.achievement-badge {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.achievement-badge-1 {
  background: #A8E6CF;
}

.achievement-badge-2 {
  background: #FFD3B6;
}

.achievement-badge-3 {
  background: #FFFACD;
}

.achievement-badge-locked {
  background: #D1D5DB;
  opacity: 0.5;
}

.achievement-emoji {
  font-size: 60rpx;
}

.achievement-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
}

.achievement-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #5D5D5D;
}

.achievement-label-locked {
  color: #9CA3AF;
}

/* AI Entry Section */
.ai-entry-section {
  padding: 0 32rpx 40rpx;
  
}

.ai-entry-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: linear-gradient(135deg, #FFC3A0, #A8E6CF);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ai-entry-card:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.entry-icon {
  width: 64rpx;
  height: 64rpx;

}

.entry-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.entry-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  display: block;
}

.entry-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

.entry-arrow {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

/* 成就详情弹窗样式 */
.achievement-detail-popup {
  width: 650rpx;
  background: #f6f8f7;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
}

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

.popup-content {
  padding: 40rpx;
 
}

.detail-gif-container {
  text-align: center;
  margin-bottom: 30rpx;
}

.detail-gif {
  width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
}

.detail-emoji {
  font-size: 120rpx;
}

.detail-info {
  text-align: center;
  margin-bottom: 40rpx;
}

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
}

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
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #A8E6CF 0%, #8af5bf 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-fill.completed {
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
}

.progress-value {
  font-size: 26rpx;
  color: #739a4c;
  font-weight: bold;
}

.detail-reward, .detail-unlock-time {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15rpx;
}

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

.popup-actions {
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

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
}

.btn-icon {
  font-size: 28rpx;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.3);
}

.action-btn.primary:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 10rpx rgba(76, 175, 80, 0.4);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
  color: #0d1b14;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.action-btn.secondary:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
}

.action-btn.disabled {
  background: linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%);
  color: #9E9E9E;
  box-shadow: none;
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn::after {
  border: none;
}

</style>