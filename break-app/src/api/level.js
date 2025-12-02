import { http } from '@/src/util/http.js'

/**
 * 获取所有等级配置
 */
export const getAllLevelConfigsAPI = () => {
  return http({
    method: 'GET',
    url: '/break/levelConfig/all'
  })
}

/**
 * 分页获取等级配置列表
 */
export const getLevelConfigListAPI = (params) => {
  return http({
    method: 'POST',
    url: '/break/levelConfig/list',
    data: params
  })
}

/**
 * 获取单个等级配置
 */
export const getLevelConfigAPI = (id) => {
  return http({
    method: 'GET',
    url: `/break/levelConfig/${id}`
  })
}

