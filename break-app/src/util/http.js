

import { useUserStore } from '@/src/stores/user.js'
import config from '@/src/util/config.js';
const baseURL =  process.env.NODE_ENV === 'development' ? config.development.baseUrl : config.production.baseUrl;
const httpInterceptor = {
  // 拦截前触发
  invoke(options) {
    // 1. 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    options.timeout = 600000
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      // ✅ 使用 x-token 头（Gin-Vue-Admin 标准方式）
      options.header['x-token'] = token
    }
  },
}

uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

export const http = (options) => {
  // 1. 返回 Promise 对象
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      // 响应成功
      success(res) {
        // 状态码 2xx， axios 就是这样设计的
		
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
		     console.log("222")
		
          resolve(res)
		   
        } else if (res.statusCode === 401) {
          reject(res)
        } else {
          uni.showToast({
            icon: 'none',
            title: (res.data).msg || '请求错误',
          })
          reject(res)
        }
      },
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}
export const httpWx = (options) => {
  // 1. 返回 Promise 对象
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      // 响应成功
      success(res) {
        // 状态码 2xx， axios 就是这样设计的
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res)
        } else if (res.statusCode === 401) {
         
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          uni.showToast({
            icon: 'none',
            title: (res.data).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}
