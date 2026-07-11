<template>
  <view class="fart-page">
    <scroll-view class="scroll-view" scroll-y>

     
   
      <!-- 滚动内容区域 -->
      <view class="content-wrapper">
        
        <image 
          class="top-image" 
          src="https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/top_text.png" 
          mode="aspectFit"
        ></image>

        <view class="floating-me-view">
        <!-- 左侧区域 -->
        <view class="floating-side-wrapper">
          <!-- 没有昵称时，使用单独的image，只显示meImg或taImg -->
          <image 
            v-if="nickname_left === ''"
            class="floating-me-img"
            :src="leftDefaultImg" 
            mode="aspectFill"
          ></image>
          <!-- 有昵称时，使用包裹的view显示头像和文字 -->
          <view v-else class="avatar-content-wrapper">
            <image 
              class="avatar-image inviter-avatar"
              :src="leftAvatarImg" 
              mode="aspectFill"
            ></image>
            <text class="inviter-name">{{ nickname_left }}</text>
          </view>
        </view>
        <!-- 中间切换区域 -->
        <view v-if="!isInviteShareMode" class="switch-center" @click="switchIdentity">
          <view><text class="switch-name-text">切换身份</text></view>
          <image 
            class="img-center" 
            src="https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/qiehuan_img.png" 
            mode="aspectFit"
          ></image>
        </view>
        <!-- 右侧区域 -->
        <view class="floating-side-wrapper">
          <!-- 没有昵称时，使用单独的image，只显示meImg或taImg -->
          <image 
            v-if="nickname_right === ''"
            class="floating-ta-img"
            :src="rightDefaultImg" 
            mode="aspectFill"
          ></image>
          <!-- 有昵称时，使用包裹的view显示头像和文字 -->
          <view v-else class="avatar-content-wrapper">
            <image 
              class="avatar-image inviter-avatar"
              :src="rightAvatarImg" 
              mode="aspectFill"
            ></image>
            <text class="inviter-name">{{ nickname_right }}</text>
          </view>
        </view>
      </view>
        <view class="bg-image-wrapper">
          <image 
            class="bg-image" 
            src="https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/xin_bg.png" 
            mode="aspectFit"
          ></image>
          <image 
            class="floating-image" 
            src="https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/xing_xing.png" 
            mode="aspectFit"
          ></image>
          <view class="floating-image-wrapper">
            <image 
              class="man-image" 
              src="https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/man_bg.png" 
              mode="aspectFit"
            ></image>
            <image 
              class="girl-image" 
              src="https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/girl_bg.png" 
              mode="aspectFit"
            ></image>
          </view>
          <image 
            class="line-img" 
            src="https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/line_bg.png" 
            mode="aspectFit"
          ></image>
        </view>
        <view class="floating-info-view">
          <!-- 如果有最近一次屁友一起打屁记录，显示记录信息 -->
          <!-- 显示条件：只要有最近一次记录就显示（无论是否完成） -->
          <template v-if="lastFartTogetherRecord">
            <view class="together-record-info">
              <view class="record-item">
                <template v-if="hasRecordData(getLeftRecordInfo())">
                  <view class="record-item-row">
                    <text class="record-label">放了</text>
                    <view class="record-type-wrapper">
                      <text class="record-type">{{ getVolumeNameByRecord(getLeftRecordInfo()) }}</text>
                      <view class="record-type-gap"></view>
                      <text class="record-type">{{ getFartTypeNameByRecord(getLeftRecordInfo()) }}</text>
                    </view>
                    <text class="record-label">屁</text>
                  </view>
                  <!-- 等级 -->
                  <view class="record-item-row">
                    <text class="record-label">气味等级：</text>
                    <text class="record-type">{{ getSmellLevelNameByRecord(getLeftRecordInfo()) }}</text>
                  </view>
                  <!-- 心情 -->
                  <view class="record-item-row">
                    <text class="record-label">心情：</text>
                    <text class="record-type">{{ getMoodNameByRecord(getLeftRecordInfo()) }}</text>
                  </view>
                </template>
                <template v-else>
                  <view class="record-item-row">
                    <text class="record-label">等待放屁。。。</text>
                  </view>
                </template>
              </view>
              <view class="record-item">
                <template v-if="hasRecordData(getRightRecordInfo())">
                  <view class="record-item-row">
                    <text class="record-label">放了</text>
                    <view class="record-type-wrapper">
                      <text class="record-type">{{ getVolumeNameByRecord(getRightRecordInfo()) }}</text>
                      <view class="record-type-gap"></view>
                      <text class="record-type">{{ getFartTypeNameByRecord(getRightRecordInfo()) }}</text>
                    </view>
                    <text class="record-label">屁</text>
                  </view>
                  <!-- 等级 -->
                  <view class="record-item-row">
                    <text class="record-label">气味等级：</text>
                    <text class="record-type">{{ getSmellLevelNameByRecord(getRightRecordInfo()) }}</text>
                  </view>
                  <!-- 心情 -->
                  <view class="record-item-row">
                    <text class="record-label">心情：</text>
                    <text class="record-type">{{ getMoodNameByRecord(getRightRecordInfo()) }}</text>
                  </view>
                </template>
                <template v-else>
                  <view class="record-item-row">
                    <text class="record-label">等待放屁。。。</text>
                  </view>
                </template>
              </view>
            </view>
          </template>
      
        </view>
      </view>
    </scroll-view>

    <!-- 底部固定区域 -->
    <view class="bottom-view">
      <!-- 如果弹窗打开，显示确认按钮 -->
      <view v-if="isPopupOpen" class="bottom-confirm-wrapper">
        <button class="bottom-confirm-button" :disabled="isSubmitting" @click="isInviteShareMode ? updateTogetherFartRecord() : confirmFart()">
          <text class="bottom-confirm-text">{{ isSubmitting ? '提交中...' : '确认放屁' }}</text>
        </button>
      </view>
      <!-- 如果是邀请分享模式，显示"和TA一起放个屁吧"按钮或"已完成，去首页放屁"按钮 -->
      <view v-else-if="isInviteShareMode" class="bottom-confirm-wrapper">
        <button class="bottom-confirm-button" :disabled="isSubmitting" @click="isCompleted ? goToHomePage() : handleTogetherFart()">
          <text class="bottom-confirm-text">{{ isSubmitting ? '提交中...' : (isCompleted ? '我们的空气，共同完成了今天的默契' : '和TA一起放个屁吧') }}</text>
        </button>
      </view>
      <!-- 如果弹窗未打开，显示用户信息和邀请按钮 -->
      <template v-else>
        <!-- 左侧：当前用户信息 -->
        <view class="user-info">
          <image 
            class="user-avatar" 
            :src="avatar" 
            mode="aspectFill"
          ></image>
          <text class="user-name">{{ nickname }}</text>
        </view>
        <!-- 右侧：邀请屁友按钮 -->
        <!-- 如果是邀请屁友模式，使用分享按钮 -->
        <button 
          v-if="lastFartTogetherRecord && lastFartTogetherRecord.inviteeRecordInfo && (!lastFartTogetherRecord.inviteeRecordInfo.fartType || lastFartTogetherRecord.inviteeRecordInfo.fartType === '')"
          class="invite-btn" 
          open-type="share"
        >
          <text class="invite-text">邀请屁友</text>
        </button>
        <!-- 否则使用普通按钮 -->
        <button v-else class="invite-btn" @click="handleInvite">
          <text class="invite-text">{{ getInviteButtonText() }}</text>
        </button>
      </template>
    </view>

    <!-- 放屁记录弹窗 -->
    <uni-popup ref="fartPopup" type="bottom" :safe-area="false" @change="handlePopupChange">
      <view class="popup-content">
        <!-- 弹窗标题 - 使用 GIF 图片 -->
        <view class="popup-header">
          <view class="popup-gif-container">
            <image 
              class="popup-gif" 
              :src="gifUrl"
              mode="aspectFit"
            />
          </view>
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
              
                  <image class="switch-emoji-img" :src="type.icon" mode="aspectFit"></image>
                  <text class="switch-text">{{ type.label }}</text>
           
              </button>
            </view>
          </view>
        </view>

        <!-- 气味等级 -->
        <view class="section">
          <text class="section-title">气味等级</text>
          <view class="switch-container">
            <scroll-view class="switch-scroll-view" scroll-x>
              <view class="switch-wrapper">
                <button 
                  v-for="(level, index) in smellLevels" 
                  :key="index"
                  :class="['switch-option', { 'selected': selectedSmellLevel === level.value }]"
                  @click="selectSmellLevel(level.value)"
                >
            
                    <image class="switch-emoji-img" :src="level.icon" mode="aspectFit"></image>
                    <text class="switch-emoji-text">{{ level.label }}</text>
                
                </button>
              </view>
            </scroll-view>
          </view>
        </view>

        <!-- 放屁当量 -->
        <view class="section">
          <text class="section-title">放屁当量</text>
          <view class="switch-container">
            <scroll-view class="switch-scroll-view" scroll-x>
              <view class="switch-wrapper">
                <button 
                  v-for="(volume, index) in volumeLevels" 
                  :key="index"
                  :class="['switch-option', { 'selected': selectedVolume === volume.value }]"
                  @click="selectVolume(volume.value)"
                >
                    <image :class="['switch-emoji-img', volume.sizeClass]" :src="volume.icon" mode="aspectFit"></image>
                    <text class="switch-emoji-text">{{ volume.label }}</text>
                </button>
              </view>
            </scroll-view>
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
             
                  <image class="switch-emoji-img" :src="mood.icon" mode="aspectFit"></image>
                  <text class="switch-emoji-text">{{ mood.label }}</text>
           
              </button>
            </view>
          </view>
        </view>
        <view style="height: 200rpx;"> </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow, onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { getUserInfoAPI, wxQuickLoginAPI, openidLoginAPI, getUserInfoByIdAPI } from '@/src/api/user.js'
