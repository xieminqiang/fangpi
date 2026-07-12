import service from '@/utils/request'

export const getFartTogetherRecordList = (data) => {
  return service({
    url: '/break/fartTogetherRecord/list',
    method: 'post',
    data
  })
}

export const findFartTogetherRecord = (params) => {
  return service({
    url: `/break/fartTogetherRecord/${params.id}`,
    method: 'get'
  })
}

export const deleteFartTogetherRecord = (data) => {
  return service({
    url: `/break/fartTogetherRecord/${data.ID}`,
    method: 'delete'
  })
}

export const deleteFartTogetherRecordByIds = (data) => {
  return service({
    url: '/break/fartTogetherRecord/deleteByIds',
    method: 'delete',
    data
  })
}
