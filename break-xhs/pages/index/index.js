/**
 * 屁屁打卡小组件 - 主页面逻辑
 */
const { getTodayRecordsAPI, getStatisticsSummaryAPI, createFartRecordAPI } = require('../../api/fart.js');
const { getUserInfoAPI } = require('../../api/user.js');
const { assets } = require('../../util/config.js');

const DEFAULT_AVATAR =
  'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/default-avatar.png';

const MOOD_ICONS = { '😌': '😌', '🤣': '🤣', '😖': '😖' };
const MOOD_VALUE_ICONS = { normal: '😌', happy: '🤣', embarrassed: '😖' };

const FART_TYPES = [
  { value: '响亮型', label: '响亮', emoji: '🔊' },
  { value: '轻柔型', label: '轻柔', emoji: '💫' },
  { value: '无声型', label: '无声', emoji: '🤫' }
];

const SMELL_LEVELS = [
  { value: '清香', label: '清香', emoji: '🌸' },
  { value: '一般', label: '一般', emoji: '🍃' },
  { value: '浓烈', label: '浓烈', emoji: '🔥' }
];

const MOODS = [
  { value: '放松', label: '放松', emoji: '😌' },
  { value: '开心', label: '开心', emoji: '🤣' },
  { value: '尴尬', label: '尴尬', emoji: '😖' }
];

const TYPE_MAP = { '响亮型': 'loud', '轻柔型': 'soft', '无声型': 'silent' };
const SMELL_MAP = { '清香': 1, '一般': 2, '浓烈': 3 };
const MOOD_MAP = { '放松': 'normal', '开心': 'happy', '尴尬': 'embarrassed' };

const TYPE_META = {
  loud: { label: '响亮', emoji: '🔊' },
  soft: { label: '轻柔', emoji: '💫' },
  silent: { label: '无声', emoji: '🤫' }
};

const SMELL_META = {
  1: { label: '清香', emoji: '🌸' },
  2: { label: '一般', emoji: '🍃' },
  3: { label: '浓烈', emoji: '🔥' }
};

const MOOD_META = {
  normal: { label: '放松', emoji: '😌' },
  happy: { label: '开心', emoji: '🤣' },
  embarrassed: { label: '尴尬', emoji: '😖' }
};

const PERIOD_META = {
  dawn: '凌晨',
  morning: '清晨',
  forenoon: '上午',
  noon: '中午',
  afternoon: '午后',
  evening: '傍晚',
  night: '夜间',
  midnight: '深夜'
};

