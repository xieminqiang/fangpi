import { http } from '@/src/util/http.js'

/**
 * 获取是否显示"屁的全家族大全"入口
 * @returns {Promise} 返回是否显示的布尔值
 */
export const getShowFartEncyclopediaEntryAPI = () => {
  return http({
    method: 'GET',
    url: '/break/appConfig/showFartEncyclopediaEntry'
  })
}

