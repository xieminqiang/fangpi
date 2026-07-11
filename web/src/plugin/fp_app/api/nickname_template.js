import service from '@/utils/request'

// @Tags NicknameTemplate
// @Summary 创建昵称模板
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakNicknameTemplate true "创建昵称模板"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"创建成功"}"
// @Router /break/nicknameTemplate [post]
export const createNicknameTemplate = (data) => {
  return service({
    url: '/break/nicknameTemplate',
    method: 'post',
    data
  })
}

// @Tags NicknameTemplate
// @Summary 删除昵称模板
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param id path uint true "昵称模板ID"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /break/nicknameTemplate/{id} [delete]
export const deleteNicknameTemplate = (data) => {
  return service({
    url: `/break/nicknameTemplate/${data.ID}`,
    method: 'delete'
  })
}

// @Tags NicknameTemplate
// @Summary 批量删除昵称模板
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param ids body request.IdsReq true "昵称模板ID列表"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"批量删除成功"}"
// @Router /break/nicknameTemplate/deleteByIds [delete]
export const deleteNicknameTemplateByIds = (data) => {
  return service({
    url: '/break/nicknameTemplate/deleteByIds',
    method: 'delete',
    data
  })
}

// @Tags NicknameTemplate
// @Summary 更新昵称模板
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.BreakNicknameTemplate true "更新昵称模板"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /break/nicknameTemplate [put]
export const updateNicknameTemplate = (data) => {
  return service({
    url: '/break/nicknameTemplate',
    method: 'put',
    data
  })
}

// @Tags NicknameTemplate
// @Summary 分页获取昵称模板列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data query request.PageInfo true "分页获取昵称模板列表"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /break/nicknameTemplate/list [get]
export const getNicknameTemplateList = (params) => {
  return service({
    url: '/break/nicknameTemplate/list',
    method: 'get',
    params
  })
}

