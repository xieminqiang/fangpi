"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_ai = require("../../src/api/ai.js");
const src_api_user = require("../../src/api/user.js");
const src_stores_user = require("../../src/stores/user.js");
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
    const loadAiAnalysis = async () => {
      isLoading.value = true;
      try {
        const response = await src_api_ai.getAiPersonalityReviewAPI();
        if (response.data.code === 0) {
          const data = response.data.data;
          applyDataToPage(data);
          common_vendor.index.__f__("log", "at pages/me/aiFx.vue:138", "智能分析数据已加载:", data);
          await deductPoints();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/aiFx.vue:144", "获取智能分析失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "error"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const deductPoints = async () => {
      try {
        const currentPoints = userStore.points || 0;
        if (currentPoints < 15) {
          common_vendor.index.__f__("log", "at pages/me/aiFx.vue:160", "屁币不足15，跳过扣除");
          return;
        }
        const { data } = await src_api_user.updateUserPointsAPI({
          points: 15,
          pointsType: 2,
          // 2代表扣除屁币
          remark: "使用智能肠道健康分析"
        });
        if (data.code === 0) {
          common_vendor.index.__f__("log", "at pages/me/aiFx.vue:171", "屁币扣除成功，当前屁币:", data.data.points);
          userStore.setUserInfo(data.data);
          common_vendor.index.showToast({
            title: `已扣除15屁币，当前屁币：${data.data.points}`,
            icon: "none",
            duration: 2e3
          });
        } else {
          common_vendor.index.__f__("error", "at pages/me/aiFx.vue:182", "屁币扣除失败:", data.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/aiFx.vue:185", "扣除屁币失败:", error);
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
        loadAiAnalysis();
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
        a: common_assets._imports_0,
        b: isLoading.value
      }, isLoading.value ? {} : {
        c: common_assets._imports_1$5,
        d: common_vendor.t(healthScore.value || 0),
        e: (healthScore.value || 0) + "%",
        f: common_vendor.n(getHealthClass(healthScore.value || 0)),
        g: common_vendor.t(patencyIndex.value || 0),
        h: (patencyIndex.value || 0) + "%",
        i: common_vendor.t(airflowActivity.value || 0),
        j: (airflowActivity.value || 0) + "%",
        k: common_vendor.t(reviewText.value || "正在生成评估报告..."),
        l: common_vendor.f(healthAdvice.value, (advice, index, i0) => {
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
