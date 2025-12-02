import service from '@/utils/request'

// @Tags LevelConfig
// @Summary 创建等级配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.BreakLevelConfig true "创建等级配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"创建成功"}"
// @Router /break/levelConfig [post]
export const createLevelConfig = (data) => {
  return service({
    url: '/break/levelConfig',
    method: 'post',
    data
  })
}

// @Tags LevelConfig
// @Summary 删除等级配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.BreakLevelConfig true "删除等级配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /break/levelConfig [delete]
export const deleteLevelConfig = (data) => {
  return service({
    url: '/break/levelConfig',
    method: 'delete',
    data
  })
}

// @Tags LevelConfig
// @Summary 删除等级配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.GetById true "删除等级配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /break/levelConfig/deleteLevelConfig [delete]
export const deleteLevelConfigByIds = (data) => {
  return service({
    url: '/break/levelConfig/deleteLevelConfigByIds',
    method: 'delete',
    data
  })
}

// @Tags LevelConfig
// @Summary 更新等级配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.BreakLevelConfig true "更新等级配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /break/levelConfig [put]
export const updateLevelConfig = (data) => {
  return service({
    url: '/break/levelConfig',
    method: 'put',
    data
  })
}

// @Tags LevelConfig
// @Summary 用id查询等级配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query model.BreakLevelConfig true "用id查询等级配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /break/levelConfig/findLevelConfig [get]
export const findLevelConfig = (params) => {
  return service({
    url: '/break/levelConfig/findLevelConfig',
    method: 'get',
    params
  })
}

// @Tags LevelConfig
// @Summary 分页获取等级配置列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.PageInfo true "分页获取等级配置列表"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /break/levelConfig/getLevelConfigList [post]
export const getLevelConfigList = (data) => {
  return service({
    url: '/break/levelConfig/list',
    method: 'post',
    data
  })
}

// @Tags LevelConfig
// @Summary 获取所有等级配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /break/levelConfig/all [get]
export const getAllLevelConfigs = () => {
  return service({
    url: '/break/levelConfig/all',
    method: 'get'
  })
}
