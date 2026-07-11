"use strict";
const common_vendor = require("../../common/vendor.js");
const src_api_user = require("../../src/api/user.js");
const src_api_fart = require("../../src/api/fart.js");
const src_stores_user = require("../../src/stores/user.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const meImg = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/me_img.png";
const taImg = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/ta_img.png";
const _sfc_main = {
  __name: "fart",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    const nickname = common_vendor.computed(() => userStore.nickname);
    const avatar = common_vendor.computed(() => userStore.avatar);
    const isMe = common_vendor.ref(true);
    const leftDefaultImg = common_vendor.ref(meImg);
    const leftAvatarImg = common_vendor.ref(meImg);
    const rightDefaultImg = common_vendor.ref(taImg);
    const rightAvatarImg = common_vendor.ref(taImg);
    common_vendor.ref(meImg);
    common_vendor.ref(taImg);
    common_vendor.ref(null);
    common_vendor.ref(null);
    const isInviteShareMode = common_vendor.ref(false);
    const currentTogetherRecordId = common_vendor.ref(null);
    const lastFartTogetherRecord = common_vendor.ref(null);
    const isCanlastFartTogether = common_vendor.ref(false);
    const hasUnfinishedRecord = common_vendor.computed(() => {
      return lastFartTogetherRecord.value && lastFartTogetherRecord.value.inviteeRecordInfo && lastFartTogetherRecord.value.inviteeRecordInfo.fartType === "";
    });
    const currentInviteeId = common_vendor.ref(null);
    const currentInviterSex = common_vendor.ref(1);
    const currentInviteeSex = common_vendor.ref(2);
    const fartPopup = common_vendor.ref();
    const nickname_left = common_vendor.ref("");
    const nickname_right = common_vendor.ref("");
    const isCompleted = common_vendor.computed(() => {
      return nickname_left.value !== "" && nickname_right.value !== "";
    });
    const selectedFartType = common_vendor.ref("响亮型");
    const selectedSmellLevel = common_vendor.ref("清香");
    const selectedVolume = common_vendor.ref("大当量");
    const selectedMood = common_vendor.ref("放松");
    const isSubmitting = common_vendor.ref(false);
    const gifUrl = common_vendor.ref(`https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`);
    const isPopupOpen = common_vendor.ref(false);
    const fartTypes = [
      { value: "响亮型", icon: "/static/emj/iangliang.png", label: "响亮型" },
      { value: "轻柔型", icon: "/static/emj/qingrou.png", label: "轻柔型" },
      { value: "无声型", icon: "/static/emj/wusheng.png", label: "无声型" }
    ];
    const smellLevels = [
      { value: "清香", icon: "/static/emj/qingxiang.png", label: "清香" },
      { value: "一般", icon: "/static/emj/yiban.png", label: "一般" },
      { value: "浓烈", icon: "/static/emj/nonglie.png", label: "浓烈" },
      { value: "不确定", icon: "/static/emj/bqd_wmj.png", label: "不确定" }
    ];
    const volumeLevels = [
      { value: "大当量", icon: "/static/emj/teddy-bear.png", label: "大当量", sizeClass: "volume-large" },
      { value: "中当量", icon: "/static/emj/teddy-bear.png", label: "中当量", sizeClass: "volume-medium" },
      { value: "小当量", icon: "/static/emj/teddy-bear.png", label: "小当量", sizeClass: "volume-small" },
      { value: "微当量", icon: "/static/emj/teddy-bear.png", label: "微当量", sizeClass: "volume-micro" }
    ];
    const moods = [
      { value: "放松", icon: "/static/emj/fangsong.png", label: "放松" },
      { value: "开心", icon: "/static/emj/kaixin.png", label: "开心" },
      { value: "尴尬", icon: "/static/emj/ganga.png", label: "尴尬" }
    ];
    const selectFartType = (value) => {
      selectedFartType.value = value;
    };
    const selectSmellLevel = (value) => {
      selectedSmellLevel.value = value;
    };
    const selectVolume = (value) => {
      selectedVolume.value = value;
    };
    const selectMood = (value) => {
      selectedMood.value = value;
    };
    const confirmFart = async () => {
      var _a;
      if (isSubmitting.value) {
        return;
      }
      let inviterId = (_a = userStore.userInfo) == null ? void 0 : _a.ID;
      let inviteeId = void 0;
      let inviterSex = currentInviterSex.value;
      let inviteeSex = currentInviteeSex.value;
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
          "浓烈": 3,
          "不确定": 0
        };
        const moodMap = {
          "放松": "normal",
          "开心": "happy",
          "尴尬": "embarrassed"
        };
        const volumeMap = {
          "大当量": "large",
          "中当量": "medium",
          "小当量": "small",
          "微当量": "micro"
        };
        const requestData = {
          inviterId
          // 邀请人ID就是当前用户的ID（必填）
        };
        if (inviteeId !== void 0 && inviteeId !== null)
          ;
        if (inviterSex !== void 0 && inviterSex !== null) {
          requestData.inviterSex = inviterSex;
        }
        if (inviteeSex !== void 0 && inviteeSex !== null) {
          requestData.inviteeSex = inviteeSex;
        }
        requestData.inviterRecordInfo = {
          fartType: typeMap[selectedFartType.value],
          mood: moodMap[selectedMood.value],
          smellLevel: smellMap[selectedSmellLevel.value],
          volumeLevel: volumeMap[selectedVolume.value]
        };
        requestData.inviteeRecordInfo = null;
        common_vendor.index.__f__("log", "at pages/index/fart.vue:500", "提交一起打屁记录:", requestData);
        const { data } = await src_api_fart.createFartTogetherRecordAPI(requestData);
        common_vendor.index.__f__("log", "at pages/index/fart.vue:505", "打卡结果:", data);
        if (data.code === 0) {
          common_vendor.index.vibrateShort({
            type: "heavy"
          });
          fartPopup.value.close();
          loadLastFartTogetherRecord();
          common_vendor.index.$emit("fartRecordAdded");
          common_vendor.index.$emit("userInfoUpdated");
          common_vendor.index.showToast({
            title: " ✅ 放屁成功",
            icon: "none",
            duration: 1500
          });
          selectedFartType.value = "响亮型";
          selectedSmellLevel.value = "清香";
          selectedVolume.value = "大当量";
          selectedMood.value = "放松";
          currentInviteeId.value = null;
          gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`;
        } else {
          common_vendor.index.showToast({
            title: data.msg || "打卡失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/fart.vue:546", "打卡失败:", error);
        common_vendor.index.showToast({
          title: "打卡失败，请重试",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    const handleTogetherFart = async () => {
      if (isSubmitting.value) {
        return;
      }
      if (!currentTogetherRecordId.value) {
        common_vendor.index.showToast({
          title: "缺少一起放屁记录ID",
          icon: "none"
        });
        return;
      }
      goToFartPage();
    };
    const goToHomePage = () => {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    };
    const updateTogetherFartRecord = async () => {
      if (isSubmitting.value) {
        return;
      }
      if (!currentTogetherRecordId.value) {
        common_vendor.index.showToast({
          title: "缺少一起放屁记录ID",
          icon: "none"
        });
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
          "浓烈": 3,
          "不确定": 0
        };
        const moodMap = {
          "放松": "normal",
          "开心": "happy",
          "尴尬": "embarrassed"
        };
        const volumeMap = {
          "大当量": "large",
          "中当量": "medium",
          "小当量": "small",
          "微当量": "micro"
        };
        const updateData = {
          inviteeRecordInfo: {
            fartType: typeMap[selectedFartType.value],
            mood: moodMap[selectedMood.value],
            smellLevel: smellMap[selectedSmellLevel.value],
            volumeLevel: volumeMap[selectedVolume.value]
          }
        };
        common_vendor.index.__f__("log", "at pages/index/fart.vue:642", "更新一起打屁记录:", currentTogetherRecordId.value, updateData);
        const { data } = await src_api_fart.updateFartTogetherRecordAPI(currentTogetherRecordId.value, updateData);
        common_vendor.index.__f__("log", "at pages/index/fart.vue:647", "更新结果:", data);
        if (data.code === 0) {
          common_vendor.index.vibrateShort({
            type: "heavy"
          });
          fartPopup.value.close();
          const recordId = currentTogetherRecordId.value;
          await loadFartTogetherRecordById(recordId);
          common_vendor.index.$emit("fartRecordAdded");
          common_vendor.index.$emit("userInfoUpdated");
          common_vendor.index.showToast({
            title: " ✅ 放屁成功",
            icon: "none",
            duration: 1500
          });
          selectedFartType.value = "响亮型";
          selectedSmellLevel.value = "清香";
          selectedVolume.value = "大当量";
          selectedMood.value = "放松";
          gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`;
        } else {
          common_vendor.index.showToast({
            title: data.msg || "更新失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/fart.vue:692", "更新失败:", error);
        common_vendor.index.showToast({
          title: "更新失败，请重试",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    const switchIdentity = async () => {
      if (isInviteShareMode.value) {
        return;
      }
      if (hasUnfinishedRecord.value) {
        const recordId = lastFartTogetherRecord.value.id;
        if (!recordId) {
          common_vendor.index.__f__("error", "at pages/index/fart.vue:712", "记录ID不存在");
          return;
        }
        const newInviterSex = lastFartTogetherRecord.value.inviteeSex || 1;
        const newInviteeSex = lastFartTogetherRecord.value.inviterSex || 2;
        try {
          const updateData = {
            id: recordId,
            inviterSex: newInviterSex,
            inviteeSex: newInviteeSex
          };
          common_vendor.index.__f__("log", "at pages/index/fart.vue:729", "切换身份，更新性别:", updateData);
          common_vendor.index.showLoading({
            title: "切换中..."
          });
          const { data } = await src_api_fart.updateFartTogetherRecordSexAPI(updateData);
          common_vendor.index.hideLoading();
          if (data.code === 0) {
            lastFartTogetherRecord.value.inviterSex = newInviterSex;
            lastFartTogetherRecord.value.inviteeSex = newInviteeSex;
            await loadLastFartTogetherRecord();
            common_vendor.index.showToast({
              title: "切换成功",
              icon: "none",
              duration: 1500
            });
          } else {
            common_vendor.index.showToast({
              title: data.msg || "切换失败",
              icon: "none"
            });
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/index/fart.vue:757", "切换身份失败:", error);
          common_vendor.index.showToast({
            title: "切换失败，请重试",
            icon: "none"
          });
        }
        return;
      }
      const hasLeftNickname = nickname_left.value !== "";
      const hasRightNickname = nickname_right.value !== "";
      if (!hasLeftNickname && !hasRightNickname) {
        isMe.value = !isMe.value;
        leftDefaultImg.value = isMe.value ? meImg : taImg;
        rightDefaultImg.value = isMe.value ? taImg : meImg;
        nickname_left.value = "";
        nickname_right.value = "";
      } else {
        const tempLeftDefaultImg = leftDefaultImg.value;
        const tempLeftAvatarImg = leftAvatarImg.value;
        const tempRightDefaultImg = rightDefaultImg.value;
        const tempRightAvatarImg = rightAvatarImg.value;
        const tempLeftNickname = nickname_left.value;
        const tempRightNickname = nickname_right.value;
        nickname_left.value = tempRightNickname;
        nickname_right.value = tempLeftNickname;
        leftDefaultImg.value = tempRightDefaultImg;
        leftAvatarImg.value = tempRightAvatarImg;
        rightDefaultImg.value = tempLeftDefaultImg;
        rightAvatarImg.value = tempLeftAvatarImg;
        if (!nickname_left.value) {
          if (tempRightDefaultImg === meImg || tempRightDefaultImg === taImg) {
            leftDefaultImg.value = tempRightDefaultImg;
          } else {
            leftDefaultImg.value = meImg;
          }
        }
        if (!nickname_right.value) {
          if (tempLeftDefaultImg === meImg || tempLeftDefaultImg === taImg) {
            rightDefaultImg.value = tempLeftDefaultImg === meImg ? taImg : meImg;
          } else {
            rightDefaultImg.value = taImg;
          }
        }
        if (leftDefaultImg.value === meImg) {
          isMe.value = true;
        } else if (leftDefaultImg.value === taImg) {
          isMe.value = false;
        }
      }
    };
    const handleWxLogin = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/index/fart.vue:829", "开始微信 code 登录...");
        const loginRes = await common_vendor.index.login();
        const code = loginRes.code;
        common_vendor.index.__f__("log", "at pages/index/fart.vue:835", "获取到的 code:", code);
        const { data } = await src_api_user.wxQuickLoginAPI(code);
        common_vendor.index.__f__("log", "at pages/index/fart.vue:840", "微信登录结果:", data);
        if (data.code === 0) {
          userStore.setLoginInfo(data.data);
          common_vendor.index.$emit("loginSuccess");
          common_vendor.index.__f__("log", "at pages/index/fart.vue:849", "✅ 微信登录成功");
          return true;
        } else {
          common_vendor.index.__f__("log", "at pages/index/fart.vue:852", "❌ 微信登录失败:", data.msg);
          return false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/fart.vue:856", "❌ 微信登录异常:", error);
        return false;
      }
    };
    const handleSmartLogin = async () => {
      common_vendor.index.__f__("log", "at pages/index/fart.vue:863", "===== 开始智能登录 =====");
      const savedOpenid = userStore.openid;
      if (savedOpenid) {
        common_vendor.index.__f__("log", "at pages/index/fart.vue:869", "检测到保存的 openid，尝试快速登录");
        try {
          const { data } = await src_api_user.openidLoginAPI(savedOpenid);
          common_vendor.index.__f__("log", "at pages/index/fart.vue:873", "openid 登录结果:", data.data);
          if (data.code === 0) {
            userStore.setLoginInfo(data.data);
            common_vendor.index.$emit("loginSuccess");
            common_vendor.index.__f__("log", "at pages/index/fart.vue:882", "✅ openid 登录成功");
            return true;
          } else {
            common_vendor.index.__f__("log", "at pages/index/fart.vue:885", "❌ openid 登录失败:", data.msg);
            return await handleWxLogin();
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/index/fart.vue:889", "❌ openid 登录异常:", error);
          return await handleWxLogin();
        }
      } else {
        return await handleWxLogin();
      }
    };
    const loadUserInfo = async () => {
      try {
        const { data } = await src_api_user.getUserInfoAPI();
        if (data.code === 0) {
          userStore.setUserInfo(data.data);
          common_vendor.index.__f__("log", "at pages/index/fart.vue:904", "用户信息已更新:", data.data);
        } else {
          common_vendor.index.__f__("log", "at pages/index/fart.vue:906", "获取用户信息失败，可能需要登录:", data.msg);
          const loginSuccess = await handleSmartLogin();
          if (loginSuccess) {
            await loadUserInfo();
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/fart.vue:915", "获取用户信息失败:", error);
        const loginSuccess = await handleSmartLogin();
        if (loginSuccess) {
          await loadUserInfo();
        }
      }
    };
    const loadLastFartTogetherRecord = async () => {
      var _a, _b, _c, _d, _e;
      try {
        if (!((_a = userStore.userInfo) == null ? void 0 : _a.ID)) {
          common_vendor.index.__f__("log", "at pages/index/fart.vue:931", "未登录，跳过加载最近一次屁友一起打屁记录");
          return;
        }
        nickname_left.value = "";
        nickname_right.value = "";
        const { data } = await src_api_fart.getLastFartTogetherRecordAPI();
        if (data.code === 0 && data.data) {
          lastFartTogetherRecord.value = data.data;
          common_vendor.index.__f__("log", "at pages/index/fart.vue:939", "最近一次屁友一起打屁记录:", data.data);
          const currentUserId = userStore.userInfo.ID;
          const record = data.data;
          if (record.inviterId === currentUserId && record.inviterSex === 1) {
            leftDefaultImg.value = meImg;
            nickname_left.value = "";
            nickname_right.value = ((_b = record.inviteeInfo) == null ? void 0 : _b.nickname) || "";
            if (nickname_right.value) {
              rightAvatarImg.value = ((_c = record.inviteeInfo) == null ? void 0 : _c.avatar) || taImg;
            } else {
              rightDefaultImg.value = taImg;
            }
          }
          if (record.inviterId == currentUserId && record.inviterSex === 2) {
            rightDefaultImg.value = meImg;
            nickname_right.value = "";
            nickname_left.value = ((_d = record.inviteeInfo) == null ? void 0 : _d.nickname) || "";
            if (nickname_left.value) {
              leftAvatarImg.value = ((_e = record.inviteeInfo) == null ? void 0 : _e.avatar) || taImg;
            } else {
              leftDefaultImg.value = taImg;
            }
          }
          if (nickname_left.value != "" && nickname_right.value != "") {
            isCanlastFartTogether.value = false;
          } else {
            isCanlastFartTogether.value = true;
          }
        } else {
          common_vendor.index.__f__("log", "at pages/index/fart.vue:1003", "没有最近一次屁友一起打屁记录");
          lastFartTogetherRecord.value = null;
          leftDefaultImg.value = meImg;
          rightDefaultImg.value = taImg;
          leftAvatarImg.value = meImg;
          rightAvatarImg.value = taImg;
          nickname_left.value = "";
          nickname_right.value = "";
          isMe.value = true;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/fart.vue:1015", "获取最近一次屁友一起打屁记录失败:", error);
        lastFartTogetherRecord.value = null;
      }
    };
    const getFartTypeName = (fartType) => {
      const typeMap = {
        "loud": "响亮型",
        "soft": "轻柔型",
        "silent": "无声型"
      };
      return typeMap[fartType] || fartType;
    };
    const getFartTypeNameByRecord = (recordInfo) => {
      if (!recordInfo || !recordInfo.fartType) {
        return "暂无";
      }
      return getFartTypeName(recordInfo.fartType);
    };
    const getSmellLevelName = (smellLevel) => {
      const levelMap = {
        0: "不确定",
        1: "清香",
        2: "一般",
        3: "浓烈"
      };
      return levelMap[smellLevel] || "未知";
    };
    const getSmellLevelNameByRecord = (recordInfo) => {
      if (!recordInfo || recordInfo.smellLevel === void 0 || recordInfo.smellLevel === null) {
        return "暂无";
      }
      return getSmellLevelName(recordInfo.smellLevel);
    };
    const getMoodName = (mood) => {
      const moodMap = {
        "normal": "放松",
        "happy": "开心",
        "embarrassed": "尴尬"
      };
      return moodMap[mood] || mood || "未知";
    };
    const getMoodNameByRecord = (recordInfo) => {
      if (!recordInfo || !recordInfo.mood) {
        return "暂无";
      }
      return getMoodName(recordInfo.mood);
    };
    const getVolumeName = (volumeLevel) => {
      const volumeMap = {
        "large": "大当量",
        "medium": "中当量",
        "small": "小当量",
        "micro": "微当量"
      };
      return volumeMap[volumeLevel] || volumeLevel || "";
    };
    const getVolumeNameByRecord = (recordInfo) => {
      if (!recordInfo || !recordInfo.volumeLevel) {
        return "";
      }
      return getVolumeName(recordInfo.volumeLevel);
    };
    const hasRecordData = (recordInfo) => {
      common_vendor.index.__f__("log", "at pages/index/fart.vue:1096", "recordInfo", recordInfo);
      if (!recordInfo || !recordInfo.fartType) {
        return false;
      }
      return !!(recordInfo.fartType || recordInfo.smellLevel !== void 0 && recordInfo.smellLevel !== null || recordInfo.mood);
    };
    const getInviteButtonText = () => {
      if (lastFartTogetherRecord.value && lastFartTogetherRecord.value.inviteeRecordInfo && (!lastFartTogetherRecord.value.inviteeRecordInfo.fartType || lastFartTogetherRecord.value.inviteeRecordInfo.fartType === "")) {
        return "邀请屁友";
      }
      return "一起去放屁吧";
    };
    const getLeftRecordInfo = () => {
      if (!lastFartTogetherRecord.value)
        return null;
      const record = lastFartTogetherRecord.value;
      if (record.inviterSex === 1) {
        return record.inviterRecordInfo;
      }
      if (record.inviteeSex === 1) {
        return record.inviteeRecordInfo;
      }
      return null;
    };
    const getRightRecordInfo = () => {
      if (!lastFartTogetherRecord.value)
        return null;
      const record = lastFartTogetherRecord.value;
      if (record.inviterSex === 2) {
        return record.inviterRecordInfo;
      }
      if (record.inviteeSex === 2) {
        return record.inviteeRecordInfo;
      }
      return null;
    };
    const goToFartPage = () => {
      selectedFartType.value = "响亮型";
      selectedSmellLevel.value = "清香";
      selectedVolume.value = "大当量";
      selectedMood.value = "放松";
      gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`;
      fartPopup.value.open();
    };
    const handlePopupChange = (e) => {
      isPopupOpen.value = e.show;
    };
    const handleInvite = () => {
      var _a, _b;
      common_vendor.index.__f__("log", "at pages/index/fart.vue:1182", "邀请屁友按钮点击", (_a = userStore.userInfo) == null ? void 0 : _a.ID);
      if (!((_b = userStore.userInfo) == null ? void 0 : _b.ID)) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      goToFartPage();
    };
    common_vendor.onShareAppMessage(() => {
      var _a;
      if (!((_a = userStore.userInfo) == null ? void 0 : _a.ID)) {
        return {
          title: "邀请你一起放屁！",
          path: "/pages/index/fart"
        };
      }
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentPath = `/${currentPage.route}`;
      if (lastFartTogetherRecord.value && lastFartTogetherRecord.value.inviteeRecordInfo && (!lastFartTogetherRecord.value.inviteeRecordInfo.fartType || lastFartTogetherRecord.value.inviteeRecordInfo.fartType === "")) {
        const sharePath2 = `${currentPath}?togetherRecordId=${lastFartTogetherRecord.value.id || ""}`;
        return {
          title: "邀请你一起放屁！",
          path: sharePath2,
          imageUrl: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/share_bg.png"
        };
      }
      const sharePath = `${currentPath}`;
      return {
        title: "邀请你一起放屁！",
        path: sharePath,
        imageUrl: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/share_bg.png"
      };
    });
    const loadFartTogetherRecordById = async (recordId) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      try {
        const { data } = await src_api_fart.getFartTogetherRecordByIdAPI(recordId);
        common_vendor.index.__f__("log", "at pages/index/fart.vue:1259", "dsdssdss", data);
        if (data.code === 0 && data.data) {
          const record = data.data;
          const currentUserId = (_a = userStore.userInfo) == null ? void 0 : _a.ID;
          lastFartTogetherRecord.value = record;
          currentTogetherRecordId.value = recordId;
          if (record.inviterSex === 1) {
            nickname_left.value = ((_b = record.inviterInfo) == null ? void 0 : _b.nickname) || "";
            if (nickname_left.value) {
              leftAvatarImg.value = ((_c = record.inviterInfo) == null ? void 0 : _c.avatar) || meImg;
            } else {
              leftDefaultImg.value = meImg;
            }
            nickname_right.value = ((_d = record.inviteeInfo) == null ? void 0 : _d.nickname) || "";
            if (nickname_right.value) {
              rightAvatarImg.value = ((_e = record.inviteeInfo) == null ? void 0 : _e.avatar) || taImg;
            } else {
              rightDefaultImg.value = taImg;
            }
          } else if (record.inviterSex === 2) {
            nickname_right.value = ((_f = record.inviterInfo) == null ? void 0 : _f.nickname) || "";
            if (nickname_right.value) {
              rightAvatarImg.value = ((_g = record.inviterInfo) == null ? void 0 : _g.avatar) || taImg;
            } else {
              rightDefaultImg.value = taImg;
            }
            nickname_left.value = ((_h = record.inviteeInfo) == null ? void 0 : _h.nickname) || "";
            if (nickname_left.value) {
              leftAvatarImg.value = ((_i = record.inviteeInfo) == null ? void 0 : _i.avatar) || meImg;
            } else {
              leftDefaultImg.value = meImg;
            }
          }
          return true;
        } else {
          common_vendor.index.__f__("error", "at pages/index/fart.vue:1355", "获取一起放屁记录失败:", data.msg);
          return false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/fart.vue:1359", "获取一起放屁记录异常:", error);
        return false;
      }
    };
    const handleInviteParams = async (togetherRecordId) => {
      common_vendor.index.__f__("log", "at pages/index/fart.vue:1366", "收到邀请参数:", { togetherRecordId });
      isInviteShareMode.value = true;
      if (!togetherRecordId) {
        return;
      }
      const success = await loadFartTogetherRecordById(parseInt(togetherRecordId));
      if (!success) {
        return;
      }
    };
    common_vendor.onMounted(() => {
    });
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/index/fart.vue:1390", "页面加载参数:", options);
      if (options.togetherRecordId) {
        isInviteShareMode.value = true;
        const togetherRecordId = options.togetherRecordId;
        setTimeout(() => {
          handleInviteParams(togetherRecordId);
        }, 500);
        if (userStore.token) {
          common_vendor.index.__f__("log", "at pages/index/fart.vue:1402", "已有 token，直接加载用户信息");
          loadUserInfo().then(() => {
          });
        } else {
          common_vendor.index.__f__("log", "at pages/index/fart.vue:1407", "暂无 token，开始自动登录...");
          handleSmartLogin().then((loginSuccess) => {
            if (loginSuccess) {
              loadUserInfo().then(() => {
              });
            }
          });
        }
      } else {
        if (userStore.token) {
          common_vendor.index.__f__("log", "at pages/index/fart.vue:1419", "已有 token，直接加载用户信息");
          loadUserInfo().then(() => {
            if (!isInviteShareMode.value) {
              loadLastFartTogetherRecord();
            }
          });
        } else {
          common_vendor.index.__f__("log", "at pages/index/fart.vue:1427", "暂无 token，开始自动登录...");
          handleSmartLogin().then((loginSuccess) => {
            if (loginSuccess) {
              loadUserInfo().then(() => {
                if (!isInviteShareMode.value) {
                  loadLastFartTogetherRecord();
                }
              });
            }
          });
        }
      }
    });
    common_vendor.onShow(() => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.options) {
        const options = currentPage.options;
        if (options.togetherRecordId && !isInviteShareMode.value) {
          const togetherRecordId = options.togetherRecordId;
          handleInviteParams(togetherRecordId);
          return;
        }
      }
      if (((_a = userStore.userInfo) == null ? void 0 : _a.ID) && !isInviteShareMode.value) {
        loadLastFartTogetherRecord();
      }
    });
    common_vendor.onUnmounted(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: nickname_left.value === ""
      }, nickname_left.value === "" ? {
        b: leftDefaultImg.value
      } : {
        c: leftAvatarImg.value,
        d: common_vendor.t(nickname_left.value)
      }, {
        e: !isInviteShareMode.value
      }, !isInviteShareMode.value ? {
        f: common_vendor.o(switchIdentity)
      } : {}, {
        g: nickname_right.value === ""
      }, nickname_right.value === "" ? {
        h: rightDefaultImg.value
      } : {
        i: rightAvatarImg.value,
        j: common_vendor.t(nickname_right.value)
      }, {
        k: lastFartTogetherRecord.value
      }, lastFartTogetherRecord.value ? common_vendor.e({
        l: hasRecordData(getLeftRecordInfo())
      }, hasRecordData(getLeftRecordInfo()) ? {
        m: common_vendor.t(getVolumeNameByRecord(getLeftRecordInfo())),
        n: common_vendor.t(getFartTypeNameByRecord(getLeftRecordInfo())),
        o: common_vendor.t(getSmellLevelNameByRecord(getLeftRecordInfo())),
        p: common_vendor.t(getMoodNameByRecord(getLeftRecordInfo()))
      } : {}, {
        q: hasRecordData(getRightRecordInfo())
      }, hasRecordData(getRightRecordInfo()) ? {
        r: common_vendor.t(getVolumeNameByRecord(getRightRecordInfo())),
        s: common_vendor.t(getFartTypeNameByRecord(getRightRecordInfo())),
        t: common_vendor.t(getSmellLevelNameByRecord(getRightRecordInfo())),
        v: common_vendor.t(getMoodNameByRecord(getRightRecordInfo()))
      } : {}) : {}, {
        w: isPopupOpen.value
      }, isPopupOpen.value ? {
        x: common_vendor.t(isSubmitting.value ? "提交中..." : "确认放屁"),
        y: isSubmitting.value,
        z: common_vendor.o(($event) => isInviteShareMode.value ? updateTogetherFartRecord() : confirmFart())
      } : isInviteShareMode.value ? {
        B: common_vendor.t(isSubmitting.value ? "提交中..." : isCompleted.value ? "我们的空气，共同完成了今天的默契" : "和TA一起放个屁吧"),
        C: isSubmitting.value,
        D: common_vendor.o(($event) => isCompleted.value ? goToHomePage() : handleTogetherFart())
      } : common_vendor.e({
        E: avatar.value,
        F: common_vendor.t(nickname.value),
        G: lastFartTogetherRecord.value && lastFartTogetherRecord.value.inviteeRecordInfo && (!lastFartTogetherRecord.value.inviteeRecordInfo.fartType || lastFartTogetherRecord.value.inviteeRecordInfo.fartType === "")
      }, lastFartTogetherRecord.value && lastFartTogetherRecord.value.inviteeRecordInfo && (!lastFartTogetherRecord.value.inviteeRecordInfo.fartType || lastFartTogetherRecord.value.inviteeRecordInfo.fartType === "") ? {} : {
        H: common_vendor.t(getInviteButtonText()),
        I: common_vendor.o(handleInvite)
      }), {
        A: isInviteShareMode.value,
        J: gifUrl.value,
        K: common_vendor.f(fartTypes, (type, index, i0) => {
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
        L: common_vendor.f(smellLevels, (level, index, i0) => {
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
        M: common_vendor.f(volumeLevels, (volume, index, i0) => {
          return {
            a: common_vendor.n(volume.sizeClass),
            b: volume.icon,
            c: common_vendor.t(volume.label),
            d: index,
            e: common_vendor.n({
              "selected": selectedVolume.value === volume.value
            }),
            f: common_vendor.o(($event) => selectVolume(volume.value), index)
          };
        }),
        N: common_vendor.f(moods, (mood, index, i0) => {
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
        O: common_vendor.sr(fartPopup, "90342e36-0", {
          "k": "fartPopup"
        }),
        P: common_vendor.o(handlePopupChange),
        Q: common_vendor.p({
          type: "bottom",
          ["safe-area"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-90342e36"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/fart.js.map
