"use strict";
const src_util_http = require("../util/http.js");
const getShowFartEncyclopediaEntryAPI = () => {
  return src_util_http.http({
    method: "GET",
    url: "/break/appConfig/showFartEncyclopediaEntry"
  });
};
exports.getShowFartEncyclopediaEntryAPI = getShowFartEncyclopediaEntryAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/app_config.js.map
