<template>
  <view class="fart-app">
    <!-- 顶部标题栏 -->
   <!-- <view class="header">
      <view class="header-content">
        
        <text class="subtitle">记录你的每一次释放</text>
      </view>
    </view> -->

    <!-- 统计卡片 -->
    <view class="stats-card">
      <!-- 设置音频按钮 -->
    
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-label">今日总数</text>
          <text class="stat-value">{{ todayCount }} </text>
        </view>
        <view class="stat-item">
          <text class="stat-label">今日心情</text>
          <image v-if="mostHappyMood" class="stat-mood-icon" :src="mostHappyMood" mode="aspectFit"></image>
        </view>
        <view class="stat-item">
          <text class="stat-label">最近一次</text>
          <text class="stat-value-small">{{ lastFartTime }}</text>
        </view>
      </view>
    </view>
    <!-- <view class="audio-setting-btn" @click="openAudioSettingPopup">
        <image class="audio-setting-icon" src="/static/img/icon-test.png" mode="aspectFit"></image>
      </view> -->
    <!-- 放屁GIF图 -->
    <view class="fart-gif-container">
      <image 
       
        class="fart-gif" 

        :src="gifUrl"
        mode="aspectFit"
        @load="onGifLoaded"
      />
    </view>

    <!-- 主按钮 -->
    <view class="main-button-container">
      <button class="main-button" @click="openPopup">
        <image class="button-icon" src="/static/emj/wusheng.png" mode="aspectFit"></image>
        <text class="button-text">记一下</text>
      </button>
    </view>

    <!-- 功能按钮组 -->
    <view class="function-buttons-container">
      <button class="function-button" @click="goToPoints">
        <image class="function-button-icon" src="/static/home/jpb_icon.png" mode="aspectFit"></image>
        <text class="function-button-text">捡屁币</text>
      </button>
      <button class="function-button" @click="openMakeupPopup">
        <image class="function-button-icon" src="/static/home/bj_icon.png" mode="aspectFit"></image>
        <text class="function-button-text">补一记</text>
      </button>
      <button class="function-button" @click="goToFartPage">
        <image class="function-button-icon" src="/static/home/py_icon.png" mode="aspectFit"></image>
        <text class="function-button-text">找屁友</text>
      </button>
      <button class="function-button" @click="openAudioSettingPopup">
        <image class="function-button-icon" src="/static/home/hgp_icon.png" mode="aspectFit"></image>
        <text class="function-button-text">换个屁</text>
      </button>
    </view>

    <!-- 弹窗 -->
    <uni-popup ref="popup" type="bottom" :safe-area="false">
      <view class="popup-content">
        <!-- 弹窗标题 -->
        <view class="popup-header">
          <text class="popup-title">记录这次释放</text>

        </view>

        <!-- 屁屁类型 -->
        <view class="section">
          <text class="section-title">屁屁类型</text>
          <view class="switch-container">
            <view class="switch-wrapper">
              <button 
                v-for="(type, index) in fartTypes" 
                :key="index"
                :class="['switch-option', { 'selected': selectedFartType === type.value }]"
                @click="selectFartType(type.value)"
              >
                <view class="switch-text">
                  <image class="switch-emoji-img" :src="type.icon" mode="aspectFit"></image>
                  <text>{{ type.label }}</text>
                </view>
              </button>
            </view>
          </view>
        </view>

        <!-- 气味等级 -->
        <view class="section">
          <text class="section-title">气味等级</text>
          <view class="switch-container">
            <view class="switch-wrapper">
              <button 
                v-for="(level, index) in smellLevels" 
                :key="index"
                :class="['switch-option', { 'selected': selectedSmellLevel === level.value }]"
                @click="selectSmellLevel(level.value)"
              >
                <view class="switch-text">
                  <image class="switch-emoji-img" :src="level.icon" mode="aspectFit"></image>
                  <text>{{ level.label }}</text>
                </view>
              </button>
            </view>
          </view>
        </view>

        <!-- 当前心情 -->
        <view class="section">
          <text class="section-title">当前心情</text>
          <view class="switch-container">
            <view class="switch-wrapper">
              <button 
                v-for="(mood, index) in moods" 
                :key="index"
                :class="['switch-option', { 'selected': selectedMood === mood.value }]"
                @click="selectMood(mood.value)"
              >
                <view class="switch-text">
                  <image class="switch-emoji-img" :src="mood.icon" mode="aspectFit"></image>
                  <text>{{ mood.label }}</text>
                </view>
              </button>
            </view>
          </view>
        </view>

        <!-- 输入框 -->
        <view class="input-section">
          <image class="input-emoji-img" src="/static/emj/wusheng.png" mode="aspectFit"></image>
          <input 
            class="text-input" 
            placeholder="记点什么吧" 
            v-model="inputText"
          />
        </view>

        <!-- 确认按钮 -->
        <button class="confirm-button" :disabled="isSubmitting" @click="confirmFart">
          <text class="confirm-text">{{ isSubmitting ? '记录中...' : '记一下' }}</text>
        </button>
      </view>
    </uni-popup>

    <!-- 动画云朵 -->
    <view v-if="showCloud" class="fart-cloud" :class="{ 'animate': showCloud }">💨</view>

    <!-- 新成就解锁弹窗 -->
    <uni-popup ref="achievementPopup" type="center" :mask-click="false">
      <view class="achievement-detail-popup">
        <view class="popup-header">
          <text class="popup-title">🎉 恭喜解锁新成就！</text>
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
            <!-- <text class="detail-desc">{{ selectedAchievement.achievementDesc }}</text>-->
            
            <view class="detail-reward">
              <text class="reward-label">奖励经验：</text>
              <text class="reward-value">+{{ selectedAchievement.rewardExp }}</text>
            </view>
          </view>
          
          <view class="popup-actions">
            <button 
              class="action-btn primary" 
              open-type="share"
              @click="handleShare"
            >
              <text class="btn-icon">🎉</text>
              <text>分享</text>
            </button>
            <button class="action-btn secondary" @click="closeAchievementDetail">
              <text class="btn-icon">👌</text>
              <text>知道了</text>
            </button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 屁币悬浮按钮 -->
    <!-- <view class="points-button" @click="goToPoints">
      <image class="points-icon" src="/static/img/jifen.png" mode="aspectFit"></image>
      <text class="points-text">屁币</text>
    </view> -->

    <!-- 屁友悬浮按钮 -->
    <!-- <view class="friend-button" @click="goToFartPage">
      <image class="friend-icon" src="/static/img/yinle_icon.png" mode="aspectFit"></image>
      <text class="friend-text">屁友</text>
    </view> -->

    <!-- 补卡悬浮按钮 -->
    <!-- <view class="makeup-button" @click="openMakeupPopup">
      <image class="makeup-icon" src="/static/img/buka.png" mode="aspectFit"></image>
      <text class="makeup-text">补卡</text>
    </view> -->

    <!-- 补卡弹窗 -->
    <uni-popup ref="makeupPopup" type="bottom" :safe-area="false">
      <view class="popup-content makeup-popup-content">
        <!-- 可滚动内容区域 -->
        <scroll-view class="popup-scroll-content" scroll-y>
          <!-- 弹窗标题 -->
          <view class="popup-header">
            <text class="popup-title">今天补一声</text>
          </view>

          <!-- 时间选择 -->
          <view class="section section-compact">
            <text class="section-title">选择时间</text>
            <view class="time-select-container">
              <view class="time-select-item" @click="showTimePicker = true">
                <image class="time-label-img" src="/static/img/miaobiao.png" mode="aspectFit"></image>
                <text class="time-value">{{ makeupTimeDisplay || '请选择时间' }}</text>
                <text class="time-arrow">›</text>
              </view>
            </view>
          </view>

          <!-- 屁屁类型 -->
          <view class="section section-compact">
            <text class="section-title">屁屁类型</text>
            <view class="switch-container">
              <view class="switch-wrapper">
                <button 
                  v-for="(type, index) in fartTypes" 
                  :key="index"
                  :class="['switch-option', { 'selected': makeupFartType === type.value }]"
                  @click="makeupFartType = type.value"
                >
                  <view class="switch-text">
                    <image class="switch-emoji-img" :src="type.icon" mode="aspectFit"></image>
                    <text>{{ type.label }}</text>
                  </view>
                </button>
              </view>
            </view>
          </view>

          <!-- 气味等级 -->
          <view class="section section-compact">
            <text class="section-title">气味等级</text>
            <view class="switch-container">
              <view class="switch-wrapper">
                <button 
                  v-for="(level, index) in smellLevels" 
                  :key="index"
                  :class="['switch-option', { 'selected': makeupSmellLevel === level.value }]"
                  @click="makeupSmellLevel = level.value"
                >
                  <view class="switch-text">
                    <image class="switch-emoji-img" :src="level.icon" mode="aspectFit"></image>
                    <text>{{ level.label }}</text>
                  </view>
                </button>
              </view>
            </view>
          </view>

          <!-- 当前心情 -->
          <view class="section section-compact">
            <text class="section-title">当前心情</text>
            <view class="switch-container">
              <view class="switch-wrapper">
                <button 
                  v-for="(mood, index) in moods" 
                  :key="index"
                  :class="['switch-option', { 'selected': makeupMood === mood.value }]"
                  @click="makeupMood = mood.value"
                >
                  <view class="switch-text">
                    <image class="switch-emoji-img" :src="mood.icon" mode="aspectFit"></image>
                    <text>{{ mood.label }}</text>
                  </view>
                </button>
              </view>
            </view>
          </view>

          <!-- 输入框 -->
          <view class="input-section">
            <image class="input-emoji-img" src="/static/emj/wusheng.png" mode="aspectFit"></image>
            <input 
              class="text-input" 
              placeholder="记点什么吧" 
              v-model="makeupInputText"
            />
          </view>
        </scroll-view>

        <!-- 固定在底部的确认按钮 -->
        <view class="popup-footer-fixed">
          <button class="confirm-button" :disabled="isSubmittingMakeup" @click="confirmMakeup">
            <text class="confirm-text">{{ isSubmittingMakeup ? '记录中...' : '补一记' }}</text>
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 时间选择器 -->
    <u-datetime-picker
      ref="timePickerRef"
      v-model="makeupTimeDisplay"
      mode="time"
      :show="showTimePicker"
      title="选择时间"
      @confirm="onTimeConfirm"
      @change="onTimeChange"
      @cancel="showTimePicker = false"
      @close="showTimePicker = false"
    ></u-datetime-picker>

    <!-- 设置音频弹窗 -->
    <uni-popup ref="audioSettingPopup" type="bottom" :safe-area="false" class="audio-setting-popup">
      <view class="popup-content audio-setting-popup-wrapper">
        <view class="popup-header">
          <text class="popup-title">选择放屁音频</text>
        </view>
        
        <scroll-view 
          class="audio-list-container" 
          scroll-y 
          @scrolltolower="onAudioListScrollToLower"
          :lower-threshold="100"
        >
          <!-- 音频库列表 -->
          <view 
            v-for="audio in audioList" 
            :key="audio.id"
            :id="`audio-${audio.id}`"
            class="audio-setting-card" 
            :class="{ 'selected': selectedAudioUrl === audio.url }"
            :style="getCardStyle(audio)"
            @click="handleSelectAudio(audio)"
          >
            <!-- 选中指示器（右上角） -->
            <image 
              v-if="selectedAudioUrl === audio.url" 
              class="audio-item-check-small" 
              src="/static/img/choose.png"
              mode="aspectFit"
              @click.stop="handleSelectAudio(audio)"
            />
            <image 
              v-else
              class="audio-item-check-small" 
              src="/static/img/no_choose.png"
              mode="aspectFit"
              @click.stop="handleSelectAudio(audio)"
            />
            
            <!-- 左侧图片 -->
            <view class="card-image-wrapper-small">
              <image
                v-if="audio.image"
                :src="audio.image"
                class="card-image-small"
                mode="aspectFill"
              />
              <view v-else class="card-image-small placeholder">
                <text class="placeholder-emoji-small">💨</text>
              </view>
              <!-- 播放状态指示器 -->
              <view v-if="playingAudioId === audio.id" class="play-indicator-small">
                <view class="scan-line-small scan-line-1"></view>
                <view class="scan-line-small scan-line-2"></view>
                <view class="scan-line-small scan-line-3"></view>
              </view>
              <!-- 播放按钮（覆盖在图片上方） -->
              <view 
                class="play-btn-small" 
                :class="{ 'playing': playingAudioId === audio.id }"
                @click.stop="playAudio(audio)"
              >
                <image 
                  class="play-icon-small" 
                  :src="playingAudioId === audio.id ? '/static/img/24gf-pause2.png' : '/static/img/24gl-playCircle.png'"
                  mode="aspectFit"
                />
              </view>
            </view>

            <!-- 右侧信息 -->
            <view class="card-content-small">
              <view class="card-header-small">
                <view class="card-title-small">{{ audio.name }}</view>
                <view class="card-desc-small">{{ audio.description ||  '' }}</view>
              </view>

              <!-- 标签区域 -->
              <view class="card-tags-small" v-if="audio.tags && audio.tags.length">
                <view class="card-tag-small" v-for="tag in audio.tags.slice(0, 3)" :key="tag">
                  {{ tag }}
                </view>
                <text v-if="audio.tags.length > 3" class="more-tags-small">+{{ audio.tags.length - 3 }}</text>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view v-if="audioList.length === 0 && !isLoadingAudio" class="empty-audio">
            <text class="empty-text">暂无音频，使用默认音频</text>
          </view>
          
          <!-- 加载状态 -->
          <view v-if="isLoadingAudio && audioList.length === 0" class="loading-audio">
            <text class="loading-text">加载中...</text>
          </view>
          
          <!-- 加载更多提示 -->
          <view v-if="isLoadingAudio && audioList.length > 0" class="loading-more-audio">
            <text class="loading-text">加载更多...</text>
          </view>
          
          <!-- 没有更多数据提示 -->
          <view v-if="!audioHasMore && audioList.length > 0" class="no-more-audio">
            <text class="no-more-text">没有更多音频了</text>
          </view>
        </scroll-view>
        
        <view class="popup-footer popup-footer-fixed">
          <button class="create-fart-btn" @click="goToCreateFartFromPopup">
            <text class="create-fart-btn-text">创建自己的屁</text>
          </button>
        </view>
      </view>
    </uni-popup>

  </view>
