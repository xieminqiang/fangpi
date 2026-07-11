import service from '@/utils/request'
// @Tags WxUser
// @Summary 创建微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.WxUser true "创建微信用户"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"创建成功"}"
// @Router /wxuser/createWxUser [post]
export const createWxUser = (data) => {
  return service({
    url: '/wxuser/createWxUser',
    method: 'post',
    data
  })
}

// @Tags WxUser
// @Summary 删除微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.WxUser true "删除微信用户"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /wxuser/deleteWxUser [delete]
export const deleteWxUser = (params) => {
  return service({
    url: '/wxuser/deleteWxUser',
    method: 'delete',
    params
  })
}

// @Tags WxUser
// @Summary 批量删除微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "批量删除微信用户"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /wxuser/deleteWxUser [delete]
export const deleteWxUserByIds = (params) => {
  return service({
    url: '/wxuser/deleteWxUserByIds',
    method: 'delete',
    params
  })
}

// @Tags WxUser
// @Summary 更新微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.WxUser true "更新微信用户"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /wxuser/updateWxUser [put]
export const updateWxUser = (data) => {
  return service({
    url: '/wxuser/updateWxUser',
    method: 'put',
    data
  })
}

// @Tags WxUser
// @Summary 用id查询微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data query model.WxUser true "用id查询微信用户"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /wxuser/findWxUser [get]
export const findWxUser = (params) => {
  return service({
    url: '/wxuser/findWxUser',
    method: 'get',
    params
  })
}

// @Tags WxUser
// @Summary 分页获取微信用户列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data query request.PageInfo true "分页获取微信用户列表"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /wxuser/getWxUserList [get]
export const getWxUserList = (params) => {
  return service({
    url: '/wxuser/getWxUserList',
    method: 'get',
    params
  })
}
// @Tags WxUser
// @Summary 不需要鉴权的微信用户接口
// @Accept application/json
// @Produce application/json
// @Param data query request.WxUserSearch true "分页获取微信用户列表"
// @Success 200 {object} response.Response{data=object,msg=string} "获取成功"
// @Router /wxuser/getWxUserPublic [get]
export const getWxUserPublic = () => {
  return service({
    url: '/wxuser/getWxUserPublic',
    method: 'get',
  })
}

// @Tags WxUser
// @Summary 校验打屁次数
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=Array,msg=string} "校验成功"
// @Router /wxuser/validateFartCounts [get]
export const validateFartCounts = () => {
  return service({
    url: '/wxuser/validateFartCounts',
    method: 'get',
  })
}

// @Tags WxUser
// @Summary 校验经验值
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param userIDs body Array true "用户ID列表"
// @Success 200 {object} response.Response{data=Object,msg=string} "校验成功"
// @Router /wxuser/validateExperience [post]
export const validateExperience = (userIDs) => {
  return service({
    url: '/wxuser/validateExperience',
    method: 'post',
    data: userIDs
  })
}

// @Tags WxUser
// @Summary 校验指定用户的打屁次数和经验值
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param userIDs body Array true "用户ID列表"
// @Success 200 {object} response.Response{data=Array,msg=string} "校验成功"
// @Router /wxuser/validateSpecificUsers [post]
export const validateSpecificUsers = (userIDs) => {
  return service({
    url: '/wxuser/validateSpecificUsers',
    method: 'post',
    data: userIDs
  })
}
