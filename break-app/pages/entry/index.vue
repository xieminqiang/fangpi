<template>
  <view class="audio-page">
    <scroll-view 
      class="scroll-content" 
      scroll-y="true" 
      :enhanced="true" 
      :show-scrollbar="false"
      @scrolltolower="onReachBottom"
      :lower-threshold="100"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshingPull"
      @refresherrefresh="onPullRefresh"
      refresher-background="#f7fbf7"
    >
      <!-- 加载状态 -->
      <view v-if="isLoading && feed.list.length === 0" class="loading-container">
        <view class="pulse"></view>
        <text class="loading-text">屁趣音效装填中...</text>
      </view>

      <!-- 错误状态 -->
      <view v-else-if="errorMessage" class="error-container">
        <text class="error-emoji">😅</text>
        <text class="error-text">{{ errorMessage }}</text>
        <button class="retry-btn" @click="refreshFeed">再试一次</button>
      </view>

      <!-- 空状态 -->
      <view v-else-if="feed.empty" class="empty-container">
        <view class="empty-illustration">
          <view class="empty-icon-wrapper">
            <text class="empty-icon">📚</text>
          </view>
          <view class="empty-sparkles">
            <text class="sparkle sparkle-1">✨</text>
            <text class="sparkle sparkle-2">💫</text>
            <text class="sparkle sparkle-3">⭐</text>
          </view>
        </view>
        <text class="empty-title">图鉴库正在建设中</text>
        <text class="empty-desc">管理员正在整理屁趣家族成员，稍后再来探索吧～</text>
        <view class="empty-hint">
          <text class="hint-text">期待更多精彩内容</text>
        </view>
      </view>

      <!-- 内容区域 -->
      <block v-else>
        <!-- 分组列表 -->
        <view class="grouped-catalog-list">
          <view
            class="catalog-group"
            v-for="group in groupedList"
            :key="group.className"
          >
            <!-- 分组标题 -->
            <view class="group-header">
              <view class="group-title-wrapper">
                <image class="group-icon" src="/static/img/fenlei.png" mode="aspectFit"></image>
                <text class="group-title">{{ group.className }}</text>
                <text class="group-count">({{ group.items.length }})</text>
              </view>
              <view class="group-divider"></view>
            </view>

            <!-- 分组下的卡片列表 -->
            <view class="group-items">
              <view
                class="catalog-card"
                v-for="item in group.items"
                :key="item.id"
                :style="getCardStyle(item)"
              >
                <!-- 删除按钮（只有"自己放的屁"分类才显示） -->
                <view 
                  v-if="item.class_name === '自己放的屁'" 
                  class="delete-btn"
                  @click.stop="handleDelete(item)"
                >
                  <text class="delete-icon">🗑️</text>
                </view>
                <!-- 卡片主体 -->
                <view class="card-body" @click="goToDetail(item)">
                  <!-- 左侧图片 -->
                  <view class="card-image-wrapper">
                    <image
                      v-if="item.image"
                      :src="item.image"
                      class="card-image"
                      mode="aspectFill"
                    />
                    <view v-else class="card-image placeholder">
                      <text class="placeholder-emoji">💨</text>
                    </view>
                  </view>

                  <!-- 右侧信息 -->
                  <view class="card-content">
                    <view class="content-header">
                      <text class="card-title">{{ item.name }}</text>
                      <text class="card-desc">{{ item.description || item.moodText }}</text>
                    </view>

                    <!-- 标签区域 -->
                    <view class="card-tags" v-if="item.tags && item.tags.length">
                      <view class="card-tag" v-for="tag in item.tags.slice(0, 4)" :key="tag">
                        {{ tag }}
                      </view>
                      <text v-if="item.tags.length > 4" class="more-tags">+{{ item.tags.length - 4 }}</text>
                    </view>

                    <!-- 查看详情提示 -->
                    <view class="card-footer">
                      <text class="view-detail-hint">点击查看详情 →</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 上拉刷新提示 -->
        <view v-if="isRefreshing" class="refresh-tip">
          <view class="refresh-spinner"></view>
          <text class="refresh-text">正在刷新...</text>
        </view>

        <!-- 底部间距 -->
        <view class="footer-spacer"></view>
      </block>
    </scroll-view>

    <!-- 底部固定区域 -->
    <view class="bottom-view">
      <view class="bottom-confirm-wrapper">
        <button class="bottom-confirm-button" @click="goToCreateFart">
          <text class="bottom-confirm-text">创建自己的屁</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getAudioLibraryFeedAPI, deleteAudioLibraryAPI } from '@/src/api/audio.js'

