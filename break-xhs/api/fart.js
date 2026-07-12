/**
 * 小红书小组件 - 放屁记录相关 API
 * 参考 break-app/src/api/fart.js
 */
const { request } = require('../util/http.js');

/**
 * 创建放屁记录（打卡）
 * @param {Object} data - 记录数据
 * @param {string} data.fartType - loud/soft/silent
 * @param {number} data.smellLevel - 1/2/3
 * @param {string} data.mood - happy/normal/embarrassed
 * @param {string} data.note - 备注
 * @param {string} data.fartDate - 2025-10-17
 * @param {string} data.fartTime - 14:30:00
 */
function createFartRecordAPI(data) {
  return request({
    method: 'POST',
    url: '/break/record',
    data
  });
}

/**
 * 获取今日记录
 */
function getTodayRecordsAPI() {
  return request({
    method: 'GET',
    url: '/break/today'
  });
}

/**
 * 获取统计小结
 * @param {string} type - day/week/month
 */
function getStatisticsSummaryAPI(type) {
  return request({
    method: 'GET',
    url: '/break/statistics/summary',
    data: { type }
  });
}

/**
 * 补卡记录
 * @param {Object} data - 记录数据
 * @param {string} data.fartTime - HH:mm
 */
function makeupFartRecordAPI(data) {
  return request({
    method: 'POST',
    url: '/break/makeup',
    data
  });
}

module.exports = {
  createFartRecordAPI,
  getTodayRecordsAPI,
  getStatisticsSummaryAPI,
  makeupFartRecordAPI
};