import { getLastFartTogetherRecordAPI, createFartTogetherRecordAPI, getFartTogetherRecordByIdAPI, updateFartTogetherRecordAPI, updateFartTogetherRecordSexAPI } from '@/src/api/fart.js'
import { useUserStore } from '@/src/stores/user.js'

// 使用 user store
const userStore = useUserStore()

// 用户信息（从store获取，支持响应式）
const nickname = computed(() => userStore.nickname)
const avatar = computed(() => userStore.avatar)

const isMe = ref(true) // true 显示 me_img, false 显示 ta_img
const meImg = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/me_img.png'
const taImg = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/ta_img.png'

// 左侧图片：默认图片（没有昵称时使用）和头像图片（有昵称时使用）
const leftDefaultImg = ref(meImg)
const leftAvatarImg = ref(meImg)
// 右侧图片：默认图片（没有昵称时使用）和头像图片（有昵称时使用）
const rightDefaultImg = ref(taImg)
const rightAvatarImg = ref(taImg)

// 保留 currentLeftImg 和 currentRightImg 用于向后兼容（后续可以移除）
const currentLeftImg = ref(meImg)
const currentRightImg = ref(taImg)

// 邀请模式相关状态
const inviterInfo = ref(null) // 邀请人信息
const inviterPosition = ref(null) // 邀请人位置：'left' 或 'right'
const isInviteShareMode = ref(false) // 是否是邀请分享模式（通过togetherRecordId进入）
const currentTogetherRecordId = ref(null) // 当前一起放屁记录ID

// 最近一次屁友一起打屁记录
const lastFartTogetherRecord = ref(null)
const isCanlastFartTogether = ref(false)

// 检查是否有未完成的记录（等待一起放屁模式）
const hasUnfinishedRecord = computed(() => {
  return lastFartTogetherRecord.value && 
    lastFartTogetherRecord.value.inviteeRecordInfo && 
    lastFartTogetherRecord.value.inviteeRecordInfo.fartType === ''
})
// 当前邀请的用户ID（用于创建一起打屁记录）
const currentInviteeId = ref(null)
const currentInviterSex = ref(1) // 默认1为男
const currentInviteeSex = ref(2) // 默认2为女

// 弹窗引用
const fartPopup = ref()

const nickname_left = ref('')
const nickname_right = ref('')

// 判断是否已完成（两个昵称都有数据）
const isCompleted = computed(() => {
  return nickname_left.value !== '' && nickname_right.value !== ''
})

// 弹窗相关数据
const selectedFartType = ref('响亮型')
const selectedSmellLevel = ref('清香')
const selectedVolume = ref('大当量')
const selectedMood = ref('放松')
const isSubmitting = ref(false)
const gifUrl = ref(`https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`)
const isPopupOpen = ref(false) // 弹窗打开状态

