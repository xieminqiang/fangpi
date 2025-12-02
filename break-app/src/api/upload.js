import config from '@/src/util/config.js'

const baseURL = process.env.NODE_ENV === 'development' ? config.development.baseUrl : config.production.baseUrl

/**
 * 上传单张图片
 * @param {Object} filePath - 本地文件路径
 * @returns {Promise} 上传结果
 */
export const uploadImageAPI = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: baseURL + '/upload/image',
      filePath: filePath,
      name: 'file',
      header: {
        'source-client': 'miniapp',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          resolve(data)
        } else {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * 上传多张图片
 * @param {Array} filePaths - 本地文件路径数组
 * @returns {Promise} 上传结果数组
 */
export const uploadImagesAPI = (filePaths) => {
  const uploadPromises = filePaths.map(filePath => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: baseURL + '/upload/image',
        filePath: filePath,
        name: 'file',
        header: {
          'source-client': 'miniapp',
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data)
            resolve(data)
          } else {
            reject(res)
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  })
  
  return Promise.all(uploadPromises)
}

