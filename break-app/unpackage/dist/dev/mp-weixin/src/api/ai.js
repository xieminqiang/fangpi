"use strict";
const src_util_http = require("../util/http.js");
const getAiPersonalityReviewAPI = () => {
  return src_util_http.http({
    url: "/break/ai/review",
    method: "GET"
  });
};
exports.getAiPersonalityReviewAPI = getAiPersonalityReviewAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/ai.js.map
