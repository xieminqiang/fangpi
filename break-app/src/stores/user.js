import { defineStore } from 'pinia'

// 定义 Store
export const useUserStore = defineStore('user',{
  // 定义 state
  state: () => ({
    userInfo: {},
    token: '',
    tokenExpireTime: 0,
    openid: '' // 微信 openid，用于快速登录
  }),
  // 定义 getters
  getters: {
    // 获取用户昵称
    nickname: (state) => state.userInfo?.nickname || '新手屁屁',
    // 获取用户头像
    avatar: (state) => state.userInfo?.avatar || 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png',
    // 获取用户等级
    level: (state) => state.userInfo?.level || 1,
    levelName: (state) => state.userInfo?.levelName || '新手屁民',
    // 获取累计放屁次数
    totalFarts: (state) => state.userInfo?.totalFarts || 0,
    // 获取经验值
    experience: (state) => state.userInfo?.experience || 0,
    // 获取屁币
    points: (state) => state.userInfo?.points || 0,
    // 判断是否已登录
    isLogin: (state) => !!state.token && !!state.userInfo?.id
  },
  // 定义 actions
  actions: {
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      console.log('保存用户信息:', this.userInfo)
    },
    
    // 设置 Token
    setToken(token, expireTime) {
      this.token = token
      this.tokenExpireTime = expireTime
      console.log('保存Token:', token)
    },
    
    // 设置登录信息（用户信息 + Token）
    setLoginInfo(data) {
      if (data.user) {
        this.setUserInfo(data.user)
        // 保存 openid 用于快速登录
        if (data.user.openid) {
          this.openid = data.user.openid
          console.log('保存 openid:', this.openid)
        }
      }
      if (data.token) {
        this.setToken(data.token, data.expiresAt)
      }
    },

    // 清除用户信息
    clearUserInfo() {
      this.userInfo = {}
      this.token = ''
      this.tokenExpireTime = 0
      this.openid = ''
      console.log('已清除用户信息')
    },
    
    // 更新用户部分信息
    updateUserInfo(updates) {
      this.userInfo = {
        ...this.userInfo,
        ...updates
      }
      console.log('更新用户信息:', updates)
    }
  },
  // 持久化配置
  persist: {
    storage: {
      getItem(key) {
        return uni.getStorageSync(key)
      },
      setItem(key, value) {
        uni.setStorageSync(key, value)
      }
    }
  }
})

