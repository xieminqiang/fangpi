"use strict";
const src_util_http = require("../util/http.js");
const getUserAchievementsAPI = () => {
  return src_util_http.http({
    url: "/break/achievements",
    method: "GET"
  });
};
exports.getUserAchievementsAPI = getUserAchievementsAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/achievement.js.map
