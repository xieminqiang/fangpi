"use strict";
const src_util_http = require("../util/http.js");
const getAllLevelConfigsAPI = () => {
  return src_util_http.http({
    method: "GET",
    url: "/break/levelConfig/all"
  });
};
exports.getAllLevelConfigsAPI = getAllLevelConfigsAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/level.js.map
