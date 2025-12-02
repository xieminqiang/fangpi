<template>
  <view class="login-container">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 主要内容区域 -->
    <view class="main-content g-flex-col g-col-center ">
      <!-- Logo区域 -->
      <view class="logo-section g-flex-col g-col-center g-row-center">
        <image 
          class="logo-image" 
          src="/static/home/logo.jpg" 
          mode="aspectFit"
        ></image>
        <text class="app-name">蓝球</text>
        <text class="app-slogan">让运动更简单</text>
      </view>
      
      <!-- 登录按钮区域 -->
      <view class="login-section g-flex-col g-col-center">
        <button 
          class="phone-login-btn"
          open-type="getPhoneNumber" 
          @getphonenumber="getPhoneNumber"
        >
          <text class="btn-text">手机号快捷登录</text>
        </button>
        
        <!-- <text class="privacy-text">
          登录即表示同意
          <text class="privacy-link">《用户协议》</text>
          和
          <text class="privacy-link">《隐私政策》</text>
        </text> -->
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { wxLoginAPI } from '@/src/api/user.js'
import { useUserStore } from '@/src/stores/user.js'

export default {
  name: 'LoginPage',
  setup() {
    const statusBarHeight = ref(0)
    const userStore = useUserStore()
    
    // 获取状态栏高度
    onMounted(() => {
      const systemInfo = uni.getSystemInfoSync()
      statusBarHeight.value = systemInfo.statusBarHeight || 0
    })
    
    // 保存用户信息
    const saveUserInfo = (data) => {
      userStore.setUserInfo(data)
    }
    
    // 处理手机号授权
    const getPhoneNumber = async (e) => {
      console.log('手机号授权结果:', e)
      
      if (e.detail.errMsg === 'getPhoneNumber:ok') {
        // 授权成功，处理手机号获取逻辑
        console.log('授权成功，加密数据:', e.detail)
        
        uni.showLoading({
          title: '登录中...'
        })
        
        try {
          // 获取微信登录code
          const loginRes = await uni.login()
          const code = loginRes.code
          
          // 调用登录接口
          const {
            data
          } = await wxLoginAPI({
            login_code: code,
            phone_code: e.detail.code
          })
          
          console.log("返回的data ===>", data)
          uni.hideLoading()
          
          if (data.code === 0) {
            saveUserInfo(data.data.token_info)
            
            uni.showToast({
              title: '登录成功',
              icon: 'none'
            })
            
            setTimeout(() => {
              uni.navigateBack({
                delta: 1 // 返回的页面数，默认值为1，即返回上一级页面
              })
            }, 1000)
          } else {
            uni.showToast({
              title: '登录失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('登录失败:', error)
          uni.hideLoading()
          uni.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          })
        }
      } else {
        // 授权失败
        uni.showToast({
          title: '授权失败，请重试',
          icon: 'none'
        })
      }
    }
    
    return {
      statusBarHeight,
      getPhoneNumber
    }
  }
}
</script>

<style lang="scss" scoped>


.login-container {
  width: 100%;
  min-height: 100vh;
  background-color: #FFFFFF;
  position: relative;
}

.status-bar {
  width: 100%;
  background-color: #FFFFFF;
}

.main-content {
  width: 100%;
  min-height: calc(100vh - var(--status-bar-height));
  padding: 0 60rpx;
  box-sizing: border-box;
}

.logo-section {
  margin-top: 120rpx;
  margin-bottom: 160rpx;
  
  .logo-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 40rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  }
  
  .app-name {
    font-size: 48rpx;
    font-weight: bold;
    color: #26BF6E;
    margin-bottom: 16rpx;
    letter-spacing: 2rpx;
  }
  
  .app-slogan {
    font-size: 28rpx;
    color: #999999;
    letter-spacing: 1rpx;
  }
}

.login-section {
  width: 100%;
  
  .phone-login-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #26BF6E 0%, #20A55A 100%);
    border-radius: 44rpx;
    border: none;
    margin-bottom: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(38, 191, 110, 0.3);
    position: relative;
    overflow: hidden;
    
    &::after {
      border: none;
    }
    
    .btn-text {
      font-size: 32rpx;
      font-weight: 500;
      color: #FFFFFF;
      letter-spacing: 1rpx;
    }
    
    // 按钮点击效果
    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 16rpx rgba(38, 191, 110, 0.4);
    }
  }
  
  .privacy-text {
    font-size: 24rpx;
    color: #999999;
    text-align: center;
    line-height: 1.6;
    
    .privacy-link {
      color: #26BF6E;
      text-decoration: underline;
    }
  }
}


</style>