<template>
  <scroll-view class="ai-fx-container" scroll-y="true">
    <!-- Header -->
    <view class="header-section">
      <image class="header-decoration-img decoration-1" src="/static/emj/wusheng.png" mode="aspectFit"></image>
      <text class="header-title">智能肠道健康分析</text>
      <text class="header-subtitle">基于你的记录数据生成</text>
    </view>

    <!-- Loading State -->
    <view v-if="isLoading" class="loading-section">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在生成你的专属健康报告...</text>
    </view>

    <!-- Content -->
    <view v-else class="content-section">
      <!-- 智能健康评估 -->
      <view class="analysis-card health-card">
        <view class="card-header">
          <image class="card-icon" src="/static/img/jiankang.png" mode="aspectFit" />
          <text class="card-title">健康评估</text>
        </view>
        <view class="card-content">
          <!-- 健康评分 -->
          <view class="metric-item">
            <view class="metric-header">
              <text class="metric-label">肠道健康评分</text>
              <text class="metric-value">{{ healthScore || 0 }}分</text>
            </view>
            <view class="progress-bar">
              <view 
                class="progress-fill health-fill" 
                :style="{ width: (healthScore || 0) + '%' }"
                :class="getHealthClass(healthScore || 0)"
              ></view>
            </view>
          </view>

          <!-- 通畅指数 -->
          <view class="metric-item">
            <view class="metric-header">
              <text class="metric-label">肠道通畅指数</text>
              <text class="metric-value">{{ patencyIndex || 0 }}分</text>
            </view>
            <view class="progress-bar">
              <view 
                class="progress-fill patency-fill" 
                :style="{ width: (patencyIndex || 0) + '%' }"
              ></view>
            </view>
          </view>

          <!-- 气流活跃度 -->
          <view class="metric-item">
            <view class="metric-header">
              <text class="metric-label">气流活跃度</text>
              <text class="metric-value">{{ airflowActivity || 0 }}分</text>
            </view>
            <view class="progress-bar">
              <view 
                class="progress-fill airflow-fill" 
                :style="{ width: (airflowActivity || 0) + '%' }"
              ></view>
            </view>
          </view>

          <!-- 智能评估报告 -->
          <view class="ai-review-section">
            <text class="review-title">智能评估报告</text>
            <text class="review-text">{{ reviewText || '正在生成评估报告...' }}</text>
          </view>

          <!-- 健康建议 -->
          <view class="advice-section">
            <text class="advice-title">健康建议</text>
            <view class="advice-list">
              <view 
                v-for="(advice, index) in healthAdvice" 
                :key="index"
                class="advice-item"
              >
                <text class="advice-icon">✓</text>
                <text class="advice-text">{{ advice }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAiPersonalityReviewAPI } from '@/src/api/ai.js'
import { updateUserPointsAPI, getUserInfoAPI } from '@/src/api/user.js'
import { useUserStore } from '@/src/stores/user.js'

const userStore = useUserStore()

// 数据状态
const isLoading = ref(true)
const healthScore = ref(0)
const patencyIndex = ref(0)
const airflowActivity = ref(0)
const reviewText = ref('')
const healthAdvice = ref([])

// 应用数据到页面
const applyDataToPage = (data) => {
  healthScore.value = data.healthScore || 0
  patencyIndex.value = data.patencyIndex || 0
  airflowActivity.value = data.airflowActivity || 0
  reviewText.value = data.reviewText || ''
  
  // 合并健康建议
  const advice = []
  if (data.dietAdvice) advice.push(data.dietAdvice)
  if (data.lifestyleTip) advice.push(data.lifestyleTip)
  if (data.intestinalHealth?.potentialIssues?.length > 0) {
    advice.push(...data.intestinalHealth.potentialIssues.slice(0, 2))
  }
  healthAdvice.value = advice.length > 0 ? advice : ['继续保持良好的生活习惯']
}

