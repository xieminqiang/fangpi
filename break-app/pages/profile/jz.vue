<template>
  <scroll-view class="donation-container" scroll-y="true">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">支持我继续创作！</text>
    </view>

    <!-- Content -->
    <view class="content">
      <!-- Thank You Message -->
      <view class="section">
        <text class="section-text">
          亲爱的朋友，非常感谢您使用"放屁档案"小程序！作为个人开发者，我很荣幸能够为您带来一些小小的欢乐。如果您在使用过程中感受到了些许乐趣，并且愿意支持我继续改进和优化这个小程序，我会非常感激。当然，这完全取决于您的意愿，无论是否支持，我都衷心感谢您的使用和陪伴。如果您愿意，可以通过下方的方式表达您的支持，每一份善意都会成为我继续前行的温暖动力。
        </text>
      </view>

      <!-- Donation Purpose -->
      <view class="section">
        <text class="section-title">你的捐赠将用于：</text>
        <view class="purpose-list">
          <view class="purpose-item">
            <text class="purpose-icon">💪</text>
            <text class="purpose-text">支持我的个人开发和创作动力</text>
          </view>
          <view class="purpose-item">
            <text class="purpose-icon">✨</text>
            <text class="purpose-text">改进和优化小程序的功能</text>
          </view>
          <view class="purpose-item">
            <text class="purpose-icon">🎉</text>
            <text class="purpose-text">让更多人也能享受记录放屁的乐趣</text>
          </view>
        </view>
      </view>

      <!-- QR Code Section -->
      <view class="section">
        <text class="section-title">捐赠二维码说明：</text>
        <text class="section-text">
          如果您愿意支持我，可以扫描下方的二维码。当然，这完全不是必须的，您能够使用这个小程序已经让我很开心了。如果收到您的支持，我会非常感激，这对我来说是莫大的鼓励。再次感谢您的理解和支持！
        </text>
        <!-- Action Buttons -->
        <view class="action-buttons-container">
          <button class="action-btn download-btn" @click="downloadQRCode">
          
            <text class="btn-text">保存二维码</text>
          </button>
          <button class="action-btn share-btn" @click="shareToFriend">
      
            <text class="btn-text">分享屁友捐赠</text>
          </button>
        </view>
        <view class="qr-code-container">
          <image 
            class="qr-code-image" 
            src="https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/small_wx.JPG" 
            mode="aspectFit"
            @click="previewQRCode"
          />
          <text class="qr-code-hint">点击图片可放大查看</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
// 返回上一页
const handleBack = () => {
  uni.navigateBack({
    delta: 1
  })
}

// 预览二维码大图
const previewQRCode = () => {
  const largeImageUrl = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG'
  uni.previewImage({
    urls: [largeImageUrl],
    current: largeImageUrl
  })
}

// 分享给微信好友
const shareToFriend = () => {
  const imageUrl = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG'
  
  // 先下载图片到本地
  uni.showLoading({
    title: '准备分享...',
    mask: true
  })
  
  uni.downloadFile({
    url: imageUrl,
    success: (downloadRes) => {
      uni.hideLoading()
      if (downloadRes.statusCode === 200) {
        // 预览图片，用户可以长按分享
        uni.previewImage({
          urls: [downloadRes.tempFilePath],
          current: downloadRes.tempFilePath,
          success: () => {
            // 提示用户长按图片可以分享
            setTimeout(() => {
              uni.showToast({
                title: '长按图片可分享',
                icon: 'none',
                duration: 2000
              })
            }, 500)
          }
        })
      } else {
        uni.showToast({
          title: '准备失败',
          icon: 'none',
          duration: 2000
        })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({
        title: '准备失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

// 下载保存二维码图片
const downloadQRCode = () => {
  const imageUrl = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG'
  
  // 显示加载提示
  uni.showLoading({
    title: '正在下载...',
    mask: true
  })
  
  // 先检查授权
  uni.getSetting({
    success: (res) => {
      if (res.authSetting['scope.writePhotosAlbum'] === false) {
        // 用户之前拒绝了授权，需要引导用户开启
        uni.showModal({
          title: '需要授权',
          content: '需要您授权保存图片到相册',
          confirmText: '去设置',
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.openSetting()
            }
          }
        })
        uni.hideLoading()
        return
      }
      
      // 下载图片
      uni.downloadFile({
        url: imageUrl,
        success: (downloadRes) => {
          if (downloadRes.statusCode === 200) {
            // 保存到相册
            uni.saveImageToPhotosAlbum({
              filePath: downloadRes.tempFilePath,
              success: () => {
                uni.hideLoading()
                uni.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
                })
              },
              fail: (err) => {
                uni.hideLoading()
                if (err.errMsg.includes('auth deny')) {
                  // 用户拒绝了授权
                  uni.showModal({
                    title: '需要授权',
                    content: '需要您授权保存图片到相册',
                    confirmText: '去设置',
                    success: (modalRes) => {
                      if (modalRes.confirm) {
                        uni.openSetting()
                      }
                    }
                  })
                } else {
                  uni.showToast({
                    title: '保存失败',
                    icon: 'none',
                    duration: 2000
                  })
                }
              }
            })
          } else {
            uni.hideLoading()
            uni.showToast({
              title: '下载失败',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({
            title: '下载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  })
}
</script>

<style scoped>
.donation-container {
  height: 100vh;
  background: linear-gradient(180deg, #FFFACD 0%, #FFE4E1 100%);
}

.header {
  padding: 120rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.back-btn:active {
  transform: translateY(-50%) scale(0.95);
  background: rgba(255, 255, 255, 0.9);
}

.back-icon {
  font-size: 40rpx;
  color: #5D5D5D;
  font-weight: bold;
}

.header-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #5D5D5D;
  display: block;
}

.content {
  padding: 0 32rpx 60rpx;
}

.section {
  margin-bottom: 60rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #5D5D5D;
  display: block;
  margin-bottom: 24rpx;
}

.section-text {
  font-size: 28rpx;
  color: #5D5D5D;
  line-height: 1.8;
  display: block;
  margin-bottom: 24rpx;
}

.purpose-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 24rpx;
}

.purpose-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.purpose-icon {
  font-size: 40rpx;
  flex-shrink: 0;
}

.purpose-text {
  font-size: 28rpx;
  color: #5D5D5D;
  line-height: 1.6;
  flex: 1;
}

.action-buttons-container {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 24rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 240rpx;
  max-width: 300rpx;
}

.action-btn::after {
  border: none;
}

.action-btn:active {
  transform: scale(0.95);
}

.download-btn {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.download-btn:active {
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.4);
}

.share-btn {
  background: linear-gradient(135deg, #FF9800, #FFC107);
  box-shadow: 0 4rpx 12rpx rgba(255, 152, 0, 0.3);
}

.share-btn:active {
  box-shadow: 0 2rpx 8rpx rgba(255, 152, 0, 0.4);
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 26rpx;
  color: white;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40rpx;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

.qr-code-image {
  width: 500rpx;
  height: 500rpx;
  border-radius: 16rpx;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.qr-code-image:active {
  transform: scale(0.98);
}

.qr-code-hint {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24rpx;
  color: #999;
  background: rgba(255, 255, 255, 0.8);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}
</style>