const feed = ref({
  list: [],
  empty: false,
  total: 0
})

const isLoading = ref(true)
const isRefreshing = ref(false) // 上拉刷新状态
const isRefreshingPull = ref(false) // 下拉刷新状态
const errorMessage = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true) // 是否还有更多数据

// 按分类分组数据
const groupedList = computed(() => {
  if (!feed.value.list || feed.value.list.length === 0) {
    return []
  }
  
  // 使用Map进行分组
  const groupMap = new Map()
  
  feed.value.list.forEach(item => {
    const className = item.class_name || '其他类屁'
    if (!groupMap.has(className)) {
      groupMap.set(className, [])
    }
    groupMap.get(className).push(item)
  })
  
  // 转换为数组并排序
  const groups = Array.from(groupMap.entries()).map(([className, items]) => ({
    className,
    items
  }))
  
  // 按分类名称排序（可选，也可以按数量排序）
  // groups.sort((a, b) => {
  //   // "声学类屁" 始终排第一位
  //   if (a.className === '声学类屁') return -1
  //   if (b.className === '声学类屁') return 1
    
  //   // "其他类屁" 始终排最后
  //   if (a.className === '其他类屁') return 1
  //   if (b.className === '其他类屁') return -1
    
  //   // 其他分类：优先显示有更多项目的分类
  //   if (b.items.length !== a.items.length) {
  //     return b.items.length - a.items.length
  //   }
  //   return a.className.localeCompare(b.className, 'zh-CN')
  // })
  
  return groups
})

// 获取卡片样式
const getCardStyle = (item) => {
  const color = item.accentColor || '#FFD3B6'
  return {
    background: `linear-gradient(135deg, ${color}12 0%, ${color}06 50%, #ffffff 100%)`,
    borderColor: `${color}30`
  }
}

// 跳转到详情页
const goToDetail = (item) => {
  // 将数据序列化为JSON字符串传递
  const itemData = JSON.stringify(item)
  uni.navigateTo({
    url: `/pages/entry/detail?data=${encodeURIComponent(itemData)}`
  })
}

// 跳转到创建自己的屁页面
const goToCreateFart = () => {
  uni.navigateTo({
    url: '/pages/entry/creat'
  })
}

// 删除音频
const handleDelete = async (item) => {
  // 确认删除
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${item.name}"吗？删除后无法恢复。`,
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#ff3b30',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '删除中...'
          })
          
          const { data } = await deleteAudioLibraryAPI(item.id)
          
          uni.hideLoading()
          
          if (data.code === 0) {
            uni.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1500
            })
            
            // 从列表中移除该项
            const index = feed.value.list.findIndex(i => i.id === item.id)
            if (index !== -1) {
              feed.value.list.splice(index, 1)
              feed.value.total--
              feed.value.empty = feed.value.list.length === 0
            }
            
            // 发送更新事件
            uni.$emit('audioLibraryUpdated')
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


const normalizeFeed = (data) => {
  if (!data) {
    return {
      list: [],
      empty: true,
      total: 0
    }
  }
  return {
    list: data.list || [],
    empty: data.empty || false,
    total: data.total || 0
  }
}

