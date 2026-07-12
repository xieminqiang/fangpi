/**
 * 小红书小组件 - 网络请求封装
 * 参考 break-app/src/util/http.js，适配 xhs.request
 */
const { baseUrl } = require('./config.js');

/**
 * 获取存储的 token
 */
function getToken() {
  try {
    return xhs.getStorageSync('token') || '';
  } catch (e) {
    return '';
  }
}

/**
 * 发起 HTTP 请求
 * @param {Object} options - 请求配置
 * @param {string} options.url - 接口路径（相对路径会拼接 baseUrl）
 * @param {string} options.method - 请求方法
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 请求头
 */
function request(options) {
  const url = options.url.startsWith('http') ? options.url : baseUrl + options.url;
  const header = {
    'content-type': 'application/json',
    'source-client': 'xhs-widget',
    ...options.header
  };
  const token = getToken();
  if (token) {
    header['x-token'] = token;
  }

  return new Promise((resolve, reject) => {
    xhs.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      timeout: options.timeout || 60000,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else if (res.statusCode === 401) {
          reject(res);
        } else {
          xhs.showToast({
            icon: 'none',
            title: (res.data && res.data.msg) || '请求错误'
          });
          reject(res);
        }
      },
      fail(err) {
        xhs.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试'
        });
        reject(err);
      }
    });
  });
}

module.exports = { request, getToken };
