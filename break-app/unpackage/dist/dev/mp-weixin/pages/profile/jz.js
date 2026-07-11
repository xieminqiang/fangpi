"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "jz",
  setup(__props) {
    const handleBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const previewQRCode = () => {
      const largeImageUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG";
      common_vendor.index.previewImage({
        urls: [largeImageUrl],
        current: largeImageUrl
      });
    };
    const shareToFriend = () => {
      const imageUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG";
      common_vendor.index.showLoading({
        title: "准备分享...",
        mask: true
      });
      common_vendor.index.downloadFile({
        url: imageUrl,
        success: (downloadRes) => {
          common_vendor.index.hideLoading();
          if (downloadRes.statusCode === 200) {
            common_vendor.index.previewImage({
              urls: [downloadRes.tempFilePath],
              current: downloadRes.tempFilePath,
              success: () => {
                setTimeout(() => {
                  common_vendor.index.showToast({
                    title: "长按图片可分享",
                    icon: "none",
                    duration: 2e3
                  });
                }, 500);
              }
            });
          } else {
            common_vendor.index.showToast({
              title: "准备失败",
              icon: "none",
              duration: 2e3
            });
          }
        },
        fail: () => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "准备失败",
            icon: "none",
            duration: 2e3
          });
        }
      });
    };
    const downloadQRCode = () => {
      const imageUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG";
      common_vendor.index.showLoading({
        title: "正在下载...",
        mask: true
      });
      common_vendor.index.getSetting({
        success: (res) => {
          if (res.authSetting["scope.writePhotosAlbum"] === false) {
            common_vendor.index.showModal({
              title: "需要授权",
              content: "需要您授权保存图片到相册",
              confirmText: "去设置",
              success: (modalRes) => {
                if (modalRes.confirm) {
                  common_vendor.index.openSetting();
                }
              }
            });
            common_vendor.index.hideLoading();
            return;
          }
          common_vendor.index.downloadFile({
            url: imageUrl,
            success: (downloadRes) => {
              if (downloadRes.statusCode === 200) {
                common_vendor.index.saveImageToPhotosAlbum({
                  filePath: downloadRes.tempFilePath,
                  success: () => {
                    common_vendor.index.hideLoading();
                    common_vendor.index.showToast({
                      title: "保存成功",
                      icon: "success",
                      duration: 2e3
                    });
                  },
                  fail: (err) => {
                    common_vendor.index.hideLoading();
                    if (err.errMsg.includes("auth deny")) {
                      common_vendor.index.showModal({
                        title: "需要授权",
                        content: "需要您授权保存图片到相册",
                        confirmText: "去设置",
                        success: (modalRes) => {
                          if (modalRes.confirm) {
                            common_vendor.index.openSetting();
                          }
                        }
                      });
                    } else {
                      common_vendor.index.showToast({
                        title: "保存失败",
                        icon: "none",
                        duration: 2e3
                      });
                    }
                  }
                });
              } else {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "下载失败",
                  icon: "none",
                  duration: 2e3
                });
              }
            },
            fail: () => {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "下载失败",
                icon: "none",
                duration: 2e3
              });
            }
          });
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleBack),
        b: common_vendor.o(downloadQRCode),
        c: common_vendor.o(shareToFriend),
        d: common_vendor.o(previewQRCode)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-781707eb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/jz.js.map
