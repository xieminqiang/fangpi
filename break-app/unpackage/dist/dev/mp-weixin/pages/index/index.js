"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_fart = require("../../src/api/fart.js");
const src_api_audio = require("../../src/api/audio.js");
const src_api_user = require("../../src/api/user.js");
const src_stores_user = require("../../src/stores/user.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_u_datetime_picker2 = common_vendor.resolveComponent("u-datetime-picker");
  (_easycom_uni_popup2 + _easycom_u_datetime_picker2)();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
const _easycom_u_datetime_picker = () => "../../uni_modules/uview-plus/components/u-datetime-picker/u-datetime-picker.js";
if (!Math) {
  (_easycom_uni_popup + _easycom_u_datetime_picker)();
}
const defaultAudioUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/audio/fangpi.MP3";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const popup = common_vendor.ref();
    const makeupPopup = common_vendor.ref();
    const achievementPopup = common_vendor.ref();
    const audioSettingPopup = common_vendor.ref();
    const selectedFartType = common_vendor.ref("响亮型");
    const selectedSmellLevel = common_vendor.ref("清香");
    const selectedMood = common_vendor.ref("放松");
    const inputText = common_vendor.ref("");
    const showCloud = common_vendor.ref(false);
    common_vendor.ref(false);
    const showGifImage = common_vendor.ref(true);
    const gifTimestamp = common_vendor.ref(Date.now());
    const gifUrl = common_vendor.ref(`https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`);
    const isGifPlaying = common_vendor.ref(false);
    const isSubmitting = common_vendor.ref(false);
    const isSubmittingMakeup = common_vendor.ref(false);
    let audioContext = null;
    let previewAudioContext = null;
    const audioList = common_vendor.ref([]);
    const isLoadingAudio = common_vendor.ref(false);
    const selectedAudioUrl = common_vendor.ref("");
    const playingAudioId = common_vendor.ref(null);
    const audioCurrentPage = common_vendor.ref(1);
    const audioPageSize = common_vendor.ref(20);
    const audioHasMore = common_vendor.ref(true);
    const audioTotal = common_vendor.ref(0);
    const getCardStyle = (item) => {
      const color = item.accentColor || "#FFD3B6";
      return {
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 50%, #ffffff 100%)`,
        borderColor: `${color}40`
      };
    };
    const selectedAchievement = common_vendor.ref(null);
    const newAchievements = common_vendor.ref([]);
    const currentAchievementIndex = common_vendor.ref(0);
    const makeupFartType = common_vendor.ref("响亮型");
    const makeupSmellLevel = common_vendor.ref("清香");
    const makeupMood = common_vendor.ref("放松");
    const makeupInputText = common_vendor.ref("");
    const showTimePicker = common_vendor.ref(false);
    const makeupTimeDisplay = common_vendor.ref("");
    const todayCount = common_vendor.ref(0);
    const mostHappyMood = common_vendor.ref("/static/emj/kaixin.png");
    const lastFartTime = common_vendor.ref("暂无记录");
    const moodEmojiToIcon = {
      "😌": "/static/emj/fangsong.png",
      // 放松
      "🤣": "/static/emj/kaixin.png",
      // 开心
      "😖": "/static/emj/ganga.png"
      // 尴尬
    };
    const moodValueToIcon = {
      "normal": "/static/emj/fangsong.png",
      "happy": "/static/emj/kaixin.png",
      "embarrassed": "/static/emj/ganga.png"
    };
    const fartTypes = common_vendor.reactive([
      { value: "响亮型", icon: "/static/emj/iangliang.png", label: "响亮型" },
      { value: "轻柔型", icon: "/static/emj/qingrou.png", label: "轻柔型" },
      { value: "无声型", icon: "/static/emj/wusheng.png", label: "无声型" }
    ]);
    const smellLevels = common_vendor.reactive([
      { value: "清香", icon: "/static/emj/qingxiang.png", label: "清香" },
      { value: "一般", icon: "/static/emj/yiban.png", label: "一般" },
      { value: "浓烈", icon: "/static/emj/nonglie.png", label: "浓烈" }
    ]);
    const moods = common_vendor.reactive([
      { value: "放松", icon: "/static/emj/fangsong.png", label: "放松" },
      { value: "开心", icon: "/static/emj/kaixin.png", label: "开心" },
      { value: "尴尬", icon: "/static/emj/ganga.png", label: "尴尬" }
    ]);
    const openPopup = () => {
      popup.value.open();
    };
    const onGifLoaded = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:586", "GIF加载完成");
      isGifPlaying.value = true;
      setTimeout(() => {
        isGifPlaying.value = false;
      }, 3e3);
    };
    const replayGif = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:596", "开始重播GIF");
      showGifImage.value = false;
      isGifPlaying.value = false;
      const timestamp = Date.now();
      gifTimestamp.value = timestamp;
      gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${timestamp}`;
      setTimeout(() => {
        showGifImage.value = true;
        common_vendor.index.__f__("log", "at pages/index/index.vue:612", "GIF重新显示，URL:", gifUrl.value);
      }, 100);
    };
    const playFartSound = () => {
      var _a;
      try {
        if (audioContext) {
          try {
            audioContext.stop();
            audioContext.destroy();
          } catch (e) {
          }
          audioContext = null;
        }
        audioContext = common_vendor.index.createInnerAudioContext();
        const userStore = src_stores_user.useUserStore();
        const defaultAudioUrl2 = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/audio/fangpi.MP3";
        const audioUrl = ((_a = userStore.userInfo) == null ? void 0 : _a.audioUrl) || defaultAudioUrl2;
        audioContext.src = audioUrl;
        audioContext.volume = 0.8;
        audioContext.obeyMuteSwitch = false;
        audioContext.onPlay(() => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:660", "开始播放放屁声音，路径:", audioContext.src);
        });
        audioContext.onEnded(() => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:664", "放屁声音播放完成");
        });
        audioContext.onError((err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:669", "播放放屁声音失败:", err);
          common_vendor.index.__f__("error", "at pages/index/index.vue:670", "音频路径:", audioContext.src);
          if (err.errMsg && (err.errMsg.includes("404") || err.errMsg.includes("not found"))) {
            common_vendor.index.__f__("warn", "at pages/index/index.vue:673", "音频文件未找到，请确保已将 fangpi.MP3 上传到 OSS 服务器");
            common_vendor.index.showToast({
              title: "音频文件未找到",
              icon: "none",
              duration: 2e3
            });
          }
          if (audioContext) {
            try {
              audioContext.destroy();
            } catch (e) {
            }
            audioContext = null;
          }
        });
        audioContext.play();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:695", "创建音频上下文失败:", error);
        audioContext = null;
      }
    };
    const goToPoints = () => {
      common_vendor.index.navigateTo({
        url: "/pages/me/points"
      });
    };
    const goToFartPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/index/fart"
      });
    };
    const openMakeupPopup = () => {
      const now = /* @__PURE__ */ new Date();
      makeupTimeDisplay.value = formatTimeDisplay(now);
      common_vendor.index.__f__("log", "at pages/index/index.vue:729", "打开补卡弹窗，初始化时间:", makeupTimeDisplay.value);
      makeupPopup.value.open();
    };
    const closeMakeupPopup = () => {
      makeupPopup.value.close();
    };
    const formatTimeDisplay = (date) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:742", "formatTimeDisplay 接收到无效的日期:", date);
        return "00:00";
      }
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    const onTimeChange = (e) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:753", "时间选择器 change 事件:", e);
      common_vendor.index.__f__("log", "at pages/index/index.vue:754", "当前 makeupTimeDisplay:", makeupTimeDisplay.value);
    };
    const onTimeConfirm = (e) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:759", "===== 时间选择器确认 =====");
      common_vendor.index.__f__("log", "at pages/index/index.vue:760", "e.value:", e.value);
      common_vendor.index.__f__("log", "at pages/index/index.vue:761", "当前 makeupTimeDisplay:", makeupTimeDisplay.value);
      const selectedTime = makeupTimeDisplay.value;
      if (selectedTime) {
        const now = /* @__PURE__ */ new Date();
        const [selectedHour, selectedMinute] = selectedTime.split(":").map(Number);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        if (selectedHour > currentHour || selectedHour === currentHour && selectedMinute > currentMinute) {
          common_vendor.index.showToast({
            title: "不能选择未来的时间",
            icon: "none",
            duration: 2e3
          });
          makeupTimeDisplay.value = formatTimeDisplay(now);
          return;
        }
      }
      showTimePicker.value = false;
    };
    const confirmMakeup = async () => {
      if (isSubmittingMakeup.value) {
        return;
      }
      try {
        isSubmittingMakeup.value = true;
        if (!makeupTimeDisplay.value) {
          common_vendor.index.showToast({
            title: "请选择时间",
            icon: "none"
          });
          return;
        }
        const typeMap = {
          "响亮型": "loud",
          "轻柔型": "soft",
          "无声型": "silent"
        };
        const smellMap = {
          "清香": 1,
          "一般": 2,
          "浓烈": 3
        };
        const moodMap = {
          "放松": "normal",
          "开心": "happy",
          "尴尬": "embarrassed"
        };
        const requestData = {
          fartType: typeMap[makeupFartType.value],
          smellLevel: smellMap[makeupSmellLevel.value],
          mood: moodMap[makeupMood.value],
          note: makeupInputText.value || "",
          fartTime: makeupTimeDisplay.value
          // HH:mm
        };
        common_vendor.index.__f__("log", "at pages/index/index.vue:838", "提交补卡记录:", requestData);
        const { data } = await src_api_fart.makeupFartRecordAPI(requestData);
        common_vendor.index.__f__("log", "at pages/index/index.vue:843", "补卡结果:", data);
        if (data.code === 0) {
          common_vendor.index.vibrateShort({
            type: "heavy"
          });
          playFartSound();
          replayGif();
          closeMakeupPopup();
          notifyDataPageRefresh();
          notifyMePageRefresh();
          loadStatisticsData();
          common_vendor.index.showToast({
            title: "记录成功 ✅",
            icon: "none",
            duration: 1500
          });
          if (data.data && data.data.newAchievements && data.data.newAchievements.length > 0) {
            common_vendor.index.__f__("log", "at pages/index/index.vue:877", "解锁新成就:", data.data.newAchievements);
            showNewAchievements(data.data.newAchievements);
          }
          makeupFartType.value = "响亮型";
          makeupSmellLevel.value = "清香";
          makeupMood.value = "放松";
          makeupInputText.value = "";
          makeupTimeDisplay.value = "";
        } else {
          common_vendor.index.showToast({
            title: data.msg || "补卡失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:895", "补卡失败:", error);
        common_vendor.index.showToast({
          title: "补卡失败，请重试",
          icon: "none"
        });
      } finally {
        isSubmittingMakeup.value = false;
      }
    };
    const loadStatisticsData = async () => {
      try {
        const [todayResponse, statsResponse] = await Promise.all([
          src_api_fart.getTodayRecordsAPI(),
          src_api_fart.getStatisticsSummaryAPI("day")
        ]);
        if (todayResponse.data.code === 0) {
          const todayData = todayResponse.data.data;
          todayCount.value = todayData.todayCount;
          if (todayData.lastRecord) {
            const lastTime = todayData.lastRecord.fartTime;
            lastFartTime.value = formatLastFartTime(lastTime);
          } else {
            lastFartTime.value = "暂无记录";
          }
        }
        if (statsResponse.data.code === 0) {
          const statsData = statsResponse.data.data;
          common_vendor.index.__f__("log", "at pages/index/index.vue:929", "统计数据返回:", statsData);
          if (statsData.mostCommonMood) {
            common_vendor.index.__f__("log", "at pages/index/index.vue:933", "mostCommonMood 数据:", statsData.mostCommonMood);
            let newMoodIcon = null;
            if (statsData.mostCommonMood.moodEmoji) {
              common_vendor.index.__f__("log", "at pages/index/index.vue:939", "尝试使用 moodEmoji 映射:", statsData.mostCommonMood.moodEmoji);
              newMoodIcon = moodEmojiToIcon[statsData.mostCommonMood.moodEmoji];
              if (newMoodIcon) {
                common_vendor.index.__f__("log", "at pages/index/index.vue:942", "moodEmoji 映射成功:", newMoodIcon);
              }
            }
            if (!newMoodIcon && statsData.mostCommonMood.mood) {
              common_vendor.index.__f__("log", "at pages/index/index.vue:948", "尝试使用 mood 值映射:", statsData.mostCommonMood.mood);
              newMoodIcon = moodValueToIcon[statsData.mostCommonMood.mood];
              if (newMoodIcon) {
                common_vendor.index.__f__("log", "at pages/index/index.vue:951", "mood 值映射成功:", newMoodIcon);
              } else {
                common_vendor.index.__f__("warn", "at pages/index/index.vue:953", "mood 值映射失败，可用的映射:", Object.keys(moodValueToIcon));
              }
            }
            if (newMoodIcon) {
              mostHappyMood.value = newMoodIcon;
              common_vendor.index.__f__("log", "at pages/index/index.vue:960", "✅ mostHappyMood 更新成功:", mostHappyMood.value);
            } else {
              common_vendor.index.__f__("warn", "at pages/index/index.vue:962", "⚠️ 无法映射心情图标，保持当前值:", mostHappyMood.value);
            }
          } else {
            common_vendor.index.__f__("log", "at pages/index/index.vue:965", "暂无 mostCommonMood 数据");
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:969", "加载统计数据失败:", error);
      }
    };
    const formatLastFartTime = (fartTime) => {
      if (!fartTime)
        return "暂无记录";
      try {
        let timeStr = fartTime;
        if (fartTime.includes("T")) {
          timeStr = fartTime.split("T")[1].split("+")[0].split("-")[0];
        }
        const now = /* @__PURE__ */ new Date();
        const today = now.toISOString().split("T")[0];
        const fartDateTime = /* @__PURE__ */ new Date(`${today}T${timeStr}`);
        const diffMs = now - fartDateTime;
        const diffMinutes = Math.floor(diffMs / (1e3 * 60));
        if (diffMinutes < 1) {
          return "刚刚";
        } else if (diffMinutes < 60) {
          return `${diffMinutes}分钟前`;
        } else {
          const diffHours = Math.floor(diffMinutes / 60);
          return `${diffHours}小时前`;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1002", "格式化时间失败:", error, fartTime);
        return "时间未知";
      }
    };
    const closePopup = () => {
      popup.value.close();
    };
    const selectFartType = (value) => {
      selectedFartType.value = value;
    };
    const selectSmellLevel = (value) => {
      selectedSmellLevel.value = value;
    };
    const selectMood = (value) => {
      selectedMood.value = value;
    };
    const notifyDataPageRefresh = () => {
      common_vendor.index.$emit("fartRecordAdded");
      const pages = getCurrentPages();
      const dataPage = pages.find((page) => page.route === "pages/data/index");
      if (dataPage && dataPage.$vm) {
        dataPage.$vm.clearAllCache();
        dataPage.$vm.loadData(true);
      }
    };
    const notifyMePageRefresh = () => {
      common_vendor.index.$emit("userInfoUpdated");
      common_vendor.index.__f__("log", "at pages/index/index.vue:1043", "已发送 userInfoUpdated 事件，通知其他页面刷新");
    };
    const confirmFart = async () => {
      if (isSubmitting.value) {
        return;
      }
      try {
        isSubmitting.value = true;
        const typeMap = {
          "响亮型": "loud",
          "轻柔型": "soft",
          "无声型": "silent"
        };
        const smellMap = {
          "清香": 1,
          "一般": 2,
          "浓烈": 3
        };
        const moodMap = {
          "放松": "normal",
          "开心": "happy",
          "尴尬": "embarrassed"
        };
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const fartDate = `${year}-${month}-${day}`;
        const fartTime = now.toTimeString().split(" ")[0];
        const requestData = {
          fartType: typeMap[selectedFartType.value],
          smellLevel: smellMap[selectedSmellLevel.value],
          mood: moodMap[selectedMood.value],
          note: inputText.value || "",
          fartDate,
          fartTime
        };
        common_vendor.index.__f__("log", "at pages/index/index.vue:1094", "提交放屁记录:", requestData);
        const { data } = await src_api_fart.createFartRecordAPI(requestData);
        common_vendor.index.__f__("log", "at pages/index/index.vue:1099", "打卡结果:", data);
        if (data.code === 0) {
          common_vendor.index.vibrateShort({
            type: "heavy"
            // 使用重度震动，让用户有明显的反馈感
          });
          playFartSound();
          replayGif();
          closePopup();
          notifyDataPageRefresh();
          notifyMePageRefresh();
          loadStatisticsData();
          if (data.data && data.data.newAchievements && data.data.newAchievements.length > 0) {
            common_vendor.index.__f__("log", "at pages/index/index.vue:1126", "解锁新成就:", data.data.newAchievements);
            showNewAchievements(data.data.newAchievements);
          }
          selectedFartType.value = "响亮型";
          selectedSmellLevel.value = "清香";
          selectedMood.value = "放松";
          inputText.value = "";
        } else {
          common_vendor.index.showToast({
            title: data.msg || "打卡失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1143", "打卡失败:", error);
        common_vendor.index.showToast({
          title: "打卡失败，请重试",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    common_vendor.onMounted(() => {
      const userStore = src_stores_user.useUserStore();
      if (userStore.token) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:1160", "已有 token，直接加载统计数据");
        loadStatisticsData();
      } else {
        common_vendor.index.__f__("log", "at pages/index/index.vue:1163", "暂无 token，等待登录完成...");
      }
      common_vendor.index.$on("loginSuccess", onLoginSuccess);
    });
    const onLoginSuccess = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1172", "收到 loginSuccess 事件，开始加载统计数据");
      loadStatisticsData();
    };
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", onLoginSuccess);
      if (audioContext) {
        try {
          audioContext.stop();
          audioContext.destroy();
        } catch (e) {
        }
        audioContext = null;
      }
      stopPreviewAudio();
    });
    const showNewAchievements = (achievements) => {
      if (!achievements || achievements.length === 0) {
        return;
      }
      newAchievements.value = achievements;
      currentAchievementIndex.value = 0;
      showAchievementAtIndex(0);
    };
    const showAchievementAtIndex = (index) => {
      if (index >= newAchievements.value.length) {
        return;
      }
      selectedAchievement.value = newAchievements.value[index];
      currentAchievementIndex.value = index;
      setTimeout(() => {
        var _a;
        (_a = achievementPopup.value) == null ? void 0 : _a.open();
      }, 500);
    };
    const closeAchievementDetail = () => {
      var _a;
      (_a = achievementPopup.value) == null ? void 0 : _a.close();
      const nextIndex = currentAchievementIndex.value + 1;
      if (nextIndex < newAchievements.value.length) {
        setTimeout(() => {
          showAchievementAtIndex(nextIndex);
        }, 300);
      } else {
        selectedAchievement.value = null;
        newAchievements.value = [];
        currentAchievementIndex.value = 0;
      }
    };
    const handleShare = () => {
      if (!selectedAchievement.value) {
        return;
      }
      common_vendor.index.__f__("log", "at pages/index/index.vue:1247", "准备分享成就:", selectedAchievement.value.achievementName);
    };
    common_vendor.onShareAppMessage(() => {
      if (selectedAchievement.value) {
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
    const openAudioSettingPopup = async () => {
      var _a, _b;
      const userStore = src_stores_user.useUserStore();
      await loadAudioList();
      const currentAudioUrl = ((_a = userStore.userInfo) == null ? void 0 : _a.audioUrl) || defaultAudioUrl;
      const audioExists = audioList.value.some((audio) => audio.url === currentAudioUrl);
      if (audioExists || currentAudioUrl === defaultAudioUrl) {
        selectedAudioUrl.value = currentAudioUrl;
      } else {
        selectedAudioUrl.value = defaultAudioUrl;
      }
      common_vendor.index.__f__("log", "at pages/index/index.vue:1289", "打开音频设置弹窗，当前选中:", selectedAudioUrl.value);
      (_b = audioSettingPopup.value) == null ? void 0 : _b.open();
      setTimeout(() => {
        const query = common_vendor.index.createSelectorQuery().in(getCurrentPages()[getCurrentPages().length - 1]);
        query.selectAll(".uni-popup").boundingClientRect((data) => {
        }).exec();
      }, 150);
    };
    const onAudioListScrollToLower = () => {
      if (!isLoadingAudio.value && audioHasMore.value) {
        loadAudioList(true);
      }
    };
    const closeAudioSettingPopup = () => {
      var _a;
      stopPreviewAudio();
      (_a = audioSettingPopup.value) == null ? void 0 : _a.close();
    };
    const loadAudioList = async (isLoadMore = false) => {
      try {
        isLoadingAudio.value = true;
        if (!isLoadMore) {
          audioCurrentPage.value = 1;
          audioList.value = [];
          audioHasMore.value = true;
        }
        const { data } = await src_api_audio.getAudioLibraryFeedAPI({
          page: audioCurrentPage.value,
          pageSize: audioPageSize.value
        });
        if (data.code === 0 && data.data) {
          const newList = data.data.list || [];
          audioTotal.value = data.data.total || 0;
          if (isLoadMore) {
            audioList.value = [...audioList.value, ...newList];
          } else {
            audioList.value = newList;
          }
          audioHasMore.value = audioList.value.length < audioTotal.value;
          if (audioHasMore.value) {
            audioCurrentPage.value++;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1370", "加载音频列表失败:", error);
        if (!isLoadMore) {
          audioList.value = [];
        }
      } finally {
        isLoadingAudio.value = false;
      }
    };
    const playAudio = (audio) => {
      if (playingAudioId.value === audio.id) {
        stopPreviewAudio();
        return;
      }
      stopPreviewAudio();
      previewAudioContext = common_vendor.index.createInnerAudioContext();
      previewAudioContext.src = audio.url;
      previewAudioContext.volume = 0.8;
      previewAudioContext.obeyMuteSwitch = false;
      playingAudioId.value = audio.id;
      previewAudioContext.onPlay(() => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:1408", "开始播放预览音频:", audio.name);
      });
      previewAudioContext.onEnded(() => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:1412", "预览音频播放完成");
        playingAudioId.value = null;
        if (previewAudioContext) {
          previewAudioContext.destroy();
          previewAudioContext = null;
        }
      });
      previewAudioContext.onError((err) => {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1421", "播放预览音频失败:", err);
        playingAudioId.value = null;
        if (previewAudioContext) {
          previewAudioContext.destroy();
          previewAudioContext = null;
        }
        common_vendor.index.showToast({
          title: "播放失败",
          icon: "none",
          duration: 2e3
        });
      });
      previewAudioContext.play();
    };
    const handleSelectAudio = async (audio) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1439", "选择音频:", audio);
      selectedAudioUrl.value = audio.url;
      await saveAudioSettingDirectly(audio.url);
    };
    const saveAudioSettingDirectly = async (audioUrl) => {
      try {
        if (!audioUrl) {
          return;
        }
        const { data } = await src_api_user.setUserAudioUrlAPI(audioUrl);
        if (data.code === 0) {
          const userStore = src_stores_user.useUserStore();
          userStore.updateUserInfo({
            audioUrl
          });
          common_vendor.index.showToast({
            title: "设置成功 ✅",
            icon: "none",
            duration: 1500
          });
        } else {
          common_vendor.index.showToast({
            title: data.msg || "设置失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1477", "保存音频设置失败:", error);
        common_vendor.index.showToast({
          title: "设置失败，请重试",
          icon: "none"
        });
      }
    };
    const goToCreateFartFromPopup = () => {
      closeAudioSettingPopup();
      common_vendor.index.navigateTo({
        url: "/pages/entry/creat"
      });
    };
    const stopPreviewAudio = () => {
      if (previewAudioContext) {
        try {
          previewAudioContext.stop();
          previewAudioContext.destroy();
        } catch (e) {
        }
        previewAudioContext = null;
      }
      playingAudioId.value = null;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(todayCount.value),
        b: mostHappyMood.value
      }, mostHappyMood.value ? {
        c: mostHappyMood.value
      } : {}, {
        d: common_vendor.t(lastFartTime.value),
        e: gifUrl.value,
        f: common_vendor.o(onGifLoaded),
        g: common_assets._imports_0,
        h: common_vendor.o(openPopup),
        i: common_assets._imports_1,
        j: common_vendor.o(goToPoints),
        k: common_assets._imports_2,
        l: common_vendor.o(openMakeupPopup),
        m: common_assets._imports_3,
        n: common_vendor.o(goToFartPage),
        o: common_assets._imports_4,
        p: common_vendor.o(openAudioSettingPopup),
        q: common_vendor.f(fartTypes, (type, index, i0) => {
          return {
            a: type.icon,
            b: common_vendor.t(type.label),
            c: index,
            d: common_vendor.n({
              "selected": selectedFartType.value === type.value
            }),
            e: common_vendor.o(($event) => selectFartType(type.value), index)
          };
        }),
        r: common_vendor.f(smellLevels, (level, index, i0) => {
          return {
            a: level.icon,
            b: common_vendor.t(level.label),
            c: index,
            d: common_vendor.n({
              "selected": selectedSmellLevel.value === level.value
            }),
            e: common_vendor.o(($event) => selectSmellLevel(level.value), index)
          };
        }),
        s: common_vendor.f(moods, (mood, index, i0) => {
          return {
            a: mood.icon,
            b: common_vendor.t(mood.label),
            c: index,
            d: common_vendor.n({
              "selected": selectedMood.value === mood.value
            }),
            e: common_vendor.o(($event) => selectMood(mood.value), index)
          };
        }),
        t: common_assets._imports_0,
        v: inputText.value,
        w: common_vendor.o(($event) => inputText.value = $event.detail.value),
        x: common_vendor.t(isSubmitting.value ? "记录中..." : "记一下"),
        y: isSubmitting.value,
        z: common_vendor.o(confirmFart),
        A: common_vendor.sr(popup, "1cf27b2a-0", {
          "k": "popup"
        }),
        B: common_vendor.p({
          type: "bottom",
          ["safe-area"]: false
        }),
        C: showCloud.value
      }, showCloud.value ? {
        D: showCloud.value ? 1 : ""
      } : {}, {
        E: common_vendor.o(closeAchievementDetail),
        F: selectedAchievement.value
      }, selectedAchievement.value ? common_vendor.e({
        G: selectedAchievement.value.achievementGif
      }, selectedAchievement.value.achievementGif ? {
        H: selectedAchievement.value.achievementGif
      } : selectedAchievement.value.achievementIcon ? {
        J: selectedAchievement.value.achievementIcon
      } : {
        K: common_vendor.t(selectedAchievement.value.achievementEmoji)
      }, {
        I: selectedAchievement.value.achievementIcon,
        L: common_vendor.t(selectedAchievement.value.achievementName),
        M: common_vendor.t(selectedAchievement.value.rewardExp),
        N: common_vendor.o(handleShare),
        O: common_vendor.o(closeAchievementDetail)
      }) : {}, {
        P: common_vendor.sr(achievementPopup, "1cf27b2a-1", {
          "k": "achievementPopup"
        }),
        Q: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        }),
        R: common_assets._imports_5,
        S: common_vendor.t(makeupTimeDisplay.value || "请选择时间"),
        T: common_vendor.o(($event) => showTimePicker.value = true),
        U: common_vendor.f(fartTypes, (type, index, i0) => {
          return {
            a: type.icon,
            b: common_vendor.t(type.label),
            c: index,
            d: common_vendor.n({
              "selected": makeupFartType.value === type.value
            }),
            e: common_vendor.o(($event) => makeupFartType.value = type.value, index)
          };
        }),
        V: common_vendor.f(smellLevels, (level, index, i0) => {
          return {
            a: level.icon,
            b: common_vendor.t(level.label),
            c: index,
            d: common_vendor.n({
              "selected": makeupSmellLevel.value === level.value
            }),
            e: common_vendor.o(($event) => makeupSmellLevel.value = level.value, index)
          };
        }),
        W: common_vendor.f(moods, (mood, index, i0) => {
          return {
            a: mood.icon,
            b: common_vendor.t(mood.label),
            c: index,
            d: common_vendor.n({
              "selected": makeupMood.value === mood.value
            }),
            e: common_vendor.o(($event) => makeupMood.value = mood.value, index)
          };
        }),
        X: common_assets._imports_0,
        Y: makeupInputText.value,
        Z: common_vendor.o(($event) => makeupInputText.value = $event.detail.value),
        aa: common_vendor.t(isSubmittingMakeup.value ? "记录中..." : "补一记"),
        ab: isSubmittingMakeup.value,
        ac: common_vendor.o(confirmMakeup),
        ad: common_vendor.sr(makeupPopup, "1cf27b2a-2", {
          "k": "makeupPopup"
        }),
        ae: common_vendor.p({
          type: "bottom",
          ["safe-area"]: false
        }),
        af: common_vendor.sr("timePickerRef", "1cf27b2a-3"),
        ag: common_vendor.o(onTimeConfirm),
        ah: common_vendor.o(onTimeChange),
        ai: common_vendor.o(($event) => showTimePicker.value = false),
        aj: common_vendor.o(($event) => showTimePicker.value = false),
        ak: common_vendor.o(($event) => makeupTimeDisplay.value = $event),
        al: common_vendor.p({
          mode: "time",
          show: showTimePicker.value,
          title: "选择时间",
          modelValue: makeupTimeDisplay.value
        }),
        am: common_vendor.f(audioList.value, (audio, k0, i0) => {
          return common_vendor.e({
            a: selectedAudioUrl.value === audio.url
          }, selectedAudioUrl.value === audio.url ? {
            b: common_assets._imports_6,
            c: common_vendor.o(($event) => handleSelectAudio(audio), audio.id)
          } : {
            d: common_assets._imports_7,
            e: common_vendor.o(($event) => handleSelectAudio(audio), audio.id)
          }, {
            f: audio.image
          }, audio.image ? {
            g: audio.image
          } : {}, {
            h: playingAudioId.value === audio.id
          }, playingAudioId.value === audio.id ? {} : {}, {
            i: playingAudioId.value === audio.id ? "/static/img/24gf-pause2.png" : "/static/img/24gl-playCircle.png",
            j: playingAudioId.value === audio.id ? 1 : "",
            k: common_vendor.o(($event) => playAudio(audio), audio.id),
            l: common_vendor.t(audio.name),
            m: common_vendor.t(audio.description || ""),
            n: audio.tags && audio.tags.length
          }, audio.tags && audio.tags.length ? common_vendor.e({
            o: common_vendor.f(audio.tags.slice(0, 3), (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            }),
            p: audio.tags.length > 3
          }, audio.tags.length > 3 ? {
            q: common_vendor.t(audio.tags.length - 3)
          } : {}) : {}, {
            r: audio.id,
            s: `audio-${audio.id}`,
            t: selectedAudioUrl.value === audio.url ? 1 : "",
            v: common_vendor.s(getCardStyle(audio)),
            w: common_vendor.o(($event) => handleSelectAudio(audio), audio.id)
          });
        }),
        an: audioList.value.length === 0 && !isLoadingAudio.value
      }, audioList.value.length === 0 && !isLoadingAudio.value ? {} : {}, {
        ao: isLoadingAudio.value && audioList.value.length === 0
      }, isLoadingAudio.value && audioList.value.length === 0 ? {} : {}, {
        ap: isLoadingAudio.value && audioList.value.length > 0
      }, isLoadingAudio.value && audioList.value.length > 0 ? {} : {}, {
        aq: !audioHasMore.value && audioList.value.length > 0
      }, !audioHasMore.value && audioList.value.length > 0 ? {} : {}, {
        ar: common_vendor.o(onAudioListScrollToLower),
        as: common_vendor.o(goToCreateFartFromPopup),
        at: common_vendor.sr(audioSettingPopup, "1cf27b2a-4", {
          "k": "audioSettingPopup"
        }),
        av: common_vendor.p({
          type: "bottom",
          ["safe-area"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
