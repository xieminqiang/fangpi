"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_ai = require("../../src/api/ai.js");
const src_stores_user = require("../../src/stores/user.js");
const CACHE_KEY = "ai_analysis_cache";
const CACHE_EXPIRE_TIME = 60 * 60 * 1e3;
const _sfc_main = {
  __name: "aiFx",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    const isLoading = common_vendor.ref(true);
    const healthScore = common_vendor.ref(0);
    const patencyIndex = common_vendor.ref(0);
    const airflowActivity = common_vendor.ref(0);
    const reviewText = common_vendor.ref("");
    const healthAdvice = common_vendor.ref([]);
    const getCacheData = () => {
      try {
        const cacheStr = common_vendor.index.getStorageSync(CACHE_KEY);
        if (!cacheStr)
          return null;
        const cache = JSON.parse(cacheStr);
        const now = Date.now();
        if (now - cache.timestamp > CACHE_EXPIRE_TIME) {
          common_vendor.index.removeStorageSync(CACHE_KEY);
          return null;
        }
        return cache.data;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/aiFx.vue:132", "读取缓存失败:", error);
        return null;
      }
    };
    const saveCacheData = (data) => {
      try {
        const cache = {
          timestamp: Date.now(),
          data
        };
        common_vendor.index.setStorageSync(CACHE_KEY, JSON.stringify(cache));
        common_vendor.index.__f__("log", "at pages/me/aiFx.vue:145", "缓存已保存");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/aiFx.vue:147", "保存缓存失败:", error);
      }
    };
    const applyDataToPage = (data) => {
      var _a, _b;
      healthScore.value = data.healthScore || 0;
      patencyIndex.value = data.patencyIndex || 0;
      airflowActivity.value = data.airflowActivity || 0;
      reviewText.value = data.reviewText || "";
      const advice = [];
      if (data.dietAdvice)
        advice.push(data.dietAdvice);
      if (data.lifestyleTip)
        advice.push(data.lifestyleTip);
      if (((_b = (_a = data.intestinalHealth) == null ? void 0 : _a.potentialIssues) == null ? void 0 : _b.length) > 0) {
        advice.push(...data.intestinalHealth.potentialIssues.slice(0, 2));
      }
      healthAdvice.value = advice.length > 0 ? advice : ["继续保持良好的生活习惯"];
    };
    const loadAiAnalysis = async (useCache = true) => {
      if (useCache) {
        const cachedData = getCacheData();
        if (cachedData) {
          common_vendor.index.__f__("log", "at pages/me/aiFx.vue:174", "使用缓存数据");
          applyDataToPage(cachedData);
          isLoading.value = false;
          return;
        }
      }
      isLoading.value = true;
      try {
        const response = await src_api_ai.getAiPersonalityReviewAPI();
        if (response.data.code === 0) {
          const data = response.data.data;
          applyDataToPage(data);
          saveCacheData(data);
          common_vendor.index.__f__("log", "at pages/me/aiFx.vue:194", "智能分析数据已加载:", data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/aiFx.vue:197", "获取智能分析失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "error"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const getHealthClass = (score) => {
      if (score >= 85)
        return "health-excellent";
      if (score >= 70)
        return "health-good";
      if (score >= 60)
        return "health-normal";
      return "health-poor";
    };
    common_vendor.onMounted(() => {
      if (userStore.token) {
        loadAiAnalysis(true);
      } else {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {} : {
        b: common_assets._imports_0$5,
        c: common_vendor.t(healthScore.value || 0),
        d: (healthScore.value || 0) + "%",
        e: common_vendor.n(getHealthClass(healthScore.value || 0)),
        f: common_vendor.t(patencyIndex.value || 0),
        g: (patencyIndex.value || 0) + "%",
        h: common_vendor.t(airflowActivity.value || 0),
        i: (airflowActivity.value || 0) + "%",
        j: common_vendor.t(reviewText.value || "正在生成评估报告..."),
        k: common_vendor.f(healthAdvice.value, (advice, index, i0) => {
          return {
            a: common_vendor.t(advice),
            b: index
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-38a9e170"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/me/aiFx.js.map
