<template>
  <view class="edit-container">
    <scroll-view class="edit-scroll" scroll-y="true">
      <!-- 头部装饰 -->
      <view class="header-decoration">
        <text class="header-title">编辑资料</text>
        <text class="header-subtitle">完善你的个人信息</text>
      </view>

      <!-- 表单区域 -->
      <view class="form-wrapper">
        <!-- 头像编辑 -->
        <view class="form-section">
          <view class="section-label">头像</view>
          <view class="avatar-section">
            <view class="avatar-wrapper" @click="chooseAvatar">
              <image 
                :src="avatarUrl || defaultAvatar" 
                class="avatar-image" 
                mode="aspectFill"
              />
              <view class="avatar-mask">
                <text class="mask-icon">📷</text>
                <text class="mask-text">更换头像</text>
              </view>
            </view>
            <text class="avatar-tip">点击头像可以更换</text>
          </view>
        </view>

        <!-- 昵称编辑 -->
        <view class="form-section">
          <view class="section-label">昵称</view>
          <view class="input-wrapper">
            <input 
              v-model="nickname" 
              type="nickname" 
              maxlength="10" 
              placeholder="请输入昵称" 
              class="form-input"
              @input="onNicknameInput"
            />
            <text class="char-count">{{ nickname.length }}/10</text>
          </view>
        </view>
      </view>

      <!-- 保存按钮 -->
      <view class="footer">
        <button 
          class="save-btn" 
          :class="{ disabled: isSubmitting || !canSave }"
          :disabled="isSubmitting || !canSave"
          @click="handleSave"
        >
          <text class="btn-text">{{ isSubmitting ? '保存中...' : '保存' }}</text>
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfoAPI, updateUserInfoAPI } from '@/src/api/user.js'
import { uploadImageAPI } from '@/src/api/upload.js'
import { useUserStore } from '@/src/stores/user.js'

const userStore = useUserStore()

// 默认头像
const defaultAvatar = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png'

// 响应式数据
const avatarUrl = ref('')
const nickname = ref('')
const isSubmitting = ref(false)
const originalNickname = ref('')
const originalAvatar = ref('')

// 是否可以保存（有变化时才能保存）
const canSave = computed(() => {
  const nicknameChanged = nickname.value.trim() !== originalNickname.value
  const avatarChanged = avatarUrl.value !== originalAvatar.value
  return (nicknameChanged || avatarChanged) && nickname.value.trim().length > 0
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const { data } = await getUserInfoAPI()
    if (data.code === 0) {
      const userInfo = data.data
      nickname.value = userInfo.nickname || ''
      avatarUrl.value = userInfo.avatar || defaultAvatar
      originalNickname.value = userInfo.nickname || ''
      originalAvatar.value = userInfo.avatar || defaultAvatar
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    })
  }
}

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      await uploadAvatar(tempFilePath)
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  })
}

// 上传头像
const uploadAvatar = async (filePath) => {
  uni.showLoading({
    title: '上传中...',
    mask: true
  })
  
  try {
    const result = await uploadImageAPI(filePath)
    
    if (result.code === 0) {
      avatarUrl.value = result.data.url
      uni.showToast({
        title: '上传成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: result.msg || '上传失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 昵称输入处理
const onNicknameInput = (e) => {
  nickname.value = e.detail.value
}

// 保存用户信息
const handleSave = async () => {
  if (isSubmitting.value || !canSave.value) {
    return
  }

  // 验证昵称
  const trimmedNickname = nickname.value.trim()
  if (!trimmedNickname) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }

  if (trimmedNickname.length > 10) {
    uni.showToast({
      title: '昵称不能超过10个字符',
      icon: 'none'
    })
    return
  }

  isSubmitting.value = true

  try {
    const { data } = await updateUserInfoAPI({
      nickname: trimmedNickname,
      avatar: avatarUrl.value
    })

    if (data.code === 0) {
      // 更新 store 中的用户信息
      await loadUserInfo()
      userStore.setUserInfo({
        ...userStore.userInfo,
        nickname: trimmedNickname,
        avatar: avatarUrl.value
      })

      // 发送事件通知其他页面刷新
      uni.$emit('userInfoUpdated')

      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: data.msg || '保存失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 页面加载
onMounted(() => {
  loadUserInfo()
})

// 页面显示时刷新数据
onShow(() => {
  loadUserInfo()
})
</script>

<style scoped>
.edit-container {
  height: 100vh;
  background: linear-gradient(180deg, #A8E6CF 0%, #FFFACD 100%);
  box-sizing: border-box;
}

.edit-scroll {
  height: 100%;
  padding: 0 32rpx;
  box-sizing: border-box;
}

/* 头部装饰 */
.header-decoration {
  padding: 90rpx 0 40rpx;
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
  color: #2E7D32;
}

/* 表单区域 */
.form-wrapper {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  width: 100%;
}

.form-section {
  margin-bottom: 48rpx;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #1B5E20;
  margin-bottom: 24rpx;
  display: block;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.avatar-wrapper {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 6rpx solid white;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.15);
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:active .avatar-mask {
  opacity: 1;
}

.mask-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.mask-text {
  font-size: 24rpx;
  color: white;
  font-weight: 500;
}

.avatar-tip {
  font-size: 24rpx;
  color: #666;
}

/* 输入区域 */
.input-wrapper {
  position: relative;
  background: rgba(168, 230, 207, 0.1);
  border-radius: 20rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(168, 230, 207, 0.3);
  box-sizing: border-box;
  width: 100%;
}

.form-input {
  width: 100%;
  font-size: 28rpx;
  color: #1B5E20;
  background: transparent;
  border: none;
  outline: none;
}

.char-count {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  font-size: 22rpx;
  color: #999;
}

/* 底部按钮 */
.footer {
  padding: 0 0 60rpx;
  box-sizing: border-box;
  width: 100%;
}

.save-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #A8E6CF 0%, #8af5bf 100%);
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(168, 230, 207, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.save-btn::after {
  border: none;
}

.save-btn:active:not(.disabled) {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(168, 230, 207, 0.5);
}

.save-btn.disabled {
  background: linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%);
  box-shadow: none;
  opacity: 0.6;
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #1B5E20;
}

.save-btn.disabled .btn-text {
  color: #999;
}
</style>

