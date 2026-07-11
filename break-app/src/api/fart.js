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
 * 获取今日最近一次放屁记录
 * @returns {Promise} 今日最近一次记录，如果没有记录则返回 null
 */
export const getTodayLastRecordAPI = () => {
  return http({
    method: 'GET',
    url: '/break/today/last'
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

/**
 * 获取最近一次屁友一起打屁记录
 * @returns {Promise} 最近一次记录，如果没有记录则返回 null
 */
export const getLastFartTogetherRecordAPI = () => {
  return http({
    method: 'GET',
    url: '/break/together/last'
  })
}

/**
 * 根据ID获取一起打屁记录
 * @param {number} id - 记录ID
 * @returns {Promise} 记录数据
 */
export const getFartTogetherRecordByIdAPI = (id) => {
  return http({
    method: 'GET',
    url: `/break/together/${id}`
  })
}

/**
 * 创建一起打屁记录
 * @param {Object} data - 记录数据
 * @param {number} data.inviteeId - 被邀请人的用户ID
 * @param {number} data.inviterSex - 邀请人的性别：1为男，2为女
 * @param {number} data.inviteeSex - 被邀请人的性别：1为男，2为女
 * @param {Object} data.inviterRecordInfo - 邀请人的放屁记录信息 {id, fartType, mood, smellLevel, volumeLevel}
 * @param {Object} data.inviteeRecordInfo - 被邀请人的放屁记录信息 {id, fartType, mood, smellLevel, volumeLevel}
 * @returns {Promise} 创建结果
 */
export const createFartTogetherRecordAPI = (data) => {
  return http({
    method: 'POST',
    url: '/break/together',
    data
  })
}

/**
 * 更新一起打屁记录（更新被邀请人的记录信息）
 * @param {number} id - 记录ID
 * @param {Object} data - 更新数据
 * @param {Object} data.inviteeRecordInfo - 被邀请人的放屁记录信息 {id, fartType, mood, smellLevel, volumeLevel}
 * @returns {Promise} 更新结果
 */
export const updateFartTogetherRecordAPI = (id, data) => {
  return http({
    method: 'PUT',
    url: `/break/together/${id}`,
    data
  })
}

/**
 * 只更新性别字段，不改变其他任何数据
 * @param {Object} data - 性别数据（包含记录ID）
 * @param {number} data.id - 记录ID
 * @param {number} data.inviterSex - 邀请人的性别：1为男，2为女
 * @param {number} data.inviteeSex - 被邀请人的性别：1为男，2为女
 * @returns {Promise} 更新结果
 */
export const updateFartTogetherRecordSexAPI = (data) => {
  return http({
    method: 'POST',
    url: '/break/together/sex',
    data
  })
}

