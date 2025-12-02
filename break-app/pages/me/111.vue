<template>
  <view class="container">

    <!-- 表单组件 -->
    <view class="form-wrapper">
      <view class="form-container">
         <view v-if="!avatarUrl" class="avatar-tip">
               <text class="tip-text">✨ 请上传头像，让拼团伙伴们认识您</text>
             </view>
        <view class="form-item">
          <view class="form-label">头像</view>
          <view class="avatar-wrapper">
            <button class="btn-normal" open-type="chooseAvatar"  @chooseavatar="onChooseAvatar"  >
              <image :src="avatarUrl || '/static/me/default-avatar.png'" class="avatar-image"  mode="aspectFill"></image>
            </button>
         
          </view>
        </view>
        <view class="form-item">
          <view class="form-label">昵称</view>
          <input v-model="nickName" type="nickname" maxlength="30" placeholder="请输入昵称" @input="onInputNickName"
            @blur="onInputNickName" class="form-input" />
        </view>
      </view>
    </view>
    <!-- 操作按钮 -->
    <view class="footer">
      <view class="btn-wrapper">
        <view class="btn-item btn-item-main" :class="{ disabled }" @click="handleSubmit()">保存</view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { updateUserProfileAPI, userProfileAPI } from '@/sheep/api/home.js'
import { stsTokenAPI } from '@/sheep/api/user.js'
import { Base64 } from './base64.js'
import CryptoJS from 'crypto-js'

