"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const src_api_audio = require("../../src/api/audio.js");
const src_api_user = require("../../src/api/user.js");
const src_stores_user = require("../../src/stores/user.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "creat",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    const points = common_vendor.computed(() => userStore.points || 0);
    const pointsInsufficientPopup = common_vendor.ref(null);
    const currentPointsForPopup = common_vendor.ref(0);
    const isRecording = common_vendor.ref(false);
    const recordFilePath = common_vendor.ref("");
    const recordDuration = common_vendor.ref(0);
    const recordTimer = common_vendor.ref(null);
    const recorderManager = common_vendor.ref(null);
    const isPlaying = common_vendor.ref(false);
    const audioContext = common_vendor.ref(null);
    const isUploading = common_vendor.ref(false);
    let videoAdForPoints = null;
    const initRecorder = () => {
      recorderManager.value = common_vendor.index.getRecorderManager();
      recorderManager.value.onStart(() => {
        common_vendor.index.__f__("log", "at pages/entry/creat.vue:202", "录音开始");
        isRecording.value = true;
        recordDuration.value = 0;
        startTimer();
      });
      recorderManager.value.onStop((res) => {
        common_vendor.index.__f__("log", "at pages/entry/creat.vue:209", "录音停止", res);
        isRecording.value = false;
        stopTimer();
        recordFilePath.value = res.tempFilePath;
        recordDuration.value = Math.floor(res.duration / 1e3);
      });
      recorderManager.value.onError((err) => {
        common_vendor.index.__f__("error", "at pages/entry/creat.vue:217", "录音错误", err);
        isRecording.value = false;
        stopTimer();
        common_vendor.index.showToast({
          title: "录音失败，请重试",
          icon: "none"
        });
      });
    };
    const startRecord = () => {
      var _a;
      const currentPoints = points.value;
      if (currentPoints < 5) {
        currentPointsForPopup.value = currentPoints;
        (_a = pointsInsufficientPopup.value) == null ? void 0 : _a.open();
        return;
      }
      if (!recorderManager.value) {
        initRecorder();
      }
      common_vendor.index.authorize({
        scope: "scope.record",
        success: () => {
          recorderManager.value.start({
            duration: 6e4,
            // 最长60秒
            sampleRate: 44100,
            numberOfChannels: 1,
            encodeBitRate: 192e3,
            format: "mp3"
          });
        },
        fail: () => {
          common_vendor.index.showModal({
            title: "需要录音权限",
            content: "请在设置中开启录音权限",
            showCancel: true,
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.openSetting();
              }
            }
          });
        }
      });
    };
    const stopRecord = () => {
      if (recorderManager.value) {
        recorderManager.value.stop();
      }
    };
    const startTimer = () => {
      recordTimer.value = setInterval(() => {
        recordDuration.value++;
      }, 1e3);
    };
    const stopTimer = () => {
      if (recordTimer.value) {
        clearInterval(recordTimer.value);
        recordTimer.value = null;
      }
    };
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    const togglePlay = () => {
      if (!recordFilePath.value)
        return;
      if (isPlaying.value) {
        if (audioContext.value) {
          audioContext.value.pause();
          isPlaying.value = false;
        }
      } else {
        if (audioContext.value) {
          audioContext.value.play();
          isPlaying.value = true;
        } else {
          audioContext.value = common_vendor.index.createInnerAudioContext();
          audioContext.value.src = recordFilePath.value;
          audioContext.value.onPlay(() => {
            isPlaying.value = true;
          });
          audioContext.value.onEnded(() => {
            isPlaying.value = false;
          });
          audioContext.value.onError((err) => {
            common_vendor.index.__f__("error", "at pages/entry/creat.vue:322", "播放失败", err);
            isPlaying.value = false;
            common_vendor.index.showToast({
              title: "播放失败",
              icon: "none"
            });
          });
          audioContext.value.play();
        }
      }
    };
    const resetRecord = () => {
      common_vendor.index.showModal({
        title: "确认重新录音",
        content: "重新录音将删除当前录音，是否继续？",
        success: (res) => {
          if (res.confirm) {
            if (audioContext.value) {
              audioContext.value.stop();
              audioContext.value.destroy();
              audioContext.value = null;
            }
            isPlaying.value = false;
            recordFilePath.value = "";
            recordDuration.value = 0;
          }
        }
      });
    };
    const uploadAndCreate = async () => {
      var _a;
      if (!recordFilePath.value) {
        common_vendor.index.showToast({
          title: "请先录音",
          icon: "none"
        });
        return;
      }
      if (!((_a = userStore.userInfo) == null ? void 0 : _a.ID)) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      try {
        isUploading.value = true;
        common_vendor.index.showLoading({
          title: "上传中..."
        });
        const uploadRes = await src_api_audio.uploadAudioAPI(recordFilePath.value);
        if (uploadRes.data.code !== 0) {
          throw new Error(uploadRes.data.msg || "上传失败");
        }
        const audioUrl = uploadRes.data.data.url;
        const createRes = await src_api_audio.createMyAudioAPI({
          url: audioUrl,
          class_name: "自己放的屁",
          name: "我的专属放屁音效"
        });
        common_vendor.index.hideLoading();
        if (createRes.data.code === 0) {
          try {
            const { data: pointsData } = await src_api_user.updateUserPointsAPI({
              points: 5,
              pointsType: 2,
              // 2代表扣除屁币
              remark: "创建专属放屁音效"
            });
            if (pointsData.code === 0) {
              userStore.setUserInfo(pointsData.data);
              common_vendor.index.__f__("log", "at pages/entry/creat.vue:413", "屁币扣除成功，当前屁币:", pointsData.data.points);
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/entry/creat.vue:416", "扣除屁币失败:", error);
          }
          common_vendor.index.showToast({
            title: "创建成功 ✅",
            icon: "none",
            duration: 2e3
          });
          common_vendor.index.$emit("audioLibraryUpdated");
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 2e3);
        } else {
          throw new Error(createRes.data.msg || "创建失败");
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/entry/creat.vue:438", "上传失败:", error);
        common_vendor.index.showToast({
          title: error.message || "上传失败，请重试",
          icon: "none",
          duration: 2e3
        });
      } finally {
        isUploading.value = false;
      }
    };
    const loadUserInfo = async () => {
      try {
        const { data } = await src_api_user.getUserInfoAPI();
        if (data.code === 0) {
          userStore.setUserInfo(data.data);
          common_vendor.index.__f__("log", "at pages/entry/creat.vue:457", "用户信息已更新:", data.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/entry/creat.vue:460", "获取用户信息失败:", error);
      }
    };
    const closePointsInsufficientPopup = () => {
      var _a;
      (_a = pointsInsufficientPopup.value) == null ? void 0 : _a.close();
    };
    const goToPointsFromPopup = () => {
      watchAdForPoints();
    };
    const initRewardedVideoAdForPoints = () => {
      if (common_vendor.wx$1.createRewardedVideoAd) {
        videoAdForPoints = common_vendor.wx$1.createRewardedVideoAd({
          adUnitId: "adunit-2ec9fad091c1156c"
        });
        videoAdForPoints.onLoad(() => {
          common_vendor.index.__f__("log", "at pages/entry/creat.vue:483", "赚取屁币激励视频广告加载成功");
        });
        videoAdForPoints.onError((err) => {
          common_vendor.index.__f__("error", "at pages/entry/creat.vue:487", "赚取屁币激励视频广告加载失败", err);
          if (err.errCode === 1004) {
            common_vendor.index.showToast({
              title: "暂时没有可用的视频，请稍后再试",
              icon: "none"
            });
          }
        });
        videoAdForPoints.onClose(async (res) => {
          if (res && res.isEnded) {
            common_vendor.index.__f__("log", "at pages/entry/creat.vue:500", "用户看完了赚取屁币激励视频广告");
            await updatePointsForPopup(30, "观看激励视频广告奖励");
            closePointsInsufficientPopup();
          } else {
            common_vendor.index.__f__("log", "at pages/entry/creat.vue:506", "用户提前关闭了赚取屁币激励视频广告");
            common_vendor.index.showToast({
              title: "需要看完视频才能获得屁币哦~",
              icon: "none",
              duration: 2e3
            });
          }
        });
      }
    };
    const watchAdForPoints = () => {
      if (!videoAdForPoints) {
        common_vendor.index.showToast({
          title: "视频未准备好，请稍后再试",
          icon: "none"
        });
        return;
      }
      videoAdForPoints.show().catch((err) => {
        common_vendor.index.__f__("error", "at pages/entry/creat.vue:532", "广告显示失败，尝试重新加载", err);
        videoAdForPoints.load().then(() => {
          return videoAdForPoints.show();
        }).catch((loadErr) => {
          common_vendor.index.__f__("error", "at pages/entry/creat.vue:541", "广告加载或显示失败", loadErr);
          if (loadErr.errCode === 1004) {
            common_vendor.index.showToast({
              title: "暂时没有可用的视频，请稍后再试",
              icon: "none"
            });
          } else {
            common_vendor.index.showToast({
              title: "视频加载失败，请稍后再试",
              icon: "none"
            });
          }
        });
      });
    };
    const updatePointsForPopup = async (points2, remark) => {
      try {
        const { data } = await src_api_user.updateUserPointsAPI({
          points: points2,
          pointsType: 1,
          // 1代表增加屁币
          remark
        });
        if (data.code === 0) {
          common_vendor.index.__f__("log", "at pages/entry/creat.vue:576", "屁币更新成功，当前屁币:", data.data.points);
          userStore.setUserInfo(data.data);
          common_vendor.index.showToast({
            title: `🎉 获得${points2}屁币！当前屁币：${data.data.points}`,
            icon: "none",
            duration: 2500
          });
        } else {
          common_vendor.index.__f__("error", "at pages/entry/creat.vue:587", "屁币更新失败:", data.msg);
          common_vendor.index.showToast({
            title: data.msg || "屁币更新失败，请稍后重试",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/entry/creat.vue:594", "更新屁币失败:", error);
        common_vendor.index.showToast({
          title: "屁币更新失败，请稍后重试",
          icon: "none"
        });
      }
    };
    common_vendor.onMounted(() => {
      initRewardedVideoAdForPoints();
    });
    common_vendor.onShow(() => {
      loadUserInfo();
    });
    common_vendor.onUnmounted(() => {
      if (recorderManager.value && isRecording.value) {
        recorderManager.value.stop();
      }
      if (audioContext.value) {
        audioContext.value.stop();
        audioContext.value.destroy();
        audioContext.value = null;
      }
      stopTimer();
      if (videoAdForPoints) {
        videoAdForPoints.destroy();
        videoAdForPoints = null;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isRecording.value && !recordFilePath.value
      }, !isRecording.value && !recordFilePath.value ? {
        b: common_assets._imports_1$2
      } : {}, {
        c: isRecording.value
      }, isRecording.value ? {
        d: common_vendor.t(formatTime(recordDuration.value))
      } : {}, {
        e: !isRecording.value && recordFilePath.value
      }, !isRecording.value && recordFilePath.value ? {
        f: common_assets._imports_1$2,
        g: common_vendor.t(formatTime(recordDuration.value))
      } : {}, {
        h: !recordFilePath.value
      }, !recordFilePath.value ? common_vendor.e({
        i: !isRecording.value
      }, !isRecording.value ? {
        j: common_assets._imports_1$3,
        k: common_vendor.o(startRecord),
        l: isUploading.value
      } : {
        m: common_vendor.o(stopRecord)
      }) : {
        n: common_vendor.t(isPlaying.value ? "暂停" : "播放"),
        o: common_vendor.o(togglePlay),
        p: isUploading.value,
        q: common_vendor.o(resetRecord),
        r: isUploading.value
      }, {
        s: common_vendor.t(isUploading.value ? "上传中..." : "上传并保存"),
        t: common_vendor.o(uploadAndCreate),
        v: !recordFilePath.value || isUploading.value,
        w: common_assets._imports_0$4,
        x: common_vendor.t(currentPointsForPopup.value),
        y: common_vendor.t(5 - currentPointsForPopup.value),
        z: common_vendor.o(closePointsInsufficientPopup),
        A: common_vendor.o(goToPointsFromPopup),
        B: common_vendor.sr(pointsInsufficientPopup, "109a309d-0", {
          "k": "pointsInsufficientPopup"
        }),
        C: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-109a309d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/entry/creat.js.map
