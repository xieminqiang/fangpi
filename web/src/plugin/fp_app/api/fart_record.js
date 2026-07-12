import service from '@/utils/request'

export const getFartRecordList = (data) => {
  return service({
    url: '/break/fartRecord/list',
    method: 'post',
    data
  })
}

export const findFartRecord = (params) => {
  return service({
    url: `/break/fartRecord/${params.id}`,
    method: 'get'
  })
}

export const deleteFartRecord = (data) => {
  return service({
    url: `/break/fartRecord/${data.ID}`,
    method: 'delete'
  })
}

export const deleteFartRecordByIds = (data) => {
  return service({
    url: '/break/fartRecord/deleteByIds',
    method: 'delete',
    data
  })
}
