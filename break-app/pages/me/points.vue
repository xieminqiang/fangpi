<template>
  <scroll-view class="points-container" scroll-y="true">
    <!-- Header -->
    <view class="header-section">
 
      <text class="header-subtitle">屁币在手，功能我有 ✨</text>
    </view>

    <!-- Current Points Display -->
    <view class="points-display-section">
      <view class="points-card">
        <view class="points-icon-wrapper">
          <image class="points-icon" src="/static/img/jifen.png" mode="aspectFit" />
        </view>
        <text class="points-label">当前屁币</text>
        <text class="points-value">{{ currentPoints }}</text>
        <text class="points-unit">屁币</text>
      </view>
    </view>

    <!-- Points Detail Entry -->
    <view class="detail-entry-section">
      <view class="detail-entry-card" @click="goToPointsDetail">
        <view class="detail-entry-left">
          <text class="detail-entry-icon">📊</text>
          <text class="detail-entry-text">查看屁币明细</text>
        </view>
        <image class="detail-entry-arrow" src="/static/img/arrow-right.png" mode="aspectFit" />
      </view>
    </view>
 <!-- Earn Points Section -->
 <view class="earn-points-section" v-if="isAdAvailable">
      <view class="section-header">
        <text class="section-title">赚取屁币</text>
        <text class="section-subtitle">简单几步，屁币到手</text>
      </view>
      
      <!-- 赚取屁币 -->
      <view class="earn-points-card earn-card-primary">
        <view class="earn-card-left">
          <view class="earn-icon-wrapper premium">
            <text class="earn-icon">⭐</text>
          </view>
          <view class="earn-info">
            <text class="earn-title">观看视频赚屁币</text>
            <text class="earn-desc">轻松获得30屁币</text>
          </view>
        </view>
        <button class="earn-points-btn btn-premium" @click="watchAd30s">
          <text class="btn-text">去赚取</text>
        </button>
      </view>
    </view>
    <!-- Points Benefits Section -->
    <view class="benefits-section">
      <view class="section-header">
        <text class="section-title">屁币权益</text>
        <text class="section-subtitle">屁币可以这样用哦~</text>
      </view>
      
      <view class="benefits-list">
        <view class="benefit-item">
          <view class="benefit-icon-wrapper benefit-icon-1">
            <text class="benefit-icon">🧠</text>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">智能肠道健康分析</text>
            <text class="benefit-desc">用屁币解锁专属健康报告，了解你的肠道健康状况</text>
          </view>
        </view>

        <view class="benefit-item">
          <view class="benefit-icon-wrapper benefit-icon-2">
            <text class="benefit-icon">🎨</text>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">创建专属屁屁</text>
            <text class="benefit-desc">用屁币打造属于你的独特屁屁，展现个性创意</text>
          </view>
        </view>

        <view class="benefit-item">
          <view class="benefit-icon-wrapper benefit-icon-3">
            <text class="benefit-icon">👥</text>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">邀请好友一起玩</text>
            <text class="benefit-desc">用屁币邀请更多屁友加入，一起解锁更多乐趣</text>
          </view>
        </view>
      </view>
    </view>

   

    <!-- Tips -->
    <view class="tips-section">
      <text class="tips-text">💡 小贴士：看完完整视频即可获得屁币奖励哦</text>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onShow} from '@dcloudio/uni-app'
import { getUserInfoAPI, updateUserPointsAPI } from '@/src/api/user.js'
import { useUserStore } from '@/src/stores/user.js'

// 使用 user store
const userStore = useUserStore()

// 当前屁币
const currentPoints = computed(() => userStore.points)

// 激励视频广告实例
let videoAd30s = null  // 30秒广告

// 广告是否可用
const isAdAvailable = ref(true)

// 页面加载时初始化广告
onMounted(() => {
  initRewardedVideoAds()
  loadUserInfo()
})

// 页面显示时刷新数据
onShow(() => {
  loadUserInfo()
})

