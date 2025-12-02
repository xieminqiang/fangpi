"use strict";
const src_util_http = require("../util/http.js");
const createFartRecordAPI = (data) => {
  return src_util_http.http({
    method: "POST",
    url: "/break/record",
    data
  });
};
const getTodayRecordsAPI = () => {
  return src_util_http.http({
    method: "GET",
    url: "/break/today"
  });
};
const getTrendDataAPI = (type = "day") => {
  return src_util_http.http({
    method: "GET",
    url: "/break/statistics/trend",
    data: { type }
  });
};
const getStatisticsSummaryAPI = (type = "day") => {
  return src_util_http.http({
    method: "GET",
    url: "/break/statistics/summary",
    data: { type }
  });
};
const makeupFartRecordAPI = (data) => {
  return src_util_http.http({
    method: "POST",
    url: "/break/makeup",
    data
  });
};
exports.createFartRecordAPI = createFartRecordAPI;
exports.getStatisticsSummaryAPI = getStatisticsSummaryAPI;
exports.getTodayRecordsAPI = getTodayRecordsAPI;
exports.getTrendDataAPI = getTrendDataAPI;
exports.makeupFartRecordAPI = makeupFartRecordAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/fart.js.map
