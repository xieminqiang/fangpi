"use strict";
const common_vendor = require("../../common/vendor.js");
const src_api_ai = require("../../src/api/ai.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const roleList = common_vendor.ref([]);
    const getRoleList = async () => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await src_api_ai.getAiChatRolesAPI();
        if (res.data.code === 0) {
          roleList.value = res.data.data || [];
        } else {
          common_vendor.index.showToast({
            title: res.msg || "获取角色列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/index.vue:65", "获取角色列表失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const selectRole = (role) => {
      common_vendor.index.navigateTo({
        url: `/pages/chat/chat?roleId=${role.id}&roleName=${role.name}&roleAvatar=${role.avatar}`
      });
    };
    common_vendor.onMounted(() => {
      getRoleList();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(roleList.value, (role, k0, i0) => {
          return {
            a: common_vendor.t(role.avatar),
            b: common_vendor.t(role.name),
            c: common_vendor.t(role.description),
            d: common_vendor.f(role.tags, (tag, index, i1) => {
              return {
                a: common_vendor.t(tag),
                b: index
              };
            }),
            e: role.id,
            f: common_vendor.o(($event) => selectRole(role), role.id)
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a559478"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/index.js.map
