<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { wxQuickLoginAPI, openidLoginAPI } from '@/src/api/user.js'
import { useUserStore } from '@/src/stores/user.js'

// 使用 user store
const userStore = useUserStore()


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
      
      console.log('✅ 微信登录成功，已发送 loginSuccess 事件')
      
      // uni.showToast({
      //   title: '登录成功',
      //   icon: 'success'
      // })
    } else {
      console.log('❌ 微信登录失败:', data.msg)
      // uni.showToast({
      //   title: data.msg || '登录失败',
      //   icon: 'none'
      // })
    }
  } catch (error) {
    console.error('❌ 微信登录异常:', error)
    // uni.showToast({
    //   title: '登录失败，请重试',
    //   icon: 'none'
    // })
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
      
      console.log('✅ openid 登录成功，已发送 loginSuccess 事件')
      
    } else {
      console.log('❌ openid 登录失败:', data.msg)
      await handleWxLogin()
    }
  } catch (error) {
    console.error('❌ openid 登录异常:', error)
    await handleWxLogin()
  }
  } else {
    await handleWxLogin()
  }



  
  // 2. 使用微信 code 登录
 
}

// 应用启动时执行
onLaunch(() => {
  console.log('App Launch')
  // handleSmartLogin()
   handleSmartLogin()
})

// 应用显示时执行
onShow(() => {
  console.log('App Show')
   
})

// 应用隐藏时执行
onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 全局样式已在 main.js 中导入 */
page {
  -webkit-overflow-scrolling: touch; // 解决ios滑动不流畅
  height: 100vh;
  width: 100vw;
  background-color: #F8F8F8;
  color: #1A1A1A;
  overflow: hidden;
}
::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
  display: none;
}
</style>
