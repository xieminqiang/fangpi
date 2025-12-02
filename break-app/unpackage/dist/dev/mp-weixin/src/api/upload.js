"use strict";
const common_vendor = require("../../common/vendor.js");
const src_util_config = require("../util/config.js");
const baseURL = src_util_config.config.development.baseUrl;
const uploadImageAPI = (filePath) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: baseURL + "/upload/image",
      filePath,
      name: "file",
      header: {
        "source-client": "miniapp"
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          resolve(data);
        } else {
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({
          title: "上传失败",
          icon: "none"
        });
        reject(err);
      }
    });
  });
};
exports.uploadImageAPI = uploadImageAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/upload.js.map
