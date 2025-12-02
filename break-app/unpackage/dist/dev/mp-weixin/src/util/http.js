"use strict";
const common_vendor = require("../../common/vendor.js");
const src_stores_user = require("../stores/user.js");
const src_util_config = require("./config.js");
const baseURL = src_util_config.config.development.baseUrl;
const httpInterceptor = {
  // 拦截前触发
  invoke(options) {
    if (!options.url.startsWith("http")) {
      options.url = baseURL + options.url;
    }
    options.timeout = 6e5;
    options.header = {
      ...options.header,
      "source-client": "miniapp"
    };
    const userStore = src_stores_user.useUserStore();
    const token = userStore.token;
    if (token) {
      options.header["x-token"] = token;
    }
  }
};
common_vendor.index.addInterceptor("request", httpInterceptor);
common_vendor.index.addInterceptor("uploadFile", httpInterceptor);
const http = (options) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      // 响应成功
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          common_vendor.index.__f__("log", "at src/util/http.js:41", "222");
          resolve(res);
        } else if (res.statusCode === 401) {
          reject(res);
        } else {
          common_vendor.index.showToast({
            icon: "none",
            title: res.data.msg || "请求错误"
          });
          reject(res);
        }
      },
      fail(err) {
        common_vendor.index.showToast({
          icon: "none",
          title: "网络错误，换个网络试试"
        });
        reject(err);
      }
    });
  });
};
exports.http = http;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/util/http.js.map