</template>

<script setup>
import {
	onShareAppMessage,
	onShareTimeline
	} from '@dcloudio/uni-app';
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { createFartRecordAPI, getTodayRecordsAPI, getStatisticsSummaryAPI, makeupFartRecordAPI } from '@/src/api/fart.js'
import { getAudioLibraryFeedAPI } from '@/src/api/audio.js'
import { setUserAudioUrlAPI } from '@/src/api/user.js'
import { useUserStore } from '@/src/stores/user.js'

// uni-popup 引用
const popup = ref()
const makeupPopup = ref()
const achievementPopup = ref()
const audioSettingPopup = ref()

// 响应式数据
const selectedFartType = ref('响亮型')
const selectedSmellLevel = ref('清香')
const selectedMood = ref('放松')
const inputText = ref('')
const showCloud = ref(false)
const showGif = ref(false)
const showGifImage = ref(true) // 控制GIF图片的显示/隐藏，用于重播
const gifTimestamp = ref(Date.now())
const gifUrl = ref(`https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`)
const isGifPlaying = ref(false)
const isSubmitting = ref(false) // 提交状态，防止重复点击
const isSubmittingMakeup = ref(false) // 补卡提交状态，防止重复点击

// 音频上下文引用（全局复用）
let audioContext = null
let previewAudioContext = null // 预览音频上下文

// 音频设置相关数据
const audioList = ref([])
const isLoadingAudio = ref(false)
const selectedAudioUrl = ref('')
const playingAudioId = ref(null)
const defaultAudioUrl = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/audio/fangpi.MP3'

// 音频列表分页相关
const audioCurrentPage = ref(1)
const audioPageSize = ref(20)
const audioHasMore = ref(true)
const audioTotal = ref(0)

// 获取卡片样式（与audio页面一致）
const getCardStyle = (item) => {
  const color = item.accentColor || '#FFD3B6'
  return {
    background: `linear-gradient(135deg, ${color}15 0%, ${color}08 50%, #ffffff 100%)`,
    borderColor: `${color}40`
  }
}

// 成就相关数据
const selectedAchievement = ref(null)
const newAchievements = ref([]) // 新解锁的成就列表
const currentAchievementIndex = ref(0) // 当前显示的成就索引

// 补卡相关数据
const makeupFartType = ref('响亮型')
const makeupSmellLevel = ref('清香')
const makeupMood = ref('放松')
const makeupInputText = ref('')

// 时间选择器相关
const showTimePicker = ref(false)
const makeupTimeDisplay = ref('') // 显示格式：HH:mm（直接绑定到组件的v-model）

// 统计数据
const todayCount = ref(0)
const mostHappyMood = ref('/static/emj/kaixin.png') // 默认显示开心图标
const lastFartTime = ref('暂无记录')

// 心情emoji到图标的映射
const moodEmojiToIcon = {
  '😌': '/static/emj/fangsong.png',  // 放松
  '🤣': '/static/emj/kaixin.png',     // 开心
  '😖': '/static/emj/ganga.png'       // 尴尬
}

// 心情值到图标的映射
const moodValueToIcon = {
  'normal': '/static/emj/fangsong.png',
  'happy': '/static/emj/kaixin.png',
  'embarrassed': '/static/emj/ganga.png'
}

