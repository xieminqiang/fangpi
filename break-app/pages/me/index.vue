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
              <text class="points-label">智能肠道健康分析需要</text>
              <view class="points-value-wrapper">
                <text class="points-value">15</text>
                <text class="points-unit">屁币</text>
              </view>
            </view>
            
            <view class="points-info-row current">
              <text class="points-label">当前屁币</text>
              <view class="points-value-wrapper">
                <text class="points-value current">{{ currentPoints }}</text>
                <text class="points-unit">屁币</text>
              </view>
            </view>
            
            <view class="points-diff">
              <text class="diff-text">还差 <text class="diff-value">{{ 15 - currentPoints }}</text> 屁币</text>
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

    <!-- 我的屁币入口 -->
    <view class="ai-entry-section">
      <view class="ai-entry-card" @click="goToPoints">
        <image class="entry-icon" src="/static/img/jifen.png" mode="aspectFit" />
        <view class="entry-content">
          <text class="entry-title">我的屁币</text>
          <text class="entry-desc">当前屁币：{{ points || 0 }}</text>
        </view>
        <view class="entry-action-container">
          <text class="entry-action-text">去获取屁币</text>
          <image class="entry-arrow" src="/static/img/arrow-right.png" mode="aspectFit" />
        </view>
   
      </view>
    </view>

    <!-- Donation Entry -->
    <!-- <view class="ai-entry-section">
      <view class="ai-entry-card donation-card" @click="goToDonation">
        <image class="entry-icon" src="/static/img/juanzeng.png" mode="aspectFit" />
        <view class="entry-content">
          <text class="entry-title">给我的屁加油！</text>
          <text class="entry-desc">支持我继续创作，让小程序更有趣</text>
        </view>
        <image class="entry-arrow" src="/static/img/arrow-right.png" mode="aspectFit" />
      </view>
    </view> -->
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { getUserInfoAPI, updateUserPointsAPI } from '@/src/api/user.js'
import { getUserAchievementsAPI } from '@/src/api/achievement.js'
import { getShowFartEncyclopediaEntryAPI } from '@/src/api/app_config.js'
import { getAllLevelConfigsAPI } from '@/src/api/level.js'
import { useUserStore } from '@/src/stores/user.js'

// 使用 user store
const userStore = useUserStore()

// 用户信息（从store获取，支持响应式）
const userInfo = computed(() => userStore.userInfo)
const points = computed(() => userStore.points)
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

// 屁币不足弹窗相关
const pointsInsufficientPopup = ref(null)
const currentPoints = ref(0)

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

// 激励视频广告实例
let videoAd = null  // 用于智能分析页面的广告
let videoAdForPoints = null  // 用于赚取屁币的广告

