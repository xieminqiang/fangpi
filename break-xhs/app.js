/**
 * 小红书小组件 - App 入口
 * 参考 break-app/App.vue 的登录逻辑
 */
const { xhsQuickLoginAPI, openidLoginAPI } = require('./api/user.js');

App({
  onLaunch() {
    // 创建登录 Promise，让页面可以等待登录完成
    this.loginReady = this.handleSmartLogin();
  },

  globalData: {
    userInfo: null,
    token: ''
  },

  /**
   * 智能登录：优先 openid，失败则 code 登录
   */
  async handleSmartLogin() {
    const savedOpenid = xhs.getStorageSync('openid') || '';

    if (savedOpenid) {
      try {
        const res = await openidLoginAPI(savedOpenid);
        const data = res.data;
        if (data.code === 0 && data.data) {
          this.setLoginInfo(data.data);
          return;
        }
      } catch (e) {
        console.error('openid 登录失败', e);
      }
    }

    await this.handleCodeLogin();
  },

  /**
   * 通过 code 登录
   */
  async handleCodeLogin() {
    try {
      const loginRes = await new Promise((resolve, reject) => {
        xhs.login({
          success: resolve,
          fail: reject
        });
      });
      const code = loginRes.code;
      if (!code) {
        console.error('获取 code 失败');
        return;
      }

      const res = await xhsQuickLoginAPI(code);
      const data = res.data;
      if (data.code === 0 && data.data) {
        this.setLoginInfo(data.data);
      }
    } catch (e) {
      console.error('登录失败', e);
    }
  },

  /**
   * 保存登录信息到 storage 和 globalData
   */
  setLoginInfo(data) {
    if (data.user) {
      this.globalData.userInfo = data.user;
      xhs.setStorageSync('userInfo', data.user);
      if (data.user.openid) {
        xhs.setStorageSync('openid', data.user.openid);
      }
    }
    if (data.token) {
      this.globalData.token = data.token;
      xhs.setStorageSync('token', data.token);
    }
  }
});
