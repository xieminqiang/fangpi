"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_user = require("../../src/api/user.js");
const src_api_achievement = require("../../src/api/achievement.js");
require("../../src/util/http.js");
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
    const points = common_vendor.computed(() => userStore.points);
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
    const pointsInsufficientPopup = common_vendor.ref(null);
    const currentPoints = common_vendor.ref(0);
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
    let videoAd = null;
    let videoAdForPoints = null;
    common_vendor.onMounted(() => {
      initRewardedVideoAd();
      initRewardedVideoAdForPoints();
      if (userStore.token) {
        common_vendor.index.__f__("log", "at pages/me/index.vue:337", "已有 token，直接加载用户信息");
        loadUserInfo();
        loadAchievements();
        loadAppConfig();
        loadLevelConfigs();
      } else {
        common_vendor.index.__f__("log", "at pages/me/index.vue:343", "暂无 token，等待登录完成...");
      }
      common_vendor.index.$on("loginSuccess", onLoginSuccess);
      common_vendor.index.$on("userInfoUpdated", () => {
        common_vendor.index.__f__("log", "at pages/me/index.vue:351", "收到用户信息更新事件，刷新数据...");
        loadUserInfo();
        loadAchievements();
        loadLevelConfigs();
      });
    });
    const onLoginSuccess = () => {
      common_vendor.index.__f__("log", "at pages/me/index.vue:360", "收到 loginSuccess 事件，开始加载用户信息");
      loadUserInfo();
      loadAchievements();
      loadAppConfig();
      loadLevelConfigs();
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/me/index.vue:369", "me页面显示，刷新数据...");
      loadUserInfo();
      loadAchievements();
      loadAppConfig();
      loadLevelConfigs();
    });
    const loadAppConfig = async () => {
    };
    const loadLevelConfigs = async () => {
      try {
        const { data } = await src_api_level.getAllLevelConfigsAPI();
        if (data.code === 0) {
          levelConfigs.value = data.data || [];
          common_vendor.index.__f__("log", "at pages/me/index.vue:396", "等级配置已加载:", levelConfigs.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/index.vue:399", "获取等级配置失败:", error);
      }
    };
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", onLoginSuccess);
      common_vendor.index.$off("userInfoUpdated");
      if (videoAd) {
        videoAd.destroy();
        videoAd = null;
      }
      if (videoAdForPoints) {
        videoAdForPoints.destroy();
        videoAdForPoints = null;
      }
    });
    const loadUserInfo = async () => {
      try {
        const { data } = await src_api_user.getUserInfoAPI();
        if (data.code === 0) {
          userStore.setUserInfo(data.data);
          common_vendor.index.__f__("log", "at pages/me/index.vue:428", "用户信息已更新:", data.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/index.vue:431", "获取用户信息失败:", error);
      }
    };
    const loadAchievements = async () => {
      try {
        const response = await src_api_achievement.getUserAchievementsAPI();
        if (response.data.code === 0) {
          achievementData.value = response.data.data;
          common_vendor.index.__f__("log", "at pages/me/index.vue:441", "成就数据已更新:", response.data.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/index.vue:444", "获取成就数据失败:", error);
      }
    };
    const goToAchievements = () => {
      common_vendor.index.navigateTo({
        url: "/pages/achievement/achievement"
      });
    };
    const goToLevel = () => {
      common_vendor.index.navigateTo({
        url: "/pages/profile/level"
      });
    };
    const goToEdit = () => {
      common_vendor.index.navigateTo({
        url: "/pages/me/edit"
      });
    };
    const initRewardedVideoAdCommon = (adUnitId, config) => {
      if (common_vendor.wx$1.createRewardedVideoAd) {
        const ad = common_vendor.wx$1.createRewardedVideoAd({
          adUnitId
        });
        ad.onLoad(() => {
          common_vendor.index.__f__("log", "at pages/me/index.vue:479", config.loadMessage || "激励视频广告加载成功");
        });
        ad.onError((err) => {
          common_vendor.index.__f__("error", "at pages/me/index.vue:483", config.errorMessage || "激励视频广告加载失败", err);
          if (config.onError && typeof config.onError === "function") {
            config.onError(err);
          }
        });
        ad.onClose(async (res) => {
          if (res && res.isEnded) {
            common_vendor.index.__f__("log", "at pages/me/index.vue:493", config.successMessage || "用户看完了激励视频广告");
            if (config.onSuccess && typeof config.onSuccess === "function") {
              await config.onSuccess();
            }
          } else {
            common_vendor.index.__f__("log", "at pages/me/index.vue:499", config.cancelMessage || "用户提前关闭了激励视频广告");
            common_vendor.index.showToast({
              title: config.cancelToast || "需要看完广告才能继续",
              icon: "none",
              duration: 2e3
            });
          }
        });
        return ad;
      }
      return null;
    };
    const initRewardedVideoAd = () => {
      videoAd = initRewardedVideoAdCommon("adunit-2ec9fad091c1156c", {
        loadMessage: "激励视频广告加载成功",
        errorMessage: "激励视频广告加载失败",
        successMessage: "用户看完了激励视频广告，允许进入智能分析页面",
        cancelMessage: "用户提前关闭了激励视频广告",
        cancelToast: "需要看完广告才能进入",
        onSuccess: async () => {
          common_vendor.index.navigateTo({
            url: "/pages/me/aiFx"
          });
        }
      });
    };
    const initRewardedVideoAdForPoints = () => {
      videoAdForPoints = initRewardedVideoAdCommon("adunit-2ec9fad091c1156c", {
        loadMessage: "赚取屁币激励视频广告加载成功",
        errorMessage: "赚取屁币激励视频广告加载失败",
        successMessage: "用户看完了赚取屁币激励视频广告",
        cancelMessage: "用户提前关闭了赚取屁币激励视频广告",
        cancelToast: "需要看完视频才能获得屁币哦~",
        onError: (err) => {
          if (err.errCode === 1004) {
            common_vendor.index.showToast({
              title: "暂时没有可用的视频，请稍后再试",
              icon: "none"
            });
          }
        },
        onSuccess: async () => {
          await updatePointsForPopup(30, "观看激励视频广告奖励");
          closePointsInsufficientPopup();
        }
      });
    };
    const watchAdForPoints = () => {
      if (!videoAdForPoints) {
        common_vendor.index.showToast({
          title: "视频未准备好，请稍后再试",
          icon: "none"
        });
        return;
      }
      videoAdForPoints.show().catch((err) => {
        common_vendor.index.__f__("error", "at pages/me/index.vue:570", "广告显示失败，尝试重新加载", err);
        videoAdForPoints.load().then(() => {
          return videoAdForPoints.show();
        }).catch((loadErr) => {
          common_vendor.index.__f__("error", "at pages/me/index.vue:579", "广告加载或显示失败", loadErr);
          if (loadErr.errCode === 1004) {
            common_vendor.index.showToast({
              title: "暂时没有可用的视频，请稍后再试",
              icon: "none"
            });
          } else {
            common_vendor.index.showToast({
              title: "视频加载失败，请稍后再试",
              icon: "none"
            });
          }
        });
      });
    };
    const updatePointsForPopup = async (points2, remark) => {
      try {
        const { data } = await src_api_user.updateUserPointsAPI({
          points: points2,
          pointsType: 1,
          // 1代表增加屁币
          remark
        });
        if (data.code === 0) {
          common_vendor.index.__f__("log", "at pages/me/index.vue:614", "屁币更新成功，当前屁币:", data.data.points);
          userStore.setUserInfo(data.data);
          common_vendor.index.showToast({
            title: `🎉 获得${points2}屁币！当前屁币：${data.data.points}`,
            icon: "none",
            duration: 2500
          });
        } else {
          common_vendor.index.__f__("error", "at pages/me/index.vue:625", "屁币更新失败:", data.msg);
          common_vendor.index.showToast({
            title: data.msg || "屁币更新失败，请稍后重试",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/index.vue:632", "更新屁币失败:", error);
        common_vendor.index.showToast({
          title: "屁币更新失败，请稍后重试",
          icon: "none"
        });
      }
    };
    const goToAiFx = () => {
      var _a;
      const points2 = userStore.points || 0;
      currentPoints.value = points2;
      if (points2 >= 15) {
        common_vendor.index.__f__("log", "at pages/me/index.vue:648", "屁币足够，直接跳转到智能分析页面");
        common_vendor.index.navigateTo({
          url: "/pages/me/aiFx"
        });
        return;
      }
      (_a = pointsInsufficientPopup.value) == null ? void 0 : _a.open();
    };
    const closePointsInsufficientPopup = () => {
      var _a;
      (_a = pointsInsufficientPopup.value) == null ? void 0 : _a.close();
    };
    const goToPointsFromPopup = () => {
      watchAdForPoints();
    };
    const goToIndex = () => {
      common_vendor.index.navigateTo({
        url: "/pages/entry/index"
      });
    };
    const goToPoints = () => {
      common_vendor.index.navigateTo({
        url: "/pages/me/points"
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
      common_vendor.index.__f__("log", "at pages/me/index.vue:719", "准备分享成就:", selectedAchievement.value.achievementName);
    };
    common_vendor.onShareAppMessage(() => {
      if (selectedAchievement.value && selectedAchievement.value.isUnlocked) {
        return {
          title: `我解锁了「${selectedAchievement.value.achievementName}」成就！🎉`,
          path: "/pages/index/index",
          imageUrl: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/share_bg.png"
        };
      }
      return {
        title: "快来一起记录放屁，解锁成就吧！💨",
        path: "/pages/index/index",
        imageUrl: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/share_bg.png"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: avatar.value,
        b: common_vendor.o(goToEdit),
        c: common_vendor.t(nickname.value),
        d: common_assets._imports_1$4,
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
        m: common_assets._imports_1$4,
        n: common_vendor.o(goToLevel),
        o: common_assets._imports_1$4,
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
        r: common_vendor.t(selectedAchievement.value && selectedAchievement.value.isUnlocked ? `恭喜您已获得了"${selectedAchievement.value.achievementName}"` : "您还未解锁该成就"),
        s: common_vendor.o(closeAchievementDetail),
        t: selectedAchievement.value
      }, selectedAchievement.value ? common_vendor.e({
        v: selectedAchievement.value.achievementGif
      }, selectedAchievement.value.achievementGif ? {
        w: selectedAchievement.value.achievementGif
      } : selectedAchievement.value.achievementIcon ? {
        y: selectedAchievement.value.achievementIcon
      } : {
        z: common_vendor.t(selectedAchievement.value.achievementEmoji)
      }, {
        x: selectedAchievement.value.achievementIcon,
        A: common_vendor.t(selectedAchievement.value.achievementName),
        B: common_vendor.t(selectedAchievement.value.achievementDesc),
        C: selectedAchievement.value.progress + "%",
        D: selectedAchievement.value.isUnlocked ? 1 : "",
        E: common_vendor.t(selectedAchievement.value.progress),
        F: common_vendor.t(selectedAchievement.value.rewardExp),
        G: selectedAchievement.value.isUnlocked
      }, selectedAchievement.value.isUnlocked ? {
        H: common_vendor.t(formatTime(selectedAchievement.value.unlockTime))
      } : {}, {
        I: selectedAchievement.value.isUnlocked
      }, selectedAchievement.value.isUnlocked ? {
        J: common_vendor.o(handleShare)
      } : {}, {
        K: common_vendor.o(closeAchievementDetail)
      }) : {}, {
        L: common_vendor.sr(achievementPopup, "c8e26b33-0", {
          "k": "achievementPopup"
        }),
        M: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        }),
        N: showFartEncyclopediaEntry.value
      }, showFartEncyclopediaEntry.value ? {
        O: common_assets._imports_1$2,
        P: common_assets._imports_1$4,
        Q: common_vendor.o(goToAiFx)
      } : {}, {
        R: common_assets._imports_0$4,
        S: common_vendor.t(currentPoints.value),
        T: common_vendor.t(15 - currentPoints.value),
        U: common_vendor.o(closePointsInsufficientPopup),
        V: common_vendor.o(goToPointsFromPopup),
        W: common_vendor.sr(pointsInsufficientPopup, "c8e26b33-1", {
          "k": "pointsInsufficientPopup"
        }),
        X: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        }),
        Y: showFartEncyclopediaEntry.value
      }, showFartEncyclopediaEntry.value ? {
        Z: common_assets._imports_3$1,
        aa: common_assets._imports_1$4,
        ab: common_vendor.o(goToIndex)
      } : {}, {
        ac: common_assets._imports_0$4,
        ad: common_vendor.t(points.value || 0),
        ae: common_assets._imports_1$4,
        af: common_vendor.o(goToPoints)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c8e26b33"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/me/index.js.map
