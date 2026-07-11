"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_audio = require("../../src/api/audio.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const feed = common_vendor.ref({
      list: [],
      empty: false,
      total: 0
    });
    const isLoading = common_vendor.ref(true);
    const isRefreshing = common_vendor.ref(false);
    const isRefreshingPull = common_vendor.ref(false);
    const errorMessage = common_vendor.ref("");
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const hasMore = common_vendor.ref(true);
    const groupedList = common_vendor.computed(() => {
      if (!feed.value.list || feed.value.list.length === 0) {
        return [];
      }
      const groupMap = /* @__PURE__ */ new Map();
      feed.value.list.forEach((item) => {
        const className = item.class_name || "其他类屁";
        if (!groupMap.has(className)) {
          groupMap.set(className, []);
        }
        groupMap.get(className).push(item);
      });
      const groups = Array.from(groupMap.entries()).map(([className, items]) => ({
        className,
        items
      }));
      return groups;
    });
    const getCardStyle = (item) => {
      const color = item.accentColor || "#FFD3B6";
      return {
        background: `linear-gradient(135deg, ${color}12 0%, ${color}06 50%, #ffffff 100%)`,
        borderColor: `${color}30`
      };
    };
    const goToDetail = (item) => {
      const itemData = JSON.stringify(item);
      common_vendor.index.navigateTo({
        url: `/pages/entry/detail?data=${encodeURIComponent(itemData)}`
      });
    };
    const goToCreateFart = () => {
      common_vendor.index.navigateTo({
        url: "/pages/entry/creat"
      });
    };
    const handleDelete = async (item) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除"${item.name}"吗？删除后无法恢复。`,
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff3b30",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "删除中..."
              });
              const { data } = await src_api_audio.deleteAudioLibraryAPI(item.id);
              common_vendor.index.hideLoading();
              if (data.code === 0) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success",
                  duration: 1500
                });
                const index = feed.value.list.findIndex((i) => i.id === item.id);
                if (index !== -1) {
                  feed.value.list.splice(index, 1);
                  feed.value.total--;
                  feed.value.empty = feed.value.list.length === 0;
                }
                common_vendor.index.$emit("audioLibraryUpdated");
              } else {
                common_vendor.index.showToast({
                  title: data.msg || "删除失败",
                  icon: "none",
                  duration: 2e3
                });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/entry/index.vue:279", "删除失败:", error);
              common_vendor.index.showToast({
                title: "删除失败，请重试",
                icon: "none",
                duration: 2e3
              });
            }
          }
        }
      });
    };
    const normalizeFeed = (data) => {
      if (!data) {
        return {
          list: [],
          empty: true,
          total: 0
        };
      }
      return {
        list: data.list || [],
        empty: data.empty || false,
        total: data.total || 0
      };
    };
    const loadFeed = async (isRefresh = false, isPullRefresh = false) => {
      if (isPullRefresh) {
        isRefreshingPull.value = true;
      } else if (isRefresh) {
        isRefreshing.value = true;
      } else {
        isLoading.value = true;
      }
      errorMessage.value = "";
      try {
        if (isPullRefresh) {
          currentPage.value = 1;
          feed.value.list = [];
          hasMore.value = true;
        }
        const { data } = await src_api_audio.getAudioLibraryFeedAPI({
          page: currentPage.value,
          pageSize: pageSize.value,
          type: 1
          // 1表示屁的全家族大全
        });
        if (data.code === 0) {
          const newFeed = normalizeFeed(data.data);
          if (currentPage.value === 1) {
            feed.value = newFeed;
          } else {
            feed.value.list = [...feed.value.list, ...newFeed.list];
            feed.value.total = newFeed.total;
            feed.value.empty = feed.value.list.length === 0;
          }
          hasMore.value = feed.value.list.length < feed.value.total;
          if (hasMore.value) {
            currentPage.value++;
          }
        } else {
          errorMessage.value = data.msg || "加载失败，请稍后重试";
        }
      } catch (error) {
        errorMessage.value = "网络走神了，稍后再试";
      } finally {
        isLoading.value = false;
        isRefreshing.value = false;
        isRefreshingPull.value = false;
      }
    };
    const refreshFeed = () => {
      currentPage.value = 1;
      feed.value.list = [];
      hasMore.value = true;
      loadFeed(true, false);
    };
    const onPullRefresh = () => {
      if (isRefreshingPull.value || isLoading.value || isRefreshing.value) {
        return;
      }
      loadFeed(false, true);
    };
    const onReachBottom = () => {
      if (isRefreshing.value || isLoading.value || isRefreshingPull.value || !hasMore.value) {
        return;
      }
      loadFeed(true, false);
    };
    const onAudioLibraryUpdated = () => {
      common_vendor.index.__f__("log", "at pages/entry/index.vue:389", "收到音频库更新事件，刷新数据");
      currentPage.value = 1;
      feed.value.list = [];
      hasMore.value = true;
      loadFeed();
    };
    common_vendor.onMounted(() => {
      loadFeed();
      common_vendor.index.$on("audioLibraryUpdated", onAudioLibraryUpdated);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("audioLibraryUpdated", onAudioLibraryUpdated);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value && feed.value.list.length === 0
      }, isLoading.value && feed.value.list.length === 0 ? {} : errorMessage.value ? {
        c: common_vendor.t(errorMessage.value),
        d: common_vendor.o(refreshFeed)
      } : feed.value.empty ? {} : common_vendor.e({
        f: common_vendor.f(groupedList.value, (group, k0, i0) => {
          return {
            a: common_vendor.t(group.className),
            b: common_vendor.t(group.items.length),
            c: common_vendor.f(group.items, (item, k1, i1) => {
              return common_vendor.e({
                a: item.class_name === "自己放的屁"
              }, item.class_name === "自己放的屁" ? {
                b: common_vendor.o(($event) => handleDelete(item), item.id)
              } : {}, {
                c: item.image
              }, item.image ? {
                d: item.image
              } : {}, {
                e: common_vendor.t(item.name),
                f: common_vendor.t(item.description || item.moodText),
                g: item.tags && item.tags.length
              }, item.tags && item.tags.length ? common_vendor.e({
                h: common_vendor.f(item.tags.slice(0, 4), (tag, k2, i2) => {
                  return {
                    a: common_vendor.t(tag),
                    b: tag
                  };
                }),
                i: item.tags.length > 4
              }, item.tags.length > 4 ? {
                j: common_vendor.t(item.tags.length - 4)
              } : {}) : {}, {
                k: common_vendor.o(($event) => goToDetail(item), item.id),
                l: item.id,
                m: common_vendor.s(getCardStyle(item))
              });
            }),
            d: group.className
          };
        }),
        g: common_assets._imports_0$2,
        h: isRefreshing.value
      }, isRefreshing.value ? {} : {}), {
        b: errorMessage.value,
        e: feed.value.empty,
        i: common_vendor.o(onReachBottom),
        j: isRefreshingPull.value,
        k: common_vendor.o(onPullRefresh),
        l: common_vendor.o(goToCreateFart)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ced29d0a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/entry/index.js.map
