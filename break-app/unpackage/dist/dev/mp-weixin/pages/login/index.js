"use strict";
const common_vendor = require("../../common/vendor.js");
const src_api_user = require("../../src/api/user.js");
const src_stores_user = require("../../src/stores/user.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "LoginPage",
  setup() {
    const statusBarHeight = common_vendor.ref(0);
    const userStore = src_stores_user.useUserStore();
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
    });
    const saveUserInfo = (data) => {
      userStore.setUserInfo(data);
    };
    const getPhoneNumber = async (e) => {
      common_vendor.index.__f__("log", "at pages/login/index.vue:64", "手机号授权结果:", e);
      if (e.detail.errMsg === "getPhoneNumber:ok") {
        common_vendor.index.__f__("log", "at pages/login/index.vue:68", "授权成功，加密数据:", e.detail);
        common_vendor.index.showLoading({
          title: "登录中..."
        });
        try {
          const loginRes = await common_vendor.index.login();
          const code = loginRes.code;
          const {
            data
          } = await src_api_user.wxLoginAPI({
            login_code: code,
            phone_code: e.detail.code
          });
          common_vendor.index.__f__("log", "at pages/login/index.vue:87", "返回的data ===>", data);
          common_vendor.index.hideLoading();
          if (data.code === 0) {
            saveUserInfo(data.data.token_info);
            common_vendor.index.showToast({
              title: "登录成功",
              icon: "none"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack({
                delta: 1
                // 返回的页面数，默认值为1，即返回上一级页面
              });
            }, 1e3);
          } else {
            common_vendor.index.showToast({
              title: "登录失败",
              icon: "none"
            });
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/login/index.vue:110", "登录失败:", error);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "登录失败，请重试",
            icon: "none"
          });
        }
      } else {
        common_vendor.index.showToast({
          title: "授权失败，请重试",
          icon: "none"
        });
      }
    };
    return {
      statusBarHeight,
      getPhoneNumber
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $setup.statusBarHeight + "px",
    b: common_assets._imports_0$1,
    c: common_vendor.o((...args) => $setup.getPhoneNumber && $setup.getPhoneNumber(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