// 屁屁类型选项
const fartTypes = [
  { value: '响亮型', icon: '/static/emj/iangliang.png', label: '响亮型' },
  { value: '轻柔型', icon: '/static/emj/qingrou.png', label: '轻柔型' },
  { value: '无声型', icon: '/static/emj/wusheng.png', label: '无声型' }
]

// 气味等级选项
const smellLevels = [
  { value: '清香', icon: '/static/emj/qingxiang.png', label: '清香' },
  { value: '一般', icon: '/static/emj/yiban.png', label: '一般' },
  { value: '浓烈', icon: '/static/emj/nonglie.png', label: '浓烈' },
  { value: '不确定', icon: '/static/emj/bqd_wmj.png', label: '不确定' }
]

// 放屁当量选项
const volumeLevels = [
  { value: '大当量', icon: '/static/emj/teddy-bear.png', label: '大当量', sizeClass: 'volume-large' },
  { value: '中当量', icon: '/static/emj/teddy-bear.png', label: '中当量', sizeClass: 'volume-medium' },
  { value: '小当量', icon: '/static/emj/teddy-bear.png', label: '小当量', sizeClass: 'volume-small' },
  { value: '微当量', icon: '/static/emj/teddy-bear.png', label: '微当量', sizeClass: 'volume-micro' }
]

// 心情选项
const moods = [
  { value: '放松', icon: '/static/emj/fangsong.png', label: '放松' },
  { value: '开心', icon: '/static/emj/kaixin.png', label: '开心' },
  { value: '尴尬', icon: '/static/emj/ganga.png', label: '尴尬' }
]

// 选择屁屁类型
const selectFartType = (value) => {
  selectedFartType.value = value
}

// 选择气味等级
const selectSmellLevel = (value) => {
  selectedSmellLevel.value = value
}

// 选择放屁当量
const selectVolume = (value) => {
  selectedVolume.value = value
}

// 选择心情
const selectMood = (value) => {
  selectedMood.value = value
}

