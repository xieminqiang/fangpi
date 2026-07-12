/**
 * 小红书小组件 - 环境配置
 * 与 break-app/src/util/config.js 共用同一后端，仅 source-client 不同
 *
 * 环境切换：修改 currentEnv（小红书无 process.env.NODE_ENV）
 * - development：本地 / IDE 预览调试
 * - production：正式上架
 */
const config = {
  development: {
    baseUrl: 'https://fangpi.mqcode.cn/api'
  },
  production: {
    baseUrl: 'https://fangpi.mqcode.cn/api'
  }
};

/** @type {'development' | 'production'} */
const currentEnv = 'production';

const baseUrl = config[currentEnv].baseUrl;

/** 静态资源（海报、图标等），便于统一替换 */
const assets = {
  archivePosterUrl:
    'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2026-05-08/wxss.png'
};

module.exports = {
  config,
  currentEnv,
  baseUrl,
  assets
};
