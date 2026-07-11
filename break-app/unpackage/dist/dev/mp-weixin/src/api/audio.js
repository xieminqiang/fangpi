"use strict";
const common_vendor = require("../../common/vendor.js");
const src_util_http = require("../util/http.js");
const src_util_config = require("../util/config.js");
const baseURL = src_util_config.config.development.baseUrl;
const getAudioLibraryFeedAPI = (params = {}) => {
  const { page = 1, pageSize = 20, type } = params;
  const requestParams = {
    page,
    pageSize
  };
  if (type !== void 0 && type !== null) {
    requestParams.type = type;
  }
  return src_util_http.http({
    method: "GET",
    url: "/break/audioLibrary/feed",
    params: requestParams
  });
};
const uploadAudioAPI = (filePath) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: baseURL + "/upload/audio",
      filePath,
      name: "file",
      header: {
        "source-client": "miniapp"
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 0) {
              resolve({ data });
            } else {
              reject(new Error(data.msg || "上传失败"));
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at src/api/audio.js:55", "解析响应失败:", e, res.data);
            reject(new Error("解析响应失败: " + e.message));
          }
        } else {
          common_vendor.index.__f__("error", "at src/api/audio.js:59", "上传失败，状态码:", res.statusCode, res.data);
          try {
            const errorData = JSON.parse(res.data);
            reject(new Error(errorData.msg || "上传失败"));
          } catch (e) {
            reject(new Error("上传失败，状态码: " + res.statusCode));
          }
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at src/api/audio.js:69", "上传失败:", err);
        reject(err);
      }
    });
  });
};
const createMyAudioAPI = (data) => {
  return src_util_http.http({
    method: "POST",
    url: "/break/audioLibrary/my",
    data
  });
};
const deleteAudioLibraryAPI = (id) => {
  return src_util_http.http({
    method: "DELETE",
    url: `/break/audioLibrary/my/${id}`
  });
};
exports.createMyAudioAPI = createMyAudioAPI;
exports.deleteAudioLibraryAPI = deleteAudioLibraryAPI;
exports.getAudioLibraryFeedAPI = getAudioLibraryFeedAPI;
exports.uploadAudioAPI = uploadAudioAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/audio.js.map
