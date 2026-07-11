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
const getLastFartTogetherRecordAPI = () => {
  return src_util_http.http({
    method: "GET",
    url: "/break/together/last"
  });
};
const getFartTogetherRecordByIdAPI = (id) => {
  return src_util_http.http({
    method: "GET",
    url: `/break/together/${id}`
  });
};
const createFartTogetherRecordAPI = (data) => {
  return src_util_http.http({
    method: "POST",
    url: "/break/together",
    data
  });
};
const updateFartTogetherRecordAPI = (id, data) => {
  return src_util_http.http({
    method: "PUT",
    url: `/break/together/${id}`,
    data
  });
};
const updateFartTogetherRecordSexAPI = (data) => {
  return src_util_http.http({
    method: "POST",
    url: "/break/together/sex",
    data
  });
};
exports.createFartRecordAPI = createFartRecordAPI;
exports.createFartTogetherRecordAPI = createFartTogetherRecordAPI;
exports.getFartTogetherRecordByIdAPI = getFartTogetherRecordByIdAPI;
exports.getLastFartTogetherRecordAPI = getLastFartTogetherRecordAPI;
exports.getStatisticsSummaryAPI = getStatisticsSummaryAPI;
exports.getTodayRecordsAPI = getTodayRecordsAPI;
exports.getTrendDataAPI = getTrendDataAPI;
exports.makeupFartRecordAPI = makeupFartRecordAPI;
exports.updateFartTogetherRecordAPI = updateFartTogetherRecordAPI;
exports.updateFartTogetherRecordSexAPI = updateFartTogetherRecordSexAPI;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/src/api/fart.js.map
