"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_achievement = require("../../src/api/achievement.js");
const src_stores_user = require("../../src/stores/user.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "achievement",
  setup(__props) {
    const loading = common_vendor.ref(false);
    const achievementData = common_vendor.ref({
      achievements: [],
      totalCount: 0,
      unlockedCount: 0
    });
    const selectedAchievement = common_vendor.ref(null);
    const achievementPopup = common_vendor.ref(null);
    const isSharing = common_vendor.ref(false);
    const completionRate = common_vendor.computed(() => {
      if (achievementData.value.totalCount === 0)
        return 0;
      return Math.round(achievementData.value.unlockedCount / achievementData.value.totalCount * 100);
    });
    common_vendor.onMounted(() => {
      const userStore = src_stores_user.useUserStore();
      if (userStore.token) {
        common_vendor.index.__f__("log", "at pages/achievement/achievement.vue:212", "已有 token，直接加载成就数据");
        loadAchievements();
      } else {
        common_vendor.index.__f__("log", "at pages/achievement/achievement.vue:215", "暂无 token，等待登录完成...");
      }
      common_vendor.index.$on("loginSuccess", onLoginSuccess);
      common_vendor.index.$on("userInfoUpdated", () => {
        common_vendor.index.__f__("log", "at pages/achievement/achievement.vue:223", "收到用户信息更新事件，刷新成就数据...");
        loadAchievements();
      });
    });
    const onLoginSuccess = () => {
      common_vendor.index.__f__("log", "at pages/achievement/achievement.vue:230", "收到 loginSuccess 事件，开始加载成就数据");
      loadAchievements();
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/achievement/achievement.vue:236", "成就页面显示，刷新数据...");
      loadAchievements();
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", onLoginSuccess);
      common_vendor.index.$off("userInfoUpdated");
    });
    const loadAchievements = async () => {
      loading.value = true;
      try {
        const response = await src_api_achievement.getUserAchievementsAPI();
        common_vendor.index.__f__("log", "at pages/achievement/achievement.vue:251", "response", response);
        if (response.data.code === 0) {
          achievementData.value = response.data.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/achievement/achievement.vue:256", "加载成就数据失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const showAchievementDetail = (achievement) => {
      selectedAchievement.value = achievement;
      achievementPopup.value.open();
    };
    const closeAchievementDetail = () => {
      achievementPopup.value.close();
      selectedAchievement.value = null;
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };
    const handleShare = () => {
      if (!selectedAchievement.value || !selectedAchievement.value.isUnlocked) {
        common_vendor.index.showToast({
          title: "该成就尚未解锁",
          icon: "none"
        });
        return;
      }
      isSharing.value = true;
      common_vendor.index.__f__("log", "at pages/achievement/achievement.vue:294", "准备分享成就:", selectedAchievement.value.achievementName);
    };
    common_vendor.onShareAppMessage(() => {
      if (selectedAchievement.value && selectedAchievement.value.isUnlocked) {
        return {
          title: `我解锁了「${selectedAchievement.value.achievementName}」成就！🎉`,
          path: "/pages/index/index",
          imageUrl: selectedAchievement.value.achievementIcon || selectedAchievement.value.achievementGif || ""
        };
      }
      return {
        title: "快来一起记录放屁，解锁成就吧！💨",
        path: "/pages/index/index"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(achievementData.value.unlockedCount),
        b: common_vendor.t(achievementData.value.totalCount),
        c: common_vendor.t(completionRate.value),
        d: common_vendor.f(achievementData.value.achievements, (achievement, k0, i0) => {
          return common_vendor.e({
            a: achievement.achievementIcon
          }, achievement.achievementIcon ? {
            b: achievement.achievementIcon
          } : {
            c: common_vendor.t(achievement.achievementEmoji)
          }, {
            d: achievement.isUnlocked
          }, achievement.isUnlocked ? {
            e: common_assets._imports_0$6
          } : {
            f: common_vendor.t(achievement.progress)
          }, {
            g: common_vendor.t(achievement.achievementName),
            h: common_vendor.t(achievement.achievementDesc),
            i: achievement.progress + "%",
            j: achievement.isUnlocked ? 1 : "",
            k: common_vendor.t(achievement.progress),
            l: common_vendor.t(achievement.rewardExp),
            m: achievement.id,
            n: achievement.isUnlocked ? 1 : "",
            o: !achievement.isUnlocked ? 1 : "",
            p: common_vendor.o(($event) => showAchievementDetail(achievement), achievement.id)
          });
        }),
        e: common_vendor.o(closeAchievementDetail),
        f: selectedAchievement.value
      }, selectedAchievement.value ? common_vendor.e({
        g: selectedAchievement.value.achievementGif
      }, selectedAchievement.value.achievementGif ? {
        h: selectedAchievement.value.achievementGif
      } : selectedAchievement.value.achievementIcon ? {
        j: selectedAchievement.value.achievementIcon
      } : {
        k: common_vendor.t(selectedAchievement.value.achievementEmoji)
      }, {
        i: selectedAchievement.value.achievementIcon,
        l: common_vendor.t(selectedAchievement.value.achievementName),
        m: common_vendor.t(selectedAchievement.value.achievementDesc),
        n: selectedAchievement.value.progress + "%",
        o: selectedAchievement.value.isUnlocked ? 1 : "",
        p: common_vendor.t(selectedAchievement.value.progress),
        q: common_vendor.t(selectedAchievement.value.rewardExp),
        r: selectedAchievement.value.isUnlocked
      }, selectedAchievement.value.isUnlocked ? {
        s: common_vendor.t(formatTime(selectedAchievement.value.unlockTime))
      } : {}, {
        t: selectedAchievement.value.isUnlocked
      }, selectedAchievement.value.isUnlocked ? {
        v: common_vendor.o(handleShare)
      } : {}, {
        w: common_vendor.o(closeAchievementDetail)
      }) : {}, {
        x: common_vendor.sr(achievementPopup, "127b3c96-0", {
          "k": "achievementPopup"
        }),
        y: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        }),
        z: loading.value
      }, loading.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-127b3c96"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/achievement/achievement.js.map
