"use strict";
const common_vendor = require("../../common/vendor.js");
const src_api_level = require("../../src/api/level.js");
const src_stores_user = require("../../src/stores/user.js");
const _sfc_main = {
  __name: "level",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    const levelList = common_vendor.ref([]);
    const userLevel = common_vendor.computed(() => userStore.level || 1);
    const userExperience = common_vendor.computed(() => userStore.experience || 0);
    const totalFarts = common_vendor.computed(() => userStore.totalFarts || 0);
    const currentUserLevel = common_vendor.computed(() => {
      return levelList.value.find((item) => item.level === userLevel.value) || {};
    });
    const isMaxLevel = common_vendor.computed(() => {
      if (!levelList.value || levelList.value.length === 0)
        return false;
      const maxLevel = Math.max(...levelList.value.map((item) => item.level || 0));
      return userLevel.value >= maxLevel;
    });
    const nextLevelExp = common_vendor.computed(() => {
      const nextLevel = levelList.value.find((item) => item.level === userLevel.value + 1);
      return nextLevel ? nextLevel.requiredExp : userExperience.value;
    });
    common_vendor.computed(() => {
      if (isMaxLevel.value)
        return 100;
      if (nextLevelExp.value === 0)
        return 100;
      const progress = userExperience.value / nextLevelExp.value * 100;
      return Math.min(progress, 100);
    });
    const isUnlocked = (level) => {
      return level <= userLevel.value;
    };
    common_vendor.onMounted(() => {
      if (userStore.token) {
        common_vendor.index.__f__("log", "at pages/profile/level.vue:179", "已有 token，直接加载等级配置");
        loadLevelConfigs();
      } else {
        common_vendor.index.__f__("log", "at pages/profile/level.vue:182", "暂无 token，等待登录完成...");
      }
      common_vendor.index.$on("loginSuccess", onLoginSuccess);
    });
    const onLoginSuccess = () => {
      common_vendor.index.__f__("log", "at pages/profile/level.vue:191", "收到 loginSuccess 事件，开始加载等级配置");
      loadLevelConfigs();
    };
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", onLoginSuccess);
    });
    const loadLevelConfigs = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const response = await src_api_level.getAllLevelConfigsAPI();
        if (response.data.code === 0) {
          const rawData = response.data.data;
          if (Array.isArray(rawData)) {
            levelList.value = rawData.sort((a, b) => a.level - b.level);
            common_vendor.index.__f__("log", "at pages/profile/level.vue:215", "✅ 等级配置加载成功", levelList.value);
          } else {
            common_vendor.index.__f__("error", "at pages/profile/level.vue:217", "❌ 返回的数据不是数组:", rawData);
            common_vendor.index.showToast({
              title: "数据格式错误",
              icon: "error"
            });
          }
        } else {
          common_vendor.index.__f__("error", "at pages/profile/level.vue:224", "❌ API 返回错误:", response.data.msg);
          common_vendor.index.showToast({
            title: response.data.msg || "加载失败",
            icon: "error"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/level.vue:231", "❌ 加载等级配置失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "error"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentUserLevel.value.levelImage
      }, currentUserLevel.value.levelImage ? {
        b: currentUserLevel.value.levelImage
      } : {}, {
        c: common_vendor.t(currentUserLevel.value.levelName || "新手屁民"),
        d: common_vendor.t(totalFarts.value),
        e: common_vendor.t(userExperience.value),
        f: common_vendor.t(levelList.value.length),
        g: levelList.value.length === 0
      }, levelList.value.length === 0 ? {} : {}, {
        h: common_vendor.f(levelList.value, (level, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(level.level || 0),
            b: level.levelImage
          }, level.levelImage ? {
            c: level.levelImage
          } : {
            d: common_vendor.t(level.levelEmoji || "❓"),
            e: common_vendor.n(`level-bg-${index % 4}`)
          }, {
            f: isUnlocked(level.level)
          }, isUnlocked(level.level) ? {} : {}, {
            g: common_vendor.t(level.levelName || "未命名"),
            h: common_vendor.t(level.requiredExp || 0),
            i: common_vendor.t(level.requiredFarts || 0),
            j: common_vendor.t(level.requiredDays || 0),
            k: isUnlocked(level.level)
          }, isUnlocked(level.level) ? {} : {}, {
            l: level.id || index,
            m: isUnlocked(level.level) ? 1 : "",
            n: !isUnlocked(level.level) ? 1 : ""
          });
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-86f5a054"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/level.js.map
