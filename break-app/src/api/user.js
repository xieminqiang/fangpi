import { http } from '@/src/util/http.js'

export const getWxPhoneAPI = (data) => {
  return http({
    method: 'GET',
    url: '/wx/phone',
	data
  })
}

/**
 * 微信登录
 * 
 */
export const wxLoginAPI = (data) => {
  return http({
    method: 'POST',
    url: '/user/login',
    data,
  })
}
export const stsTokenAPI = () => {
  return http({
      method: 'POST',
      url: '/sts/token',
   
  })
}

/**
 * 微信登录接口
 * @param {string} code - 微信登录获取的code
 * @returns {Promise} 登录结果
 */
export const wxUserLoginAPI = (code) => {
  return http({
    method: 'POST',
    url: '/wxuser/wxLogin',
    data: {
      code
    }
  })
}

/**
 * 微信快速登录接口（自动注册）
 * 不需要手机号授权，直接通过code获取openid
 * 如果用户不存在则自动注册，默认昵称"新手屁屁"
 * @param {string} code - 微信登录获取的code
 * @returns {Promise} 登录结果
 */
export const wxQuickLoginAPI = (code) => {
  return http({
    method: 'POST',
    url: '/wxuser/wxQuickLogin',
    data: {
      code
    }
  })
}

/**
 * 通过 OpenID 登录接口
 * 适用于已登录过的用户，使用保存的 openid 快速登录
 * @param {string} openid - 用户的微信openid
 * @returns {Promise} 登录结果
 */
export const openidLoginAPI = (openid) => {
  return http({
    method: 'POST',
    url: '/wxuser/openidLogin',
    data: {
      openid
    }
  })
}

/**
 * 获取当前登录用户信息
 * @returns {Promise} 用户信息
 */
export const getUserInfoAPI = () => {
  return http({
    method: 'GET',
    url: '/wxuser/getUserInfo'
  })
}

/**
 * 设置用户放屁音频URL
 * @param {string} audioUrl - 音频URL
 * @returns {Promise} 设置结果
 */
export const setUserAudioUrlAPI = (audioUrl) => {
  return http({
    method: 'POST',
    url: '/wxuser/setUserAudioUrl',
    data: {
      audioUrl
    }
  })
}

/**
 * 更新用户信息（昵称和头像）- 小程序用户端接口
 * @param {Object} data - 用户信息 {nickname: string, avatar: string}
 * @returns {Promise} 更新结果
 */
export const updateUserInfoAPI = (data) => {
  return http({
    method: 'POST',
    url: '/wxuser/updateUserInfo',
    data: {
      nickname: data.nickname,
      avatar: data.avatar
    }
  })
}