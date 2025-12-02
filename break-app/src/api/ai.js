/**
 * AI 相关 API 调用
 * 包括：AI个性点评、AI聊天
 */

import { http } from '@/src/util/http.js'

/**
 * ==================== AI个性点评相关 ====================
 */

/**
 * 获取AI个性点评
 * @returns {Promise} AI点评数据
 */
export const getAiPersonalityReviewAPI = () => {
  return http({
    url: '/break/ai/review',
    method: 'GET'
  })
}

/**
 * 刷新AI个性点评
 * @returns {Promise} 新的AI点评数据
 */
export const refreshAiPersonalityReviewAPI = () => {
  return http({
    url: '/break/ai/review/refresh',
    method: 'POST'
  })
}

/**
 * ==================== AI聊天相关 ====================
 */

/**
 * 获取AI角色列表
 * @returns {Promise} 角色列表数据
 */
export const getAiChatRolesAPI = () => {
  return http({
    url: '/break/ai/chat/roles',
    method: 'GET'
  })
}

/**
 * 清空对话历史
 * @param {String} roleType - 角色类型 (ppjl: 屁屁精灵, cbos: 肠博士)
 * @returns {Promise} 清空结果
 */
export const clearAiChatHistoryAPI = (roleType) => {
  return http({
    url: '/break/ai/chat/clear',
    method: 'POST',
    params: {
      roleType
    }
  })
}

/**
 * 获取WebSocket连接URL
 * @param {String} roleType - 角色类型 (ppjl: 屁屁精灵, cbos: 肠博士)
 * @param {String} token - 用户token
 * @returns {String} WebSocket URL
 */
export const getAiChatWebSocketUrl = (roleType, token) => {
  // 根据当前环境构建WebSocket URL
  // 使用局域网 IP 而不是 localhost，以便在微信小程序中正常工作
  let baseUrl = 'ws://192.168.1.15:8881'
  
  // #ifdef H5
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    baseUrl = `${protocol}//${host}`
  }
  // #endif
  
  return `${baseUrl}/break/ai/chat/ws?roleType=${roleType}&token=${token}`
}