const loadFeed = async (isRefresh = false, isPullRefresh = false) => {
  if (isPullRefresh) {
    isRefreshingPull.value = true
  } else if (isRefresh) {
    isRefreshing.value = true
  } else {
    isLoading.value = true
  }
  errorMessage.value = ''
  
  try {
    // 如果是下拉刷新，重置页码和列表
    if (isPullRefresh) {
      currentPage.value = 1
      feed.value.list = []
      hasMore.value = true
    }
    
    const { data } = await getAudioLibraryFeedAPI({
      page: currentPage.value,
      pageSize: pageSize.value,
      type: 1  // 1表示屁的全家族大全
    })
    
    if (data.code === 0) {
      const newFeed = normalizeFeed(data.data)
      
      if (currentPage.value === 1) {
        // 第一页，替换数据
        feed.value = newFeed
      } else {
        // 加载更多，追加数据
        feed.value.list = [...feed.value.list, ...newFeed.list]
        feed.value.total = newFeed.total
        feed.value.empty = feed.value.list.length === 0
      }
      
      // 判断是否还有更多数据
      hasMore.value = feed.value.list.length < feed.value.total
      
      // 如果还有更多数据，页码加1，准备下次加载
      if (hasMore.value) {
        currentPage.value++
      }
    } else {
      errorMessage.value = data.msg || '加载失败，请稍后重试'
    }
  } catch (error) {
    errorMessage.value = '网络走神了，稍后再试'
  } finally {
    isLoading.value = false
    isRefreshing.value = false
    isRefreshingPull.value = false
  }
}

const refreshFeed = () => {
  currentPage.value = 1
  feed.value.list = []
  hasMore.value = true
  loadFeed(true, false)
}

// 下拉刷新
const onPullRefresh = () => {
  if (isRefreshingPull.value || isLoading.value || isRefreshing.value) {
    return
  }
  loadFeed(false, true)
}

// 上拉加载更多
const onReachBottom = () => {
  if (isRefreshing.value || isLoading.value || isRefreshingPull.value || !hasMore.value) {
    return
  }
  // 加载下一页
  loadFeed(true, false)
}

// 监听音频库更新事件
const onAudioLibraryUpdated = () => {
  console.log('收到音频库更新事件，刷新数据')
  // 重置分页并刷新
  currentPage.value = 1
  feed.value.list = []
  hasMore.value = true
  loadFeed()
}

onMounted(() => {
  loadFeed()
  // 监听音频库更新事件
  uni.$on('audioLibraryUpdated', onAudioLibraryUpdated)
})

onUnmounted(() => {
  // 移除事件监听
  uni.$off('audioLibraryUpdated', onAudioLibraryUpdated)
})
</script>

<style lang="scss" scoped>
.audio-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7fbf7 0%, #ffffff 100%);
  box-sizing: border-box;
}

.scroll-content {
  flex: 1;
  height: 0; /* 配合 flex: 1 使用，让 scroll-view 正确计算高度 */
  padding: 0 32rpx;
  padding-bottom: 140rpx; /* 为底部固定区域留出空间 */
  box-sizing: border-box;
}

// 加载状态
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
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

.error-emoji,
.empty-emoji {
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

.empty-illustration {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-wrapper {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, rgba(158, 135, 71, 0.1) 0%, rgba(158, 135, 71, 0.05) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed rgba(158, 135, 71, 0.2);
}

.empty-icon {
  font-size: 100rpx;
}

.empty-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 32rpx;
  animation: sparkleFloat 3s infinite;
}

.sparkle-1 {
  top: 20rpx;
  left: 20rpx;
  animation-delay: 0s;
}

.sparkle-2 {
  top: 40rpx;
  right: 30rpx;
  animation-delay: 1s;
}

.sparkle-3 {
  bottom: 30rpx;
  left: 50%;
  animation-delay: 2s;
}

@keyframes sparkleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20rpx) scale(1.2);
    opacity: 1;
  }
}

