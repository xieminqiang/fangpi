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
    const mostHappyMood = common_vendor.ref("🤣");
    const lastFartTime = common_vendor.ref("暂无记录");
    const fartTypes = common_vendor.reactive([
      { value: "响亮型", emoji: "🔥", label: "响亮型" },
      { value: "轻柔型", emoji: "🌬️", label: "轻柔型" },
      { value: "无声型", emoji: "💨", label: "无声型" }
    ]);
    const smellLevels = common_vendor.reactive([
      { value: "清香", emoji: "😊", label: "清香" },
      { value: "一般", emoji: "😐", label: "一般" },
      { value: "浓烈", emoji: "😷", label: "浓烈" }
    ]);
    const moods = common_vendor.reactive([
      { value: "放松", emoji: "😌", label: "放松" },
      { value: "开心", emoji: "🤣", label: "开心" },
      { value: "尴尬", emoji: "😖", label: "尴尬" }
    ]);
    const openPopup = () => {
      popup.value.open();
    };
    const onGifLoaded = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:564", "GIF加载完成");
      isGifPlaying.value = true;
      setTimeout(() => {
        isGifPlaying.value = false;
      }, 3e3);
    };
    const replayGif = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:574", "开始重播GIF");
      showGifImage.value = false;
      isGifPlaying.value = false;
      const timestamp = Date.now();
      gifTimestamp.value = timestamp;
      gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${timestamp}`;
      setTimeout(() => {
        showGifImage.value = true;
        common_vendor.index.__f__("log", "at pages/index/index.vue:590", "GIF重新显示，URL:", gifUrl.value);
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
          common_vendor.index.__f__("log", "at pages/index/index.vue:638", "开始播放放屁声音，路径:", audioContext.src);
        });
        audioContext.onEnded(() => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:642", "放屁声音播放完成");
        });
        audioContext.onError((err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:647", "播放放屁声音失败:", err);
          common_vendor.index.__f__("error", "at pages/index/index.vue:648", "音频路径:", audioContext.src);
          if (err.errMsg && (err.errMsg.includes("404") || err.errMsg.includes("not found"))) {
            common_vendor.index.__f__("warn", "at pages/index/index.vue:651", "音频文件未找到，请确保已将 fangpi.MP3 上传到 OSS 服务器");
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:673", "创建音频上下文失败:", error);
        audioContext = null;
      }
    };
    const openMakeupPopup = () => {
      const now = /* @__PURE__ */ new Date();
      makeupTimeDisplay.value = formatTimeDisplay(now);
      common_vendor.index.__f__("log", "at pages/index/index.vue:686", "打开补卡弹窗，初始化时间:", makeupTimeDisplay.value);
      makeupPopup.value.open();
    };
    const closeMakeupPopup = () => {
      makeupPopup.value.close();
    };
    const formatTimeDisplay = (date) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:699", "formatTimeDisplay 接收到无效的日期:", date);
        return "00:00";
      }
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    const onTimeChange = (e) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:710", "时间选择器 change 事件:", e);
      common_vendor.index.__f__("log", "at pages/index/index.vue:711", "当前 makeupTimeDisplay:", makeupTimeDisplay.value);
    };
    const onTimeConfirm = (e) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:716", "===== 时间选择器确认 =====");
      common_vendor.index.__f__("log", "at pages/index/index.vue:717", "e.value:", e.value);
      common_vendor.index.__f__("log", "at pages/index/index.vue:718", "当前 makeupTimeDisplay:", makeupTimeDisplay.value);
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:795", "提交补卡记录:", requestData);
        const { data } = await src_api_fart.makeupFartRecordAPI(requestData);
        common_vendor.index.__f__("log", "at pages/index/index.vue:800", "补卡结果:", data);
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
            title: "补卡成功 ✅",
            icon: "none",
            duration: 1500
          });
          if (data.data && data.data.newAchievements && data.data.newAchievements.length > 0) {
            common_vendor.index.__f__("log", "at pages/index/index.vue:834", "解锁新成就:", data.data.newAchievements);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:852", "补卡失败:", error);
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
          if (statsData.mostCommonMood && statsData.mostCommonMood.moodEmoji) {
            mostHappyMood.value = statsData.mostCommonMood.moodEmoji;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:892", "加载统计数据失败:", error);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:925", "格式化时间失败:", error, fartTime);
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
      common_vendor.index.__f__("log", "at pages/index/index.vue:966", "已发送 userInfoUpdated 事件，通知其他页面刷新");
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
        const fartDate = now.toISOString().split("T")[0];
        const fartTime = now.toTimeString().split(" ")[0];
        const requestData = {
          fartType: typeMap[selectedFartType.value],
          smellLevel: smellMap[selectedSmellLevel.value],
          mood: moodMap[selectedMood.value],
          note: inputText.value || "",
          fartDate,
          fartTime
        };
        common_vendor.index.__f__("log", "at pages/index/index.vue:1014", "提交放屁记录:", requestData);
        const { data } = await src_api_fart.createFartRecordAPI(requestData);
        common_vendor.index.__f__("log", "at pages/index/index.vue:1019", "打卡结果:", data);
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
            common_vendor.index.__f__("log", "at pages/index/index.vue:1046", "解锁新成就:", data.data.newAchievements);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:1063", "打卡失败:", error);
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:1080", "已有 token，直接加载统计数据");
        loadStatisticsData();
      } else {
        common_vendor.index.__f__("log", "at pages/index/index.vue:1083", "暂无 token，等待登录完成...");
      }
      common_vendor.index.$on("loginSuccess", onLoginSuccess);
    });
    const onLoginSuccess = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1092", "收到 loginSuccess 事件，开始加载统计数据");
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
      common_vendor.index.__f__("log", "at pages/index/index.vue:1167", "准备分享成就:", selectedAchievement.value.achievementName);
    };
    common_vendor.onShareAppMessage(() => {
      if (selectedAchievement.value) {
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
      common_vendor.index.__f__("log", "at pages/index/index.vue:1208", "打开音频设置弹窗，当前选中:", selectedAudioUrl.value);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:1289", "加载音频列表失败:", error);
        if (!isLoadMore) {
          audioList.value = [];
        }
      } finally {
        isLoadingAudio.value = false;
      }
    };
    const selectAudio = (url, name) => {
      selectedAudioUrl.value = url;
      common_vendor.index.__f__("log", "at pages/index/index.vue:1301", "选择音频:", name, url);
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:1327", "开始播放预览音频:", audio.name);
      });
      previewAudioContext.onEnded(() => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:1331", "预览音频播放完成");
        playingAudioId.value = null;
        if (previewAudioContext) {
          previewAudioContext.destroy();
          previewAudioContext = null;
        }
      });
      previewAudioContext.onError((err) => {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1340", "播放预览音频失败:", err);
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
    const saveAudioSetting = async () => {
      try {
        if (!selectedAudioUrl.value) {
          common_vendor.index.showToast({
            title: "请选择音频",
            icon: "none"
          });
          return;
        }
        const { data } = await src_api_user.setUserAudioUrlAPI(selectedAudioUrl.value);
        if (data.code === 0) {
          const userStore = src_stores_user.useUserStore();
          userStore.updateUserInfo({
            audioUrl: selectedAudioUrl.value
          });
          closeAudioSettingPopup();
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:1407", "保存音频设置失败:", error);
        common_vendor.index.showToast({
          title: "设置失败，请重试",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_vendor.o(openAudioSettingPopup),
        c: common_vendor.t(todayCount.value),
        d: common_vendor.t(mostHappyMood.value),
        e: common_vendor.t(lastFartTime.value),
        f: gifUrl.value,
        g: common_vendor.o(onGifLoaded),
        h: common_vendor.o(openPopup),
        i: common_vendor.f(fartTypes, (type, index, i0) => {
          return {
            a: common_vendor.t(type.emoji),
            b: common_vendor.t(type.label),
            c: index,
            d: common_vendor.n({
              "selected": selectedFartType.value === type.value
            }),
            e: common_vendor.o(($event) => selectFartType(type.value), index)
          };
        }),
        j: common_vendor.f(smellLevels, (level, index, i0) => {
          return {
            a: common_vendor.t(level.emoji),
            b: common_vendor.t(level.label),
            c: index,
            d: common_vendor.n({
              "selected": selectedSmellLevel.value === level.value
            }),
            e: common_vendor.o(($event) => selectSmellLevel(level.value), index)
          };
        }),
        k: common_vendor.f(moods, (mood, index, i0) => {
          return {
            a: common_vendor.t(mood.emoji),
            b: common_vendor.t(mood.label),
            c: index,
            d: common_vendor.n({
              "selected": selectedMood.value === mood.value
            }),
            e: common_vendor.o(($event) => selectMood(mood.value), index)
          };
        }),
        l: inputText.value,
        m: common_vendor.o(($event) => inputText.value = $event.detail.value),
        n: common_vendor.t(isSubmitting.value ? "提交中..." : "确认打卡"),
        o: isSubmitting.value,
        p: common_vendor.o(confirmFart),
        q: common_vendor.sr(popup, "1cf27b2a-0", {
          "k": "popup"
        }),
        r: common_vendor.p({
          type: "bottom",
          ["safe-area"]: false
        }),
        s: showCloud.value
      }, showCloud.value ? {
        t: showCloud.value ? 1 : ""
      } : {}, {
        v: common_vendor.o(closeAchievementDetail),
        w: selectedAchievement.value
      }, selectedAchievement.value ? common_vendor.e({
        x: selectedAchievement.value.achievementGif
      }, selectedAchievement.value.achievementGif ? {
        y: selectedAchievement.value.achievementGif
      } : selectedAchievement.value.achievementIcon ? {
        A: selectedAchievement.value.achievementIcon
      } : {
        B: common_vendor.t(selectedAchievement.value.achievementEmoji)
      }, {
        z: selectedAchievement.value.achievementIcon,
        C: common_vendor.t(selectedAchievement.value.achievementName),
        D: common_vendor.t(selectedAchievement.value.rewardExp),
        E: common_vendor.o(handleShare),
        F: common_vendor.o(closeAchievementDetail)
      }) : {}, {
        G: common_vendor.sr(achievementPopup, "1cf27b2a-1", {
          "k": "achievementPopup"
        }),
        H: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        }),
        I: common_assets._imports_1,
        J: common_vendor.o(openMakeupPopup),
        K: common_vendor.t(makeupTimeDisplay.value || "请选择时间"),
        L: common_vendor.o(($event) => showTimePicker.value = true),
        M: common_vendor.f(fartTypes, (type, index, i0) => {
          return {
            a: common_vendor.t(type.emoji),
            b: common_vendor.t(type.label),
            c: index,
            d: common_vendor.n({
              "selected": makeupFartType.value === type.value
            }),
            e: common_vendor.o(($event) => makeupFartType.value = type.value, index)
          };
        }),
        N: common_vendor.f(smellLevels, (level, index, i0) => {
          return {
            a: common_vendor.t(level.emoji),
            b: common_vendor.t(level.label),
            c: index,
            d: common_vendor.n({
              "selected": makeupSmellLevel.value === level.value
            }),
            e: common_vendor.o(($event) => makeupSmellLevel.value = level.value, index)
          };
        }),
        O: common_vendor.f(moods, (mood, index, i0) => {
          return {
            a: common_vendor.t(mood.emoji),
            b: common_vendor.t(mood.label),
            c: index,
            d: common_vendor.n({
              "selected": makeupMood.value === mood.value
            }),
            e: common_vendor.o(($event) => makeupMood.value = mood.value, index)
          };
        }),
        P: makeupInputText.value,
        Q: common_vendor.o(($event) => makeupInputText.value = $event.detail.value),
        R: common_vendor.t(isSubmittingMakeup.value ? "提交中..." : "确认补卡"),
        S: isSubmittingMakeup.value,
        T: common_vendor.o(confirmMakeup),
        U: common_vendor.sr(makeupPopup, "1cf27b2a-2", {
          "k": "makeupPopup"
        }),
        V: common_vendor.p({
          type: "bottom",
          ["safe-area"]: false
        }),
        W: common_vendor.sr("timePickerRef", "1cf27b2a-3"),
        X: common_vendor.o(onTimeConfirm),
        Y: common_vendor.o(onTimeChange),
        Z: common_vendor.o(($event) => showTimePicker.value = false),
        aa: common_vendor.o(($event) => showTimePicker.value = false),
        ab: common_vendor.o(($event) => makeupTimeDisplay.value = $event),
        ac: common_vendor.p({
          mode: "time",
          show: showTimePicker.value,
          title: "选择时间",
          modelValue: makeupTimeDisplay.value
        }),
        ad: selectedAudioUrl.value === defaultAudioUrl
      }, selectedAudioUrl.value === defaultAudioUrl ? {
        ae: common_assets._imports_2
      } : {
        af: common_assets._imports_3
      }, {
        ag: selectedAudioUrl.value === defaultAudioUrl ? 1 : "",
        ah: common_vendor.o(($event) => selectAudio(defaultAudioUrl, "默认音频")),
        ai: common_vendor.f(audioList.value, (audio, k0, i0) => {
          return common_vendor.e({
            a: selectedAudioUrl.value === audio.url
          }, selectedAudioUrl.value === audio.url ? {
            b: common_assets._imports_2
          } : {
            c: common_assets._imports_3
          }, {
            d: audio.image
          }, audio.image ? {
            e: audio.image
          } : {}, {
            f: playingAudioId.value === audio.id
          }, playingAudioId.value === audio.id ? {} : {}, {
            g: playingAudioId.value === audio.id ? "/static/img/24gf-pause2.png" : "/static/img/24gl-playCircle.png",
            h: playingAudioId.value === audio.id ? 1 : "",
            i: common_vendor.o(($event) => playAudio(audio), audio.id),
            j: common_vendor.t(audio.name),
            k: common_vendor.t(audio.description || ""),
            l: audio.tags && audio.tags.length
          }, audio.tags && audio.tags.length ? common_vendor.e({
            m: common_vendor.f(audio.tags.slice(0, 3), (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            }),
            n: audio.tags.length > 3
          }, audio.tags.length > 3 ? {
            o: common_vendor.t(audio.tags.length - 3)
          } : {}) : {}, {
            p: audio.id,
            q: `audio-${audio.id}`,
            r: selectedAudioUrl.value === audio.url ? 1 : "",
            s: common_vendor.s(getCardStyle(audio)),
            t: common_vendor.o(($event) => selectAudio(audio.url, audio.name), audio.id)
          });
        }),
        aj: audioList.value.length === 0 && !isLoadingAudio.value
      }, audioList.value.length === 0 && !isLoadingAudio.value ? {} : {}, {
        ak: isLoadingAudio.value && audioList.value.length === 0
      }, isLoadingAudio.value && audioList.value.length === 0 ? {} : {}, {
        al: isLoadingAudio.value && audioList.value.length > 0
      }, isLoadingAudio.value && audioList.value.length > 0 ? {} : {}, {
        am: !audioHasMore.value && audioList.value.length > 0
      }, !audioHasMore.value && audioList.value.length > 0 ? {} : {}, {
        an: common_vendor.o(onAudioListScrollToLower),
        ao: common_vendor.o(closeAudioSettingPopup),
        ap: common_vendor.o(saveAudioSetting),
        aq: common_vendor.sr(audioSettingPopup, "1cf27b2a-4", {
          "k": "audioSettingPopup"
        }),
        ar: common_vendor.p({
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