// 页面加载时获取用户信息
onMounted(() => {
  // 初始化激励视频广告
  initRewardedVideoAd()
  // 初始化赚取屁币的激励视频广告
  initRewardedVideoAdForPoints()
  
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
  // try {
  //   const { data } = await getShowFartEncyclopediaEntryAPI()
  //   if (data.code === 0) {
  //     showFartEncyclopediaEntry.value = data.data === true || data.data === 'true'
  //   }
  // } catch (error) {
  //   console.error('获取应用配置失败:', error)
  //   // 默认显示
  //   showFartEncyclopediaEntry.value = true
  // }
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

// 页面卸载时移除事件监听和销毁广告实例
onUnmounted(() => {
  uni.$off('loginSuccess', onLoginSuccess)
  uni.$off('userInfoUpdated')
  
  // #ifdef MP-WEIXIN
  if (videoAd) {
    videoAd.destroy()
    videoAd = null
  }
  if (videoAdForPoints) {
    videoAdForPoints.destroy()
    videoAdForPoints = null
  }
  // #endif
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
    url: '/pages/profile/level'
  })
}

// 跳转到编辑页面
const goToEdit = () => {
  uni.navigateTo({
    url: '/pages/me/edit'
  })
}

// 通用的激励视频广告初始化函数
const initRewardedVideoAdCommon = (adUnitId, config) => {
  // #ifdef MP-WEIXIN
  if (wx.createRewardedVideoAd) {
    const ad = wx.createRewardedVideoAd({
      adUnitId: adUnitId
    })

    ad.onLoad(() => {
      console.log(config.loadMessage || '激励视频广告加载成功')
    })

    ad.onError((err) => {
      console.error(config.errorMessage || '激励视频广告加载失败', err)
      if (config.onError && typeof config.onError === 'function') {
        config.onError(err)
      }
    })

    // 监听广告关闭事件
    ad.onClose(async (res) => {
      if (res && res.isEnded) {
        // 用户看完了激励视频广告
        console.log(config.successMessage || '用户看完了激励视频广告')
        if (config.onSuccess && typeof config.onSuccess === 'function') {
          await config.onSuccess()
        }
      } else {
        // 用户提前关闭了广告
        console.log(config.cancelMessage || '用户提前关闭了激励视频广告')
        uni.showToast({
          title: config.cancelToast || '需要看完广告才能继续',
          icon: 'none',
          duration: 2000
        })
      }
    })
    
    return ad
  }
  // #endif
  return null
}

// 初始化激励视频广告（用于智能分析页面）
const initRewardedVideoAd = () => {
  videoAd = initRewardedVideoAdCommon('adunit-2ec9fad091c1156c', {
    loadMessage: '激励视频广告加载成功',
    errorMessage: '激励视频广告加载失败',
    successMessage: '用户看完了激励视频广告，允许进入智能分析页面',
    cancelMessage: '用户提前关闭了激励视频广告',
    cancelToast: '需要看完广告才能进入',
    onSuccess: async () => {
      // 跳转到智能分析页面（屁币扣除在aiFx页面调用接口成功后执行）
      uni.navigateTo({
        url: '/pages/me/aiFx'
      })
    }
  })
}

// 初始化赚取屁币的激励视频广告
const initRewardedVideoAdForPoints = () => {
  videoAdForPoints = initRewardedVideoAdCommon('adunit-2ec9fad091c1156c', {
    loadMessage: '赚取屁币激励视频广告加载成功',
    errorMessage: '赚取屁币激励视频广告加载失败',
    successMessage: '用户看完了赚取屁币激励视频广告',
    cancelMessage: '用户提前关闭了赚取屁币激励视频广告',
    cancelToast: '需要看完视频才能获得屁币哦~',
    onError: (err) => {
      if (err.errCode === 1004) {
        uni.showToast({
          title: '暂时没有可用的视频，请稍后再试',
          icon: 'none'
        })
      }
    },
    onSuccess: async () => {
      // 更新屁币
      await updatePointsForPopup(30, '观看激励视频广告奖励')
      // 关闭弹窗
      closePointsInsufficientPopup()
    }
  })
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

// 跳转到智能分析页面（需要屁币>=15）
const goToAiFx = () => {
  // 检查屁币是否大于等于15
  const points = userStore.points || 0
  currentPoints.value = points
  
  if (points >= 15) {
    // 屁币足够，直接跳转
    console.log('屁币足够，直接跳转到智能分析页面')
    uni.navigateTo({
      url: '/pages/me/aiFx'
    })
    return
  }
  
  // 屁币不足，显示弹框
  pointsInsufficientPopup.value?.open()
}

// 关闭屁币不足弹窗
const closePointsInsufficientPopup = () => {
  pointsInsufficientPopup.value?.close()
}

// 从弹窗直接观看广告赚取屁币
const goToPointsFromPopup = () => {
  watchAdForPoints()
}

// 跳转到图鉴页面
const goToIndex = () => {
  uni.navigateTo({
    url: '/pages/entry/index'
  })
}

// 跳转到屁币页面
const goToPoints = () => {
  uni.navigateTo({
    url: '/pages/me/points'
  })
}

// 跳转到捐赠页面
const goToDonation = () => {
  uni.navigateTo({
    url: '/pages/profile/jz'
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
      imageUrl: 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/share_bg.png'
    }
  }
  
  // 默认分享内容
  return {
    title: '快来一起记录放屁，解锁成就吧！💨',
    path: '/pages/index/index',
    imageUrl: 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/share_bg.png'
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
.entry-action-container {
  display: flex;
  align-items: center;
  gap: 10rpx;
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

.donation-card {
  background: linear-gradient(135deg, #FFB6C1, #FFD700);
}

.points-card {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
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
  font-size: 28rpx;
  font-weight: medium;
  color: white;

}

.entry-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
 
}

.entry-action-text {
  font-size: 26rpx;
  color: #FF9F7A;
  font-weight: 600;
  text-shadow: 0 1rpx 3rpx rgba(255, 159, 122, 0.2);
}

.entry-arrow {
  width: 32rpx;
  height: 32rpx;
 
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

.tip-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  flex: 1;
}

.points-insufficient-popup .popup-actions {
  padding: 0 32rpx 32rpx;
  gap: 16rpx;
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

.btn-icon {
  font-size: 28rpx;
}

</style>