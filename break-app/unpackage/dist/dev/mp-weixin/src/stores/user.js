"use strict";
const common_vendor = require("../../common/vendor.js");
const useUserStore = common_vendor.defineStore("user", {
  // 定义 state
  state: () => ({
    userInfo: {},
    token: "",
    tokenExpireTime: 0,
    openid: ""
    // 微信 openid，用于快速登录
  }),
  // 定义 getters
  getters: {
    // 获取用户昵称
    nickname: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.nickname) || "新手屁屁";
    },
    // 获取用户头像
    avatar: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.avatar) || "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png";
    },
    // 获取用户等级
    level: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.level) || 1;
    },
    levelName: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.levelName) || "新手屁民";
    },
    // 获取累计放屁次数
    totalFarts: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.totalFarts) || 0;
    },
    // 获取经验值
    experience: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.experience) || 0;
    },
    // 判断是否已登录
    isLogin: (state) => {
      var _a;
      return !!state.token && !!((_a = state.userInfo) == null ? void 0 : _a.id);
    }
  },
  // 定义 actions
  actions: {
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      common_vendor.index.__f__("log", "at src/stores/user.js:33", "保存用户信息:", this.userInfo);
    },
    // 设置 Token
    setToken(token, expireTime) {
      this.token = token;
      this.tokenExpireTime = expireTime;
      common_vendor.index.__f__("log", "at src/stores/user.js:40", "保存Token:", token);
    },
    // 设置登录信息（用户信息 + Token）
    setLoginInfo(data) {
      if (data.user) {
        this.setUserInfo(data.user);
        if (data.user.openid) {
          this.openid = data.user.openid;
          common_vendor.index.__f__("log", "at src/stores/user.js:50", "保存 openid:", this.openid);
        }
      }
      if (data.token) {
        this.setToken(data.token, data.expiresAt);
      }
    },
    // 清除用户信息
    clearUserInfo() {
      this.userInfo = {};
      this.token = "";
      this.tokenExpireTime = 0;
      this.openid = "";
      common_vendor.index.__f__("log", "at src/stores/user.js:64", "已清除用户信息");
    },
    // 更新用户部分信息
    updateUserInfo(updates) {
      this.userInfo = {
        ...this.userInfo,
        ...updates
      };
      common_vendor.index.__f__("log", "at src/stores/user.js:73", "更新用户信息:", updates);
    }
  },
  // 持久化配置
  persist: {
    storage: {
      getItem(key) {
        return common_vendor.index.getStorageSync(key);
      },
      setItem(key, value) {
        common_vendor.index.setStorageSync(key, value);
      }
    }
  }
});
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/stores/user.js.map
