<template>
  <scroll-view 
    class="points-detail-container" 
    scroll-y="true"
    refresher-enabled="true"
    :refresher-triggered="isRefreshing"
    @refresherrefresh="onRefresh"
    @scrolltolower="onScrollToLower"
    lower-threshold="100"
  >
    <!-- Header -->


    <!-- Points Summary -->
    <view class="summary-section">
      <view class="summary-card">
        <text class="summary-label">当前屁币</text>
        <text class="summary-value">{{ currentPoints }}</text>
      </view>
    </view>

    <!-- Points Record List -->
    <view class="record-section">
      <text class="section-title">屁币记录</text>
      
      <!-- Loading State -->
  

      <!-- Empty State -->
      <view v-if="pointsRecords.length === 0" class="empty-container">
        <text class="empty-text">暂无屁币记录</text>
      </view>

      <!-- Record List -->
      <view v-else class="record-list">
        <view 
          v-for="(record, index) in pointsRecords" 
          :key="record.id || index"
          class="record-item"
        >
          <view class="record-left">
            <text class="record-type" :class="record.pointsType === 1 ? 'type-add' : 'type-deduct'">
              {{ record.pointsType === 1 ? '获得' : '扣除' }}
            </text>
            <text class="record-remark">{{ record.remark || '屁币变动' }}</text>
            <text class="record-time">{{ formatTime(record.createdAt || record.CreatedAt) }}</text>
          </view>
          <view class="record-right">
            <text class="record-points" :class="record.pointsType === 1 ? 'points-add' : 'points-deduct'">
              {{ record.pointsType === 1 ? '+' : '-' }}{{ record.points }}
            </text>
          </view>
        </view>
      </view>

      <!-- Loading More State -->
      <view v-if="isLoadingMore && pointsRecords.length > 0" class="loading-more-container">
        <text class="loading-more-text">加载中...</text>
      </view>

      <!-- No More Data -->
      <view v-if="!hasMore && pointsRecords.length > 0" class="no-more-container">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfoAPI, getPointsRecordsAPI } from '@/src/api/user.js'
import { useUserStore } from '@/src/stores/user.js'

// 使用 user store
const userStore = useUserStore()

// 当前屁币
const currentPoints = computed(() => userStore.points)

// 屁币记录列表
const pointsRecords = ref([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isRefreshing = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 页面加载时获取数据
onMounted(() => {
  loadUserInfo()
  loadPointsRecords()
})

// 页面显示时刷新数据
onShow(() => {
 
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

// 加载屁币记录
const loadPointsRecords = async (isLoadMore = false) => {
  // 防止重复请求
  if (isLoadMore) {
    if (isLoadingMore.value || !hasMore.value) return
    isLoadingMore.value = true
  } else {
    if (isLoading.value) return
    isLoading.value = true
  }
  
  try {
    const page = isLoadMore ? currentPage.value + 1 : 1
    const { data } = await getPointsRecordsAPI({
      page: page,
      pageSize: pageSize.value
    })
    
    if (data.code === 0) {
      const records = data.data.list || []
      total.value = data.data.total || 0
      
      if (isLoadMore) {
        // 加载更多，追加数据
        pointsRecords.value = [...pointsRecords.value, ...records]
        currentPage.value = page
      } else {
        // 首次加载或刷新
        pointsRecords.value = records
        currentPage.value = 1
      }
      
      // 判断是否还有更多数据：当前已加载的数据量小于总数
      const loadedCount = pointsRecords.value.length
      hasMore.value = loadedCount < total.value
    } else {
      uni.showToast({
        title: data.msg || '获取屁币记录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取屁币记录失败:', error)
    uni.showToast({
      title: '获取屁币记录失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  
  try {
    // 重置分页
    currentPage.value = 1
    hasMore.value = true
    
    // 重新加载数据
    await loadPointsRecords(false)
    
    // 同时刷新用户信息
    await loadUserInfo()
  } catch (error) {
    console.error('刷新失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

// 上拉加载更多
const onScrollToLower = () => {
  if (!hasMore.value || isLoadingMore.value || isLoading.value) return
  loadPointsRecords(true)
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  
  try {
    // 处理 ISO 8601 格式的时间字符串，如 "2025-12-21T15:55:02.839+08:00"
    const date = new Date(timeStr)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('无效的时间格式:', timeStr)
      return ''
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    const today = new Date()
    const isToday = year === today.getFullYear() && 
                    month === String(today.getMonth() + 1).padStart(2, '0') && 
                    day === String(today.getDate()).padStart(2, '0')
    
    if (isToday) {
      return `今天 ${hours}:${minutes}`
    } else {
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  } catch (error) {
    console.error('时间格式化错误:', error, timeStr)
    return ''
  }
}
</script>

<style scoped>
.points-detail-container {
  height: 100vh;
  background: linear-gradient(180deg, #A8E6CF 0%, #FFFACD 100%);
}

/* Header Section */
.header-section {
  padding: 30rpx 32rpx 32rpx;
  text-align: center;
}

.header-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #1B5E20;
  margin-bottom: 16rpx;
}

.header-subtitle {
  display: block;
  font-size: 28rpx;
  color: #5D5D5D;
}

/* Summary Section */
.summary-section {
  padding: 30rpx 32rpx 32rpx;
}

.summary-card {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
}

.summary-label {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12rpx;
}

.summary-value {
  display: block;
  font-size: 60rpx;
  font-weight: bold;
  color: #fff;
}

/* Record Section */
.record-section {
  padding: 0 32rpx 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1B5E20;
  margin-bottom: 24rpx;
}

/* Loading State */
.loading-container {
  padding: 60rpx 0;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: #5D5D5D;
}

/* Empty State */
.empty-container {
  padding: 120rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #9CA3AF;
}

/* Record List */
.record-list {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.record-item:last-child {
  border-bottom: none;
}

.record-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-type {
  font-size: 24rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  align-self: flex-start;
}

.type-add {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.type-deduct {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.record-remark {
  font-size: 28rpx;
  color: #1B5E20;
  font-weight: 500;
}

.record-time {
  font-size: 24rpx;
  color: #9CA3AF;
}

.record-right {
  margin-left: 24rpx;
}

.record-points {
  font-size: 32rpx;
  font-weight: bold;
}

.points-add {
  color: #4CAF50;
}

.points-deduct {
  color: #F44336;
}

/* Load More */
.loading-more-container {
  padding: 32rpx 0;
  text-align: center;
}

.loading-more-text {
  font-size: 28rpx;
  color: #9CA3AF;
}

.no-more-container {
  padding: 32rpx 0;
  text-align: center;
}

.no-more-text {
  font-size: 24rpx;
  color: #9CA3AF;
}
</style>

