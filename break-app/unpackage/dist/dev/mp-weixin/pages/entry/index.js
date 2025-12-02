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
      groups.sort((a, b) => {
        if (a.className === "声学类屁")
          return -1;
        if (b.className === "声学类屁")
          return 1;
        if (a.className === "其他类屁")
          return 1;
        if (b.className === "其他类屁")
          return -1;
        if (b.items.length !== a.items.length) {
          return b.items.length - a.items.length;
        }
        return a.className.localeCompare(b.className, "zh-CN");
      });
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
    common_vendor.onMounted(() => {
      loadFeed();
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
                a: item.image
              }, item.image ? {
                b: item.image
              } : {}, {
                c: common_vendor.t(item.name),
                d: common_vendor.t(item.description || item.moodText),
                e: item.tags && item.tags.length
              }, item.tags && item.tags.length ? common_vendor.e({
                f: common_vendor.f(item.tags.slice(0, 4), (tag, k2, i2) => {
                  return {
                    a: common_vendor.t(tag),
                    b: tag
                  };
                }),
                g: item.tags.length > 4
              }, item.tags.length > 4 ? {
                h: common_vendor.t(item.tags.length - 4)
              } : {}) : {}, {
                i: item.id,
                j: common_vendor.s(getCardStyle(item)),
                k: common_vendor.o(($event) => goToDetail(item), item.id)
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
        k: common_vendor.o(onPullRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ced29d0a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/entry/index.js.map
