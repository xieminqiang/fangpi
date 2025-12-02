import { http } from '@/src/util/http.js'

/**
 * 创建放屁记录（打卡）
 * @param {Object} data - 记录数据
 * @param {string} data.fartType - 屁屁类型: loud/soft/silent
 * @param {number} data.smellLevel - 气味等级: 1/2/3
 * @param {string} data.mood - 心情: happy/normal/embarrassed
 * @param {string} data.note - 备注（可选）
 * @param {string} data.fartDate - 放屁日期: 2025-10-17
 * @param {string} data.fartTime - 放屁时间: 14:30:00
 * @returns {Promise} 创建结果
 */
export const createFartRecordAPI = (data) => {
  return http({
    method: 'POST',
    url: '/break/record',
    data
  })
}

/**
 * 获取今日记录
 * @returns {Promise} 今日所有记录
 */
export const getTodayRecordsAPI = () => {
  return http({
    method: 'GET',
    url: '/break/today'
  })
}

/**
 * 获取趋势数据
 * @param {string} type - 统计类型：day-日，week-周，month-月
 * @returns {Promise} 趋势数据
 */
export const getTrendDataAPI = (type = 'day') => {
  return http({
    method: 'GET',
    url: '/break/statistics/trend',
    data: { type }
  })
}

/**
 * 获取统计小结
 * @param {string} type - 统计类型：day-日，week-周，month-月
 * @returns {Promise} 统计小结
 */
export const getStatisticsSummaryAPI = (type = 'day') => {
  return http({
    method: 'GET',
    url: '/break/statistics/summary',
    data: { type }
  })
}

/**
 * 补卡记录
 * @param {Object} data - 记录数据
 * @param {string} data.fartType - 屁屁类型: loud/soft/silent
 * @param {number} data.smellLevel - 气味等级: 1/2/3
 * @param {string} data.mood - 心情: happy/normal/embarrassed
 * @param {string} data.note - 备注（可选）
 * @param {string} data.fartTime - 放屁时间: HH:mm（例如：09:13），日期由后端自动使用当前日期
 * @returns {Promise} 补卡结果
 */
export const makeupFartRecordAPI = (data) => {
  return http({
    method: 'POST',
    url: '/break/makeup',
    data
  })
}

