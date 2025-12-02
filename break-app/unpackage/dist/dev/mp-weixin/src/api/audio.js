"use strict";
const src_util_http = require("../util/http.js");
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
exports.getAudioLibraryFeedAPI = getAudioLibraryFeedAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/audio.js.map
