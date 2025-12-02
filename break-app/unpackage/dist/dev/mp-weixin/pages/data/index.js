"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_fart = require("../../src/api/fart.js");
const src_stores_user = require("../../src/stores/user.js");
if (!Array) {
  const _easycom_u_subsection2 = common_vendor.resolveComponent("u-subsection");
  _easycom_u_subsection2();
}
const _easycom_u_subsection = () => "../../uni_modules/uview-plus/components/u-subsection/u-subsection.js";
if (!Math) {
  (_easycom_u_subsection + LEchart)();
}
const LEchart = () => "../../uni_modules/lime-echart/components/l-echart/l-echart.js";
const CACHE_DURATION = 5 * 60 * 1e3;
const _sfc_main = {
  __name: "index",
  setup(__props, { expose: __expose }) {
    const echarts = require("../../uni_modules/lime-echart/static/echarts.min");
    const selectedPeriod = common_vendor.ref("今日");
    const periods = common_vendor.ref(["今日", "本周", "本月"]);
    const currentPeriodIndex = common_vendor.ref(0);
    common_vendor.ref(["凌晨", "上午", "下午", "晚上"]);
    const trendData = common_vendor.ref(null);
    const summaryData = common_vendor.ref(null);
    const dataCache = common_vendor.ref({
      day: { trendData: null, summaryData: null, timestamp: 0 },
      week: { trendData: null, summaryData: null, timestamp: 0 },
      month: { trendData: null, summaryData: null, timestamp: 0 }
    });
    const trendChartRef = common_vendor.ref(null);
    const chartLabels = common_vendor.computed(() => {
      if (!trendData.value)
        return ["凌晨", "上午", "下午", "晚上"];
      if (trendData.value.type === "day") {
        return ["凌晨", "上午", "下午", "晚上"];
      } else if (trendData.value.type === "week") {
        return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
      } else if (trendData.value.type === "month") {
        return ["月初", "月中", "月底"];
      }
      return [];
    });
    const chartData = common_vendor.computed(() => {
      if (!trendData.value)
        return [0, 0, 0, 0];
      if (trendData.value.type === "day") {
        const tp = trendData.value.timePeriodData || {};
        return [tp.dawn || 0, tp.morning || 0, tp.afternoon || 0, tp.evening || 0];
      } else if (trendData.value.type === "week") {
        return trendData.value.weekData || [];
      } else if (trendData.value.type === "month") {
        return trendData.value.monthData || [];
      }
      return [];
    });
    const getChartHeight = () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const screenHeight = systemInfo.windowHeight;
      systemInfo.windowWidth;
      if (screenHeight < 600) {
        return "300rpx";
      } else if (screenHeight < 700) {
        return "350rpx";
      } else if (screenHeight < 800) {
        return "400rpx";
      } else {
        return "450rpx";
      }
    };
    const chartStyle = common_vendor.ref(`width: 100%; height: ${getChartHeight()};`);
    const totalCount = common_vendor.computed(() => {
      var _a;
      return ((_a = summaryData.value) == null ? void 0 : _a.totalCount) || 0;
    });
    const mostCommonType = common_vendor.computed(() => {
      var _a, _b;
      return ((_b = (_a = summaryData.value) == null ? void 0 : _a.mostCommonType) == null ? void 0 : _b.typeName) || "响亮型";
    });
    const averageSmell = common_vendor.computed(() => {
      var _a, _b;
      return ((_b = (_a = summaryData.value) == null ? void 0 : _a.averageSmell) == null ? void 0 : _b.levelName) || "一般";
    });
    const mostCommonMood = common_vendor.computed(() => {
      var _a;
      const mood = (_a = summaryData.value) == null ? void 0 : _a.mostCommonMood;
      if (!mood)
        return { name: "开心", emoji: "🤣" };
      return {
        name: mood.moodName,
        emoji: mood.moodEmoji
      };
    });
    common_vendor.computed(() => {
      return [
        {
          label: `${selectedPeriod.value}放屁次数`,
          value: `${totalCount.value} 💨`,
          icon: "☁️"
        },
        {
          label: "最多类型",
          value: `${mostCommonType.value} 💥`,
          icon: "🔊"
        },
        {
          label: "平均气味等级",
          value: `${averageSmell.value} 😷`,
          icon: "😖"
        },
        {
          label: "心情指数",
          value: `${mostCommonMood.value.name} ${mostCommonMood.value.emoji}`,
          icon: "😊"
        }
      ];
    });
    common_vendor.computed(() => {
      var _a;
      const dist = (_a = summaryData.value) == null ? void 0 : _a.typeDistribution;
      if (!dist) {
        return [
          { name: "响亮型", percent: 0, colorClass: "peach-segment" },
          { name: "轻柔型", percent: 0, colorClass: "blue-segment" },
          { name: "无声型", percent: 0, colorClass: "mint-segment" }
        ];
      }
      const total = dist.loud + dist.soft + dist.silent;
      if (total === 0) {
        return [
          { name: "响亮型", percent: 0, colorClass: "peach-segment" },
          { name: "轻柔型", percent: 0, colorClass: "blue-segment" },
          { name: "无声型", percent: 0, colorClass: "mint-segment" }
        ];
      }
      return [
        {
          name: "响亮型",
          percent: Math.round(dist.loud / total * 100),
          colorClass: "peach-segment"
        },
        {
          name: "轻柔型",
          percent: Math.round(dist.soft / total * 100),
          colorClass: "blue-segment"
        },
        {
          name: "无声型",
          percent: Math.round(dist.silent / total * 100),
          colorClass: "mint-segment"
        }
      ];
    });
    common_vendor.computed(() => [
      { icon: "😊", top: "20rpx", left: "40rpx", size: "48rpx" },
      { icon: "🤣", top: "60rpx", right: "60rpx", left: "auto", size: "60rpx" },
      { icon: "🌸", top: "200rpx", left: "25%", size: "48rpx" },
      { icon: "😷", top: "160rpx", right: "33%", left: "auto", size: "60rpx" },
      { icon: "💀", top: "50%", left: "50%", size: "80rpx", transform: "translate(-50%, -50%)" },
      { icon: "😖", top: "240rpx", left: "50rpx", size: "48rpx" }
    ]);
    const chartOption = common_vendor.computed(() => ({
      grid: {
        left: "10%",
        right: "10%",
        bottom: "15%",
        top: "10%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: chartLabels.value,
        axisLine: {
          lineStyle: {
            color: "rgba(138, 245, 191, 0.3)"
          }
        },
        axisLabel: {
          color: "rgba(138, 245, 191, 0.8)",
          fontSize: 11,
          fontWeight: "bold"
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: "rgba(138, 245, 191, 0.6)",
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: "rgba(138, 245, 191, 0.1)",
            type: "dashed"
          }
        }
      },
      series: [{
        data: chartData.value,
        type: "line",
        smooth: true,
        smoothMonotone: "x",
        symbol: "none",
        itemStyle: {
          color: "#8af5bf",
          borderColor: "#fff",
          borderWidth: 2
        },
        lineStyle: {
          color: "#8af5bf",
          width: 2,
          shadowColor: "rgba(138, 245, 191, 0.3)",
          shadowBlur: 8,
          shadowOffsetY: 3
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(138, 245, 191, 0.3)" },
              { offset: 1, color: "rgba(138, 245, 191, 0.05)" }
            ]
          }
        },
        emphasis: {
          focus: "series",
          itemStyle: {
            color: "#5BCFA0",
            borderColor: "#fff",
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: "rgba(138, 245, 191, 0.8)"
          }
        }
      }]
    }));
    const initChart = async () => {
      await common_vendor.nextTick$1();
      setTimeout(async () => {
        if (!trendChartRef.value) {
          common_vendor.index.__f__("warn", "at pages/data/index.vue:402", "图表 ref 未找到");
          return;
        }
        try {
          const myChart = await trendChartRef.value.init(echarts, (chart) => {
            common_vendor.index.__f__("log", "at pages/data/index.vue:408", "图表实例创建成功", chart);
          });
          if (myChart) {
            myChart.setOption(chartOption.value);
            common_vendor.index.__f__("log", "at pages/data/index.vue:414", "图表初始化成功");
            setTimeout(() => {
              myChart.resize();
            }, 100);
            common_vendor.index.onWindowResize(() => {
              setTimeout(() => {
                myChart.resize();
              }, 100);
            });
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/data/index.vue:429", "图表初始化失败：", error);
        }
      }, 800);
    };
    common_vendor.onMounted(() => {
      const userStore = src_stores_user.useUserStore();
      if (userStore.token) {
        common_vendor.index.__f__("log", "at pages/data/index.vue:440", "已有 token，直接加载数据");
        loadData();
      } else {
        common_vendor.index.__f__("log", "at pages/data/index.vue:444", "暂无 token，等待登录完成...");
      }
      initChart();
      common_vendor.index.$on("loginSuccess", onLoginSuccess);
      common_vendor.index.$on("fartRecordAdded", () => {
        common_vendor.index.__f__("log", "at pages/data/index.vue:455", "收到放屁记录添加事件，刷新数据");
        clearAllCache();
        loadData(true);
      });
    });
    const onLoginSuccess = () => {
      common_vendor.index.__f__("log", "at pages/data/index.vue:463", "收到 loginSuccess 事件，开始加载数据");
      loadData();
    };
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", onLoginSuccess);
      common_vendor.index.$off("fartRecordAdded");
    });
    const isCacheValid = (statType) => {
      const cache = dataCache.value[statType];
      if (!cache.trendData || !cache.summaryData)
        return false;
      return Date.now() - cache.timestamp < CACHE_DURATION;
    };
    const loadFromCache = (statType) => {
      const cache = dataCache.value[statType];
      trendData.value = cache.trendData;
      summaryData.value = cache.summaryData;
      common_vendor.index.__f__("log", "at pages/data/index.vue:485", `从缓存加载${statType}数据`);
    };
    const saveToCache = (statType, trendDataValue, summaryDataValue) => {
      dataCache.value[statType] = {
        trendData: trendDataValue,
        summaryData: summaryDataValue,
        timestamp: Date.now()
      };
      common_vendor.index.__f__("log", "at pages/data/index.vue:495", `保存${statType}数据到缓存`);
    };
    const clearAllCache = () => {
      dataCache.value = {
        day: { trendData: null, summaryData: null, timestamp: 0 },
        week: { trendData: null, summaryData: null, timestamp: 0 },
        month: { trendData: null, summaryData: null, timestamp: 0 }
      };
      common_vendor.index.__f__("log", "at pages/data/index.vue:505", "清除所有数据缓存");
    };
    const loadData = async (forceRefresh = false) => {
      try {
        const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
        const statType = typeMap[selectedPeriod.value];
        if (!forceRefresh && isCacheValid(statType)) {
          loadFromCache(statType);
          initChart();
          return;
        }
        const [trendRes, summaryRes] = await Promise.all([
          src_api_fart.getTrendDataAPI(statType),
          src_api_fart.getStatisticsSummaryAPI(statType)
        ]);
        let newTrendData = null;
        let newSummaryData = null;
        if (trendRes.data.code === 0) {
          newTrendData = trendRes.data.data;
          trendData.value = newTrendData;
          common_vendor.index.__f__("log", "at pages/data/index.vue:537", "趋势数据:", newTrendData);
        }
        if (summaryRes.data.code === 0) {
          newSummaryData = summaryRes.data.data;
          summaryData.value = newSummaryData;
          common_vendor.index.__f__("log", "at pages/data/index.vue:543", "统计小结:", newSummaryData);
        }
        if (newTrendData && newSummaryData) {
          saveToCache(statType, newTrendData, newSummaryData);
        }
        common_vendor.index.hideLoading();
        initChart();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/data/index.vue:556", "加载数据失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    };
    const changePeriod = (period) => {
      if (selectedPeriod.value === period)
        return;
      selectedPeriod.value = period;
      loadData();
    };
    const onPeriodChange = (index) => {
      currentPeriodIndex.value = index;
      const period = periods.value[index];
      changePeriod(period);
    };
    __expose({
      clearAllCache,
      loadData: (forceRefresh = true) => loadData(forceRefresh)
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onPeriodChange),
        b: common_vendor.p({
          list: periods.value,
          current: currentPeriodIndex.value,
          mode: "button",
          activeColor: "#0d1b14",
          inactiveColor: "#8af5bf",
          bgColor: "rgba(138, 245, 191, 0.2)"
        }),
        c: common_vendor.f(chartData.value, (value, index, i0) => {
          return {
            a: common_vendor.t(chartLabels.value[index]),
            b: common_vendor.t(value),
            c: index
          };
        }),
        d: common_vendor.sr(trendChartRef, "af28c7f4-1", {
          "k": "trendChartRef"
        }),
        e: common_vendor.p({
          ["custom-style"]: chartStyle.value,
          type: "2d",
          ["is-disable-scroll"]: false
        }),
        f: common_assets._imports_1$2,
        g: common_vendor.t(selectedPeriod.value),
        h: common_vendor.t(totalCount.value),
        i: common_vendor.t(mostCommonType.value),
        j: common_vendor.t(averageSmell.value),
        k: common_vendor.t(mostCommonMood.value.name),
        l: common_vendor.t(mostCommonMood.value.emoji)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-af28c7f4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/data/index.js.map
