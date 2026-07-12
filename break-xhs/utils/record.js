/**
 * 放屁记录 - 常量与数据映射（与 break-app 保持一致）
 */

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

const TYPE_MAP = { 响亮型: 'loud', 轻柔型: 'soft', 无声型: 'silent' };
const SMELL_MAP = { 清香: 1, 一般: 2, 浓烈: 3 };
const MOOD_MAP = { 放松: 'normal', 开心: 'happy', 尴尬: 'embarrassed' };

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

const MOOD_ICONS = { '😌': '😌', '🤣': '🤣', '😖': '😖' };
const MOOD_VALUE_ICONS = { normal: '😌', happy: '🤣', embarrassed: '😖' };

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

const DEFAULT_FORM = {
  selectedFartType: '响亮型',
  selectedSmellLevel: '清香',
  selectedMood: '放松',
  inputText: ''
};

function formatRecordClock(fartTime) {
  if (!fartTime) return '--:--';
  try {
    if (typeof fartTime === 'string' && /^\d{1,2}:\d{2}/.test(fartTime) && !fartTime.includes('T')) {
      const p = fartTime.split(':');
      return `${String(p[0]).padStart(2, '0')}:${String(p[1]).padStart(2, '0')}`;
    }
    const d = new Date(fartTime);
    if (Number.isNaN(d.getTime())) return '--:--';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    return '--:--';
  }
}

function formatLastFartTime(fartTime) {
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
    const diffMinutes = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    return `${Math.floor(diffMinutes / 60)}小时前`;
  } catch (e) {
    return '时间未知';
  }
}

function mapTodayRecords(records) {
  if (!Array.isArray(records) || !records.length) return [];
  const sorted = [...records].sort((a, b) => {
    const ta = new Date(a.fartTime || a.CreatedAt || 0).getTime();
    const tb = new Date(b.fartTime || b.CreatedAt || 0).getTime();
    return tb - ta;
  });
  return sorted.map(r => {
    const typeKey = r.fartType || '';
    const smellKey = r.smellLevel != null ? Number(r.smellLevel) : 1;
    const moodKey = r.mood || 'normal';
    const t = TYPE_META[typeKey] || { label: typeKey || '未知', emoji: '💨' };
    const s = SMELL_META[smellKey] || SMELL_META[1];
    const m = MOOD_META[moodKey] || MOOD_META.normal;
    return {
      id: r.ID != null ? r.ID : r.id,
      timeStr: formatRecordClock(r.fartTime),
      period: r.timePeriod && PERIOD_META[r.timePeriod] ? PERIOD_META[r.timePeriod] : '',
      typeEmoji: t.emoji,
      typeLabel: t.label,
      smellEmoji: s.emoji,
      smellLabel: s.label,
      moodEmoji: m.emoji,
      moodLabel: m.label,
      note: (r.note && String(r.note).trim()) || ''
    };
  });
}

function buildRecordPayload(form) {
  const now = new Date();
  const fartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return {
    fartType: TYPE_MAP[form.selectedFartType],
    smellLevel: SMELL_MAP[form.selectedSmellLevel],
    mood: MOOD_MAP[form.selectedMood],
    note: form.inputText || '',
    fartDate,
    fartTime: now.toTimeString().split(' ')[0]
  };
}

function buildMakeupPayload(form, fartTime) {
  return {
    fartType: TYPE_MAP[form.selectedFartType],
    smellLevel: SMELL_MAP[form.selectedSmellLevel],
    mood: MOOD_MAP[form.selectedMood],
    note: form.inputText || '',
    fartTime
  };
}

function normalizeTodayPayload(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.code !== undefined && raw.data !== undefined) return raw;
  if (raw.mood && raw.mood.code !== undefined) return raw.mood;
  return null;
}

function applyTodayResponse(pack) {
  if (!pack || pack.code !== 0 || !pack.data) return null;
  const d = pack.data;
  const updates = {
    todayCount: d.todayCount || 0,
    todayRecords: mapTodayRecords(d.records || [])
  };
  const sorted = [...(Array.isArray(d.records) ? d.records : [])].sort((a, b) => {
    const ta = new Date(a.fartTime || a.CreatedAt || 0).getTime();
    const tb = new Date(b.fartTime || b.CreatedAt || 0).getTime();
    return tb - ta;
  });
  const lastFt =
    (d.lastRecord && d.lastRecord.fartTime) ||
    (sorted[0] && (sorted[0].fartTime || sorted[0].CreatedAt));
  if (lastFt) {
    updates.lastFartTime = formatLastFartTime(lastFt);
  } else if (updates.todayCount > 0) {
    updates.lastFartTime = '今日';
  } else {
    updates.lastFartTime = '暂无记录';
  }
  return updates;
}

function formatTimeHM(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

module.exports = {
  FART_TYPES,
  SMELL_LEVELS,
  MOODS,
  TYPE_MAP,
  SMELL_MAP,
  MOOD_MAP,
  MOOD_ICONS,
  MOOD_VALUE_ICONS,
  DEFAULT_FORM,
  formatRecordClock,
  formatLastFartTime,
  mapTodayRecords,
  buildRecordPayload,
  buildMakeupPayload,
  normalizeTodayPayload,
  applyTodayResponse,
  formatTimeHM
};