Page({
  data: {
    activeTab: 'home',
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
    selectedFartType: '响亮型',
    selectedSmellLevel: '清香',
    selectedMood: '放松',
    inputText: '',
    nickname: '新手屁屁',
    avatarUrl: DEFAULT_AVATAR,
    totalFarts: 0,
    experience: 0,
    levelName: '',
    safeAreaBottom: 0
  },

  async onLoad() {
    this.initSafeArea();
    // 等待 App 登录完成后再加载数据
    const app = getApp();
    if (app.loginReady) {
      await app.loginReady;
    }
    this.loadStatisticsData();
    this.loadProfile();
  },

  /** 真机安全区：CSS env() 在部分小组件环境不生效，改用 API 取值 */
  initSafeArea() {
    try {
      const info = xhs.getSystemInfoSync();
      let bottom = 0;
      if (info.safeAreaInsets && info.safeAreaInsets.bottom) {
        bottom = info.safeAreaInsets.bottom;
      } else if (info.safeArea && info.screenHeight) {
        bottom = Math.max(0, info.screenHeight - info.safeArea.bottom);
      }
      if (bottom > 0) {
        this.setData({ safeAreaBottom: bottom });
      }
    } catch (e) {
      // 忽略，使用默认 0
    }
  },

  onShow() {
    const token = xhs.getStorageSync('token');
    if (token) {
      if (this.data.activeTab === 'home') {
        this.loadStatisticsData();
      } else {
        this.loadProfile();
      }
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab || tab === this.data.activeTab) return;

    this.setData({
      activeTab: tab,
      showStatsPopup: false,
      showArchivePopup: false
    });

    xhs.setNavigationBarTitle({
      title: tab === 'home' ? '今日放屁' : '个人中心'
    });

    if (tab === 'home') {
      this.loadStatisticsData();
    } else {
      this.loadProfile();
    }
  },

  mapUserInfo(user) {
    return {
      nickname: user.nickname || '新手屁屁',
      avatarUrl: user.avatar || DEFAULT_AVATAR,
      totalFarts: user.totalFarts != null ? user.totalFarts : 0,
      experience: user.experience != null ? user.experience : 0,
      levelName: user.levelName || ''
    };
  },

  loadProfile() {
    const cached = xhs.getStorageSync('userInfo');
    if (cached) {
      this.setData(this.mapUserInfo(cached));
    }

    Promise.all([getUserInfoAPI(), getTodayRecordsAPI()])
      .then(([userRes, todayRes]) => {
        const updates = {};

        if (userRes.data && userRes.data.code === 0 && userRes.data.data) {
          const user = userRes.data.data;
          xhs.setStorageSync('userInfo', user);
          Object.assign(updates, this.mapUserInfo(user));
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

  refreshProfile() {
    xhs.showToast({ title: '刷新中…', icon: 'none' });
    this.loadProfile();
  },

  /** 兼容 { code,data } 与外层挂在 mood 等字段下的结构 */
  normalizeTodayPayload(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (raw.code !== undefined && raw.data !== undefined) return raw;
    if (raw.mood && raw.mood.code !== undefined) return raw.mood;
    return null;
  },

  mapTodayRecords(records) {
    if (!Array.isArray(records) || !records.length) return [];
    const sorted = [...records].sort((a, b) => {
      const ta = new Date(a.fartTime || a.CreatedAt || 0).getTime();
      const tb = new Date(b.fartTime || b.CreatedAt || 0).getTime();
      return tb - ta;
    });
    return sorted.map(r => {
      const id = r.ID != null ? r.ID : r.id;
      const typeKey = r.fartType || '';
      const smellKey = r.smellLevel != null ? Number(r.smellLevel) : 1;
      const moodKey = r.mood || 'normal';
      const t = TYPE_META[typeKey] || { label: typeKey || '未知', emoji: '💨' };
      const s = SMELL_META[smellKey] || SMELL_META[1];
      const m = MOOD_META[moodKey] || MOOD_META.normal;
      const timeStr = this.formatRecordClock(r.fartTime);
      const period = r.timePeriod && PERIOD_META[r.timePeriod] ? PERIOD_META[r.timePeriod] : '';
      const note = (r.note && String(r.note).trim()) || '';
      return {
        id,
        timeStr,
        period,
        typeEmoji: t.emoji,
        typeLabel: t.label,
        smellEmoji: s.emoji,
        smellLabel: s.label,
        moodEmoji: m.emoji,
        moodLabel: m.label,
        note
      };
    });
  },

  formatRecordClock(fartTime) {
    if (!fartTime) return '--:--';
    try {
      if (typeof fartTime === 'string' && /^\d{1,2}:\d{2}/.test(fartTime) && !fartTime.includes('T')) {
        const p = fartTime.split(':');
        return `${String(p[0]).padStart(2, '0')}:${String(p[1]).padStart(2, '0')}`;
      }
      const d = new Date(fartTime);
      if (Number.isNaN(d.getTime())) return '--:--';
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch (e) {
      return '--:--';
    }
  },

  applyTodayResponse(pack) {
    if (!pack || pack.code !== 0 || !pack.data) return null;
    const d = pack.data;
    const updates = {
      todayCount: d.todayCount || 0,
      todayRecords: this.mapTodayRecords(d.records || [])
    };
    const sortedForLast = [...(Array.isArray(d.records) ? d.records : [])].sort((a, b) => {
      const ta = new Date(a.fartTime || a.CreatedAt || 0).getTime();
      const tb = new Date(b.fartTime || b.CreatedAt || 0).getTime();
      return tb - ta;
    });
    const lastFt =
      (d.lastRecord && d.lastRecord.fartTime) || (sortedForLast[0] && (sortedForLast[0].fartTime || sortedForLast[0].CreatedAt));
    if (lastFt) {
      updates.lastFartTime = this.formatLastFartTime(lastFt);
    } else if (updates.todayCount > 0) {
      updates.lastFartTime = '今日';
    } else {
      updates.lastFartTime = '暂无记录';
    }
    return updates;
  },

  loadStatisticsData() {
    Promise.all([getTodayRecordsAPI(), getStatisticsSummaryAPI('day')])
      .then(([todayRes, statsRes]) => {
        const updates = {};
        const pack = this.normalizeTodayPayload(todayRes.data);
        const todayUpdates = this.applyTodayResponse(pack);
        if (todayUpdates) Object.assign(updates, todayUpdates);

        if (statsRes.data.code === 0 && statsRes.data.data && statsRes.data.data.mostCommonMood) {
          const m = statsRes.data.data.mostCommonMood;
          const icon = MOOD_ICONS[m.moodEmoji] || MOOD_VALUE_ICONS[m.mood] || this.data.mostHappyMood;
          updates.mostHappyMood = icon;
        }
        if (Object.keys(updates).length) {
          this.setData(updates);
        }
      })
      .catch(() => {});
  },

  formatLastFartTime(fartTime) {
    if (!fartTime) return '暂无记录';
    try {
      let d;
      if (typeof fartTime === 'string' && fartTime.includes('T')) {
        d = new Date(fartTime);
      } else {
        let timeStr = fartTime;
        const now = new Date();
        const y = now.getFullYear();
        const mo = String(now.getMonth() + 1).padStart(2, '0');
        const da = String(now.getDate()).padStart(2, '0');
        const todayPrefix = `${y}-${mo}-${da}`;
        if (timeStr.includes('T')) timeStr = timeStr.split('T')[1];
        const hms = (timeStr || '').split(/[+.Z-]/)[0];
        d = new Date(`${todayPrefix}T${hms}`);
      }
      if (Number.isNaN(d.getTime())) return '时间未知';
      const diffMs = Date.now() - d.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return '刚刚';
      if (diffMinutes < 60) return diffMinutes + '分钟前';
      return Math.floor(diffMinutes / 60) + '小时前';
    } catch (e) {
      return '时间未知';
    }
  },

  toggleStatsPopup() {
    const open = !this.data.showStatsPopup;
    this.setData({
      showStatsPopup: open,
      showArchivePopup: false
    });
    if (open) {
      this.loadStatisticsData();
    }
  },

  preventBubble() {
    // 阻止点击弹窗内容时关闭，仅点击遮罩或关闭按钮时关闭
  },

  openArchivePopup() {
    this.setData({
      showArchivePopup: true,
      showStatsPopup: false
    });
  },

  closeArchivePopup() {
    this.setData({ showArchivePopup: false });
  },

  selectFartType(e) {
    this.setData({ selectedFartType: e.currentTarget.dataset.value });
  },

  selectSmellLevel(e) {
    this.setData({ selectedSmellLevel: e.currentTarget.dataset.value });
  },

  selectMood(e) {
    this.setData({ selectedMood: e.currentTarget.dataset.value });
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  confirmFart() {
    if (this.data.isSubmitting) return; // 防止重复点击
    this.setData({ isSubmitting: true });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fartDate = year + '-' + month + '-' + day;
    const fartTime = now.toTimeString().split(' ')[0];

    const req = {
      fartType: TYPE_MAP[this.data.selectedFartType],
      smellLevel: SMELL_MAP[this.data.selectedSmellLevel],
      mood: MOOD_MAP[this.data.selectedMood],
      note: this.data.inputText || '',
      fartDate,
      fartTime
    };

    createFartRecordAPI(req)
      .then(res => {
        const data = res.data;
        if (data.code === 0) {
          xhs.vibrateShort && xhs.vibrateShort({ type: 'heavy' });
          this.setData({
            selectedFartType: '响亮型',
            selectedSmellLevel: '清香',
            selectedMood: '放松',
            inputText: ''
          });
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
