"use strict";
const src_util_http = require("../util/http.js");
const wxLoginAPI = (data) => {
  return src_util_http.http({
    method: "POST",
    url: "/user/login",
    data
  });
};
const wxQuickLoginAPI = (code) => {
  return src_util_http.http({
    method: "POST",
    url: "/wxuser/wxQuickLogin",
    data: {
      code
    }
  });
};
const openidLoginAPI = (openid) => {
  return src_util_http.http({
    method: "POST",
    url: "/wxuser/openidLogin",
    data: {
      openid
    }
  });
};
const getUserInfoAPI = () => {
  return src_util_http.http({
    method: "GET",
    url: "/wxuser/getUserInfo"
  });
};
const setUserAudioUrlAPI = (audioUrl) => {
  return src_util_http.http({
    method: "POST",
    url: "/wxuser/setUserAudioUrl",
    data: {
      audioUrl
    }
  });
};
const updateUserInfoAPI = (data) => {
  return src_util_http.http({
    method: "POST",
    url: "/wxuser/updateUserInfo",
    data: {
      nickname: data.nickname,
      avatar: data.avatar
    }
  });
};
const updateUserPointsAPI = (data) => {
  return src_util_http.http({
    method: "POST",
    url: "/wxuser/updateUserPoints",
    data: {
      points: data.points,
      pointsType: data.pointsType,
      remark: data.remark || ""
    }
  });
};
const getPointsRecordsAPI = (params) => {
  return src_util_http.http({
    method: "GET",
    url: "/wxuser/getPointsRecords",
    data: {
      page: params.page || 1,
      pageSize: params.pageSize || 20
    }
  });
};
exports.getPointsRecordsAPI = getPointsRecordsAPI;
exports.getUserInfoAPI = getUserInfoAPI;
exports.openidLoginAPI = openidLoginAPI;
exports.setUserAudioUrlAPI = setUserAudioUrlAPI;
exports.updateUserInfoAPI = updateUserInfoAPI;
exports.updateUserPointsAPI = updateUserPointsAPI;
exports.wxLoginAPI = wxLoginAPI;
exports.wxQuickLoginAPI = wxQuickLoginAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/user.js.map
