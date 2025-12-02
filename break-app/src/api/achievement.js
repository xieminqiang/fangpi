/**
 * 成就系统 API 调用
 */

import { http } from '@/src/util/http.js'






/**
 * 获取用户成就列表
 * @returns {Promise} 用户成就数据
 */
export const getUserAchievementsAPI = () => {
  return http({
    url: '/break/achievements',
    method: 'GET'
  })
}

/**
 * 获取所有成就配置
 * @returns {Promise} 成就配置列表
 */
export const getAchievementListAPI = () => {
  return http({
    url: '/break/achievements/list',
    method: 'GET'
  })
}

/**
 * 标记成就为已查看
 * @param {number} achievementId 成就ID
 * @returns {Promise} 操作结果
 */
export const markAchievementViewedAPI = (achievementId) => {
  return http({
    url: `/break/achievements/${achievementId}/view`,
    method: 'POST'
  })
}

/**
 * 获取成就进度
 * @param {number} achievementId 成就ID
 * @returns {Promise} 成就进度数据
 */
export const getAchievementProgressAPI = (achievementId) => {
  return http({
    url: `/break/achievements/${achievementId}/progress`,
    method: 'GET'
  })
}
