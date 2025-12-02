"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uviewPlus_libs_function_test = require("./test.js");
const uni_modules_uviewPlus_libs_config_config = require("../config/config.js");
function range(min = 0, max = 0, value = 0) {
  return Math.max(min, Math.min(max, Number(value)));
}
function sleep(value = 30) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, value);
  });
}
function getWindowInfo() {
  let ret = {};
  ret = common_vendor.index.getWindowInfo();
  return ret;
}
function $parent(name = void 0) {
  let parent = this.$parent;
  while (parent) {
    name = name.replace(/up-([a-zA-Z0-9-_]+)/g, "u-$1");
    if (parent.$options && parent.$options.name !== name) {
      parent = parent.$parent;
    } else {
      return parent;
    }
  }
  return false;
}
function addStyle(customStyle, target = "object") {
  if (uni_modules_uviewPlus_libs_function_test.empty(customStyle) || typeof customStyle === "object" && target === "object" || target === "string" && typeof customStyle === "string") {
    return customStyle;
  }
  if (target === "object") {
    customStyle = trim(customStyle);
    const styleArray = customStyle.split(";");
    const style = {};
    for (let i = 0; i < styleArray.length; i++) {
      if (styleArray[i]) {
        const item = styleArray[i].split(":");
        style[trim(item[0])] = trim(item[1]);
      }
    }
    return style;
  }
  let string = "";
  if (typeof customStyle === "object") {
    customStyle.forEach((val, i) => {
      const key = i.replace(/([A-Z])/g, "-$1").toLowerCase();
      string += `${key}:${val};`;
    });
  }
  return trim(string);
}
function addUnit(value = "auto", unit = "") {
  if (!unit) {
    unit = uni_modules_uviewPlus_libs_config_config.config.unit || "px";
  }
  if (unit == "rpx" && uni_modules_uviewPlus_libs_function_test.number(String(value))) {
    value = value * 2;
  }
  value = String(value);
  return uni_modules_uviewPlus_libs_function_test.number(value) ? `${value}${unit}` : value;
}
function deepClone(obj) {
  if ([null, void 0, NaN, false].includes(obj))
    return obj;
  if (typeof obj !== "object" && typeof obj !== "function") {
    return obj;
  }
  const o = uni_modules_uviewPlus_libs_function_test.array(obj) ? [] : {};
  for (const i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i];
    }
  }
  return o;
}
function deepMerge(targetOrigin = {}, source = {}) {
  let target = deepClone(targetOrigin);
  if (typeof target !== "object" || typeof source !== "object")
    return false;
  for (const prop in source) {
    if (!source.hasOwnProperty(prop))
      continue;
    if (prop in target) {
      if (source[prop] == null) {
        target[prop] = source[prop];
      } else if (typeof target[prop] !== "object") {
        target[prop] = source[prop];
      } else if (typeof source[prop] !== "object") {
        target[prop] = source[prop];
      } else if (target[prop].concat && source[prop].concat) {
        target[prop] = target[prop].concat(source[prop]);
      } else {
        target[prop] = deepMerge(target[prop], source[prop]);
      }
    } else {
      target[prop] = source[prop];
    }
  }
  return target;
}
function shallowMerge(target, source = {}) {
  if (typeof target !== "object" || typeof source !== "object")
    return false;
  for (const prop in source) {
    if (!source.hasOwnProperty(prop))
      continue;
    if (prop in target) {
      if (source[prop] == null) {
        target[prop] = source[prop];
      } else if (typeof target[prop] !== "object") {
        target[prop] = source[prop];
      } else if (typeof source[prop] !== "object") {
        target[prop] = source[prop];
      } else if (target[prop].concat && source[prop].concat) {
        target[prop] = target[prop].concat(source[prop]);
      } else {
        target[prop] = shallowMerge(target[prop], source[prop]);
      }
    } else {
      target[prop] = source[prop];
    }
  }
  return target;
}
function error(err) {
  {
    common_vendor.index.__f__("error", "at uni_modules/uview-plus/libs/function/index.js:318", `uView提示：${err}`);
  }
}
if (!String.prototype.padStart) {
  String.prototype.padStart = function(maxLength, fillString = " ") {
    if (Object.prototype.toString.call(fillString) !== "[object String]") {
      throw new TypeError(
        "fillString must be String"
      );
    }
    const str = this;
    if (str.length >= maxLength)
      return String(str);
    const fillLength = maxLength - str.length;
    let times = Math.ceil(fillLength / fillString.length);
    while (times >>= 1) {
      fillString += fillString;
      if (times === 1) {
        fillString += fillString;
      }
    }
    return fillString.slice(0, fillLength) + str;
  };
}
function trim(str, pos = "both") {
  str = String(str);
  if (pos == "both") {
    return str.replace(/^\s+|\s+$/g, "");
  }
  if (pos == "left") {
    return str.replace(/^\s*/, "");
  }
  if (pos == "right") {
    return str.replace(/(\s*$)/g, "");
  }
  if (pos == "all") {
    return str.replace(/\s+/g, "");
  }
  return str;
}
function queryParams(data = {}, isPrefix = true, arrayFormat = "brackets") {
  const prefix = isPrefix ? "?" : "";
  const _result = [];
  if (["indices", "brackets", "repeat", "comma"].indexOf(arrayFormat) == -1)
    arrayFormat = "brackets";
  for (const key in data) {
    const value = data[key];
    if (["", void 0, null].indexOf(value) >= 0) {
      continue;
    }
    if (value.constructor === Array) {
      switch (arrayFormat) {
        case "indices":
          for (let i = 0; i < value.length; i++) {
            _result.push(`${key}[${i}]=${value[i]}`);
          }
          break;
        case "brackets":
          value.forEach((_value) => {
            _result.push(`${key}[]=${_value}`);
          });
          break;
        case "repeat":
          value.forEach((_value) => {
            _result.push(`${key}=${_value}`);
          });
          break;
        case "comma":
          let commaStr = "";
          value.forEach((_value) => {
            commaStr += (commaStr ? "," : "") + _value;
          });
          _result.push(`${key}=${commaStr}`);
          break;
        default:
          value.forEach((_value) => {
            _result.push(`${key}[]=${_value}`);
          });
      }
    } else {
      _result.push(`${key}=${value}`);
    }
  }
  return _result.length ? prefix + _result.join("&") : "";
}
function padZero(value) {
  return `00${value}`.slice(-2);
}
function page() {
  const pages2 = getCurrentPages();
  return `/${pages2[pages2.length - 1].route || ""}`;
}
exports.$parent = $parent;
exports.addStyle = addStyle;
exports.addUnit = addUnit;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.error = error;
exports.getWindowInfo = getWindowInfo;
exports.padZero = padZero;
exports.page = page;
exports.queryParams = queryParams;
exports.range = range;
exports.shallowMerge = shallowMerge;
exports.sleep = sleep;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uview-plus/libs/function/index.js.map