// 确认打卡
const confirmFart = async () => {
  // 防止重复点击
  if (isSubmitting.value) {
    return
  }

  // 确定邀请人和被邀请人
  // 邀请人ID就是当前用户的ID
  let inviterId = userStore.userInfo?.ID
  // 被邀请人的用户ID不需要填
  let inviteeId = undefined
  let inviterSex = currentInviterSex.value
  let inviteeSex = currentInviteeSex.value

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
      '浓烈': 3,
      '不确定': 0
    }

    // 心情映射
    const moodMap = {
      '放松': 'normal',
      '开心': 'happy',
      '尴尬': 'embarrassed'
    }

    // 当量映射（中文转英文）
    const volumeMap = {
      '大当量': 'large',
      '中当量': 'medium',
      '小当量': 'small',
      '微当量': 'micro'
    }

    // 构建请求数据 - 创建一起打屁记录
    // 只有 inviterId 是必填的，其他字段都是选填
    const requestData = {
      inviterId: inviterId // 邀请人ID就是当前用户的ID（必填）
    }
    
    // 可选字段：只在有值时才添加
    if (inviteeId !== undefined && inviteeId !== null) {
      requestData.inviteeId = inviteeId
    }
    if (inviterSex !== undefined && inviterSex !== null) {
      requestData.inviterSex = inviterSex
    }
    if (inviteeSex !== undefined && inviteeSex !== null) {
      requestData.inviteeSex = inviteeSex
    }
    
    // 邀请人记录信息（选填）
    requestData.inviterRecordInfo = {
      fartType: typeMap[selectedFartType.value],
      mood: moodMap[selectedMood.value],
      smellLevel: smellMap[selectedSmellLevel.value],
      volumeLevel: volumeMap[selectedVolume.value]
    }
    
    // 被邀请人记录信息设为 null
    requestData.inviteeRecordInfo = null

    console.log('提交一起打屁记录:', requestData)

    // 调用API
    const { data } = await createFartTogetherRecordAPI(requestData)

    console.log('打卡结果:', data)

    if (data.code === 0) {
      // 震动反馈
      uni.vibrateShort({
        type: 'heavy'
      })

      // 关闭弹窗（状态会通过 @change 事件更新）
      fartPopup.value.close()

      // 刷新最近一次记录
      loadLastFartTogetherRecord()

      // 发送事件通知其他页面刷新
      uni.$emit('fartRecordAdded')
      uni.$emit('userInfoUpdated')

      // 显示成功提示
      uni.showToast({
        title: ' ✅ 放屁成功',
        icon: 'none',
        duration: 1500
      })

      // 重置表单
      selectedFartType.value = '响亮型'
      selectedSmellLevel.value = '清香'
      selectedVolume.value = '大当量'
      selectedMood.value = '放松'
      currentInviteeId.value = null
      
      // 更新 GIF URL 以重新播放
      gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`
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

// 和TA一起放个屁吧（更新一起放屁记录）
const handleTogetherFart = async () => {
  // 防止重复点击
  if (isSubmitting.value) {
    return
  }

  // 检查是否有一起放屁记录ID
  if (!currentTogetherRecordId.value) {
    uni.showToast({
      title: '缺少一起放屁记录ID',
      icon: 'none'
    })
    return
  }

  // 打开放屁弹窗
  goToFartPage()
}

// 跳转到首页
const goToHomePage = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 更新一起放屁记录（在确认放屁时调用）
const updateTogetherFartRecord = async () => {
  // 防止重复点击
  if (isSubmitting.value) {
    return
  }

  // 检查是否有一起放屁记录ID
  if (!currentTogetherRecordId.value) {
    uni.showToast({
      title: '缺少一起放屁记录ID',
      icon: 'none'
    })
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
      '浓烈': 3,
      '不确定': 0
    }

    // 心情映射
    const moodMap = {
      '放松': 'normal',
      '开心': 'happy',
      '尴尬': 'embarrassed'
    }

    // 当量映射（中文转英文）
    const volumeMap = {
      '大当量': 'large',
      '中当量': 'medium',
      '小当量': 'small',
      '微当量': 'micro'
    }

    // 构建更新数据
    const updateData = {
      inviteeRecordInfo: {
        fartType: typeMap[selectedFartType.value],
        mood: moodMap[selectedMood.value],
        smellLevel: smellMap[selectedSmellLevel.value],
        volumeLevel: volumeMap[selectedVolume.value]
      }
    }

    console.log('更新一起打屁记录:', currentTogetherRecordId.value, updateData)

    // 调用API
    const { data } = await updateFartTogetherRecordAPI(currentTogetherRecordId.value, updateData)

    console.log('更新结果:', data)

    if (data.code === 0) {
      // 震动反馈
      uni.vibrateShort({
        type: 'heavy'
      })

      // 关闭弹窗（状态会通过 @change 事件更新）
      fartPopup.value.close()

      // 保存记录ID
      const recordId = currentTogetherRecordId.value
      
      // 刷新记录
      await loadFartTogetherRecordById(recordId)
      
      // 保持邀请分享模式，因为记录已更新，但用户可能还想查看

      // 发送事件通知其他页面刷新
      uni.$emit('fartRecordAdded')
      uni.$emit('userInfoUpdated')

      // 显示成功提示
      uni.showToast({
        title: ' ✅ 放屁成功',
        icon: 'none',
        duration: 1500
      })

      // 重置表单
      selectedFartType.value = '响亮型'
      selectedSmellLevel.value = '清香'
      selectedVolume.value = '大当量'
      selectedMood.value = '放松'
      
      // 更新 GIF URL 以重新播放
      gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`
    } else {
      uni.showToast({
        title: data.msg || '更新失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('更新失败:', error)
    uni.showToast({
      title: '更新失败，请重试',
      icon: 'none'
    })
  } finally {
    isSubmitting.value = false
  }
}

const switchIdentity = async () => {
  // 如果是邀请分享模式，不允许切换
  if (isInviteShareMode.value) {
    return
  }
  
  // 如果有未完成的记录，需要调用接口更新性别
  if (hasUnfinishedRecord.value) {
    const recordId = lastFartTogetherRecord.value.id
    if (!recordId) {
      console.error('记录ID不存在')
      return
    }
    
    // 交换性别：1为男，2为女
    const newInviterSex = lastFartTogetherRecord.value.inviteeSex || 1
    const newInviteeSex = lastFartTogetherRecord.value.inviterSex || 2
    
    try {
      // 调用新接口，只更新性别字段，不改变其他任何数据
      // id和参数都放在请求体中
      const updateData = {
        id: recordId,
        inviterSex: newInviterSex,
        inviteeSex: newInviteeSex
      }
      
      console.log('切换身份，更新性别:', updateData)
      
      uni.showLoading({
        title: '切换中...'
      })
      const { data } = await updateFartTogetherRecordSexAPI(updateData)
      uni.hideLoading()
      if (data.code === 0) {
        // 更新本地记录
        lastFartTogetherRecord.value.inviterSex = newInviterSex
        lastFartTogetherRecord.value.inviteeSex = newInviteeSex
        
        // 重新加载记录以更新显示
        await loadLastFartTogetherRecord()
        
        // 显示成功提示
        uni.showToast({
          title: '切换成功',
          icon: 'none',
          duration: 1500
        })
      } else {
        uni.showToast({
          title: data.msg || '切换失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('切换身份失败:', error)
      uni.showToast({
        title: '切换失败，请重试',
        icon: 'none'
      })
    }
    return
  }
  
  // 如果没有未完成的记录，使用原来的逻辑
  // 检查是否有昵称
  const hasLeftNickname = nickname_left.value !== ''
  const hasRightNickname = nickname_right.value !== ''
  
  // 如果左右都没有昵称，使用原来的逻辑切换默认图片
  if (!hasLeftNickname && !hasRightNickname) {
    isMe.value = !isMe.value
    leftDefaultImg.value = isMe.value ? meImg : taImg
    rightDefaultImg.value = isMe.value ? taImg : meImg
    // 重置昵称（因为默认图片模式下不显示昵称）
    nickname_left.value = ''
    nickname_right.value = ''
  } else {
    // 如果左右有昵称或头像，交换左右两边的图片和昵称
    const tempLeftDefaultImg = leftDefaultImg.value
    const tempLeftAvatarImg = leftAvatarImg.value
    const tempRightDefaultImg = rightDefaultImg.value
    const tempRightAvatarImg = rightAvatarImg.value
    const tempLeftNickname = nickname_left.value
    const tempRightNickname = nickname_right.value
    
    // 交换昵称
    nickname_left.value = tempRightNickname
    nickname_right.value = tempLeftNickname
    
    // 交换图片
    leftDefaultImg.value = tempRightDefaultImg
    leftAvatarImg.value = tempRightAvatarImg
    rightDefaultImg.value = tempLeftDefaultImg
    rightAvatarImg.value = tempLeftAvatarImg
    
    // 如果交换后没有昵称，确保默认图片是正确的
    if (!nickname_left.value) {
      // 如果原右边是默认图片，保持；如果是头像，设置为 meImg
      if (tempRightDefaultImg === meImg || tempRightDefaultImg === taImg) {
        leftDefaultImg.value = tempRightDefaultImg
      } else {
        leftDefaultImg.value = meImg
      }
    }
    
    if (!nickname_right.value) {
      // 如果原左边是默认图片，切换；如果是头像，设置为 taImg
      if (tempLeftDefaultImg === meImg || tempLeftDefaultImg === taImg) {
        rightDefaultImg.value = tempLeftDefaultImg === meImg ? taImg : meImg
      } else {
        rightDefaultImg.value = taImg
      }
    }
    
    // 更新 isMe 状态（根据当前左边默认图片是否是 meImg 来判断）
    if (leftDefaultImg.value === meImg) {
      isMe.value = true
    } else if (leftDefaultImg.value === taImg) {
      isMe.value = false
    }
  }
}

// 微信登录（使用 code）
const handleWxLogin = async () => {
  try {
    console.log('开始微信 code 登录...')
    
    // 获取微信登录code
    const loginRes = await uni.login()
    const code = loginRes.code
    
    console.log('获取到的 code:', code)
    
    // 调用微信快速登录接口（自动注册）
    const { data } = await wxQuickLoginAPI(code)
    
    console.log('微信登录结果:', data)
    
    if (data.code === 0) {
      // 保存用户信息和token到store
      userStore.setLoginInfo(data.data)
      
      // 发送登录成功事件，通知其他页面可以加载数据了
      uni.$emit('loginSuccess')
      
      console.log('✅ 微信登录成功')
      return true
    } else {
      console.log('❌ 微信登录失败:', data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 微信登录异常:', error)
    return false
  }
}

// 智能登录：优先使用 openid，失败则使用微信 code 登录
const handleSmartLogin = async () => {
  console.log('===== 开始智能登录 =====')
  
  // 1. 检查是否有保存的 openid
  const savedOpenid = userStore.openid
  
  if (savedOpenid) {
    console.log('检测到保存的 openid，尝试快速登录')
    try {
      const { data } = await openidLoginAPI(savedOpenid)
      
      console.log('openid 登录结果:', data.data)
      
      if (data.code === 0) {
        // 保存用户信息和token到store
        userStore.setLoginInfo(data.data)
        
        // 发送登录成功事件，通知其他页面可以加载数据了
        uni.$emit('loginSuccess')
        
        console.log('✅ openid 登录成功')
        return true
      } else {
        console.log('❌ openid 登录失败:', data.msg)
        return await handleWxLogin()
      }
    } catch (error) {
      console.error('❌ openid 登录异常:', error)
      return await handleWxLogin()
    }
  } else {
    return await handleWxLogin()
  }
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const { data } = await getUserInfoAPI()
    if (data.code === 0) {
      // 更新store中的用户信息
      userStore.setUserInfo(data.data)
      console.log('用户信息已更新:', data.data)
    } else {
      console.log('获取用户信息失败，可能需要登录:', data.msg)
      // 如果获取用户信息失败，可能是未登录，尝试自动登录
      const loginSuccess = await handleSmartLogin()
      if (loginSuccess) {
        // 登录成功后重新获取用户信息
        await loadUserInfo()
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 如果获取用户信息失败，可能是未登录，尝试自动登录
    const loginSuccess = await handleSmartLogin()
    if (loginSuccess) {
      // 登录成功后重新获取用户信息
      await loadUserInfo()
    }
  }
}


// 加载最近一次屁友一起打屁记录
const loadLastFartTogetherRecord = async () => {
  try {
    // 检查是否已登录
    if (!userStore.userInfo?.ID) {
      console.log('未登录，跳过加载最近一次屁友一起打屁记录')
      return
    }
    nickname_left.value = ''
    nickname_right.value = ''
    const { data } = await getLastFartTogetherRecordAPI()
    if (data.code === 0 && data.data) {
      lastFartTogetherRecord.value = data.data
      console.log('最近一次屁友一起打屁记录:', data.data)
      
      // 根据记录设置显示
      const currentUserId = userStore.userInfo.ID
      const record = data.data
      
      // 根据性别设置位置：1为男（左边），2为女（右边）
      // 如果邀请人性别是1（男），邀请人在左边；如果被邀请人性别是1（男），被邀请人在左边
      // 如果邀请人性别是2（女），邀请人在右边；如果被邀请人性别是2（女），被邀请人在右边

     if (record.inviterId === currentUserId && record.inviterSex === 1) { 
         // 左边：当前用户，使用默认图片
         leftDefaultImg.value = meImg
         nickname_left.value = ''
         
         // 右边：被邀请人
         nickname_right.value = record.inviteeInfo?.nickname || ''
         if (nickname_right.value) {
           // 有昵称时，设置头像
           rightAvatarImg.value = record.inviteeInfo?.avatar || taImg
         } else {
           // 没有昵称时，只显示默认图片
           rightDefaultImg.value = taImg
         }
     }
  
     if (record.inviterId == currentUserId && record.inviterSex === 2) { 
         // 右边：当前用户，使用默认图片
         rightDefaultImg.value = meImg
         nickname_right.value = ''
         
         
         // 左边：被邀请人
         nickname_left.value = record.inviteeInfo?.nickname || ''
         if (nickname_left.value) {
           // 有昵称时，设置头像
           leftAvatarImg.value = record.inviteeInfo?.avatar || taImg
         } else {
           // 没有昵称时，只显示默认图片
           leftDefaultImg.value = taImg
         }
     }


   if (nickname_left.value != "" && nickname_right.value != "") {
       isCanlastFartTogether.value = false
   } else {
      isCanlastFartTogether.value = true
   }
  
      // if (record.inviterSex === 1) {
      //   // 邀请人是男，在左边
      //   currentLeftImg.value = record.inviterId === currentUserId ? (avatar.value || meImg) : (record.inviterInfo?.avatar || meImg)
      //   currentRightImg.value = record.inviteeId === currentUserId ? (avatar.value || taImg) : (record.inviteeInfo?.avatar || taImg)
      // } else if (record.inviteeSex === 1) {
      //   // 被邀请人是男，在左边
      //   currentLeftImg.value = record.inviteeId === currentUserId ? (avatar.value || meImg) : (record.inviteeInfo?.avatar || meImg)
      //   currentRightImg.value = record.inviterId === currentUserId ? (avatar.value || taImg) : (record.inviterInfo?.avatar || taImg)
      // } else {
      //   // 默认情况：邀请人在左边，被邀请人在右边
      //   currentLeftImg.value = record.inviterId === currentUserId ? (avatar.value || meImg) : (record.inviterInfo?.avatar || meImg)
      //   currentRightImg.value = record.inviteeId === currentUserId ? (avatar.value || taImg) : (record.inviteeInfo?.avatar || taImg)
      // }
    } else {
      console.log('没有最近一次屁友一起打屁记录')
      lastFartTogetherRecord.value = null
      // 重置图片和昵称为默认值
      leftDefaultImg.value = meImg
      rightDefaultImg.value = taImg
      leftAvatarImg.value = meImg
      rightAvatarImg.value = taImg
      nickname_left.value = ''
      nickname_right.value = ''
      isMe.value = true
    }
  } catch (error) {
    console.error('获取最近一次屁友一起打屁记录失败:', error)
    lastFartTogetherRecord.value = null
  }
}

// 获取屁屁类型的中文名称
const getFartTypeName = (fartType) => {
  const typeMap = {
    'loud': '响亮型',
    'soft': '轻柔型',
    'silent': '无声型'
  }
  return typeMap[fartType] || fartType
}

// 根据记录信息获取屁屁类型名称
const getFartTypeNameByRecord = (recordInfo) => {
  if (!recordInfo || !recordInfo.fartType) {
    return '暂无'
  }
  return getFartTypeName(recordInfo.fartType)
}

// 获取气味等级的中文名称
const getSmellLevelName = (smellLevel) => {
  const levelMap = {
    0: '不确定',
    1: '清香',
    2: '一般',
    3: '浓烈'
  }
  return levelMap[smellLevel] || '未知'
}

// 根据记录信息获取气味等级名称
const getSmellLevelNameByRecord = (recordInfo) => {
  if (!recordInfo || recordInfo.smellLevel === undefined || recordInfo.smellLevel === null) {
    return '暂无'
  }
  return getSmellLevelName(recordInfo.smellLevel)
}

// 获取心情的中文名称
const getMoodName = (mood) => {
  const moodMap = {
    'normal': '放松',
    'happy': '开心',
    'embarrassed': '尴尬'
  }
  return moodMap[mood] || mood || '未知'
}

// 根据记录信息获取心情名称
const getMoodNameByRecord = (recordInfo) => {
  if (!recordInfo || !recordInfo.mood) {
    return '暂无'
  }
  return getMoodName(recordInfo.mood)
}

// 获取当量的中文名称
const getVolumeName = (volumeLevel) => {
  const volumeMap = {
    'large': '大当量',
    'medium': '中当量',
    'small': '小当量',
    'micro': '微当量'
  }
  return volumeMap[volumeLevel] || volumeLevel || ''
}

// 根据记录信息获取当量名称
const getVolumeNameByRecord = (recordInfo) => {
  if (!recordInfo || !recordInfo.volumeLevel) {
    return ''
  }
  return getVolumeName(recordInfo.volumeLevel)
}

// 检查记录信息是否有数据
const hasRecordData = (recordInfo) => {
  console.log('recordInfo', recordInfo)
  if (!recordInfo || !recordInfo.fartType) {
    return false
  }
  // 检查是否有任何有效数据
  return !!(recordInfo.fartType || 
            (recordInfo.smellLevel !== undefined && recordInfo.smellLevel !== null) || 
            recordInfo.mood)
}

// 获取邀请按钮文本
const getInviteButtonText = () => {
  // 如果最近一次记录存在，且被邀请人的fartType为空，显示"邀请屁友"
  if (lastFartTogetherRecord.value && 
      lastFartTogetherRecord.value.inviteeRecordInfo && 
      (!lastFartTogetherRecord.value.inviteeRecordInfo.fartType || 
       lastFartTogetherRecord.value.inviteeRecordInfo.fartType === '')) {
    return '邀请屁友'
  }
  return '一起去放屁吧'
}

// 获取左边显示的记录信息（左边显示的是性别为1（男）的记录）
const getLeftRecordInfo = () => {
  if (!lastFartTogetherRecord.value) return null
  
  const record = lastFartTogetherRecord.value
  
  // 如果邀请人性别是1（男），返回邀请人的记录信息
  if (record.inviterSex === 1) {
    return record.inviterRecordInfo
  }
  // 如果被邀请人性别是1（男），返回被邀请人的记录信息
  if (record.inviteeSex === 1) {
    return record.inviteeRecordInfo
  }
  
  return null
}

// 获取右边显示的记录信息（右边显示的是性别为2（女）的记录）
const getRightRecordInfo = () => {
  if (!lastFartTogetherRecord.value) return null
  
  const record = lastFartTogetherRecord.value
  
  // 如果邀请人性别是2（女），返回邀请人的记录信息
  if (record.inviterSex === 2) {
    return record.inviterRecordInfo
  }
  // 如果被邀请人性别是2（女），返回被邀请人的记录信息
  if (record.inviteeSex === 2) {
    return record.inviteeRecordInfo
  }
  
  return null
}

// 打开放屁记录弹窗
const goToFartPage = () => {
  // 重置表单
  selectedFartType.value = '响亮型'
  selectedSmellLevel.value = '清香'
  selectedVolume.value = '大当量'
  selectedMood.value = '放松'
  
  // 更新 GIF URL 以重新播放
  gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`
  
  // 打开弹窗（状态会通过 @change 事件更新）
  fartPopup.value.open()
}

// 处理弹窗状态变化（包括打开和关闭）
const handlePopupChange = (e) => {
  isPopupOpen.value = e.show
}

// 登录成功回调
const onLoginSuccess = () => {
  console.log('收到 loginSuccess 事件，开始加载用户信息')
  loadUserInfo()
}

// 邀请屁友按钮点击 - 打开放屁弹窗
const handleInvite = () => {
  console.log('邀请屁友按钮点击', userStore.userInfo?.ID)
  // 检查是否已登录
  if (!userStore.userInfo?.ID) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  // 打开放屁弹窗
  goToFartPage()
}

// 微信分享配置
onShareAppMessage(() => {
  // 检查是否已登录
  if (!userStore.userInfo?.ID) {
    return {
      title: '邀请你一起放屁！',
      path: '/pages/index/fart'
    }
  }

  // 获取当前页面路径
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentPath = `/${currentPage.route}`

  // 如果有最近一次一起放屁记录，且被邀请人的fartType为空，分享一起放屁记录
  if (lastFartTogetherRecord.value && 
      lastFartTogetherRecord.value.inviteeRecordInfo && 
      (!lastFartTogetherRecord.value.inviteeRecordInfo.fartType || 
       lastFartTogetherRecord.value.inviteeRecordInfo.fartType === '')) {
    // 分享一起放屁记录：只传递一起放屁记录ID
    const sharePath = `${currentPath}?togetherRecordId=${lastFartTogetherRecord.value.id || ''}`
    return {
      title: '邀请你一起放屁！',
      path: sharePath,
      imageUrl: 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/share_bg.png'
    }
  }

  // 默认分享（创建新的一起放屁记录）
  const sharePath = `${currentPath}`
  return {
    title: '邀请你一起放屁！',
    path: sharePath,
    imageUrl: 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/share_bg.png'
  }
})

// 加载邀请人信息
const loadInviterInfo = async (inviteId) => {
  try {
    const { data } = await getUserInfoByIdAPI(inviteId)
    if (data.code === 0 && data.data) {
      inviterInfo.value = {
        id: data.data.id,
        nickname: data.data.nickname || '未知用户',
        avatar: data.data.avatar || 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png'
      }
      return true
    } else {
      console.error('获取邀请人信息失败:', data.msg)
      return false
    }
  } catch (error) {
    console.error('获取邀请人信息异常:', error)
    return false
  }
}

// 加载一起放屁记录数据
const loadFartTogetherRecordById = async (recordId) => {
  try {
    const { data } = await getFartTogetherRecordByIdAPI(recordId)
    console.log("dsdssdss",data)
    if (data.code === 0 && data.data) {
      // 设置记录数据
      const record = data.data
      const currentUserId = userStore.userInfo?.ID
      
      // 检查是否是本人（邀请人不能成为被邀请人）
      // if (record.inviterId === currentUserId) {
      //   uni.showToast({
      //     title: '您是邀请人，不能成为屁友一起放屁',
      //     icon: 'none',
      //     duration: 3000
      //   })
      //   // 恢复到正常界面
      //   isInviteShareMode.value = false
      //   currentTogetherRecordId.value = null
      //   nickname_left.value = ''
      //   nickname_right.value = ''
      //   leftDefaultImg.value = meImg
      //   rightDefaultImg.value = taImg
      //   leftAvatarImg.value = meImg
      //   rightAvatarImg.value = taImg
      //   isMe.value = true
      //   // 加载最近一次记录
      //   loadLastFartTogetherRecord()
      //   return false
      // }
      
      // 设置记录数据
      lastFartTogetherRecord.value = record
      currentTogetherRecordId.value = recordId

      // 根据性别设置显示位置：1为男（左边），2为女（右边）
      if (record.inviterSex === 1) { 
        // 邀请人是男，在左边
        nickname_left.value = record.inviterInfo?.nickname || ''
        if (nickname_left.value) {
          // 有昵称时，设置头像
          leftAvatarImg.value = record.inviterInfo?.avatar || meImg
        } else {
          // 没有昵称时，只显示默认图片
          leftDefaultImg.value = meImg
        }
        
        // 被邀请人在右边
        nickname_right.value = record.inviteeInfo?.nickname || ''
        if (nickname_right.value) {
          // 有昵称时，设置头像
          rightAvatarImg.value = record.inviteeInfo?.avatar || taImg
        } else {
          // 没有昵称时，只显示默认图片
          rightDefaultImg.value = taImg
        }
      } else if (record.inviterSex === 2) { 
        // 邀请人是女，在右边
        nickname_right.value = record.inviterInfo?.nickname || ''
        if (nickname_right.value) {
          // 有昵称时，设置头像
          rightAvatarImg.value = record.inviterInfo?.avatar || taImg
        } else {
          // 没有昵称时，只显示默认图片
          rightDefaultImg.value = taImg
        }
        
        // 被邀请人在左边
        nickname_left.value = record.inviteeInfo?.nickname || ''
        if (nickname_left.value) {
          // 有昵称时，设置头像
          leftAvatarImg.value = record.inviteeInfo?.avatar || meImg
        } else {
          // 没有昵称时，只显示默认图片
          leftDefaultImg.value = meImg
        }
      }



      
      // 设置头像
      // if (record.inviterSex === 1) {
      //   // 邀请人是男，在左边
      //   currentLeftImg.value = record.inviterId === currentUserId ? (avatar.value || meImg) : (record.inviterInfo?.avatar || meImg)
      //   currentRightImg.value = record.inviteeId === currentUserId ? (avatar.value || taImg) : (record.inviteeInfo?.avatar || taImg)
        
      // } else if (record.inviteeSex === 1) {
      //   // 被邀请人是男，在左边
      //   currentLeftImg.value = record.inviteeId === currentUserId ? (avatar.value || meImg) : (record.inviteeInfo?.avatar || meImg)
      //   currentRightImg.value = record.inviterId === currentUserId ? (avatar.value || taImg) : (record.inviterInfo?.avatar || taImg)
      // } else {
      //   // 默认情况：邀请人在左边，被邀请人在右边
      //   currentLeftImg.value = record.inviterId === currentUserId ? (avatar.value || meImg) : (record.inviterInfo?.avatar || meImg)
      //   currentRightImg.value = record.inviteeId === currentUserId ? (avatar.value || taImg) : (record.inviteeInfo?.avatar || taImg)
      // }
      
      return true
    } else {
      console.error('获取一起放屁记录失败:', data.msg)
      return false
    }
  } catch (error) {
    console.error('获取一起放屁记录异常:', error)
    return false
  }
}

// 处理邀请逻辑（只处理 togetherRecordId）
const handleInviteParams = async (togetherRecordId) => {
  console.log('收到邀请参数:', { togetherRecordId })
  isInviteShareMode.value = true
  if (!togetherRecordId) {
    return
  }
  
  // 加载一起放屁记录数据
  const success = await loadFartTogetherRecordById(parseInt(togetherRecordId))
  if (!success) {

    return
  }

 
}

// 页面加载时
onMounted(() => {
  // 检查是否已经有 token（已登录状态）

})

// 页面加载时检查邀请参数
onLoad((options) => {
  console.log('页面加载参数:', options)
  
  // 检查是否有一起放屁记录ID
  if (options.togetherRecordId) {
    isInviteShareMode.value = true
    const togetherRecordId = options.togetherRecordId
    // 延迟处理，确保页面已加载完成
    setTimeout(() => {
      handleInviteParams(togetherRecordId)
    }, 500)

    if (userStore.token) {
    console.log('已有 token，直接加载用户信息')
    loadUserInfo().then(() => {
    
    })
  } else {
    console.log('暂无 token，开始自动登录...')
    handleSmartLogin().then(loginSuccess => {
      if (loginSuccess) {
        loadUserInfo().then(() => {
       
        })
      }
    })
  }
  } else {

    if (userStore.token) {
    console.log('已有 token，直接加载用户信息')
    loadUserInfo().then(() => {
      // 如果不是邀请分享模式，才加载最近一次记录
      if (!isInviteShareMode.value) {
        loadLastFartTogetherRecord()
      }
    })
  } else {
    console.log('暂无 token，开始自动登录...')
    handleSmartLogin().then(loginSuccess => {
      if (loginSuccess) {
        loadUserInfo().then(() => {
          // 如果不是邀请分享模式，才加载最近一次记录
          if (!isInviteShareMode.value) {
            loadLastFartTogetherRecord()
          }
        })
      }
    })
  }
  }
})

// 页面显示时刷新数据
onShow(() => {
  // 检查页面参数（从分享进入时）
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage && currentPage.options) {
    const options = currentPage.options
    
    // 检查是否有一起放屁记录ID
    if (options.togetherRecordId && !isInviteShareMode.value) {
      const togetherRecordId = options.togetherRecordId
      handleInviteParams(togetherRecordId)
      return
    }
  }
  
  // 刷新记录（非邀请分享模式时）
  if (userStore.userInfo?.ID && !isInviteShareMode.value) {
    loadLastFartTogetherRecord()
  }
})

// 页面卸载时移除事件监听
onUnmounted(() => {

})
</script>

<style lang="scss" scoped>
.fart-page {
  height: 100vh;
  background: #FFF2F5;
}

.scroll-view {
  height: 100vh;
  width: 100%;
  position: relative;
  padding-bottom: 140rpx; /* 为底部固定区域留出空间 */
  box-sizing: border-box;
}

.floating-me-view {
  width: 500rpx;
  min-height: 90rpx;
  z-index: 100;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.floating-side-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 160rpx; /* 固定宽度，确保切换自然 */
  box-sizing: border-box;
}

/* 没有昵称时的单独图片样式 */
.floating-me-img {
  width: 100rpx;
  height: 90rpx;
  flex-shrink: 0;
}

.floating-ta-img {
  width: 100rpx;
  height: 90rpx;
  flex-shrink: 0;
}

/* 头像内容包裹容器 - 固定宽度，确保切换自然 */
.avatar-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  width: 100%;
  min-height: 90rpx;
  box-sizing: border-box;
}

/* 邀请人头像样式：圆形、1:1、小一点 */
.avatar-image.inviter-avatar {
  width: 70rpx !important;
  height: 70rpx !important;
  border-radius: 35rpx !important;
  overflow: hidden;
  flex-shrink: 0;
}

.inviter-name {
  font-size: 20rpx;
  color: #333;
  font-weight: 500;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.switch-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}



.switch-name-text {
  font-size: 24rpx;
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 8rpx;
}
.img-center {
  width: 40rpx;
  height: 40rpx;
}
.content-wrapper {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.top-image {
  width: 500rpx;
  height: 197rpx;
  display: block;
  margin: 0 auto;
}

.bg-image-wrapper {
  position: relative;
  width: 670rpx;
  height: 686rpx;
  margin: 0 auto;
 

}

.bg-image {
 
  position: absolute;
  top: 0;
  left: 0;
  width: 670rpx;
  height: 568rpx;
}

.floating-image {
  position: absolute;
  width: 623rpx;
  height: 246rpx;
  top: 0;
  left: 0;
  z-index: 10;
}

.floating-image-wrapper {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  z-index: 20;
  width: 580rpx;

}

.man-image {
  width: 302rpx;
  height: 686rpx;
  flex-shrink: 0;
}

.girl-image {
  width: 264rpx;
  height: 622rpx;
  flex-shrink: 0;
  margin-top: 60rpx;
}

.line-img {
  position: absolute;
  width: 635rpx;
  height: 404rpx;
  top: 166rpx;
  left: 50%;
  margin-left: -30rpx;
  transform: translateX(-50%);
  z-index: 30;
}

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

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.invite-btn {
  height: 80rpx;
  padding: 0 40rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.3);
  border: none;
  line-height: 80rpx;
  font-size: 0;
  margin-left: auto;
  flex-shrink: 0;
}

.invite-btn::after {
  border: none;
}

.invite-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

.floating-info-view {
  width: 670rpx;
  margin: 0 auto;
}

.last-record-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}


.no-record-view {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.go-fart-btn {
  height: 70rpx;
  padding: 0 50rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.3);
  border: none;
  line-height: 70rpx;
  font-size: 0;
}

.go-fart-btn::after {
  border: none;
}

.go-fart-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

.inviter-record-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 0;
}

.inviter-record-text {
  font-size: 26rpx;
  color: #666;
  font-weight: 400;
  text-align: center;
}

.go-fart-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.together-record-info {
  display: flex;
  justify-content: space-between;
  gap: 30rpx;
  
  box-sizing: border-box;
  margin-top: 40rpx;
}

.record-item {
  border: 4rpx solid #FD788C;
  border-radius: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  width: 100%;
  padding: 20rpx;
}
.record-item-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  
}
.record-label {
  font-size: 20rpx;
  color: #666;
  font-weight: 400;
}

.record-type-wrapper {
  display: flex;
  align-items: center;
}

.record-type {
  font-size: 24rpx;
  color: #FF6B9D;
  font-weight: 600;
   margin-left: 10rpx;
   margin-right: 10rpx;
}

.record-type-gap {
  width: 0rpx;
}

/* 弹窗样式 */
.popup-content {
  background: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx 32rpx;
  max-height: 80vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.popup-header {
  text-align: center;

  padding-bottom: 20rpx;

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

.section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #0d1b14;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.switch-container {
  width: 100%;
}

.switch-scroll-view {
  width: 100%;
  white-space: nowrap;
}

.switch-wrapper {
  display: flex;
  gap: 16rpx;
  flex-wrap: nowrap;
}

.switch-option {
  padding: 10rpx 40rpx;
  background: #fffbfa;
  border: 2rpx solid #e8e8e8;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  gap: 20rpx;
  flex-shrink: 0;
}

.switch-option::after {
  border: none;
}

.switch-option:active {
  transform: scale(0.98);
}

.switch-option.selected {
  background: linear-gradient(135deg, #A8E6CF 0%, #F9F871 100%);
  border-color: #A8E6CF;

}

.switch-text {
 

  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.switch-emoji-img {
  width: 48rpx;
  height: 48rpx;
}

/* 放屁当量图片大小 - 最大不超过原有的48rpx */
.switch-emoji-img.volume-large {
  width: 48rpx;
  height: 48rpx;
}

.switch-emoji-img.volume-medium {
  width: 42rpx;
  height: 42rpx;
}

.switch-emoji-img.volume-small {
  width: 36rpx;
  height: 36rpx;
}

.switch-emoji-img.volume-micro {
  width: 30rpx;
  height: 30rpx;
}

.switch-emoji-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}
.input-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #fffbfa;
  border-radius: 18rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.input-emoji-img {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.text-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  min-width: 0;
}

.confirm-button {
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

.confirm-button::after {
  border: none;
}

.confirm-button:active:not(:disabled) {
  transform: scale(0.98);
}

.confirm-button:disabled {
  opacity: 0.6;
}

.confirm-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
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
