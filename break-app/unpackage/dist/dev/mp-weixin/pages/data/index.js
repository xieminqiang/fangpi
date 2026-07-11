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
    const dayChartRef = common_vendor.ref(null);
    const weekChartRef = common_vendor.ref(null);
    const monthChartRef = common_vendor.ref(null);
    const chartInstances = {
      day: null,
      week: null,
      month: null
    };
    const isInitializing = {
      day: false,
      week: false,
      month: false
    };
    const isInitialized = {
      day: false,
      week: false,
      month: false
    };
    const chartLoading = common_vendor.ref({
      day: true,
      week: false,
      month: false
    });
    const getChartData = (periodType) => {
      const cache = dataCache.value[periodType];
      if (!cache || !cache.trendData) {
        if (periodType === "day")
          return { labels: ["凌晨", "上午", "下午", "晚上"], data: [0, 0, 0, 0] };
        if (periodType === "week")
          return { labels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"], data: [0, 0, 0, 0, 0, 0, 0] };
        if (periodType === "month")
          return { labels: ["月初", "月中", "月底"], data: [0, 0, 0] };
        return { labels: [], data: [] };
      }
      const trendData2 = cache.trendData;
      if (periodType === "day") {
        const tp = trendData2.timePeriodData || {};
        return {
          labels: ["凌晨", "上午", "下午", "晚上"],
          data: [tp.dawn || 0, tp.morning || 0, tp.afternoon || 0, tp.evening || 0]
        };
      } else if (periodType === "week") {
        return {
          labels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
          data: trendData2.weekData || [0, 0, 0, 0, 0, 0, 0]
        };
      } else if (periodType === "month") {
        return {
          labels: ["月初", "月中", "月底"],
          data: trendData2.monthData || [0, 0, 0]
        };
      }
      return { labels: [], data: [] };
    };
    const chartLabels = common_vendor.computed(() => {
      const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
      const periodType = typeMap[selectedPeriod.value];
      return getChartData(periodType).labels;
    });
    const chartData = common_vendor.computed(() => {
      const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
      const periodType = typeMap[selectedPeriod.value];
      return getChartData(periodType).data;
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
    const ensureDataContinuity = (data) => {
      if (!data || data.length === 0)
        return [0];
      return data.map((val) => val === null || val === void 0 || isNaN(val) ? 0 : Number(val));
    };
    const getChartOption = (periodType) => {
      const { labels, data } = getChartData(periodType);
      const safeData = ensureDataContinuity(data);
      const safeLabels = labels.length > 0 ? labels : ["数据"];
      return {
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
          data: safeLabels,
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
          min: 0,
          // 确保最小值从0开始，避免区域线折断
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
          data: safeData,
          type: "line",
          smooth: true,
          smoothMonotone: "x",
          symbol: "circle",
          // 显示数据点，便于调试
          symbolSize: 6,
          connectNulls: true,
          // 连接空值，避免折断
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
      };
    };
    common_vendor.computed(() => {
      const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
      const periodType = typeMap[selectedPeriod.value];
      return getChartOption(periodType);
    });
    const updateChart = async (periodType) => {
      if (isInitializing[periodType]) {
        return;
      }
      const instance = chartInstances[periodType];
      if (!instance) {
        await initChart(periodType);
        return;
      }
      try {
        await common_vendor.nextTick$1();
        const option = getChartOption(periodType);
        instance.setOption(option, {
          notMerge: false,
          // 合并配置，保留动画等状态
          lazyUpdate: false
          // 立即更新
        });
        setTimeout(() => {
          if (chartInstances[periodType]) {
            chartInstances[periodType].resize();
          }
        }, 150);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/data/index.vue:530", `更新${periodType}图表失败：`, error);
        chartInstances[periodType] = null;
        isInitialized[periodType] = false;
        await initChart(periodType);
      }
    };
    const initChart = async (periodType) => {
      if (isInitialized[periodType] && chartInstances[periodType]) {
        await updateChart(periodType);
        return;
      }
      if (isInitializing[periodType]) {
        return;
      }
      isInitializing[periodType] = true;
      await common_vendor.nextTick$1();
      const { data } = getChartData(periodType);
      if (!data || data.length === 0) {
        common_vendor.index.__f__("warn", "at pages/data/index.vue:562", `${periodType}图表数据未准备好，延迟初始化`);
        isInitializing[periodType] = false;
        setTimeout(() => {
          if (!isInitialized[periodType]) {
            chartLoading.value[periodType] = false;
          }
        }, 3e3);
        setTimeout(() => initChart(periodType), 300);
        return;
      }
      setTimeout(async () => {
        const chartRef = periodType === "day" ? dayChartRef.value : periodType === "week" ? weekChartRef.value : monthChartRef.value;
        if (!chartRef) {
          common_vendor.index.__f__("warn", "at pages/data/index.vue:581", `${periodType}图表 ref 未找到`);
          isInitializing[periodType] = false;
          chartLoading.value[periodType] = false;
          return;
        }
        try {
          const myChart = await chartRef.init(echarts, (chart) => {
            common_vendor.index.__f__("log", "at pages/data/index.vue:590", `${periodType}图表实例创建成功`, chart);
          });
          if (myChart) {
            chartInstances[periodType] = myChart;
            isInitialized[periodType] = true;
            isInitializing[periodType] = false;
            const option = getChartOption(periodType);
            myChart.setOption(option, {
              notMerge: true
              // 首次初始化不合并
            });
            common_vendor.index.__f__("log", "at pages/data/index.vue:606", `${periodType}图表初始化成功`);
            chartLoading.value[periodType] = false;
            setTimeout(() => {
              if (chartInstances[periodType]) {
                chartInstances[periodType].resize();
              }
            }, 200);
            common_vendor.index.onWindowResize(() => {
              if (chartInstances[periodType]) {
                setTimeout(() => {
                  chartInstances[periodType].resize();
                }, 100);
              }
            });
          } else {
            isInitializing[periodType] = false;
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/data/index.vue:630", `${periodType}图表初始化失败：`, error);
          chartInstances[periodType] = null;
          isInitialized[periodType] = false;
          isInitializing[periodType] = false;
          chartLoading.value[periodType] = false;
        }
      }, 500);
    };
    const updateTimers = {
      day: null,
      week: null,
      month: null
    };
    common_vendor.watch(selectedPeriod, async (newPeriod) => {
      const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
      const periodType = typeMap[newPeriod];
      const cache = dataCache.value[periodType];
      if (!cache || !cache.trendData) {
        return;
      }
      if (!isInitialized[periodType]) {
        chartLoading.value[periodType] = true;
        await initChart(periodType);
      } else {
        await updateChart(periodType);
      }
    });
    common_vendor.watch(() => dataCache.value, () => {
      Object.keys(chartInstances).forEach((periodType) => {
        if (isInitialized[periodType] && chartInstances[periodType]) {
          if (updateTimers[periodType]) {
            clearTimeout(updateTimers[periodType]);
          }
          updateTimers[periodType] = setTimeout(() => {
            updateChart(periodType);
            updateTimers[periodType] = null;
          }, 100);
        }
      });
    }, { deep: true });
    common_vendor.onMounted(() => {
      const userStore = src_stores_user.useUserStore();
      if (userStore.token) {
        common_vendor.index.__f__("log", "at pages/data/index.vue:694", "已有 token，直接加载数据");
        loadData();
      } else {
        common_vendor.index.__f__("log", "at pages/data/index.vue:698", "暂无 token，等待登录完成...");
      }
      common_vendor.index.$on("loginSuccess", onLoginSuccess);
      common_vendor.index.$on("fartRecordAdded", () => {
        common_vendor.index.__f__("log", "at pages/data/index.vue:706", "收到放屁记录添加事件，刷新数据");
        clearAllCache();
        loadData(true);
      });
    });
    const onLoginSuccess = () => {
      common_vendor.index.__f__("log", "at pages/data/index.vue:714", "收到 loginSuccess 事件，开始加载数据");
      loadData();
    };
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", onLoginSuccess);
      common_vendor.index.$off("fartRecordAdded");
      Object.keys(updateTimers).forEach((periodType) => {
        if (updateTimers[periodType]) {
          clearTimeout(updateTimers[periodType]);
          updateTimers[periodType] = null;
        }
      });
      Object.keys(chartInstances).forEach((periodType) => {
        if (chartInstances[periodType]) {
          chartInstances[periodType].dispose && chartInstances[periodType].dispose();
          chartInstances[periodType] = null;
        }
        isInitialized[periodType] = false;
        isInitializing[periodType] = false;
      });
      chartLoading.value = {
        day: true,
        week: false,
        month: false
      };
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
      common_vendor.index.__f__("log", "at pages/data/index.vue:761", `从缓存加载${statType}数据`);
    };
    const saveToCache = (statType, trendDataValue, summaryDataValue) => {
      dataCache.value[statType] = {
        trendData: trendDataValue,
        summaryData: summaryDataValue,
        timestamp: Date.now()
      };
      common_vendor.index.__f__("log", "at pages/data/index.vue:771", `保存${statType}数据到缓存`);
    };
    const clearAllCache = () => {
      dataCache.value = {
        day: { trendData: null, summaryData: null, timestamp: 0 },
        week: { trendData: null, summaryData: null, timestamp: 0 },
        month: { trendData: null, summaryData: null, timestamp: 0 }
      };
      common_vendor.index.__f__("log", "at pages/data/index.vue:781", "清除所有数据缓存");
    };
    const loadData = async (forceRefresh = false) => {
      try {
        const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
        const statType = typeMap[selectedPeriod.value];
        if (!forceRefresh && isCacheValid(statType)) {
          loadFromCache(statType);
          await common_vendor.nextTick$1();
          if (!isInitialized[statType]) {
            chartLoading.value[statType] = true;
            await initChart(statType);
          } else {
            updateChart(statType);
          }
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
          common_vendor.index.__f__("log", "at pages/data/index.vue:821", "趋势数据:", newTrendData);
        }
        if (summaryRes.data.code === 0) {
          newSummaryData = summaryRes.data.data;
          summaryData.value = newSummaryData;
          common_vendor.index.__f__("log", "at pages/data/index.vue:827", "统计小结:", newSummaryData);
        }
        if (newTrendData && newSummaryData) {
          saveToCache(statType, newTrendData, newSummaryData);
        }
        common_vendor.index.hideLoading();
        await common_vendor.nextTick$1();
        if (!isInitialized[statType]) {
          chartLoading.value[statType] = true;
          await initChart(statType);
        } else {
          updateChart(statType);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/data/index.vue:848", "加载数据失败:", error);
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
      return common_vendor.e({
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
        d: chartLoading.value.day
      }, chartLoading.value.day ? {} : {}, {
        e: common_vendor.sr(dayChartRef, "af28c7f4-1", {
          "k": "dayChartRef"
        }),
        f: common_vendor.p({
          ["custom-style"]: chartStyle.value,
          type: "2d",
          ["is-disable-scroll"]: false
        }),
        g: selectedPeriod.value === "今日",
        h: chartLoading.value.week
      }, chartLoading.value.week ? {} : {}, {
        i: common_vendor.sr(weekChartRef, "af28c7f4-2", {
          "k": "weekChartRef"
        }),
        j: common_vendor.p({
          ["custom-style"]: chartStyle.value,
          type: "2d",
          ["is-disable-scroll"]: false
        }),
        k: selectedPeriod.value === "本周",
        l: chartLoading.value.month
      }, chartLoading.value.month ? {} : {}, {
        m: common_vendor.sr(monthChartRef, "af28c7f4-3", {
          "k": "monthChartRef"
        }),
        n: common_vendor.p({
          ["custom-style"]: chartStyle.value,
          type: "2d",
          ["is-disable-scroll"]: false
        }),
        o: selectedPeriod.value === "本月",
        p: common_assets._imports_1$2,
        q: common_vendor.t(selectedPeriod.value),
        r: common_vendor.t(totalCount.value),
        s: common_vendor.t(mostCommonType.value),
        t: common_vendor.t(averageSmell.value),
        v: common_vendor.t(mostCommonMood.value.name)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-af28c7f4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/data/index.js.map