export default {
  name: 'Edit',
  setup() {
    // 响应式数据
    const disabled = ref(false)
    const avatarUrl = ref('')
    const avatarId = ref('')
    const nickName = ref('')
    const tempFile = ref(null)
    const oss = ref({})

    // 获取当前用户信息
    const getUserInfo = async () => {
      try {
        const { data } = await userProfileAPI({
          // 这里可以传入用户ID等参数
        })
        console.log('用户信息:', data)
        if(data.code === 0) {
          // 设置用户信息
          if (data.data.avatar) {
            avatarUrl.value = data.data.avatar
            avatarId.value = data.data.avatar
          }
          if (data.data.nickname) {
            nickName.value = data.data.nickname
            console.log('用户昵称:', data.data.nickname)
          }
        } else {
          console.log('获取用户信息失败:', data.msg)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    // 点击头像按钮事件
    const onClickAvatar = () => {
      // 选择图片
      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          uploadImage(res.tempFilePaths[0])
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

    // 选择微信头像事件（保留但不再使用）
    const onChooseAvatar = ({ detail }) => {
      // avatarUrl.value = detail.avatarUrl
      // tempFile.value = { path: avatarUrl.value }
      // console.log("detail.avatarUrl",detail.avatarUrl)
      // // 如果是微信头像，直接使用，不需要上传
      // if (detail.avatarUrl) {
      //   avatarId.value = detail.avatarUrl
      // }
      uploadImage(detail.avatarUrl)
    }

    // 选择图片（从相册选择或拍照）
    const chooseImage = (sourceType = 'both') => {
      let sourceTypes = []
      if (sourceType === 'camera') {
        sourceTypes = ['camera']
      } else if (sourceType === 'album') {
        sourceTypes = ['album']
      } else {
        sourceTypes = ['album', 'camera']
      }

      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: sourceTypes,
        success: (res) => {
          uploadImage(res.tempFilePaths[0])
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

    // 上传图片到OSS
    const uploadImage = async (filePath) => {
      uni.showLoading({
        mask: true,
        title: '上传中...'
      })
      
      try {
        const basePath = 'avatar/'
        const fileName = new Date().getTime() + '.png'
        const timestamp = getCurrentFormatDateTime()
        let key = `${basePath}${timestamp}/${fileName}`

        const res = await stsTokenAPI()
        if (res.data.code === 0) {
          oss.value = res.data.data
          const date = new Date()
          date.setHours(date.getHours() + 1)
          const policyText = {
            expiration: date.toISOString(),
            conditions: [
              ["content-length-range", 0, 1024 * 1024 * 1024],
            ],
          }
          const policy = Base64.encode(JSON.stringify(policyText))
          const signature = computeSignature(oss.value.accesskey_secret, policy)

          uni.uploadFile({
            url: oss.value.bucket_endpoint,
            filePath: filePath,
            name: 'file',
            formData: {
              key: key,
              region: oss.value.region,
              policy,
              signature,
              OSSAccessKeyId: oss.value.accesskey_id,
              success_action_status: '200',
              'x-oss-security-token': oss.value.security_token
            },
            success: (res) => {
              uni.hideLoading()
              if (res.statusCode === 200) {
                const imageUrl = `${oss.value.bucket_endpoint}/${key}`
                avatarUrl.value = imageUrl
                avatarId.value = imageUrl
                console.log('头像上传成功:', imageUrl)
              } else {
                uni.showToast({
                  title: '上传失败',
                  icon: 'none'
                })
              }
            },
            fail: (err) => {
              console.log("上传失败：", err)
              uni.hideLoading()
              uni.showToast({
                title: '上传失败',
                icon: 'none'
              })
            }
          })
        } else {
          uni.hideLoading()
          uni.showToast({
            title: '获取上传凭证失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('上传图片失败:', error)
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      }
    }

    // 获取当前格式化日期时间
    const getCurrentFormatDateTime = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${year}${month}${day}_${hours}${minutes}${seconds}`
    }

    // 计算签名
    const computeSignature = (accessKeySecret, policy) => {
      const bytes = CryptoJS.enc.Utf8.parse(policy)
      const signature = CryptoJS.HmacSHA1(bytes, accessKeySecret).toString(CryptoJS.enc.Base64)
      return signature
    }


    // 确认修改
    const handleSubmit = async () => {
      // 判断是否重复提交
      if (disabled.value === true) return
      
      // 简单验证
      if (!nickName.value.trim()) {
        uni.showToast({
          title: '请输入用户昵称',
          icon: 'none'
        })
        return
      }

      // 头像验证
      if (!avatarUrl.value || avatarUrl.value === '/static/me/default-avatar.png') {
        uni.showToast({
          title: '请上传您的头像',
          icon: 'none'
        })
        return
      }
      
      // 按钮禁用
      disabled.value = true
       
      try {
        // 调用更新用户信息接口
        const { data } = await updateUserProfileAPI({
          nickname: nickName.value,
          avatar: avatarId.value || avatarUrl.value
        })
        console.log('更新用户信息结果11:', {
          nickname: nickName.value,
          avatar: avatarId.value || avatarUrl.value
        })
        console.log('更新用户信息结果:', data)
        if (data.code === 0) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          // 发送事件通知其他页面刷新用户信息
          uni.$emit('refreshUserInfo', {
            nickname: nickName.value,
            avatar: avatarId.value || avatarUrl.value
          })
          setTimeout(() => {
            disabled.value = false
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: data.msg || '保存失败',
            icon: 'none'
          })
          disabled.value = false
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
        disabled.value = false
      }
    }

    // 绑定昵称输入框 (用于微信小程序端快速填写昵称能力)
    const onInputNickName = (val) => {
      console.log('onInputNickName', val)
      if (val) {
        nickName.value = val.detail.value
      }
    }

    // 页面加载时获取用户信息
    onLoad(() => {
      getUserInfo()
    })

    return {
      disabled,
      avatarUrl,
      avatarId,
      nickName,
      tempFile,
      getUserInfo,
      onClickAvatar,
      onChooseAvatar,
      chooseImage,
      uploadImage,
      handleSubmit,
      onInputNickName
    }
  }
}
</script>

<style>
  page {
    background: #f7f8fa;
  }
</style>
<style lang="scss" scoped>

  .page-title {
    width: 94%;
    margin: 0 auto;
    padding-top: 40rpx;
    font-size: 28rpx;
    color: rgba(69, 90, 100, 0.6);
  }
  .avatar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
  }

  .avatar-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
  }

  .avatar-tip {
    padding: 12rpx 0;
   
  }

  .tip-text {
    font-size: 26rpx;
    color: #1A1A1A;
    text-align: center;
    line-height: 1.4;
    font-weight: 400;
  }
  .form-wrapper {
    margin: 20rpx auto 20rpx auto;
    padding: 0 40rpx;
    width: 94%;
 
    border-radius: 16rpx;
    background: #fff;
  }
  .container {
   height: 100vh;
   background-color: #ffffff;
   overflow: hidden;
  }
  .form-container {
    padding: 20rpx 0;
  }

  .form-item {
    display: flex;
    align-items: center;
    padding: 40rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
 
  }

  .form-label {
    width: 140rpx;
    font-size: 28rpx;
    color: #333;
    flex-shrink: 0;
  }

  .form-input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    border: none;
    outline: none;
    background: transparent;
  }

  .btn-normal {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    line-height: 1;
    outline: none;
    box-shadow: none;
    border-radius: 0;
    position: relative;
    overflow: visible;
  }

  .btn-normal::after {
    border: none;
  }

  /* 底部操作栏 */

  .footer {
    margin-top: 80rpx;

    .btn-wrapper {
      height: 100%;
      // display: flex;
      // align-items: center;
      padding: 0 20rpx;
    }

    .btn-item {
      flex: 1;
      font-size: 28rpx;
      height: 86rpx;
      color: #fff;
      border-radius: 50rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .btn-item-wechat {
      background: #0ba90b;
      margin-bottom: 26rpx;
    }

    .btn-item-main {
      background: linear-gradient(90deg, #FF5F62 0%, #FF3119 100%);
      color: #ffffff;

      // 禁用按钮
      &.disabled {
        opacity: 0.6;
      }
    }

  }
</style>