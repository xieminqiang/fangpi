"use strict";
const common_vendor = require("../../../../common/vendor.js");
function getDeviceInfo() {
  if (common_vendor.index.getDeviceInfo || common_vendor.index.canIUse("getDeviceInfo")) {
    return common_vendor.index.getDeviceInfo();
  } else {
    return common_vendor.index.getSystemInfoSync();
  }
}
function getWindowInfo() {
  if (common_vendor.index.getWindowInfo || common_vendor.index.canIUse("getWindowInfo")) {
    return common_vendor.index.getWindowInfo();
  } else {
    return common_vendor.index.getSystemInfoSync();
  }
}
function getAppBaseInfo() {
  if (common_vendor.index.getAppBaseInfo || common_vendor.index.canIUse("getAppBaseInfo")) {
    return common_vendor.index.getAppBaseInfo();
  } else {
    return common_vendor.index.getSystemInfoSync();
  }
}
function compareVersion(v1, v2) {
  v1 = v1.split(".");
  v2 = v2.split(".");
  const len = Math.max(v1.length, v2.length);
  while (v1.length < len) {
    v1.push("0");
  }
  while (v2.length < len) {
    v2.push("0");
  }
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10);
    const num2 = parseInt(v2[i], 10);
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }
  return 0;
}
function gte(version) {
  const { platform } = getDeviceInfo();
  let { SDKVersion } = getAppBaseInfo();
  return platform !== "mac" && compareVersion(SDKVersion, version) >= 0;
}
function canIUseCanvas2d() {
  return gte("2.9.0");
}
function convertTouchesToArray(touches) {
  if (Array.isArray(touches)) {
    return touches;
  }
  if (typeof touches === "object" && touches !== null) {
    return Object.values(touches);
  }
  return touches;
}
function wrapTouch(event) {
  event.touches = convertTouchesToArray(event.touches);
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touch.offsetX = touch.x;
    touch.offsetY = touch.y;
  }
  return event;
}
const devicePixelRatio = getWindowInfo().pixelRatio;
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
function getRect(selector, context, node) {
  return new Promise((resolve, reject) => {
    const dom = common_vendor.index.createSelectorQuery().in(context).select(selector);
    const result = (rect) => {
      if (rect) {
        resolve(rect);
      } else {
        reject();
      }
    };
    if (!node) {
      dom.boundingClientRect(result).exec();
    } else {
      dom.fields({
        node: true,
        size: true,
        rect: true
      }, result).exec();
    }
  });
}
exports.canIUseCanvas2d = canIUseCanvas2d;
exports.convertTouchesToArray = convertTouchesToArray;
exports.devicePixelRatio = devicePixelRatio;
exports.getDeviceInfo = getDeviceInfo;
exports.getRect = getRect;
exports.sleep = sleep;
exports.wrapTouch = wrapTouch;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/lime-echart/components/l-echart/utils.js.map