.empty-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f1f1f;
  margin-bottom: 16rpx;
}

.empty-desc {
  color: #8a8a8a;
  font-size: 28rpx;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32rpx;
  padding: 0 40rpx;
}

.empty-hint {
  padding: 16rpx 32rpx;
  background: rgba(158, 135, 71, 0.05);
  border-radius: 24rpx;
  border: 1rpx solid rgba(158, 135, 71, 0.1);
}

.hint-text {
  font-size: 24rpx;
  color: #9E8747;
}

// 分组列表容器
.grouped-catalog-list {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
  padding-bottom: 40rpx;
}

// 分组容器
.catalog-group {
  display: flex;
  flex-direction: column;
}

// 分组标题区域
.group-header {
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.group-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.group-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.group-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f1f1f;
}

.group-count {
  font-size: 24rpx;
  color: #999;
  font-weight: 500;
}

.group-divider {
  height: 2rpx;
  background: linear-gradient(90deg, rgba(158, 135, 71, 0.3) 0%, rgba(158, 135, 71, 0.1) 50%, transparent 100%);
  border-radius: 2rpx;
}

// 分组下的卡片列表
.group-items {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.catalog-card {
  border-radius: 32rpx;
  border: 2rpx solid;
  background: #ffffff;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

// 删除按钮
.delete-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 59, 48, 0.1);
  border-radius: 50%;
  z-index: 10;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.delete-btn:active {
  transform: scale(0.9);
  background: rgba(255, 59, 48, 0.2);
}

.delete-icon {
  font-size: 32rpx;
}

.catalog-card:active {
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.12);
}

// 卡片主体
.card-body {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 28rpx 28rpx;
  gap: 24rpx;
}

// 左侧图片
.card-image-wrapper {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  overflow: hidden;
}

.card-image {
  width: 200rpx;
  height: calc(200rpx * 301 / 780);

  border-radius: 24rpx;
}

.card-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f9f9f9 0%, #ececec 100%);
}

.placeholder-emoji {
  font-size: 80rpx;
  opacity: 0.4;
}

// 右侧内容
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  justify-content: space-between;
}

.content-header {
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f1f1f;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

.card-desc {
  font-size: 24rpx;
  color: #7a7a7a;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

// 标签区域
.card-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.card-tag {
  padding: 8rpx 18rpx;
  background: rgba(158, 135, 71, 0.08);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #9E8747;
  border: 1rpx solid rgba(158, 135, 71, 0.15);
}

.more-tags {
  font-size: 22rpx;
  color: #999;
  padding-left: 8rpx;
}

// 卡片底部
.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
}

.view-detail-hint {
  font-size: 24rpx;
  color: #9E8747;
  font-weight: 500;
}

// 上拉刷新提示
.refresh-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  gap: 16rpx;
}

.refresh-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #e8f8e8;
  border-top-color: #1f1f1f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.refresh-text {
  font-size: 24rpx;
  color: #8a8a8a;
}

// 底部间距
.footer-spacer {
  height: 80rpx;
}

// 按钮样式重置
button {
  border: none;
  background: transparent;
}

button::after {
  border: none;
}

/* 底部固定区域 */
.bottom-view {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 40rpx;
  padding-bottom: 40rpx;
  background: rgba(255, 255, 255, 1);
  border-radius: 40rpx 40rpx 0px 0px;
  border-top: 1rpx solid rgba(215, 219, 217, 0.5);
  z-index: 100;
  box-sizing: border-box;
  width: 100%;
}

.bottom-confirm-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-confirm-button {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.3);
  border: none;
  line-height: 80rpx;
  font-size: 0;
  transition: all 0.3s ease;
}

.bottom-confirm-button::after {
  border: none;
}

.bottom-confirm-button:active:not(:disabled) {
  transform: scale(0.98);
}

.bottom-confirm-button:disabled {
  opacity: 0.6;
}

.bottom-confirm-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}
</style>

