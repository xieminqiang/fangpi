import service from '@/utils/request'

// @Tags AudioLibrary
// @Summary 创建音频库
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.BreakAudioLibrary true "创建音频库"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"创建成功"}"
// @Router /break/audioLibrary [post]
export const createAudioLibrary = (data) => {
  return service({
    url: '/break/audioLibrary',
    method: 'post',
    data
  })
}

// @Tags AudioLibrary
// @Summary 删除音频库
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param id path uint true "音频库ID"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /break/audioLibrary/{id} [delete]
export const deleteAudioLibrary = (data) => {
  return service({
    url: `/break/audioLibrary/${data.ID}`,
    method: 'delete'
  })
}

// @Tags AudioLibrary
// @Summary 更新音频库
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.BreakAudioLibrary true "更新音频库"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /break/audioLibrary [put]
export const updateAudioLibrary = (data) => {
  return service({
    url: '/break/audioLibrary',
    method: 'put',
    data
  })
}

// @Tags AudioLibrary
// @Summary 用id查询音频库
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param id path uint true "音频库ID"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /break/audioLibrary/{id} [get]
export const findAudioLibrary = (params) => {
  return service({
    url: `/break/audioLibrary/${params.id}`,
    method: 'get'
  })
}

// @Tags AudioLibrary
// @Summary 分页获取音频库列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.PageInfo true "分页获取音频库列表"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /break/audioLibrary/list [post]
export const getAudioLibraryList = (data) => {
  return service({
    url: '/break/audioLibrary/list',
    method: 'post',
    data
  })
}

// @Tags AudioLibrary
// @Summary 获取所有音频库
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /break/audioLibrary/all [get]
export const getAllAudioLibraries = () => {
  return service({
    url: '/break/audioLibrary/all',
    method: 'get'
  })
}

