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

/**
 * 根据用户ID获取用户信息（公开接口，用于邀请功能）
 * @param {number} id - 用户ID
 * @returns {Promise} 用户信息（包含id、nickname、avatar）
 */
export const getUserInfoByIdAPI = (id) => {
  return http({
    method: 'GET',
    url: `/wxuser/getUserInfoById?id=${id}`
  })
}

/**
 * 更新用户屁币
 * @param {Object} data - 屁币信息 {points: number, pointsType: number, remark: string}
 * @param {number} data.points - 屁币数量（正数）
 * @param {number} data.pointsType - 屁币类型：1-增加屁币，2-扣除屁币
 * @param {string} data.remark - 备注说明
 * @returns {Promise} 更新后的用户信息
 */
export const updateUserPointsAPI = (data) => {
  return http({
    method: 'POST',
    url: '/wxuser/updateUserPoints',
    data: {
      points: data.points,
      pointsType: data.pointsType,
      remark: data.remark || ''
    }
  })
}

/**
 * 创建屁币记录
 * @param {Object} data - 屁币记录信息 {userId: number, points: number, pointsType: number, remark: string}
 * @param {number} data.userId - 用户ID
 * @param {number} data.points - 屁币数量
 * @param {number} data.pointsType - 屁币类型：1-增加屁币，2-扣除屁币
 * @param {string} data.remark - 备注说明
 * @returns {Promise} 创建结果
 */
export const createPointsRecordAPI = (data) => {
  return http({
    method: 'POST',
    url: '/wxuser/createPointsRecord',
    data: {
      userId: data.userId,
      points: data.points,
      pointsType: data.pointsType,
      remark: data.remark || ''
    }
  })
}

/**
 * 获取屁币记录列表
 * @param {Object} params - 查询参数 {page: number, pageSize: number}
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 屁币记录列表
 */
export const getPointsRecordsAPI = (params) => {
  return http({
    method: 'GET',
    url: '/wxuser/getPointsRecords',
    data: {
      page: params.page || 1,
      pageSize: params.pageSize || 20
    }
  })
}