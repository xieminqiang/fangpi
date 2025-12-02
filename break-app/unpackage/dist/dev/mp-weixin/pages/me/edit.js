"use strict";
const common_vendor = require("../../common/vendor.js");
const src_api_user = require("../../src/api/user.js");
const src_api_upload = require("../../src/api/upload.js");
const src_stores_user = require("../../src/stores/user.js");
const defaultAvatar = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png";
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const userStore = src_stores_user.useUserStore();
    const avatarUrl = common_vendor.ref("");
    const nickname = common_vendor.ref("");
    const isSubmitting = common_vendor.ref(false);
    const originalNickname = common_vendor.ref("");
    const originalAvatar = common_vendor.ref("");
    const canSave = common_vendor.computed(() => {
      const nicknameChanged = nickname.value.trim() !== originalNickname.value;
      const avatarChanged = avatarUrl.value !== originalAvatar.value;
      return (nicknameChanged || avatarChanged) && nickname.value.trim().length > 0;
    });
    const loadUserInfo = async () => {
      try {
        const { data } = await src_api_user.getUserInfoAPI();
        if (data.code === 0) {
          const userInfo = data.data;
          nickname.value = userInfo.nickname || "";
          avatarUrl.value = userInfo.avatar || defaultAvatar;
          originalNickname.value = userInfo.nickname || "";
          originalAvatar.value = userInfo.avatar || defaultAvatar;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/edit.vue:101", "获取用户信息失败:", error);
        common_vendor.index.showToast({
          title: "获取用户信息失败",
          icon: "none"
        });
      }
    };
    const chooseAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          await uploadAvatar(tempFilePath);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/me/edit.vue:120", "选择图片失败:", err);
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    };
    const uploadAvatar = async (filePath) => {
      common_vendor.index.showLoading({
        title: "上传中...",
        mask: true
      });
      try {
        const result = await src_api_upload.uploadImageAPI(filePath);
        if (result.code === 0) {
          avatarUrl.value = result.data.url;
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.msg || "上传失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/edit.vue:152", "上传头像失败:", error);
        common_vendor.index.showToast({
          title: "上传失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const onNicknameInput = (e) => {
      nickname.value = e.detail.value;
    };
    const handleSave = async () => {
      if (isSubmitting.value || !canSave.value) {
        return;
      }
      const trimmedNickname = nickname.value.trim();
      if (!trimmedNickname) {
        common_vendor.index.showToast({
          title: "请输入昵称",
          icon: "none"
        });
        return;
      }
      if (trimmedNickname.length > 10) {
        common_vendor.index.showToast({
          title: "昵称不能超过10个字符",
          icon: "none"
        });
        return;
      }
      isSubmitting.value = true;
      try {
        const { data } = await src_api_user.updateUserInfoAPI({
          nickname: trimmedNickname,
          avatar: avatarUrl.value
        });
        if (data.code === 0) {
          await loadUserInfo();
          userStore.setUserInfo({
            ...userStore.userInfo,
            nickname: trimmedNickname,
            avatar: avatarUrl.value
          });
          common_vendor.index.$emit("userInfoUpdated");
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: data.msg || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/edit.vue:226", "保存用户信息失败:", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    common_vendor.onMounted(() => {
      loadUserInfo();
    });
    common_vendor.onShow(() => {
      loadUserInfo();
    });
    return (_ctx, _cache) => {
      return {
        a: avatarUrl.value || defaultAvatar,
        b: common_vendor.o(chooseAvatar),
        c: common_vendor.o([($event) => nickname.value = $event.detail.value, onNicknameInput]),
        d: nickname.value,
        e: common_vendor.t(nickname.value.length),
        f: common_vendor.t(isSubmitting.value ? "保存中..." : "保存"),
        g: isSubmitting.value || !canSave.value ? 1 : "",
        h: isSubmitting.value || !canSave.value,
        i: common_vendor.o(handleSave)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f2be5884"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/me/edit.js.map