// 屁屁类型选项
const fartTypes = reactive([
  { value: '响亮型', icon: '/static/emj/iangliang.png', label: '响亮型' },
  { value: '轻柔型', icon: '/static/emj/qingrou.png', label: '轻柔型' },
  { value: '无声型', icon: '/static/emj/wusheng.png', label: '无声型' }
])

// 气味等级选项
const smellLevels = reactive([
  { value: '清香', icon: '/static/emj/qingxiang.png', label: '清香' },
  { value: '一般', icon: '/static/emj/yiban.png', label: '一般' },
  { value: '浓烈', icon: '/static/emj/nonglie.png', label: '浓烈' }
])

// 心情选项
const moods = reactive([
  { value: '放松', icon: '/static/emj/fangsong.png', label: '放松' },
  { value: '开心', icon: '/static/emj/kaixin.png', label: '开心' },
  { value: '尴尬', icon: '/static/emj/ganga.png', label: '尴尬' }
])

// 方法
const openPopup = () => {
  popup.value.open()
}

// GIF加载完成回调
const onGifLoaded = () => {
  console.log('GIF加载完成')
  isGifPlaying.value = true
  // 3秒后重置播放状态
  setTimeout(() => {
    isGifPlaying.value = false
  }, 3000)
}

// 重新播放GIF（小程序专用方案）
const replayGif = () => {
  console.log('开始重播GIF')
  
  // 方案：先移除DOM，再重新添加，强制重新加载GIF
  // 1. 先隐藏图片
  showGifImage.value = false
  isGifPlaying.value = false
  
  // 2. 更新GIF的URL（添加新的时间戳）
  const timestamp = Date.now()
  gifTimestamp.value = timestamp
  gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${timestamp}`
  
  // 3. 等待DOM更新后重新显示
  // 使用nextTick确保DOM已更新
  setTimeout(() => {
    showGifImage.value = true
    console.log('GIF重新显示，URL:', gifUrl.value)
  }, 100)
}

// 播放放屁声音
const playFartSound = () => {
  try {
    // 如果音频上下文已存在，先停止并销毁
    if (audioContext) {
      try {
        audioContext.stop()
        audioContext.destroy()
      } catch (e) {
        // 忽略销毁时的错误
      }
      audioContext = null
    }
    
    // 创建新的音频上下文
    audioContext = uni.createInnerAudioContext()
    
    // 从 userStore 获取 audioUrl，如果没有则使用默认值
    const userStore = useUserStore()
    const defaultAudioUrl = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/audio/fangpi.MP3'
    const audioUrl = userStore.userInfo?.audioUrl || defaultAudioUrl
    
    // #ifdef MP-WEIXIN
    // 微信小程序中，无法直接访问静态资源文件，必须使用网络 URL
    audioContext.src = audioUrl
    // #endif
    
    // #ifndef MP-WEIXIN
    // 其他平台：如果有 audioUrl 则使用，否则使用静态资源路径
    if (audioUrl && audioUrl.startsWith('http')) {
      audioContext.src = audioUrl
    } else {
      audioContext.src = '@/static/fangpi.MP3'
    }
    // #endif
    
    audioContext.volume = 0.8
    
    // #ifdef MP-WEIXIN
    // 忽略静音模式，即使在静音状态下也能播放声音
    audioContext.obeyMuteSwitch = false
    // #endif
    
    audioContext.onPlay(() => {
      console.log('开始播放放屁声音，路径:', audioContext.src)
    })
    
    audioContext.onEnded(() => {
      console.log('放屁声音播放完成')
      // 播放完成后不销毁，保留以便下次使用
    })
    
    audioContext.onError((err) => {
      console.error('播放放屁声音失败:', err)
      console.error('音频路径:', audioContext.src)
      // #ifdef MP-WEIXIN
      if (err.errMsg && (err.errMsg.includes('404') || err.errMsg.includes('not found'))) {
        console.warn('音频文件未找到，请确保已将 fangpi.MP3 上传到 OSS 服务器')
        uni.showToast({
          title: '音频文件未找到',
          icon: 'none',
          duration: 2000
        })
      }
      // #endif
      // 出错时销毁音频上下文
      if (audioContext) {
        try {
          audioContext.destroy()
        } catch (e) {
          // 忽略销毁时的错误
        }
        audioContext = null
      }
    })
    
    // 手动触发播放（不使用 autoplay，更可控）
    audioContext.play()
  } catch (error) {
    console.error('创建音频上下文失败:', error)
    audioContext = null
  }
}

// 跳转到屁币页面
const goToPoints = () => {
  uni.navigateTo({
    url: '/pages/me/points'
  })
}

// 跳转到屁友页面
const goToFartPage = () => {
  uni.navigateTo({
    url: '/pages/index/fart'
  })
}

// 跳转到创建自己的屁页面
const goToCreateFart = () => {
  uni.navigateTo({
    url: '/pages/entry/creat'
  })
}

// 补卡相关方法
const openMakeupPopup = () => {
  // 初始化当前时间
  const now = new Date()
  
  // 设置为 HH:mm 格式的字符串（u-datetime-picker 需要这种格式）
  makeupTimeDisplay.value = formatTimeDisplay(now)
  
  console.log('打开补卡弹窗，初始化时间:', makeupTimeDisplay.value)
  
  makeupPopup.value.open()
}

const closeMakeupPopup = () => {
  makeupPopup.value.close()
}

// 格式化时间显示为 HH:mm
const formatTimeDisplay = (date) => {
  // 确保 date 是有效的 Date 对象
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatTimeDisplay 接收到无效的日期:', date)
    return '00:00'
  }
  
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 时间选择器值改变回调
const onTimeChange = (e) => {
  console.log('时间选择器 change 事件:', e)
  console.log('当前 makeupTimeDisplay:', makeupTimeDisplay.value)
}

// 时间选择器确认回调
const onTimeConfirm = (e) => {
  console.log('===== 时间选择器确认 =====')
  console.log('e.value:', e.value)
  console.log('当前 makeupTimeDisplay:', makeupTimeDisplay.value)
  
  // 验证选择的时间是否超过当前时间
  const selectedTime = makeupTimeDisplay.value // 格式：HH:mm
  if (selectedTime) {
    const now = new Date()
    const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number)
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // 检查是否超过当前时间
    if (selectedHour > currentHour || 
        (selectedHour === currentHour && selectedMinute > currentMinute)) {
      uni.showToast({
        title: '不能选择未来的时间',
        icon: 'none',
        duration: 2000
      })
      // 重置为当前时间
      makeupTimeDisplay.value = formatTimeDisplay(now)
      return
    }
  }
  
  // v-model 已经自动更新了 makeupTimeDisplay
  showTimePicker.value = false
}

// 确认补卡
const confirmMakeup = async () => {
  // 防止重复点击
  if (isSubmittingMakeup.value) {
    return
  }
  
  try {
    isSubmittingMakeup.value = true
    
    // 验证时间是否已选择
    if (!makeupTimeDisplay.value) {
      uni.showToast({
        title: '请选择时间',
        icon: 'none'
      })
      return
    }
    
    // 类型映射
    const typeMap = {
      '响亮型': 'loud',
      '轻柔型': 'soft',
      '无声型': 'silent'
    }
    
    // 气味映射
    const smellMap = {
      '清香': 1,
      '一般': 2,
      '浓烈': 3
    }
    
    // 心情映射
    const moodMap = {
      '放松': 'normal',
      '开心': 'happy',
      '尴尬': 'embarrassed'
    }
    
    // 构建请求数据 - 只传时间，日期由后端补充
    const requestData = {
      fartType: typeMap[makeupFartType.value],
      smellLevel: smellMap[makeupSmellLevel.value],
      mood: moodMap[makeupMood.value],
      note: makeupInputText.value || '',
      fartTime: makeupTimeDisplay.value  // HH:mm
    }
    
    console.log('提交补卡记录:', requestData)
    
    // 调用补卡API
    const { data } = await makeupFartRecordAPI(requestData)
    
    console.log('补卡结果:', data)
    
    if (data.code === 0) {
      // 震动反馈
      uni.vibrateShort({
        type: 'heavy'
      })
      
      // 播放放屁声音
      playFartSound()
      
      // 重新播放GIF
      replayGif()
      
      closeMakeupPopup()
      
      // 通知数据页面刷新数据
      notifyDataPageRefresh()
      
      // 通知 me 页面刷新用户信息
      notifyMePageRefresh()
      
      // 刷新统计数据
      loadStatisticsData()
      
      // 显示成功提示
      uni.showToast({
        title: '记录成功 ✅',
        icon: 'none',
        duration: 1500
      })
      
      // 检查是否有新成就解锁
      if (data.data && data.data.newAchievements && data.data.newAchievements.length > 0) {
        console.log('解锁新成就:', data.data.newAchievements)
        // 显示新成就弹窗
        showNewAchievements(data.data.newAchievements)
      }
      
      // 重置补卡选择
      makeupFartType.value = '响亮型'
      makeupSmellLevel.value = '清香'
      makeupMood.value = '放松'
      makeupInputText.value = ''
      makeupTimeDisplay.value = ''
    } else {
      uni.showToast({
        title: data.msg || '补卡失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('补卡失败:', error)
    uni.showToast({
      title: '补卡失败，请重试',
      icon: 'none'
    })
  } finally {
    isSubmittingMakeup.value = false
  }
}

// 加载统计数据
const loadStatisticsData = async () => {
  try {
    // 并行获取今日记录和统计小结
    const [todayResponse, statsResponse] = await Promise.all([
      getTodayRecordsAPI(),
      getStatisticsSummaryAPI('day')
    ])
    
    if (todayResponse.data.code === 0) {
      const todayData = todayResponse.data.data
      todayCount.value = todayData.todayCount
      
      // 计算最近一次放屁时间
      if (todayData.lastRecord) {
        const lastTime = todayData.lastRecord.fartTime
        lastFartTime.value = formatLastFartTime(lastTime)
      } else {
        lastFartTime.value = '暂无记录'
      }
    }
    
    if (statsResponse.data.code === 0) {
      const statsData = statsResponse.data.data
      console.log('统计数据返回:', statsData)
      
      // 设置最开心的心情图标
      if (statsData.mostCommonMood) {
        console.log('mostCommonMood 数据:', statsData.mostCommonMood)
        
        let newMoodIcon = null
        
        // 优先使用 moodEmoji 映射
        if (statsData.mostCommonMood.moodEmoji) {
          console.log('尝试使用 moodEmoji 映射:', statsData.mostCommonMood.moodEmoji)
          newMoodIcon = moodEmojiToIcon[statsData.mostCommonMood.moodEmoji]
          if (newMoodIcon) {
            console.log('moodEmoji 映射成功:', newMoodIcon)
          }
        } 
        
        // 其次使用 mood 值映射
        if (!newMoodIcon && statsData.mostCommonMood.mood) {
          console.log('尝试使用 mood 值映射:', statsData.mostCommonMood.mood)
          newMoodIcon = moodValueToIcon[statsData.mostCommonMood.mood]
          if (newMoodIcon) {
            console.log('mood 值映射成功:', newMoodIcon)
          } else {
            console.warn('mood 值映射失败，可用的映射:', Object.keys(moodValueToIcon))
          }
        }
        
        // 如果成功映射，则更新
        if (newMoodIcon) {
          mostHappyMood.value = newMoodIcon
          console.log('✅ mostHappyMood 更新成功:', mostHappyMood.value)
        } else {
          console.warn('⚠️ 无法映射心情图标，保持当前值:', mostHappyMood.value)
        }
      } else {
        console.log('暂无 mostCommonMood 数据')
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 保持默认值
  }
}

// 格式化最近一次放屁时间
const formatLastFartTime = (fartTime) => {
  if (!fartTime) return '暂无记录'
  
  try {
    // 兼容处理：提取时间部分
    // 如果是完整时间戳格式 "2025-10-21T21:19:54+08:00"，提取时间部分
    let timeStr = fartTime
    if (fartTime.includes('T')) {
      // 提取T后面的时间部分，去掉时区信息
      timeStr = fartTime.split('T')[1].split('+')[0].split('-')[0]
    }
    
    const now = new Date()
    const today = now.toISOString().split('T')[0] // 2025-10-21
    const fartDateTime = new Date(`${today}T${timeStr}`)
    const diffMs = now - fartDateTime
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) {
      return '刚刚'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`
    } else {
      const diffHours = Math.floor(diffMinutes / 60)
      return `${diffHours}小时前`
    }
  } catch (error) {
    console.error('格式化时间失败:', error, fartTime)
    return '时间未知'
  }
}