// 加载智能分析数据
const loadAiAnalysis = async () => {
  isLoading.value = true
  try {
    const response = await getAiPersonalityReviewAPI()
    if (response.data.code === 0) {
      const data = response.data.data
      
      // 应用数据到页面
      applyDataToPage(data)
      
      console.log('智能分析数据已加载:', data)
      
      // 接口调用成功，扣除15屁币
      await deductPoints()
    }
  } catch (error) {
    console.error('获取智能分析失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 扣除屁币
const deductPoints = async () => {
  try {
    const currentPoints = userStore.points || 0
    // 检查屁币是否足够
    if (currentPoints < 15) {
      console.log('屁币不足15，跳过扣除')
      return
    }
    
    const { data } = await updateUserPointsAPI({
      points: 15,
      pointsType: 2, // 2代表扣除屁币
      remark: '使用智能肠道健康分析'
    })
    
    if (data.code === 0) {
      console.log('屁币扣除成功，当前屁币:', data.data.points)
      // 更新store中的用户信息
      userStore.setUserInfo(data.data)
      
      // 显示扣除提示
      uni.showToast({
        title: `已扣除15屁币，当前屁币：${data.data.points}`,
        icon: 'none',
        duration: 2000
      })
    } else {
      console.error('屁币扣除失败:', data.msg)
    }
  } catch (error) {
    console.error('扣除屁币失败:', error)
    // 扣除失败不影响页面显示，只记录日志
  }
}

// 获取健康评分样式类
const getHealthClass = (score) => {
  if (score >= 85) return 'health-excellent'
  if (score >= 70) return 'health-good'
  if (score >= 60) return 'health-normal'
  return 'health-poor'
}

onMounted(() => {
  if (userStore.token) {
    loadAiAnalysis()
  } else {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

// 刷新数据
const refreshData = () => {
  loadAiAnalysis()
}
</script>

<style scoped>
.ai-fx-container {
  height: 100vh;
  background: linear-gradient(180deg, #E8F5E9 0%, #FFF9C4 50%, #E1F5FE 100%);
  position: relative;
  box-sizing: border-box;
}

/* Header Section */
.header-section {
  padding: 0rpx 32rpx 40rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  color: rgba(255, 255, 255, 0.3);
  opacity: 0.5;
}

.header-decoration-img {
  position: absolute;
  opacity: 0.3;
}

.decoration-1 {
  top: -20rpx;
  left: -40rpx;
  width: 180rpx;
  height: 180rpx;
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #1B5E20;
  margin-bottom: 16rpx;
}

.header-subtitle {
  display: block;
  font-size: 28rpx;
  color: #2E7D32;
  margin-bottom: 20rpx;
}

.header-desc {
  display: block;
  font-size: 24rpx;
  color: #558B2F;
  line-height: 1.6;
}

/* Loading Section */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 8rpx solid rgba(27, 94, 32, 0.2);
  border-top-color: #1B5E20;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 32rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #558B2F;
}

/* Content Section */
.content-section {
  padding: 0 32rpx 40rpx;
}

/* Analysis Card */
.analysis-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.health-card {
  background: linear-gradient(135deg, rgba(168, 230, 207, 0.3), rgba(255, 255, 255, 0.95));
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.card-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}



.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1B5E20;
}


/* Metric Item */
.metric-item {
  margin-bottom: 32rpx;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.metric-label {
  font-size: 28rpx;
  color: #2E7D32;
  font-weight: 600;
}

.metric-value {
  font-size: 28rpx;
  color: #1B5E20;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 20rpx;
  background: rgba(168, 230, 207, 0.3);
  border-radius: 10rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 10rpx;
  transition: width 0.5s ease;
}

.health-fill {
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
}

.health-excellent {
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
}

.health-good {
  background: linear-gradient(90deg, #8BC34A, #CDDC39);
}

.health-normal {
  background: linear-gradient(90deg, #FFC107, #FF9800);
}

.health-poor {
  background: linear-gradient(90deg, #FF5722, #F44336);
}

.patency-fill {
  background: linear-gradient(90deg, #A8E6CF, #8AF5BF);
}

.airflow-fill {
  background: linear-gradient(90deg, #2196F3, #64B5F6);
}

/* 智能评估报告区域 */
.ai-review-section {
  margin-top: 32rpx;
  padding: 24rpx;
  background: rgba(168, 230, 207, 0.2);
  border-radius: 16rpx;
}

.review-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #1B5E20;
  margin-bottom: 16rpx;
}

.review-text {
  display: block;
  font-size: 26rpx;
  color: #2E7D32;
  line-height: 1.8;
}

.advice-section {
   margin-top: 20rpx;
  margin-bottom: 24rpx;
}

.advice-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #1B5E20;
  margin-bottom: 16rpx;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.advice-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.advice-icon {
  color: #4CAF50;
  font-weight: bold;
  margin-top: 4rpx;
}

.advice-text {
  flex: 1;
  font-size: 24rpx;
  color: #2E7D32;
  line-height: 1.6;
}
</style>

