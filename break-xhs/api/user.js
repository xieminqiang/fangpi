/**
 * 小红书小组件 - 用户相关 API
 * 参考 break-app/src/api/user.js，适配 xhs 平台
 */
const { request } = require('../util/http.js');

/**
 * 小红书快速登录（通过 code）
 * 后端需提供 xhs 登录接口，或复用 /wxuser/wxQuickLogin 并识别 source-client: xhs-widget
 * @param {string} code - xhs.login 获取的 code
 */
function xhsQuickLoginAPI(code) {
  return request({
    method: 'POST',
    url: '/wxuser/xhsQuickLogin',
    data: { code }
  });
}

/**
 * 通过 OpenID 登录（已登录用户快速恢复）
 * @param {string} openid - 用户 openid
 */
function openidLoginAPI(openid) {
  return request({
    method: 'POST',
    url: '/wxuser/openidLogin',
    data: { openid }
  });
}

/**
 * 获取当前用户信息
 */
function getUserInfoAPI() {
  return request({
    method: 'GET',
    url: '/wxuser/getUserInfo'
  });
}

/**
 * 设置用户放屁音频 URL
 * @param {string} audioUrl - 音频 URL
 */
function setUserAudioUrlAPI(audioUrl) {
  return request({
    method: 'POST',
    url: '/wxuser/setUserAudioUrl',
    data: { audioUrl }
  });
}

module.exports = {
  xhsQuickLoginAPI,
  openidLoginAPI,
  getUserInfoAPI,
  setUserAudioUrlAPI
};
