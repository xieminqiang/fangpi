/**
 * 放屁档案 · 小红书小组件主页
 * 单页双 Tab（home / me），逻辑下沉至 utils/
 */
const { getTodayRecordsAPI, getStatisticsSummaryAPI, createFartRecordAPI } = require('../../api/fart.js');
const { getUserInfoAPI } = require('../../api/user.js');
const { assets } = require('../../util/config.js');
const { getLayoutMetrics } = require('../../utils/layout.js');
const { DEFAULT_AVATAR, mapUserInfo } = require('../../utils/profile.js');
const {
  FART_TYPES,
  SMELL_LEVELS,
  MOODS,
  MOOD_ICONS,
  MOOD_VALUE_ICONS,
  DEFAULT_FORM,
  buildRecordPayload,
  normalizeTodayPayload,
  applyTodayResponse
} = require('../../utils/record.js');

const TAB_TITLE = {
  home: '今日放屁',
  me: '个人中心'
};

const FIELD_KEY = {
  fartType: 'selectedFartType',
  smellLevel: 'selectedSmellLevel',
  mood: 'selectedMood'
};

Page({
  data: {
    activeTab: 'home',
    pageTitle: TAB_TITLE.home,
    statusBarHeight: 20,
    headerHeight: 64,
    safeAreaBottom: 0,
    tabbarHeight: 50,
    submitBottom: 50,
    todayCount: 0,
    mostHappyMood: '🤣',
    lastFartTime: '暂无记录',
    todayRecords: [],
    showStatsPopup: false,
    showArchivePopup: false,
    archivePosterUrl: assets.archivePosterUrl,
    isSubmitting: false,
    fartTypes: FART_TYPES,
    smellLevels: SMELL_LEVELS,
    moods: MOODS,
    ...DEFAULT_FORM,
    nickname: '新手屁屁',
    avatarUrl: DEFAULT_AVATAR,
    totalFarts: 0,
    experience: 0,
    levelName: ''
  },

  async onLoad() {
    this.setData(getLayoutMetrics());
    const app = getApp();
    if (app.loginReady) {
      await app.loginReady;
    }
    this.loadStatisticsData();
    this.loadProfile();
  },

  onShow() {
    if (!xhs.getStorageSync('token')) return;
    if (this.data.activeTab === 'home') {
      this.loadStatisticsData();
    } else {
      this.loadProfile();
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab || tab === this.data.activeTab) return;

    this.setData({
      activeTab: tab,
      pageTitle: TAB_TITLE[tab] || TAB_TITLE.home,
      showStatsPopup: false,
      showArchivePopup: false
    });

    if (tab === 'home') {
      this.loadStatisticsData();
    } else {
      this.loadProfile();
    }
  },

  onSelectOption(e) {
    const { field, value } = e.currentTarget.dataset;
    const key = FIELD_KEY[field];
    if (!key || value === undefined) return;
    this.setData({ [key]: value });
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  loadProfile() {
    const cached = xhs.getStorageSync('userInfo');
    if (cached) {
      this.setData(mapUserInfo(cached));
    }

    Promise.all([getUserInfoAPI(), getTodayRecordsAPI()])
      .then(([userRes, todayRes]) => {
        const updates = {};

        if (userRes.data && userRes.data.code === 0 && userRes.data.data) {
          const user = userRes.data.data;
          xhs.setStorageSync('userInfo', user);
          Object.assign(updates, mapUserInfo(user));
        }

        if (todayRes.data && todayRes.data.code === 0 && todayRes.data.data) {
          updates.todayCount = todayRes.data.data.todayCount || 0;
        }

        if (Object.keys(updates).length) {
          this.setData(updates);
        }
      })
      .catch(() => {});
  },

  loadStatisticsData() {
    Promise.all([getTodayRecordsAPI(), getStatisticsSummaryAPI('day')])
      .then(([todayRes, statsRes]) => {
        const updates = {};
        const pack = normalizeTodayPayload(todayRes.data);
        const todayUpdates = applyTodayResponse(pack);
        if (todayUpdates) Object.assign(updates, todayUpdates);

        if (statsRes.data && statsRes.data.code === 0 && statsRes.data.data && statsRes.data.data.mostCommonMood) {
          const m = statsRes.data.data.mostCommonMood;
          updates.mostHappyMood = MOOD_ICONS[m.moodEmoji] || MOOD_VALUE_ICONS[m.mood] || this.data.mostHappyMood;
        }

        if (Object.keys(updates).length) {
          this.setData(updates);
        }
      })
      .catch(() => {});
  },

  toggleStatsPopup() {
    const open = !this.data.showStatsPopup;
    this.setData({ showStatsPopup: open, showArchivePopup: false });
    if (open) this.loadStatisticsData();
  },

  openArchivePopup() {
    this.setData({ showArchivePopup: true, showStatsPopup: false });
  },

  closeArchivePopup() {
    this.setData({ showArchivePopup: false });
  },

  preventBubble() {},

  confirmFart() {
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });

    const req = buildRecordPayload({
      selectedFartType: this.data.selectedFartType,
      selectedSmellLevel: this.data.selectedSmellLevel,
      selectedMood: this.data.selectedMood,
      inputText: this.data.inputText
    });

    createFartRecordAPI(req)
      .then(res => {
        const data = res.data;
        if (data.code === 0) {
          xhs.vibrateShort && xhs.vibrateShort({ type: 'heavy' });
          this.setData({ ...DEFAULT_FORM });
          this.loadStatisticsData();
          xhs.showToast({ title: '记录成功 ✅', icon: 'none' });
        } else {
          xhs.showToast({ title: data.msg || '打卡失败', icon: 'none' });
        }
      })
      .catch(() => {
        xhs.showToast({ title: '打卡失败，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ isSubmitting: false });
      });
  }
});
