"use strict";
const common_vendor = require("../../common/vendor.js");
const src_api_user = require("../../src/api/user.js");
const src_stores_user = require("../../src/stores/user.js");
const _sfc_main = {
  __name: "pointsDetail",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    const currentPoints = common_vendor.computed(() => userStore.points);
    const pointsRecords = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    const isLoadingMore = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const total = common_vendor.ref(0);
    common_vendor.onMounted(() => {
      loadUserInfo();
      loadPointsRecords();
    });
    common_vendor.onShow(() => {
    });
    const loadUserInfo = async () => {
      try {
        const { data } = await src_api_user.getUserInfoAPI();
        if (data.code === 0) {
          userStore.setUserInfo(data.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/pointsDetail.vue:110", "获取用户信息失败:", error);
      }
    };
    const loadPointsRecords = async (isLoadMore = false) => {
      if (isLoadMore) {
        if (isLoadingMore.value || !hasMore.value)
          return;
        isLoadingMore.value = true;
      } else {
        if (isLoading.value)
          return;
        isLoading.value = true;
      }
      try {
        const page = isLoadMore ? currentPage.value + 1 : 1;
        const { data } = await src_api_user.getPointsRecordsAPI({
          page,
          pageSize: pageSize.value
        });
        if (data.code === 0) {
          const records = data.data.list || [];
          total.value = data.data.total || 0;
          if (isLoadMore) {
            pointsRecords.value = [...pointsRecords.value, ...records];
            currentPage.value = page;
          } else {
            pointsRecords.value = records;
            currentPage.value = 1;
          }
          const loadedCount = pointsRecords.value.length;
          hasMore.value = loadedCount < total.value;
        } else {
          common_vendor.index.showToast({
            title: data.msg || "获取屁币记录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/pointsDetail.vue:156", "获取屁币记录失败:", error);
        common_vendor.index.showToast({
          title: "获取屁币记录失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        isLoadingMore.value = false;
      }
    };
    const onRefresh = async () => {
      if (isRefreshing.value)
        return;
      isRefreshing.value = true;
      try {
        currentPage.value = 1;
        hasMore.value = true;
        await loadPointsRecords(false);
        await loadUserInfo();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/pointsDetail.vue:184", "刷新失败:", error);
      } finally {
        isRefreshing.value = false;
      }
    };
    const onScrollToLower = () => {
      if (!hasMore.value || isLoadingMore.value || isLoading.value)
        return;
      loadPointsRecords(true);
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) {
          common_vendor.index.__f__("error", "at pages/me/pointsDetail.vue:206", "无效的时间格式:", timeStr);
          return "";
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const today = /* @__PURE__ */ new Date();
        const isToday = year === today.getFullYear() && month === String(today.getMonth() + 1).padStart(2, "0") && day === String(today.getDate()).padStart(2, "0");
        if (isToday) {
          return `今天 ${hours}:${minutes}`;
        } else {
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/pointsDetail.vue:227", "时间格式化错误:", error, timeStr);
        return "";
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(currentPoints.value),
        b: pointsRecords.value.length === 0
      }, pointsRecords.value.length === 0 ? {} : {
        c: common_vendor.f(pointsRecords.value, (record, index, i0) => {
          return {
            a: common_vendor.t(record.pointsType === 1 ? "获得" : "扣除"),
            b: common_vendor.n(record.pointsType === 1 ? "type-add" : "type-deduct"),
            c: common_vendor.t(record.remark || "屁币变动"),
            d: common_vendor.t(formatTime(record.createdAt || record.CreatedAt)),
            e: common_vendor.t(record.pointsType === 1 ? "+" : "-"),
            f: common_vendor.t(record.points),
            g: common_vendor.n(record.pointsType === 1 ? "points-add" : "points-deduct"),
            h: record.id || index
          };
        })
      }, {
        d: isLoadingMore.value && pointsRecords.value.length > 0
      }, isLoadingMore.value && pointsRecords.value.length > 0 ? {} : {}, {
        e: !hasMore.value && pointsRecords.value.length > 0
      }, !hasMore.value && pointsRecords.value.length > 0 ? {} : {}, {
        f: isRefreshing.value,
        g: common_vendor.o(onRefresh),
        h: common_vendor.o(onScrollToLower)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f53ae4eb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/me/pointsDetail.js.map