// 页面卸载时销毁广告实例
onUnmounted(() => {
  // #ifdef MP-WEIXIN
  if (videoAd30s) {
    videoAd30s.destroy()
    videoAd30s = null
  }
  // #endif
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const { data } = await getUserInfoAPI()
    if (data.code === 0) {
      userStore.setUserInfo(data.data)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 初始化激励视频广告
const initRewardedVideoAds = () => {
  // #ifdef MP-WEIXIN
  if (wx.createRewardedVideoAd) {
    // 初始化30秒广告
    videoAd30s = wx.createRewardedVideoAd({
      adUnitId: 'adunit-2ec9fad091c1156c'
    })

    videoAd30s.onLoad(() => {
      console.log('30秒激励视频广告加载成功')
      isAdAvailable.value = true
    })

    videoAd30s.onError((err) => {
      console.error('30秒激励视频广告错误', err)
      
      // 处理不同的错误情况
      // errCode: 1004 表示调用正常，但没有合适的广告返回给用户
      // 其他错误码表示错误的调用导致的异常返回
      if (err.errCode === 1004) {
        // 没有合适的广告返回，隐藏赚取屁币入口
        console.log('当前没有可用的广告')
        isAdAvailable.value = false
      } else {
        // 其他错误，记录日志但不隐藏入口（可能是临时错误）
        console.error('广告加载异常:', err.errMsg || err)
        // 可以选择是否隐藏入口，这里暂时保留入口，让用户可以重试
        // isAdAvailable.value = false
      }
    })

    // 监听30秒广告关闭事件
    videoAd30s.onClose(async (res) => {
      if (res && res.isEnded) {
        console.log('用户看完了30秒激励视频广告')
        await updatePoints(30, '观看激励视频广告奖励')
      } else {
        console.log('用户提前关闭了30秒激励视频广告')
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

// 观看30秒广告
const watchAd30s = () => {
  // #ifdef MP-WEIXIN
  if (!videoAd30s) {
    uni.showToast({
      title: '视频未准备好，请稍后再试',
      icon: 'none'
    })
    return
  }

  // 先尝试显示广告
  videoAd30s.show()
    .catch(err => {
      console.error('广告显示失败，尝试重新加载', err)
      
      // 如果显示失败，尝试重新加载
      videoAd30s.load()
        .then(() => {
          // 加载成功后再次尝试显示
          return videoAd30s.show()
        })
        .catch(loadErr => {
          console.error('广告加载或显示失败', loadErr)
          
          // 根据错误码判断
          if (loadErr.errCode === 1004) {
            // 没有合适的广告返回
            isAdAvailable.value = false
            uni.showToast({
              title: '暂时没有可用的视频，请稍后再试',
              icon: 'none',
              duration: 2000
            })
          } else {
            // 其他错误
            uni.showToast({
              title: '视频加载失败，请稍后重试',
              icon: 'none'
            })
          }
        })
    })
  // #endif

  // #ifndef MP-WEIXIN
  // 非微信小程序平台，模拟更新屁币
  updatePoints(30, '观看激励视频广告奖励')
  // #endif
}

// 更新屁币
const updatePoints = async (points, remark) => {
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

// 跳转到屁币明细页面
const goToPointsDetail = () => {
  uni.navigateTo({
    url: '/pages/me/pointsDetail'
  })
}
</script>

<style scoped>
.points-container {
  height: 100vh;
  background: linear-gradient(180deg, #A8E6CF 0%, #FFFACD 100%);
}

/* Header Section */
.header-section {
  padding: 30rpx 32rpx 24rpx;
  text-align: center;
}

.header-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #1B5E20;
  margin-bottom: 12rpx;
}

.header-subtitle {
  display: block;
  font-size: 26rpx;
  color: #5D5D5D;
}

/* Points Display Section */
.points-display-section {
  padding: 0 32rpx 32rpx;
}

.points-card {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  border-radius: 28rpx;
  padding: 50rpx 32rpx;
  text-align: center;
  box-shadow: 0 12rpx 32rpx rgba(76, 175, 80, 0.25);
  position: relative;
  overflow: hidden;
}

.points-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.points-icon-wrapper {
  margin-bottom: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.points-icon {
  width: 64rpx;
  height: 64rpx;
  display: block;
}

.points-label {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12rpx;
}

.points-value {
  display: inline-block;
  font-size: 88rpx;
  font-weight: bold;
  color: #fff;
  line-height: 1;
  margin-right: 8rpx;
}

.points-unit {
  display: inline-block;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
  vertical-align: bottom;
  margin-bottom: 8rpx;
}

/* Detail Entry Section */
.detail-entry-section {
  padding: 0 32rpx 32rpx;
}

.detail-entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.detail-entry-card:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.detail-entry-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.detail-entry-icon {
  font-size: 32rpx;
}

.detail-entry-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #1B5E20;
}

.detail-entry-arrow {
  width: 32rpx;
  height: 32rpx;
}

/* Benefits Section */
.benefits-section {
  padding: 0 32rpx 32rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #1B5E20;
  margin-bottom: 8rpx;
}

.section-subtitle {
  display: block;
  font-size: 24rpx;
  color: #9CA3AF;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.benefit-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-icon-1 {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
}

.benefit-icon-2 {
  background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
}

.benefit-icon-3 {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
}

.benefit-icon {
  font-size: 40rpx;
}

.benefit-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.benefit-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1B5E20;
}

.benefit-desc {
  font-size: 24rpx;
  color: #5D5D5D;
  line-height: 1.5;
}

/* Earn Points Section */
.earn-points-section {
  padding: 0 32rpx 32rpx;
}

.earn-points-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.earn-points-card:active {
  transform: scale(0.98);
}

.earn-card-primary {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
}

.earn-card-premium {
  background: linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%);
}

.earn-card-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.earn-icon-wrapper {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.earn-icon-wrapper.premium {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.earn-icon {
  font-size: 36rpx;
}

.earn-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.earn-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1B5E20;
}

.earn-desc {
  font-size: 24rpx;
  color: #5D5D5D;
}

.earn-points-btn {
  border-radius: 50rpx;
  padding: 18rpx 48rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.earn-points-btn:active {
  transform: scale(0.95);
}

.earn-points-btn::after {
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: #fff;
}

.btn-premium {
  background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
  color: #fff;
}

.btn-text {
  color: #fff;
}

/* Tips Section */
.tips-section {
  padding: 0 32rpx 40rpx;
}

.tips-text {
  display: block;
  font-size: 24rpx;
  color: #9CA3AF;
  text-align: center;
  line-height: 1.6;
}
</style>
