import { http } from '@/src/util/http.js'
import config from '@/src/util/config.js'
const baseURL = process.env.NODE_ENV === 'development' ? config.development.baseUrl : config.production.baseUrl

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

/**
 * 上传音频文件
 * @param {string} filePath - 音频文件路径（临时文件路径）
 * @returns {Promise} 上传结果，包含url
 */
export const uploadAudioAPI = (filePath) => {
  // http拦截器会自动添加token和baseURL，参考upload.js的实现
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: baseURL + '/upload/audio',
      filePath: filePath,
      name: 'file',
      header: {
        'source-client': 'miniapp'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve({ data })
            } else {
              reject(new Error(data.msg || '上传失败'))
            }
          } catch (e) {
            console.error('解析响应失败:', e, res.data)
            reject(new Error('解析响应失败: ' + e.message))
          }
        } else {
          console.error('上传失败，状态码:', res.statusCode, res.data)
          try {
            const errorData = JSON.parse(res.data)
            reject(new Error(errorData.msg || '上传失败'))
          } catch (e) {
            reject(new Error('上传失败，状态码: ' + res.statusCode))
          }
        }
      },
      fail: (err) => {
        console.error('上传失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 创建用户自己的音频库记录
 * @param {Object} data - 音频库数据
 * @param {string} data.url - 音频URL
 * @param {string} data.class_name - 分类名称（固定为"自己放的屁"）
 * @param {string} data.name - 音频名字
 * @returns {Promise} 创建结果
 */
export const createMyAudioAPI = (data) => {
  return http({
    method: 'POST',
    url: '/break/audioLibrary/my',
    data: data
  })
}

/**
 * 删除用户自己的音频库记录（小程序端专用）
 * @param {number} id - 音频库ID
 * @returns {Promise} 删除结果
 */
export const deleteAudioLibraryAPI = (id) => {
  return http({
    method: 'DELETE',
    url: `/break/audioLibrary/my/${id}`
  })
}

