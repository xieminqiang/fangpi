import request from '@/utils/request'

/**
 * 获取是否显示"屁的全家族大全"入口
 */
export const getShowFartEncyclopediaEntry = () => {
  return request({
    url: '/break/appConfig/showFartEncyclopediaEntry',
    method: 'get'
  })
}

/**
 * 设置是否显示"屁的全家族大全"入口
 * @param {boolean} show - 是否显示
 */
export const setShowFartEncyclopediaEntry = (show) => {
  return request({
    url: '/break/appConfig/showFartEncyclopediaEntry',
    method: 'put',
    data: {
      show
    }
  })
}

