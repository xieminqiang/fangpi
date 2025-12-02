"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_user = require("../../src/api/user.js");
const src_api_achievement = require("../../src/api/achievement.js");
const src_api_app_config = require("../../src/api/app_config.js");
const src_api_level = require("../../src/api/level.js");
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
  __name: "index",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    common_vendor.computed(() => userStore.userInfo);
    const nickname = common_vendor.computed(() => userStore.nickname);
    const avatar = common_vendor.computed(() => userStore.avatar);
    const level = common_vendor.computed(() => userStore.level);
    const levelName = common_vendor.computed(() => userStore.levelName);
    const totalFarts = common_vendor.computed(() => userStore.totalFarts);
    const experience = common_vendor.computed(() => userStore.experience);
    const achievementData = common_vendor.ref({
      achievements: [],
      totalCount: 0,
      unlockedCount: 0
    });
    const selectedAchievement = common_vendor.ref(null);
    const achievementPopup = common_vendor.ref(null);
    const showFartEncyclopediaEntry = common_vendor.ref(true);
    const levelConfigs = common_vendor.ref([]);
    const currentLevelConfig = common_vendor.computed(() => {
      if (levelConfigs.value.length === 0 || !level.value) {
        return null;
      }
      return levelConfigs.value.find((config) => config.level === level.value) || null;
    });
    const firstFourAchievements = common_vendor.computed(() => {
      return achievementData.value.achievements.slice(0, 4);
    });
    common_vendor.ref(42);
    common_vendor.ref(6);
    common_vendor.ref("响亮型");
    common_vendor.ref("浓烈");
    common_vendor.onMounted(() => {
      if (userStore.token) {
        common_vendor.index.__f__("log", "at pages/me/index.vue:244", "已有 token，直接加载用户信息");
        loadUserInfo();
        loadAchievements();
        loadAppConfig();
        loadLevelConfigs();
      } else {
        common_vendor.index.__f__("log", "at pages/me/index.vue:250", "暂无 token，等待登录完成...");
      }
      common_vendor.index.$on("loginSuccess", onLoginSuccess);
      common_vendor.index.$on("userInfoUpdated", () => {
        common_vendor.index.__f__("log", "at pages/me/index.vue:258", "收到用户信息更新事件，刷新数据...");
        loadUserInfo();
        loadAchievements();
        loadLevelConfigs();
      });
    });
    const onLoginSuccess = () => {
      common_vendor.index.__f__("log", "at pages/me/index.vue:267", "收到 loginSuccess 事件，开始加载用户信息");
      loadUserInfo();
      loadAchievements();
      loadAppConfig();
      loadLevelConfigs();
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/me/index.vue:276", "me页面显示，刷新数据...");
      loadUserInfo();
      loadAchievements();
      loadAppConfig();
      loadLevelConfigs();
    });
    const loadAppConfig = async () => {
      try {
        const { data } = await src_api_app_config.getShowFartEncyclopediaEntryAPI();
        if (data.code === 0) {
          showFartEncyclopediaEntry.value = data.data === true || data.data === "true";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/index.vue:291", "获取应用配置失败:", error);
        showFartEncyclopediaEntry.value = true;
      }
    };
    const loadLevelConfigs = async () => {
      try {
        const { data } = await src_api_level.getAllLevelConfigsAPI();
        if (data.code === 0) {
          levelConfigs.value = data.data || [];
          common_vendor.index.__f__("log", "at pages/me/index.vue:303", "等级配置已加载:", levelConfigs.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/index.vue:306", "获取等级配置失败:", error);
      }
    };
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", onLoginSuccess);
      common_vendor.index.$off("userInfoUpdated");
    });
    const loadUserInfo = async () => {
      try {
        const { data } = await src_api_user.getUserInfoAPI();
        if (data.code === 0) {
          userStore.setUserInfo(data.data);
          common_vendor.index.__f__("log", "at pages/me/index.vue:323", "用户信息已更新:", data.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/index.vue:326", "获取用户信息失败:", error);
      }
    };
    const loadAchievements = async () => {
      try {
        const response = await src_api_achievement.getUserAchievementsAPI();
        if (response.data.code === 0) {
          achievementData.value = response.data.data;
          common_vendor.index.__f__("log", "at pages/me/index.vue:336", "成就数据已更新:", response.data.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/index.vue:339", "获取成就数据失败:", error);
      }
    };
    const goToAchievements = () => {
      common_vendor.index.navigateTo({
        url: "/pages/achievement/achievement"
      });
    };
    const goToLevel = () => {
      common_vendor.index.navigateTo({
        url: "/pages/me/level"
      });
    };
    const goToEdit = () => {
      common_vendor.index.navigateTo({
        url: "/pages/me/edit"
      });
    };
    const goToAiFx = () => {
      common_vendor.index.navigateTo({
        url: "/pages/me/aiFx"
      });
    };
    const goToIndex = () => {
      common_vendor.index.navigateTo({
        url: "/pages/entry/index"
      });
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
      common_vendor.index.__f__("log", "at pages/me/index.vue:408", "准备分享成就:", selectedAchievement.value.achievementName);
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
        a: avatar.value,
        b: common_vendor.o(goToEdit),
        c: common_vendor.t(nickname.value),
        d: common_assets._imports_0$4,
        e: common_vendor.o(goToEdit),
        f: common_vendor.t(totalFarts.value),
        g: common_vendor.o(goToLevel),
        h: common_vendor.t(experience.value),
        i: common_vendor.o(goToLevel),
        j: currentLevelConfig.value && currentLevelConfig.value.icon
      }, currentLevelConfig.value && currentLevelConfig.value.icon ? {
        k: currentLevelConfig.value.icon
      } : {}, {
        l: common_vendor.t(levelName.value),
        m: common_assets._imports_0$4,
        n: common_vendor.o(goToLevel),
        o: common_assets._imports_0$4,
        p: common_vendor.o(goToAchievements),
        q: common_vendor.f(firstFourAchievements.value, (achievement, index, i0) => {
          return common_vendor.e({
            a: achievement.achievementIcon
          }, achievement.achievementIcon ? {
            b: achievement.achievementIcon
          } : {
            c: common_vendor.t(achievement.achievementEmoji)
          }, {
            d: index === 0 ? 1 : "",
            e: index === 1 ? 1 : "",
            f: index === 2 ? 1 : "",
            g: !achievement.isUnlocked ? 1 : "",
            h: common_vendor.t(achievement.achievementName),
            i: achievement.id,
            j: common_vendor.o(($event) => showAchievementDetail(achievement), achievement.id)
          });
        }),
        r: common_vendor.o(closeAchievementDetail),
        s: selectedAchievement.value
      }, selectedAchievement.value ? common_vendor.e({
        t: selectedAchievement.value.achievementGif
      }, selectedAchievement.value.achievementGif ? {
        v: selectedAchievement.value.achievementGif
      } : selectedAchievement.value.achievementIcon ? {
        x: selectedAchievement.value.achievementIcon
      } : {
        y: common_vendor.t(selectedAchievement.value.achievementEmoji)
      }, {
        w: selectedAchievement.value.achievementIcon,
        z: common_vendor.t(selectedAchievement.value.achievementName),
        A: common_vendor.t(selectedAchievement.value.achievementDesc),
        B: selectedAchievement.value.progress + "%",
        C: selectedAchievement.value.isUnlocked ? 1 : "",
        D: common_vendor.t(selectedAchievement.value.progress),
        E: common_vendor.t(selectedAchievement.value.rewardExp),
        F: selectedAchievement.value.isUnlocked
      }, selectedAchievement.value.isUnlocked ? {
        G: common_vendor.t(formatTime(selectedAchievement.value.unlockTime))
      } : {}, {
        H: selectedAchievement.value.isUnlocked
      }, selectedAchievement.value.isUnlocked ? {
        I: common_vendor.o(handleShare)
      } : {}, {
        J: common_vendor.o(closeAchievementDetail)
      }) : {}, {
        K: common_vendor.sr(achievementPopup, "c8e26b33-0", {
          "k": "achievementPopup"
        }),
        L: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        }),
        M: showFartEncyclopediaEntry.value
      }, showFartEncyclopediaEntry.value ? {
        N: common_assets._imports_1$2,
        O: common_assets._imports_0$4,
        P: common_vendor.o(goToAiFx)
      } : {}, {
        Q: showFartEncyclopediaEntry.value
      }, showFartEncyclopediaEntry.value ? {
        R: common_assets._imports_2$1,
        S: common_assets._imports_0$4,
        T: common_vendor.o(goToIndex)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c8e26b33"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/me/index.js.map