const closePopup = () => {
  popup.value.close()
}

const selectFartType = (value) => {
  selectedFartType.value = value
}

const selectSmellLevel = (value) => {
  selectedSmellLevel.value = value
}

const selectMood = (value) => {
  selectedMood.value = value
}

// 通知数据页面刷新数据
const notifyDataPageRefresh = () => {
  // 使用 uni.$emit 发送全局事件
  uni.$emit('fartRecordAdded')
  
  // 也可以使用 getCurrentPages 获取页面栈，直接调用方法
  const pages = getCurrentPages()
  const dataPage = pages.find(page => page.route === 'pages/data/index')
  if (dataPage && dataPage.$vm) {
    // 清除缓存并重新加载数据
    dataPage.$vm.clearAllCache()
    dataPage.$vm.loadData(true)
  }
}

// 通知 me 页面和成就页面刷新数据
const notifyMePageRefresh = () => {
  // 发送全局事件，通知其他页面刷新
  uni.$emit('userInfoUpdated')
  
  console.log('已发送 userInfoUpdated 事件，通知其他页面刷新')
}

const confirmFart = async () => {
  // 防止重复点击
  if (isSubmitting.value) {
    return
  }
  
  try {
    isSubmitting.value = true
    
    // 类型映射
    const typeMap = {
      '响亮型': 'loud',
      '轻柔型': 'soft',
      '无声型': 'silent'
    }
    
    // 气味映射
    const smellMap = {
      '清香': 1,
      '一般': 2,
      '浓烈': 3
    }
    
    // 心情映射
    const moodMap = {
      '放松': 'normal',
      '开心': 'happy',
      '尴尬': 'embarrassed'
    }
    
    // 获取当前时间（本地时间，避免 UTC 导致 0~7 点日期少一天）
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const fartDate = `${year}-${month}-${day}` // 本地日期，如 2026-02-12
    const fartTime = now.toTimeString().split(' ')[0] // 14:30:45
    
    // 构建请求数据
    const requestData = {
      fartType: typeMap[selectedFartType.value],
      smellLevel: smellMap[selectedSmellLevel.value],
      mood: moodMap[selectedMood.value],
      note: inputText.value || '',
      fartDate: fartDate,
      fartTime: fartTime
    }
    
    console.log('提交放屁记录:', requestData)
    
    // 调用API
    const { data } = await createFartRecordAPI(requestData)
    
    console.log('打卡结果:', data)
    
    if (data.code === 0) {
      // 震动反馈 - 提供触觉反馈提升用户体验
      uni.vibrateShort({
        type: 'heavy' // 使用重度震动，让用户有明显的反馈感
      })
      
      // 播放放屁声音
      playFartSound()
      
      // 重新播放GIF
      replayGif()
      
      closePopup()
      
      // 通知数据页面刷新数据
      notifyDataPageRefresh()
      
      // 通知 me 页面刷新用户信息
      notifyMePageRefresh()
      
      // 刷新统计数据
      loadStatisticsData()
      
      // 检查是否有新成就解锁
      if (data.data && data.data.newAchievements && data.data.newAchievements.length > 0) {
        console.log('解锁新成就:', data.data.newAchievements)
        // 显示新成就弹窗
        showNewAchievements(data.data.newAchievements)
      }
      
      // 重置选择
      selectedFartType.value = '响亮型'
      selectedSmellLevel.value = '清香'
      selectedMood.value = '放松'
      inputText.value = ''
    } else {
      uni.showToast({
        title: data.msg || '打卡失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('打卡失败:', error)
    uni.showToast({
      title: '打卡失败，请重试',
      icon: 'none'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 页面加载时获取统计数据
onMounted(() => {
   
  // 检查是否已经有 token（已登录状态），如果有就直接加载数据
  // 从 userStore 中读取 token，而不是从 storage
  const userStore = useUserStore()
  if (userStore.token) {
    console.log('已有 token，直接加载统计数据')
    loadStatisticsData()
  } else {
    console.log('暂无 token，等待登录完成...')
  }
  
  // 监听登录成功事件
  uni.$on('loginSuccess', onLoginSuccess)
})

// 登录成功回调
const onLoginSuccess = () => {
  console.log('收到 loginSuccess 事件，开始加载统计数据')
  loadStatisticsData()
}

// 页面卸载时清理
onUnmounted(() => {
  // 取消事件监听
  uni.$off('loginSuccess', onLoginSuccess)
  
  // 清理音频上下文
  if (audioContext) {
    try {
      audioContext.stop()
      audioContext.destroy()
    } catch (e) {
      // 忽略清理时的错误
    }
    audioContext = null
  }
  
  // 清理预览音频上下文
  stopPreviewAudio()
})

// 显示新成就列表
const showNewAchievements = (achievements) => {
  if (!achievements || achievements.length === 0) {
    return
  }
  
  newAchievements.value = achievements
  currentAchievementIndex.value = 0
  
  // 显示第一个成就
  showAchievementAtIndex(0)
}

// 显示指定索引的成就
const showAchievementAtIndex = (index) => {
  if (index >= newAchievements.value.length) {
    return
  }
  
  selectedAchievement.value = newAchievements.value[index]
  currentAchievementIndex.value = index
  
  setTimeout(() => {
    achievementPopup.value?.open()
  }, 500) // 延迟500ms显示，让打卡成功提示先显示
}

// 关闭成就详情
const closeAchievementDetail = () => {
  achievementPopup.value?.close()
  
  // 如果还有更多成就，显示下一个
  const nextIndex = currentAchievementIndex.value + 1
  if (nextIndex < newAchievements.value.length) {
    setTimeout(() => {
      showAchievementAtIndex(nextIndex)
    }, 300)
  } else {
    // 所有成就都显示完了，清空数据
    selectedAchievement.value = null
    newAchievements.value = []
    currentAchievementIndex.value = 0
  }
}

// 处理分享按钮点击
const handleShare = () => {
  if (!selectedAchievement.value) {
    return
  }
  
  console.log('准备分享成就:', selectedAchievement.value.achievementName)
}

// 配置分享内容
onShareAppMessage(() => {
  if (selectedAchievement.value) {
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

// ========== 音频设置相关功能 ==========

// 打开音频设置弹窗
const openAudioSettingPopup = async () => {
  const userStore = useUserStore()
  
  // 先加载音频列表
  await loadAudioList()
  
  // 初始化选中的音频URL（使用用户当前设置的或默认值）
  const currentAudioUrl = userStore.userInfo?.audioUrl || defaultAudioUrl
  
  // 检查当前音频URL是否在音频列表中，如果不在则使用默认值
  const audioExists = audioList.value.some(audio => audio.url === currentAudioUrl)
  if (audioExists || currentAudioUrl === defaultAudioUrl) {
    selectedAudioUrl.value = currentAudioUrl
  } else {
    // 如果用户设置的音频不在列表中，回退到默认音频
    selectedAudioUrl.value = defaultAudioUrl
  }
  
  console.log('打开音频设置弹窗，当前选中:', selectedAudioUrl.value)
  
  // 打开弹窗
  audioSettingPopup.value?.open()
  
  // 动态设置 z-index，确保在补卡按钮之上
  // #ifdef H5
  setTimeout(() => {
    // H5 环境下通过 DOM 操作设置 z-index
    const popupElements = document.querySelectorAll('.uni-popup')
    popupElements.forEach((el) => {
      if (el.querySelector('.audio-setting-popup-wrapper')) {
        el.style.setProperty('z-index', '200', 'important')
      }
    })
  }, 150)
  // #endif
  
  // #ifdef MP-WEIXIN
  // 微信小程序环境下，通过 nextTick 确保 DOM 更新后设置样式
  setTimeout(() => {
    const query = uni.createSelectorQuery().in(getCurrentPages()[getCurrentPages().length - 1])
    query.selectAll('.uni-popup').boundingClientRect((data) => {
      // 小程序中需要通过样式类来覆盖，已在全局样式中设置
    }).exec()
  }, 150)
  // #endif
}

// 音频列表滚动到底部，加载更多
const onAudioListScrollToLower = () => {
  if (!isLoadingAudio.value && audioHasMore.value) {
    loadAudioList(true) // 加载更多
  }
}

// 关闭音频设置弹窗
const closeAudioSettingPopup = () => {
  // 停止预览音频
  stopPreviewAudio()
  audioSettingPopup.value?.close()
}

// 加载音频列表（支持分页）
const loadAudioList = async (isLoadMore = false) => {
  try {
    isLoadingAudio.value = true
    
    // 如果不是加载更多，重置页码
    if (!isLoadMore) {
      audioCurrentPage.value = 1
      audioList.value = []
      audioHasMore.value = true
    }
    
    const { data } = await getAudioLibraryFeedAPI({
      page: audioCurrentPage.value,
      pageSize: audioPageSize.value
    })
    
    if (data.code === 0 && data.data) {
      const newList = data.data.list || []
      audioTotal.value = data.data.total || 0
      
      if (isLoadMore) {
        // 加载更多，追加数据
        audioList.value = [...audioList.value, ...newList]
      } else {
        // 首次加载或刷新，替换数据
        audioList.value = newList
      }
      
      // 判断是否还有更多数据
      audioHasMore.value = audioList.value.length < audioTotal.value
      
      // 如果还有更多数据，页码加1，准备下次加载
      if (audioHasMore.value) {
        audioCurrentPage.value++
      }
    }
  } catch (error) {
    console.error('加载音频列表失败:', error)
    if (!isLoadMore) {
      audioList.value = []
    }
  } finally {
    isLoadingAudio.value = false
  }
}

// 选择音频
const selectAudio = (url, name) => {
  selectedAudioUrl.value = url
  console.log('选择音频:', name, url)
}

// 播放预览音频
const playAudio = (audio) => {
  // 如果正在播放同一个音频，则停止
  if (playingAudioId.value === audio.id) {
    stopPreviewAudio()
    return
  }
  
  // 停止之前的预览
  stopPreviewAudio()
  
  // 创建新的预览音频上下文
  previewAudioContext = uni.createInnerAudioContext()
  previewAudioContext.src = audio.url
  previewAudioContext.volume = 0.8
  
  // #ifdef MP-WEIXIN
  previewAudioContext.obeyMuteSwitch = false
  // #endif
  
  playingAudioId.value = audio.id
  
  previewAudioContext.onPlay(() => {
    console.log('开始播放预览音频:', audio.name)
  })
  
  previewAudioContext.onEnded(() => {
    console.log('预览音频播放完成')
    playingAudioId.value = null
    if (previewAudioContext) {
      previewAudioContext.destroy()
      previewAudioContext = null
    }
  })
  
  previewAudioContext.onError((err) => {
    console.error('播放预览音频失败:', err)
    playingAudioId.value = null
    if (previewAudioContext) {
      previewAudioContext.destroy()
      previewAudioContext = null
    }
    uni.showToast({
      title: '播放失败',
      icon: 'none',
      duration: 2000
    })
  })
  
  previewAudioContext.play()
}

// 选择音频并设置（点击选中指示器时）
const handleSelectAudio = async (audio) => {
  console.log('选择音频:', audio)
  // 选择音频
  selectedAudioUrl.value = audio.url
  
  // 直接保存设置
  await saveAudioSettingDirectly(audio.url)
}

// 直接保存音频设置（不显示确认按钮）
const saveAudioSettingDirectly = async (audioUrl) => {
  try {
    if (!audioUrl) {
      return
    }
    
    // 调用API保存
    const { data } = await setUserAudioUrlAPI(audioUrl)
    
    if (data.code === 0) {
      // 更新 userStore 中的 audioUrl
      const userStore = useUserStore()
      userStore.updateUserInfo({
        audioUrl: audioUrl
      })
      
      // 显示成功提示
      uni.showToast({
        title: '设置成功 ✅',
        icon: 'none',
        duration: 1500
      })
    } else {
      uni.showToast({
        title: data.msg || '设置失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('保存音频设置失败:', error)
    uni.showToast({
      title: '设置失败，请重试',
      icon: 'none'
    })
  }
}

// 从弹窗跳转到创建页面
const goToCreateFartFromPopup = () => {
  // 关闭弹窗
  closeAudioSettingPopup()
  // 跳转到创建页面
  uni.navigateTo({
    url: '/pages/entry/creat'
  })
}

// 停止预览音频
const stopPreviewAudio = () => {
  if (previewAudioContext) {
    try {
      previewAudioContext.stop()
      previewAudioContext.destroy()
    } catch (e) {
      // 忽略错误
    }
    previewAudioContext = null
  }
  playingAudioId.value = null
}

// 保存音频设置
const saveAudioSetting = async () => {
  try {
    if (!selectedAudioUrl.value) {
      uni.showToast({
        title: '请选择音频',
        icon: 'none'
      })
      return
    }
    
    // 调用API保存
    const { data } = await setUserAudioUrlAPI(selectedAudioUrl.value)
    
    if (data.code === 0) {
      // 更新 userStore 中的 audioUrl
      const userStore = useUserStore()
      userStore.updateUserInfo({
        audioUrl: selectedAudioUrl.value
      })
      
      // 关闭弹窗
      closeAudioSettingPopup()
      
      // 显示成功提示
      uni.showToast({
        title: '设置成功 ✅',
        icon: 'none',
        duration: 1500
      })
    } else {
      uni.showToast({
        title: data.msg || '设置失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('保存音频设置失败:', error)
    uni.showToast({
      title: '设置失败，请重试',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.fart-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8f7 0%, #e8f5e8 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  position: relative;
  overflow-x: hidden;
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


.header {
  display: flex;
  align-items: center;
  justify-content: center;

   padding: 30rpx;
   box-sizing: border-box;
}


.header-content {
  text-align: center;
}

.title {
  color: #0d1b14;
  font-size: 40rpx;
  font-weight: 600;
  letter-spacing: -0.5rpx;
  display: block;
  margin-bottom: 8rpx;
}

.subtitle {
  color: #739a4c;
  font-size: 24rpx;
  font-weight: 400;
  opacity: 0.8;
  display: block;
}

.stats-card {
  position: relative;
  margin: 40rpx 32rpx;
  padding: 48rpx;
  background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
  border-radius: 24rpx;
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.07);
  overflow: hidden;

}

.floating-emoji {
  position: absolute;
  font-size: 120rpx;
  color: rgba(255, 255, 255, 0.5);
  animation: float 4s ease-in-out infinite;
}

.floating-emoji-1 {
  top: -32rpx;
  left: -16rpx;
  transform: rotate(12deg);
  animation-delay: -2s;
}

.floating-emoji-2 {
  top: -16rpx;
  right: 32rpx;
  transform: rotate(-12deg);
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(12deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-30rpx) rotate(-12deg);
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotate(12deg);
    opacity: 0.8;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 32rpx;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-label {
  color: #0d1b14;
  font-size: 28rpx;
  font-weight: 500;
}

.stat-value {
  color: #0d1b14;
  font-size: 80rpx;
  font-weight: bold;
}

.emoji {
  font-size: 60rpx;
}

.stat-mood-icon {
  width: 80rpx;
  height: 80rpx;
  margin-top: 8rpx;
}

.stat-value-small {
  color: #0d1b14;
  font-size: 32rpx;
  font-weight: bold;
  padding-top: 16rpx;
}

.fart-gif-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 64rpx 16rpx 64rpx;
  z-index: 10;
}

.fart-gif {
  width: 260rpx;
  height: 260rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.fart-gif.gif-playing {
  transform: scale(1.05);
  box-shadow: 0 8rpx 24rpx rgba(115, 154, 76, 0.3);
}

.main-button-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 64rpx 48rpx 64rpx;
  z-index: 10;
}

.main-button {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  /* 恢复原来的渐变背景色，叠加毛玻璃效果 */
  background: linear-gradient(135deg, rgba(255, 211, 182, 0.95) 0%, rgba(255, 182, 193, 0.95) 100%);
  backdrop-filter: blur(15rpx);
  -webkit-backdrop-filter: blur(15rpx);
  /* 轻盈的立体感边框 */
  border: 1.5rpx solid rgba(255, 255, 255, 0.5);
  /* 轻盈的阴影 - 更柔和 */
  box-shadow: 
    /* 柔和外发光 */
    0 0 20rpx rgba(255, 182, 193, 0.25),
    /* 轻盈主阴影 */
    0 8rpx 24rpx rgba(0, 0, 0, 0.08),
    0 4rpx 12rpx rgba(0, 0, 0, 0.05),
    /* 柔和内高光 */
    inset 0 1rpx 4rpx rgba(255, 255, 255, 0.6),
    inset 0 -1rpx 4rpx rgba(255, 182, 193, 0.15);
  color: #5c3a21;
  font-size: 36rpx;

  letter-spacing: 0.3rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* 动态模糊动画 - 更柔和 */
  animation: glassBlur 4s ease-in-out infinite;
  overflow: visible;
}

/* 微妙的呼吸效果 - 通过伪元素实现，不影响按下效果 */
.main-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
  opacity: 0.4;
  animation: gentleBreath 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* 微妙的呼吸效果 - 增加情绪价值 */
@keyframes gentleBreath {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

/* 背景光晕效果 - 更柔和轻盈 */
.main-button::before {
  content: '';
  position: absolute;
  top: -15rpx;
  left: -15rpx;
  right: -15rpx;
  bottom: -15rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 182, 193, 0.15) 0%, rgba(255, 211, 182, 0.1) 50%, transparent 75%);
  opacity: 0.5;
  z-index: -1;
  animation: glowPulse 3s ease-in-out infinite;
  pointer-events: none;
}

/* 光晕脉冲动画 - 更柔和 */
@keyframes glowPulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

/* 毛玻璃模糊动态更新动画 - 轻盈柔和 */
@keyframes glassBlur {
  0%, 100% {
    backdrop-filter: blur(15rpx);
    -webkit-backdrop-filter: blur(15rpx);
    box-shadow: 
      0 0 20rpx rgba(255, 182, 193, 0.25),
      0 8rpx 24rpx rgba(0, 0, 0, 0.08),
      0 4rpx 12rpx rgba(0, 0, 0, 0.05),
      inset 0 1rpx 4rpx rgba(255, 255, 255, 0.6),
      inset 0 -1rpx 4rpx rgba(255, 182, 193, 0.15);
  }
  50% {
    backdrop-filter: blur(18rpx);
    -webkit-backdrop-filter: blur(18rpx);
    box-shadow: 
      0 0 25rpx rgba(255, 182, 193, 0.3),
      0 10rpx 28rpx rgba(0, 0, 0, 0.1),
      0 5rpx 14rpx rgba(0, 0, 0, 0.06),
      inset 0 1rpx 5rpx rgba(255, 255, 255, 0.7),
      inset 0 -1rpx 5rpx rgba(255, 182, 193, 0.18);
  }
}

/* 按下时的塌陷效果 - 轻盈解压 */
.main-button:active {
  transform: translateY(6rpx) scale(0.97);
  /* 阴影几乎消失 - 解压感 */
  box-shadow: 
    0 0 8rpx rgba(255, 182, 193, 0.15),
    0 2rpx 8rpx rgba(0, 0, 0, 0.05),
    inset 0 1rpx 3rpx rgba(255, 255, 255, 0.5),
    inset 0 -1rpx 3rpx rgba(255, 182, 193, 0.1);
  /* 按下时减少模糊 */
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 按下时光晕收缩 - 更柔和 */
.main-button:active::before {
  opacity: 0.25;
  transform: scale(0.95);
  transition: all 0.12s ease;
}

.button-emoji {
  position: absolute;
  font-size: 80rpx;
  opacity: 0.4;
  animation: float 4s ease-in-out infinite;
}

/* 按钮图标样式 */
.button-icon {
  width: 60rpx;
  height:  60rpx;
  margin-top: 10rpx;
  z-index: 2;
  position: relative;
  opacity: 0.95;
  transition: all 0.3s ease;
  /* 柔和的阴影效果 */
  filter: drop-shadow(0 2rpx 4rpx rgba(200, 90, 107, 0.15)) drop-shadow(0 1rpx 2rpx rgba(255, 255, 255, 0.3));
}

/* 按下时图标效果 - 与文字同步 */
.main-button:active .button-icon {
  transform: scale(0.96);
  opacity: 0.9;
  filter: drop-shadow(0 1rpx 2rpx rgba(200, 90, 107, 0.1)) drop-shadow(0 0rpx 1rpx rgba(255, 255, 255, 0.2));
}

.button-text {
  z-index: 2;
  position: relative;
  margin-top: -10rpx;
  /* 文字颜色 - 与背景色协调的深粉色，与背景的粉色部分呼应 */
  color: #C85A6B;
  /* 轻盈的文字阴影 - 增加层次感 */
  text-shadow: 
    0 1rpx 4rpx rgba(200, 90, 107, 0.25),
    0 0rpx 2rpx rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5rpx;
}

/* H5环境下的文字渐变效果 - 与背景色协调的渐变 */
/* #ifdef H5 */
.button-text {
  background: linear-gradient(135deg, #C85A6B 0%, #D9776C 50%, #E89A9E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}
/* #endif */

/* 按下时文字效果 - 轻盈反馈 */
.main-button:active .button-text {
  transform: scale(0.96);
  opacity: 0.9;
  text-shadow: 
    0 0rpx 2rpx rgba(200, 90, 107, 0.15),
    0 0rpx 1rpx rgba(255, 255, 255, 0.4);
}

/* 功能按钮组容器 */
.function-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40rpx;
   margin-top: 60rpx;
  z-index: 10;
}

/* 功能按钮样式 - 白色毛玻璃风格，轻盈美观 */
.function-button {
  position: relative;
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  /* 白色毛玻璃背景 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  /* 精致的立体感边框 */
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  /* 轻盈优雅的阴影 */
  box-shadow: 
    /* 柔和外发光 */
    0 0 20rpx rgba(255, 182, 193, 0.15),
    /* 轻盈主阴影 - 增加立体感 */
    0 6rpx 20rpx rgba(0, 0, 0, 0.08),
    0 3rpx 10rpx rgba(0, 0, 0, 0.05),
    /* 精致内高光 */
    inset 0 2rpx 6rpx rgba(255, 255, 255, 0.9),
    inset 0 -1rpx 4rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* 动态模糊动画 - 更柔和 */
  animation: glassBlurWhite 4s ease-in-out infinite;
  overflow: visible;
}

/* 功能按钮的白色毛玻璃模糊动画 */
@keyframes glassBlurWhite {
  0%, 100% {
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
    box-shadow: 
      0 0 20rpx rgba(255, 182, 193, 0.15),
      0 6rpx 20rpx rgba(0, 0, 0, 0.08),
      0 3rpx 10rpx rgba(0, 0, 0, 0.05),
      inset 0 2rpx 6rpx rgba(255, 255, 255, 0.9),
      inset 0 -1rpx 4rpx rgba(0, 0, 0, 0.05);
  }
  50% {
    backdrop-filter: blur(24rpx);
    -webkit-backdrop-filter: blur(24rpx);
    box-shadow: 
      0 0 25rpx rgba(255, 182, 193, 0.2),
      0 8rpx 24rpx rgba(0, 0, 0, 0.1),
      0 4rpx 12rpx rgba(0, 0, 0, 0.06),
      inset 0 2rpx 8rpx rgba(255, 255, 255, 0.95),
      inset 0 -1rpx 5rpx rgba(0, 0, 0, 0.06);
  }
}

/* 功能按钮背景光晕效果 - 白色主题 */
.function-button::before {
  content: '';
  position: absolute;
  top: -12rpx;
  left: -12rpx;
  right: -12rpx;
  bottom: -12rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 182, 193, 0.1) 0%, rgba(255, 211, 182, 0.06) 50%, transparent 75%);
  opacity: 0.5;
  z-index: -1;
  animation: glowPulseWhite 3s ease-in-out infinite;
  pointer-events: none;
}

/* 功能按钮光晕脉冲动画 - 白色主题 */
@keyframes glowPulseWhite {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

/* 功能按钮呼吸效果 - 白色主题 */
.function-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 65%);
  opacity: 0.4;
  animation: gentleBreathWhite 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* 功能按钮呼吸动画 - 白色主题 */
@keyframes gentleBreathWhite {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

/* 功能按钮图标样式 */
.function-button-icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 16rpx;
  z-index: 2;
  position: relative;
  opacity: 0.95;
  transition: all 0.3s ease;
  filter: drop-shadow(0 1rpx 2rpx rgba(200, 90, 107, 0.15));
}

/* 按下时图标效果 */
.function-button:active .function-button-icon {
  transform: scale(0.95);
  opacity: 0.9;
}

/* 功能按钮文字样式 - 白色主题优化 */
.function-button-text {
  z-index: 2;
  position: relative;
  font-size: 20rpx;
  color: #C85A6B;
  font-weight: 600;
  letter-spacing: 0.3rpx;
  text-shadow: 
    0 1rpx 3rpx rgba(200, 90, 107, 0.2),
    0 0rpx 1rpx rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  line-height: 1.2;
  text-align: center;
}

/* H5环境下的功能按钮文字渐变效果 */
/* #ifdef H5 */
.function-button-text {
  background: linear-gradient(135deg, #C85A6B 0%, #D9776C 50%, #E89A9E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}
/* #endif */

/* 功能按钮按下时的塌陷效果 - 白色主题 */
.function-button:active {
  transform: translateY(5rpx) scale(0.97);
  /* 阴影几乎消失 - 解压感 */
  box-shadow: 
    0 0 8rpx rgba(255, 182, 193, 0.1),
    0 2rpx 6rpx rgba(0, 0, 0, 0.05),
    inset 0 1rpx 3rpx rgba(255, 255, 255, 0.7),
    inset 0 -1rpx 3rpx rgba(0, 0, 0, 0.03);
  /* 按下时减少模糊 */
  backdrop-filter: blur(16rpx);
  -webkit-backdrop-filter: blur(16rpx);
  transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 按下时光晕收缩 */
.function-button:active::before {
  opacity: 0.25;
  transform: scale(0.95);
  transition: all 0.12s ease;
}

/* 按下时文字效果 */
.function-button:active .function-button-text {
  transform: scale(0.96);
  opacity: 0.9;
  text-shadow: 
    0 0rpx 2rpx rgba(200, 90, 107, 0.2),
    0 0rpx 1rpx rgba(255, 255, 255, 0.6);
}

.popup-content {
  background: #f6f8f7;
  border-radius: 24rpx 24rpx 0 0;
  padding: 24rpx;
  padding-top: 20rpx;
  max-height: 80vh;
  overflow-y: auto;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

/* 补卡弹窗特殊样式 - 固定底部按钮 */
.makeup-popup-content {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.popup-scroll-content {
  flex: 1;
  padding: 24rpx;
  padding-top: 20rpx;
  overflow-y: auto;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.popup-footer-fixed {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f6f8f7;
  padding: 24rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  z-index: 10;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.popup-header {
  text-align: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid rgba(115, 154, 76, 0.2);
}

.popup-gif-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.popup-gif {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
}

.popup-title {
  color: #0d1b14;
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.popup-desc {
  color: #739a4c;
  font-size: 24rpx;
  font-weight: 400;
  opacity: 0.8;
  display: block;
  line-height: 1.4;
}


.section {
  margin-bottom: 48rpx;
}

.section-compact {
  margin-bottom: 32rpx;
}

.section-title {
  color: #739a4c;
  font-size: 26rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
  display: block;
}

.switch-container {
  padding: 0 0rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.switch-wrapper {
  display: flex;
  min-height: 96rpx;
  background: #fffbfa;
  border-radius: 50rpx;
  padding: 8rpx;
  box-sizing: border-box;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.switch-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80rpx;
  background: transparent;
  border: none;
  border-radius: 50rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16rpx;
  position: relative;
  outline: none;
  box-shadow: none;
  box-sizing: border-box;
}

.switch-option::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50rpx;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.switch-option:active {
  transform: scale(0.95);
}

.switch-option.selected {
  background: #ffdaba;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.switch-option.selected::after {
  background: #ffdaba;
}

.switch-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #739a4c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.2;
  text-align: center;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-emoji {
  margin-right: 20rpx;
  display: inline-block;
}

.switch-emoji-img {
  width: 48rpx;
  height: 48rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.switch-option.selected .switch-text {
  color: #141b0d;
  font-weight: 600;
}

.input-section {
  position: relative;
  margin-bottom: 24rpx;
  width: 100%;
  box-sizing: border-box;
}

.input-emoji {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 36rpx;
  z-index: 1;
  pointer-events: none;
}

.input-emoji-img {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 36rpx;
  height: 36rpx;
  z-index: 1;
  pointer-events: none;
}

.text-input {
  width: 100%;
  height: 88rpx;
  background: #fffbfa;
  border: none;
  border-radius: 18rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  padding-left: 72rpx;
  padding-right: 24rpx;
}

.text-input::placeholder {
  color: #999;
}

.confirm-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
  color: #0d1b14;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 0.3rpx;
  border-radius: 50rpx;
  border: none;
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.07);
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  box-sizing: border-box;
}

.confirm-button:active {
  transform: scale(0.95);
}

.confirm-button:disabled {
  opacity: 0.6;
  background: linear-gradient(135deg, #d0d0d0 0%, #b0b0b0 100%);
  color: #666;
  pointer-events: none;
}

.confirm-button:disabled:active {
  transform: none;
}

.confirm-text {
  line-height: 1;
}

.fart-cloud {
  position: fixed;
  font-size: 60rpx;
  z-index: 50;
  opacity: 0;
  left: -20%;
  top: 50%;
  transform: translateY(-50%);
}

.fart-cloud.animate {
  animation: floatAcross 5s linear forwards;
  opacity: 1;
}

@keyframes floatAcross {
  0% {
    left: -20%;
    top: 50%;
    opacity: 1;
    transform: translateY(-50%) scale(0.8) rotate(-15deg);
  }
  25% {
    top: 45%;
    transform: translateY(-50%) scale(1) rotate(10deg);
  }
  50% {
    top: 55%;
    transform: translateY(-50%) scale(1.2) rotate(-10deg);
  }
  75% {
    top: 50%;
    transform: translateY(-50%) scale(1) rotate(5deg);
  }
  100% {
    left: 120%;
    top: 48%;
    opacity: 0;
    transform: translateY(-50%) scale(0.7) rotate(15deg);
  }
}

/* 屁币悬浮按钮 */
.points-button {
  position: fixed;
  right: 32rpx;
  bottom: 440rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: all 0.3s ease;
}

.points-button:active {
  transform: scale(0.9);
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.points-icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 4rpx;
}

.points-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

/* 屁友悬浮按钮 */
.friend-button {
  position: fixed;
  right: 32rpx;
  bottom: 280rpx;
  width: 120rpx;
  height: 120rpx;
  background: #FF8399;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(255, 131, 153, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: all 0.3s ease;
}

.friend-button:active {
  transform: scale(0.9);
  box-shadow: 0 4rpx 12rpx rgba(255, 131, 153, 0.3);
}

.friend-icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 4rpx;
}

.friend-text {
  font-size: 24rpx;
  color: #333333;
  font-weight: 600;
}

/* 补卡悬浮按钮 */
.makeup-button {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #FFE5B4 0%, #FFD700 100%);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50; /* 降低 z-index，确保弹窗可以遮住 */
  transition: all 0.3s ease;
}

.makeup-button:active {
  transform: scale(0.9);
  box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.3);
}

.makeup-icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 4rpx;
}

.makeup-text {
  font-size: 24rpx;
  color: #8B6914;
  font-weight: 600;
}

/* 创建自己的屁按钮 */
.create-fart-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -4rpx 12rpx rgba(255, 107, 157, 0.3);
  z-index: 100;
  transition: all 0.3s ease;
}

.create-fart-button:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.create-fart-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

/* 时间选择容器 */
.time-select-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.time-select-item {
  background: #fffbfa;
  border-radius: 18rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.time-select-item:active {
  transform: scale(0.98);
  background: #fff5f0;
}

.time-label {
  font-size: 36rpx;
}

.time-label-img {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.time-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.time-arrow {
  font-size: 40rpx;
  color: #999;
  font-weight: 300;
}

/* 成就详情弹窗样式 */
.achievement-detail-popup {
  width: calc(100vw - 64rpx);

  margin: 0 32rpx;
  background: #f6f8f7;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

.achievement-detail-popup .popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-bottom: none;
}

.achievement-detail-popup .popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
}

.achievement-detail-popup .popup-close {
  font-size: 40rpx;
  color: white;
  padding: 10rpx;
}

.achievement-detail-popup .popup-content {
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

.detail-reward {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #FFE5B4 0%, #FFD700 100%);
  border-radius: 16rpx;
}

.reward-label {
  font-size: 26rpx;
  color: #8B6914;
  margin-right: 10rpx;
  font-weight: 600;
}

.reward-value {
  font-size: 32rpx;
  color: #FF6B00;
  font-weight: bold;
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

/* 音频设置按钮 */
.audio-setting-btn {
  position: fixed;
  right: 32rpx;
  top: 300rpx; /* 在屁友按钮上方，屁友按钮是280rpx，加上按钮高度120rpx和间距 */
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  // background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 50;
  transition: all 0.3s ease;
}

.audio-setting-btn:active {
  transform: scale(0.9);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.audio-setting-icon {
  width: 64rpx;
  height: 64rpx;
}

/* 音频设置弹窗 - 使用 popup-content 样式，这里只覆盖特定样式 */
.audio-setting-popup-wrapper {
  position: relative;
}

.audio-list-container {
  flex: 1;
  max-height: 60vh;
  padding: 0;
  margin-top: 0;
  overflow-y: auto;
  
}

/* 音频设置卡片样式（与audio页面一致，但尺寸更小） */
.audio-setting-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 16rpx;
  border-radius: 24rpx;
  border: 2rpx solid;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: calc(100% - 48rpx);
}

.audio-setting-card:active {
  transform: scale(0.98);
}

.audio-setting-card.selected {
  border-color: #A8E6CF;
  box-shadow: 0 6rpx 16rpx rgba(168, 230, 207, 0.3);
}

/* 左侧图片（缩小版） */
.card-image-wrapper-small {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  overflow: hidden;
}

.card-image-small {
  width: 140rpx;
  height: 140rpx;
  border-radius: 18rpx;
}

.card-image-small.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f9f9f9 0%, #ececec 100%);
}

.placeholder-emoji-small {
  font-size: 48rpx;
  opacity: 0.5;
}

/* 播放指示器（缩小版） */
.play-indicator-small {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 18rpx;
  pointer-events: none;
}

.scan-line-small {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3rpx;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.8) 20%,
    rgba(255, 255, 255, 0.9) 50%,
    rgba(255, 255, 255, 0.8) 80%,
    transparent 100%
  );
  box-shadow: 0 0 15rpx rgba(255, 255, 255, 0.6),
              0 0 30rpx rgba(255, 255, 255, 0.4);
  animation: scan-small 2s infinite;
}

.scan-line-small.scan-line-1 {
  animation-delay: 0s;
}

.scan-line-small.scan-line-2 {
  animation-delay: 0.66s;
}

.scan-line-small.scan-line-3 {
  animation-delay: 1.33s;
}

@keyframes scan-small {
  0% {
    left: -3rpx;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

/* 右侧内容（缩小版） */
.card-content-small {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.card-header-small {
  margin-bottom: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
  width: 100%;
  flex-shrink: 0;
  overflow: hidden;
}

.card-title-small {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #1f1f1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  width: 100%;
  max-width: 100%;
  flex-shrink: 0;
  word-break: keep-all;
  word-wrap: normal;
}

.card-desc-small {
  display: block;
  font-size: 22rpx;
  color: #7a7a7a;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  max-width: 100%;
  flex-shrink: 0;
  word-break: keep-all;
  word-wrap: normal;
}

/* 标签和操作区域行（水平对齐，居右） */
/* 标签区域（缩小版） */
.card-tags-small {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  min-width: 0;
}

.card-tag-small {
  padding: 4rpx 12rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #5c5c5c;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.more-tags-small {
  font-size: 20rpx;
  color: #999;
}

.play-btn-small {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  padding: 0;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  border: none;
  transition: all 0.3s ease;
  z-index: 5;
  backdrop-filter: blur(4rpx);
}

.play-btn-small:active:not(.playing) {
  opacity: 0.8;
  transform: translate(-50%, -50%) scale(0.95);
}

.play-btn-small.playing {
  background: rgba(0, 0, 0, 0.08);
}

.play-icon-small {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
  filter: brightness(1.2);
}

.play-text-small {
  font-weight: 500;
}

.audio-item-check-small {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 36rpx;
  height: 36rpx;
  transition: all 0.3s ease;
  z-index: 10;
  pointer-events: auto; /* 允许点击事件 */
  cursor: pointer;
}

/* 默认音频选项样式 */
.audio-item-default {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  margin-bottom: 16rpx;
  background: #fffbfa;
  border-radius: 18rpx;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
  box-sizing: border-box;
  width: calc(100% - 48rpx);
}

.audio-item-default:active {
  transform: scale(0.98);
}

.audio-item-default.selected {
  border-color: #A8E6CF;
  background: #f0fdf4;
}

.audio-item-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.audio-item-emoji {
  font-size: 48rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.audio-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.audio-item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f1f1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-item-desc {
  font-size: 24rpx;
  color: #7a7a7a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-item-check {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.empty-audio,
.loading-audio,
.loading-more-audio,
.no-more-audio {
  padding: 40rpx 0;
  text-align: center;
}

.empty-text,
.loading-text,
.no-more-text {
  font-size: 28rpx;
  color: #999;
}

.no-more-text {
  color: #ccc;
  font-size: 24rpx;
}

.popup-footer {
  display: flex;
  gap: 24rpx;
  padding: 0;
  padding-top: 24rpx;
  margin-top: 24rpx;
}

/* 音频设置弹窗的固定底部 */
.audio-setting-popup-wrapper {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  max-height: 80vh;
}

.audio-setting-popup-wrapper .popup-header {
  padding: 24rpx;
  padding-bottom: 20rpx;
  flex-shrink: 0;
}

.audio-setting-popup-wrapper .audio-list-container {
  flex: 1;
  padding: 0 24rpx;
  min-height: 0;
}

.audio-setting-popup-wrapper .popup-footer-fixed {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f6f8f7;
  padding: 24rpx;

  z-index: 10;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-top: 0;
  border-top: 1rpx solid rgba(115, 154, 76, 0.2);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.cancel-btn {
  background: #fffbfa;
  color: #739a4c;
}

.cancel-btn:active {
  transform: scale(0.95);
}

.confirm-btn {
  background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
  color: #0d1b14;
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.07);
}

.confirm-btn:active {
  transform: scale(0.95);
}

/* 创建自己的屁按钮 */
.create-fart-btn {
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

.create-fart-btn::after {
  border: none;
}

.create-fart-btn:active {
  transform: scale(0.98);
}

.create-fart-btn-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}
</style>

<!-- 全局样式：提高音频设置弹窗的 z-index，确保在补卡按钮之上 -->
<style lang="scss">
/* 通过类名选择器提高音频设置弹窗的 z-index */
.audio-setting-popup.uni-popup,
.uni-popup.audio-setting-popup {
  z-index: 200 !important; /* 高于补卡按钮的 z-index: 50 */
}

/* 通过内容选择器 */
.uni-popup:has(.audio-setting-popup-wrapper) {
  z-index: 200 !important;
}

/* 更通用的选择器 - 选择包含 audio-setting-popup-wrapper 的所有父级 */
.uni-popup.bottom:has(.audio-setting-popup-wrapper) {
  z-index: 200 !important;
}

/* 小程序环境下的样式覆盖 */
/* #ifdef MP-WEIXIN */
.uni-popup {
  &[class*="audio-setting"] {
    z-index: 200 !important;
  }
}
/* #endif */
</style>