"use strict";
const common_vendor = require("../../common/vendor.js");
const src_stores_user = require("../../src/stores/user.js");
const src_api_ai = require("../../src/api/ai.js");
const _sfc_main = {
  __name: "chat",
  setup(__props) {
    const roleId = common_vendor.ref("");
    const roleName = common_vendor.ref("");
    const roleAvatar = common_vendor.ref("");
    const userStore = src_stores_user.useUserStore();
    const messages = common_vendor.ref([]);
    const inputMessage = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    const loadingText = common_vendor.ref("思考中...");
    const scrollIntoView = common_vendor.ref("");
    const ws = common_vendor.ref(null);
    const currentAiMessage = common_vendor.ref(null);
    const isConnected = common_vendor.ref(false);
    const canSend = common_vendor.computed(() => {
      return inputMessage.value.trim().length > 0 && !isLoading.value && ws.value && isConnected.value;
    });
    const initWebSocket = () => {
      try {
        const token = userStore.token || common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        const wsUrl = src_api_ai.getAiChatWebSocketUrl(roleId.value, token);
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:123", "连接WebSocket:", wsUrl);
        ws.value = common_vendor.index.connectSocket({
          url: wsUrl,
          success: () => {
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:129", "WebSocket连接请求发送成功");
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/chat/chat.vue:132", "WebSocket连接请求失败:", error);
            common_vendor.index.showToast({
              title: "连接失败",
              icon: "none"
            });
          }
        });
        if (ws.value) {
          ws.value.onOpen((res) => {
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:144", "WebSocket连接成功");
            isConnected.value = true;
            common_vendor.index.showToast({
              title: "连接成功",
              icon: "success",
              duration: 1e3
            });
          });
          ws.value.onMessage((res) => {
            try {
              common_vendor.index.__f__("log", "at pages/chat/chat.vue:156", "收到原始消息:", res.data);
              const response = JSON.parse(res.data);
              handleStreamResponse(response);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/chat/chat.vue:160", "解析消息失败:", error, res.data);
            }
          });
          ws.value.onError((error) => {
            common_vendor.index.__f__("error", "at pages/chat/chat.vue:166", "WebSocket错误:", error);
            isConnected.value = false;
            isLoading.value = false;
            common_vendor.index.showToast({
              title: "连接失败，请重试",
              icon: "none"
            });
          });
          ws.value.onClose(() => {
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:177", "WebSocket连接关闭");
            isConnected.value = false;
            isLoading.value = false;
          });
        } else {
          common_vendor.index.__f__("error", "at pages/chat/chat.vue:182", "WebSocket创建失败，socketTask为null");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:186", "创建WebSocket失败:", error);
        common_vendor.index.showToast({
          title: "连接失败",
          icon: "none"
        });
      }
    };
    const handleStreamResponse = (response) => {
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:196", "收到消息:", response);
      switch (response.type) {
        case "thinking":
          if (!currentAiMessage.value) {
            currentAiMessage.value = {
              role: "assistant",
              content: "",
              thinking: ""
            };
            messages.value.push(currentAiMessage.value);
          }
          currentAiMessage.value.thinking += response.content;
          loadingText.value = "思考中...";
          scrollToBottom();
          break;
        case "content":
          if (!currentAiMessage.value) {
            currentAiMessage.value = {
              role: "assistant",
              content: "",
              thinking: ""
            };
            messages.value.push(currentAiMessage.value);
          }
          currentAiMessage.value.content += response.content;
          loadingText.value = "回复中...";
          scrollToBottom();
          break;
        case "done":
          isLoading.value = false;
          currentAiMessage.value = null;
          loadingText.value = "思考中...";
          scrollToBottom();
          break;
        case "error":
          isLoading.value = false;
          currentAiMessage.value = null;
          common_vendor.index.showToast({
            title: response.content || "发送失败",
            icon: "none"
          });
          break;
      }
    };
    const sendMessage = () => {
      if (!canSend.value) {
        return;
      }
      const message = inputMessage.value.trim();
      if (!message) {
        return;
      }
      messages.value.push({
        role: "user",
        content: message
      });
      inputMessage.value = "";
      isLoading.value = true;
      currentAiMessage.value = null;
      try {
        if (!ws.value) {
          throw new Error("WebSocket 未连接");
        }
        const data = {
          message,
          roleType: roleId.value
        };
        ws.value.send({
          data: JSON.stringify(data),
          success: () => {
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:288", "消息发送成功");
            scrollToBottom();
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/chat/chat.vue:292", "发送消息失败:", error);
            isLoading.value = false;
            common_vendor.index.showToast({
              title: "发送失败，请重试",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:301", "发送消息失败:", error);
        isLoading.value = false;
        common_vendor.index.showToast({
          title: "发送失败，请重试",
          icon: "none"
        });
      }
    };
    const clearHistory = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清空聊天记录吗？",
        success: async (res) => {
          var _a;
          if (res.confirm) {
            messages.value = [];
            try {
              const result = await src_api_ai.clearAiChatHistoryAPI(roleId.value);
              if (result.data && result.data.code === 0) {
                common_vendor.index.showToast({
                  title: "已清空",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: ((_a = result.data) == null ? void 0 : _a.msg) || "清空失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/chat/chat.vue:333", "清空历史失败:", error);
              common_vendor.index.showToast({
                title: "清空失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const scrollToBottom = () => {
      common_vendor.nextTick$1(() => {
        if (messages.value.length > 0) {
          scrollIntoView.value = "msg-" + (messages.value.length - 1);
        }
      });
    };
    const onInputFocus = () => {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || currentPage.$route.query;
      roleId.value = options.roleId || "ppjl";
      roleName.value = decodeURIComponent(options.roleName || "屁屁精灵");
      roleAvatar.value = decodeURIComponent(options.roleAvatar || "💨");
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:376", "角色信息:", { roleId: roleId.value, roleName: roleName.value, roleAvatar: roleAvatar.value });
      initWebSocket();
    });
    common_vendor.onUnmounted(() => {
      if (ws.value) {
        ws.value.close({
          success: () => {
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:388", "WebSocket已关闭");
          }
        });
        ws.value = null;
        isConnected.value = false;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.t(roleAvatar.value),
        c: common_vendor.t(roleName.value),
        d: common_vendor.o(clearHistory),
        e: common_vendor.f(messages.value, (msg, index, i0) => {
          return common_vendor.e({
            a: msg.role === "assistant"
          }, msg.role === "assistant" ? common_vendor.e({
            b: common_vendor.t(roleAvatar.value),
            c: msg.thinking
          }, msg.thinking ? {
            d: common_vendor.t(msg.thinking)
          } : {}, {
            e: common_vendor.t(msg.content)
          }) : {
            f: common_vendor.t(msg.content)
          }, {
            g: index,
            h: "msg-" + index,
            i: common_vendor.n(msg.role === "user" ? "user-message" : "ai-message")
          });
        }),
        f: isLoading.value
      }, isLoading.value ? {
        g: common_vendor.t(loadingText.value)
      } : {}, {
        h: scrollIntoView.value,
        i: "和" + roleName.value + "聊聊吧...",
        j: common_vendor.o(onInputFocus),
        k: inputMessage.value,
        l: common_vendor.o(($event) => inputMessage.value = $event.detail.value),
        m: common_vendor.t(canSend.value ? "发送" : "..."),
        n: !canSend.value ? 1 : "",
        o: common_vendor.o(sendMessage)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0a633310"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/chat.js.map
