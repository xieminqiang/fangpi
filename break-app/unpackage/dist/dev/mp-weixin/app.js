"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const src_api_user = require("./src/api/user.js");
const src_stores_user = require("./src/stores/user.js");
const src_stores_index = require("./src/stores/index.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/login/index.js";
  "./pages/entry/index.js";
  "./pages/index/fart.js";
  "./pages/entry/detail.js";
  "./pages/data/index.js";
  "./pages/entry/creat.js";
  "./pages/me/index.js";
  "./pages/me/aiFx.js";
  "./pages/me/edit.js";
  "./pages/me/points.js";
  "./pages/me/pointsDetail.js";
  "./pages/achievement/achievement.js";
  "./pages/profile/level.js";
  "./pages/profile/jz.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    const handleWxLogin = async () => {
      try {
        common_vendor.index.__f__("log", "at App.vue:13", "开始微信 code 登录...");
        const loginRes = await common_vendor.index.login();
        const code = loginRes.code;
        common_vendor.index.__f__("log", "at App.vue:19", "获取到的 code:", code);
        const { data } = await src_api_user.wxQuickLoginAPI(code);
        common_vendor.index.__f__("log", "at App.vue:24", "微信登录结果:", data);
        if (data.code === 0) {
          userStore.setLoginInfo(data.data);
          common_vendor.index.$emit("loginSuccess");
          common_vendor.index.__f__("log", "at App.vue:33", "✅ 微信登录成功，已发送 loginSuccess 事件");
        } else {
          common_vendor.index.__f__("log", "at App.vue:40", "❌ 微信登录失败:", data.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:47", "❌ 微信登录异常:", error);
      }
    };
    const handleSmartLogin = async () => {
      common_vendor.index.__f__("log", "at App.vue:57", "===== 开始智能登录 =====");
      const savedOpenid = userStore.openid;
      if (savedOpenid) {
        common_vendor.index.__f__("log", "at App.vue:63", "检测到保存的 openid，尝试快速登录");
        try {
          const { data } = await src_api_user.openidLoginAPI(savedOpenid);
          common_vendor.index.__f__("log", "at App.vue:69", "openid 登录结果:", data.data);
          if (data.code === 0) {
            userStore.setLoginInfo(data.data);
            common_vendor.index.$emit("loginSuccess");
            common_vendor.index.__f__("log", "at App.vue:78", "✅ openid 登录成功，已发送 loginSuccess 事件");
          } else {
            common_vendor.index.__f__("log", "at App.vue:81", "❌ openid 登录失败:", data.msg);
            await handleWxLogin();
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at App.vue:85", "❌ openid 登录异常:", error);
          await handleWxLogin();
        }
      } else {
        await handleWxLogin();
      }
    };
    common_vendor.onLaunch(() => {
      common_vendor.index.__f__("log", "at App.vue:101", "App Launch");
      handleSmartLogin();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at App.vue:108", "App Show");
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at App.vue:114", "App Hide");
    });
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(src_stores_index.pinia);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
