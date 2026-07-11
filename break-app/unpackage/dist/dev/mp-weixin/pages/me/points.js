"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_user = require("../../src/api/user.js");
const src_stores_user = require("../../src/stores/user.js");
const _sfc_main = {
  __name: "points",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    const currentPoints = common_vendor.computed(() => userStore.points);
    let videoAd30s = null;
    const isAdAvailable = common_vendor.ref(true);
    common_vendor.onMounted(() => {
      initRewardedVideoAds();
      loadUserInfo();
    });
    common_vendor.onShow(() => {
      loadUserInfo();
    });
    common_vendor.onUnmounted(() => {
      if (videoAd30s) {
        videoAd30s.destroy();
        videoAd30s = null;
      }
    });
    const loadUserInfo = async () => {
      try {
        const { data } = await src_api_user.getUserInfoAPI();
        if (data.code === 0) {
          userStore.setUserInfo(data.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/points.vue:150", "获取用户信息失败:", error);
      }
    };
    const initRewardedVideoAds = () => {
      if (common_vendor.wx$1.createRewardedVideoAd) {
        videoAd30s = common_vendor.wx$1.createRewardedVideoAd({
          adUnitId: "adunit-2ec9fad091c1156c"
        });
        videoAd30s.onLoad(() => {
          common_vendor.index.__f__("log", "at pages/me/points.vue:164", "30秒激励视频广告加载成功");
          isAdAvailable.value = true;
        });
        videoAd30s.onError((err) => {
          common_vendor.index.__f__("error", "at pages/me/points.vue:169", "30秒激励视频广告错误", err);
          if (err.errCode === 1004) {
            common_vendor.index.__f__("log", "at pages/me/points.vue:176", "当前没有可用的广告");
            isAdAvailable.value = false;
          } else {
            common_vendor.index.__f__("error", "at pages/me/points.vue:180", "广告加载异常:", err.errMsg || err);
          }
        });
        videoAd30s.onClose(async (res) => {
          if (res && res.isEnded) {
            common_vendor.index.__f__("log", "at pages/me/points.vue:189", "用户看完了30秒激励视频广告");
            await updatePoints(30, "观看激励视频广告奖励");
          } else {
            common_vendor.index.__f__("log", "at pages/me/points.vue:192", "用户提前关闭了30秒激励视频广告");
            common_vendor.index.showToast({
              title: "需要看完视频才能获得屁币哦~",
              icon: "none",
              duration: 2e3
            });
          }
        });
      }
    };
    const watchAd30s = () => {
      if (!videoAd30s) {
        common_vendor.index.showToast({
          title: "视频未准备好，请稍后再试",
          icon: "none"
        });
        return;
      }
      videoAd30s.show().catch((err) => {
        common_vendor.index.__f__("error", "at pages/me/points.vue:218", "广告显示失败，尝试重新加载", err);
        videoAd30s.load().then(() => {
          return videoAd30s.show();
        }).catch((loadErr) => {
          common_vendor.index.__f__("error", "at pages/me/points.vue:227", "广告加载或显示失败", loadErr);
          if (loadErr.errCode === 1004) {
            isAdAvailable.value = false;
            common_vendor.index.showToast({
              title: "暂时没有可用的视频，请稍后再试",
              icon: "none",
              duration: 2e3
            });
          } else {
            common_vendor.index.showToast({
              title: "视频加载失败，请稍后重试",
              icon: "none"
            });
          }
        });
      });
    };
    const updatePoints = async (points, remark) => {
      try {
        const { data } = await src_api_user.updateUserPointsAPI({
          points,
          pointsType: 1,
          // 1代表增加屁币
          remark
        });
        if (data.code === 0) {
          common_vendor.index.__f__("log", "at pages/me/points.vue:265", "屁币更新成功，当前屁币:", data.data.points);
          userStore.setUserInfo(data.data);
          common_vendor.index.showToast({
            title: `🎉 获得${points}屁币！当前屁币：${data.data.points}`,
            icon: "none",
            duration: 2500
          });
        } else {
          common_vendor.index.__f__("error", "at pages/me/points.vue:276", "屁币更新失败:", data.msg);
          common_vendor.index.showToast({
            title: data.msg || "屁币更新失败，请稍后重试",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/points.vue:283", "更新屁币失败:", error);
        common_vendor.index.showToast({
          title: "屁币更新失败，请稍后重试",
          icon: "none"
        });
      }
    };
    const goToPointsDetail = () => {
      common_vendor.index.navigateTo({
        url: "/pages/me/pointsDetail"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$4,
        b: common_vendor.t(currentPoints.value),
        c: common_assets._imports_1$4,
        d: common_vendor.o(goToPointsDetail),
        e: isAdAvailable.value
      }, isAdAvailable.value ? {
        f: common_vendor.o(watchAd30s)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f8d1908e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/me/points.js.map
