import service from '@/utils/request'

// @Tags Achievement
// @Summary 创建成就配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.BreakAchievement true "创建成就配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"创建成功"}"
// @Router /break/achievement [post]
export const createAchievement = (data) => {
  return service({
    url: '/break/achievement',
    method: 'post',
    data
  })
}

// @Tags Achievement
// @Summary 删除成就配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.BreakAchievement true "删除成就配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /break/achievement [delete]
export const deleteAchievement = (data) => {
  return service({
    url: '/break/achievement',
    method: 'delete',
    data
  })
}

// @Tags Achievement
// @Summary 删除成就配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.GetById true "删除成就配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /break/achievement/deleteAchievement [delete]
export const deleteAchievementByIds = (data) => {
  return service({
    url: '/break/achievement/deleteAchievementByIds',
    method: 'delete',
    data
  })
}

// @Tags Achievement
// @Summary 更新成就配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.BreakAchievement true "更新成就配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /break/achievement [put]
export const updateAchievement = (data) => {
  return service({
    url: '/break/achievement',
    method: 'put',
    data
  })
}

// @Tags Achievement
// @Summary 用id查询成就配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query model.BreakAchievement true "用id查询成就配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /break/achievement/findAchievement [get]
export const findAchievement = (params) => {
  return service({
    url: '/break/achievement/findAchievement',
    method: 'get',
    params
  })
}

// @Tags Achievement
// @Summary 分页获取成就配置列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.PageInfo true "分页获取成就配置列表"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /break/achievement/getAchievementList [post]
export const getAchievementList = (data) => {
  return service({
    url: '/break/achievement/list',
    method: 'post',
    data
  })
}

// @Tags Achievement
// @Summary 获取所有成就配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /break/achievement/all [get]
export const getAllAchievements = () => {
  return service({
    url: '/break/achievement/all',
    method: 'get'
  })
}
