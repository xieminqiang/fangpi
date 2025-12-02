"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const loading = common_vendor.ref(true);
    const itemData = common_vendor.ref(null);
    const isPlaying = common_vendor.ref(false);
    let innerAudioContext = null;
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      if (options.data) {
        try {
          const decodedData = decodeURIComponent(options.data);
          itemData.value = JSON.parse(decodedData);
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/entry/detail.vue:119", "解析数据失败:", error);
          itemData.value = null;
        }
      } else {
        itemData.value = null;
      }
      loading.value = false;
    });
    const ensureAudioContext = () => {
      var _a;
      if (!innerAudioContext && ((_a = itemData.value) == null ? void 0 : _a.url)) {
        try {
          innerAudioContext = common_vendor.index.createInnerAudioContext();
          if (!innerAudioContext) {
            throw new Error("无法创建音频上下文");
          }
          innerAudioContext.autoplay = false;
          innerAudioContext.obeyMuteSwitch = false;
          innerAudioContext.onEnded(() => {
            isPlaying.value = false;
          });
          innerAudioContext.onStop(() => {
            isPlaying.value = false;
          });
          innerAudioContext.onError((err) => {
            common_vendor.index.__f__("error", "at pages/entry/detail.vue:149", "音频播放错误:", err);
            isPlaying.value = false;
            let errorMsg = "音频播放失败";
            if (err && typeof err === "object" && err.errMsg) {
              const errMsgLower = err.errMsg.toLowerCase();
              if (errMsgLower.includes("decode") || errMsgLower.includes("解码")) {
                errorMsg = "该手机不支持此音频播放";
              } else if (errMsgLower.includes("network") || errMsgLower.includes("网络")) {
                errorMsg = "网络错误，请检查网络连接";
              } else if (errMsgLower.includes("404") || errMsgLower.includes("not found")) {
                errorMsg = "音频文件不存在";
              }
            }
            common_vendor.index.showToast({
              title: errorMsg,
              icon: "none",
              duration: 2500
            });
            try {
              if (innerAudioContext) {
                innerAudioContext.destroy();
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/entry/detail.vue:175", "清理音频上下文失败:", e);
            }
            innerAudioContext = null;
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/entry/detail.vue:180", "创建音频上下文失败:", error);
          common_vendor.index.showToast({
            title: "音频初始化失败",
            icon: "none",
            duration: 2e3
          });
          innerAudioContext = null;
        }
      }
    };
    const isValidUrl = (url) => {
      if (!url || typeof url !== "string") {
        return false;
      }
      try {
        new URL(url);
        return true;
      } catch {
        return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
      }
    };
    const togglePlay = () => {
      var _a;
      if (!((_a = itemData.value) == null ? void 0 : _a.url)) {
        common_vendor.index.showToast({
          title: "音频地址缺失",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      if (!isValidUrl(itemData.value.url)) {
        common_vendor.index.showToast({
          title: "音频地址格式错误",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      if (isPlaying.value) {
        try {
          if (innerAudioContext) {
            innerAudioContext.pause();
            isPlaying.value = false;
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/entry/detail.vue:233", "暂停音频失败:", error);
          isPlaying.value = false;
        }
        return;
      }
      ensureAudioContext();
      if (!innerAudioContext) {
        common_vendor.index.showToast({
          title: "音频播放器初始化失败",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      try {
        innerAudioContext.src = itemData.value.url;
        isPlaying.value = true;
        setTimeout(() => {
          try {
            if (innerAudioContext && isPlaying.value && innerAudioContext.src === itemData.value.url) {
              innerAudioContext.play();
            }
          } catch (playError) {
            common_vendor.index.__f__("error", "at pages/entry/detail.vue:265", "播放音频失败:", playError);
            isPlaying.value = false;
            common_vendor.index.showToast({
              title: "播放失败，请稍后重试",
              icon: "none",
              duration: 2e3
            });
            try {
              if (innerAudioContext) {
                innerAudioContext.destroy();
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/entry/detail.vue:278", "清理音频上下文失败:", e);
            }
            innerAudioContext = null;
          }
        }, 100);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/entry/detail.vue:284", "设置音频源失败:", error);
        isPlaying.value = false;
        common_vendor.index.showToast({
          title: "播放失败，请稍后重试",
          icon: "none",
          duration: 2e3
        });
        try {
          if (innerAudioContext) {
            innerAudioContext.destroy();
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/entry/detail.vue:297", "清理音频上下文失败:", e);
        }
        innerAudioContext = null;
      }
    };
    const destroyAudio = () => {
      if (innerAudioContext) {
        try {
          innerAudioContext.stop();
          innerAudioContext.destroy();
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/entry/detail.vue:310", "销毁音频上下文失败:", e);
        }
        innerAudioContext = null;
      }
      isPlaying.value = false;
    };
    const goBack = () => {
      destroyAudio();
      common_vendor.index.navigateBack();
    };
    common_vendor.onUnmounted(() => {
      destroyAudio();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : itemData.value ? common_vendor.e({
        c: itemData.value.image
      }, itemData.value.image ? {
        d: itemData.value.image
      } : {}, {
        e: itemData.value.url
      }, itemData.value.url ? common_vendor.e({
        f: !isPlaying.value
      }, !isPlaying.value ? {
        g: common_assets._imports_0$3
      } : {
        h: common_assets._imports_1$1
      }, {
        i: isPlaying.value ? 1 : "",
        j: common_vendor.o(($event) => !isPlaying.value && togglePlay())
      }) : {}, {
        k: itemData.value.class_name
      }, itemData.value.class_name ? {
        l: common_vendor.t(itemData.value.class_name)
      } : {}, {
        m: common_vendor.t(itemData.value.name),
        n: itemData.value.badge
      }, itemData.value.badge ? {
        o: common_vendor.t(itemData.value.badge)
      } : {}, {
        p: itemData.value.description
      }, itemData.value.description ? {
        q: common_vendor.t(itemData.value.description)
      } : {}, {
        r: itemData.value.tags && itemData.value.tags.length
      }, itemData.value.tags && itemData.value.tags.length ? {
        s: common_vendor.f(itemData.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}) : {
        t: common_vendor.o(goBack)
      }, {
        b: itemData.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-70e86f9f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/entry/detail.js.map
