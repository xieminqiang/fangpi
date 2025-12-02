import { http } from '@/src/util/http.js'

/**
 * 获取屁趣音效音频库数据（支持分页）
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认20
 * @param {number} params.type - 类型，1表示屁的全家族大全
 * @returns {Promise} 音频库结构化数据
 */
export const getAudioLibraryFeedAPI = (params = {}) => {
  const { page = 1, pageSize = 20, type } = params
  const requestParams = {
    page,
    pageSize
  }
  // 如果传入了type参数，添加到请求参数中
  if (type !== undefined && type !== null) {
    requestParams.type = type
  }
  return http({
    method: 'GET',
    url: '/break/audioLibrary/feed',
    params: requestParams
  })
}

