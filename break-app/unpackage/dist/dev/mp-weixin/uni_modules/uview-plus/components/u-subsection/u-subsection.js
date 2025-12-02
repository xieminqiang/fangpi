"use strict";
const uni_modules_uviewPlus_components_uSubsection_props = require("./props.js");
const uni_modules_uviewPlus_libs_mixin_mpMixin = require("../../libs/mixin/mpMixin.js");
const uni_modules_uviewPlus_libs_mixin_mixin = require("../../libs/mixin/mixin.js");
const uni_modules_uviewPlus_libs_function_index = require("../../libs/function/index.js");
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-subsection",
  mixins: [uni_modules_uviewPlus_libs_mixin_mpMixin.mpMixin, uni_modules_uviewPlus_libs_mixin_mixin.mixin, uni_modules_uviewPlus_components_uSubsection_props.props],
  data() {
    return {
      // 组件尺寸
      itemRect: {
        width: 0,
        height: 0
      },
      innerCurrent: "",
      windowResizeCallback: {}
    };
  },
  watch: {
    list(newValue, oldValue) {
      this.init();
    },
    current: {
      immediate: true,
      handler(n) {
        if (n !== this.innerCurrent) {
          this.innerCurrent = Number(n);
        }
      }
    }
  },
  computed: {
    wrapperStyle() {
      const style = {};
      if (this.mode === "button") {
        style.backgroundColor = this.bgColor;
      }
      return style;
    },
    // 滑块的样式
    barStyle() {
      const style = {};
      style.width = `${this.itemRect.width}px`;
      style.height = `${this.itemRect.height}px`;
      style.transform = `translateX(${this.innerCurrent * this.itemRect.width}px)`;
      if (this.mode === "subsection") {
        style.backgroundColor = this.activeColor;
      }
      return style;
    },
    // 分段器item的样式
    itemStyle(index) {
      return (index2) => {
        const style = {};
        if (this.mode === "subsection") {
          style.borderColor = this.activeColor;
          style.borderWidth = "1px";
          style.borderStyle = "solid";
        }
        return style;
      };
    },
    // 分段器文字颜色
    textStyle(index, item) {
      return (index2, item2) => {
        const style = {};
        style.fontWeight = this.bold && this.innerCurrent === index2 ? "bold" : "normal";
        style.fontSize = uni_modules_uviewPlus_libs_function_index.addUnit(this.fontSize);
        let activeColorTemp = null;
        let inactiveColorTemp = null;
        if (typeof item2 === "object" && item2[this.activeColorKeyName]) {
          activeColorTemp = item2[this.activeColorKeyName];
        }
        if (typeof item2 === "object" && item2[this.inactiveColorKeyName]) {
          inactiveColorTemp = item2[this.inactiveColorKeyName];
        }
        if (this.mode === "subsection") {
          if (this.innerCurrent === index2) {
            style.color = activeColorTemp ? activeColorTemp : "#FFF";
          } else {
            style.color = inactiveColorTemp ? inactiveColorTemp : this.inactiveColor;
          }
        } else {
          if (this.innerCurrent === index2) {
            style.color = activeColorTemp ? activeColorTemp : this.activeColor;
          } else {
            style.color = inactiveColorTemp ? inactiveColorTemp : this.inactiveColor;
          }
        }
        return style;
      };
    }
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
  },
  emits: ["change", "update:current"],
  methods: {
    addStyle: uni_modules_uviewPlus_libs_function_index.addStyle,
    init() {
      this.innerCurrent = this.current;
      uni_modules_uviewPlus_libs_function_index.sleep().then(() => this.getRect());
    },
    // 判断展示文本
    getText(item) {
      return typeof item === "object" ? item[this.keyName] : item;
    },
    // 获取组件的尺寸
    getRect() {
      this.$uGetRect(".u-subsection__item--0").then((size) => {
        this.itemRect = size;
      });
    },
    clickHandler(index) {
      if (this.disabled) {
        return;
      }
      this.innerCurrent = index;
      this.$emit("update:current", index);
      this.$emit("change", index);
    },
    /**
     * 获取当前文字区域的 class禁用样式
     * @param index
     */
    getTextViewDisableClass(index) {
      if (this.disabled) {
        if (this.mode === "button") {
          return "item-button--disabled";
        } else {
          return "item-subsection--disabled";
        }
      }
      return "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.s($options.barStyle),
    b: common_vendor.n(_ctx.mode === "button" && "u-subsection--button__bar"),
    c: common_vendor.n($data.innerCurrent === 0 && _ctx.mode === "subsection" && "u-subsection__bar--first"),
    d: common_vendor.n($data.innerCurrent > 0 && $data.innerCurrent < _ctx.list.length - 1 && _ctx.mode === "subsection" && "u-subsection__bar--center"),
    e: common_vendor.n($data.innerCurrent === _ctx.list.length - 1 && _ctx.mode === "subsection" && "u-subsection__bar--last"),
    f: common_vendor.f(_ctx.list, (item, index, i0) => {
      return {
        a: common_vendor.t($options.getText(item)),
        b: common_vendor.s($options.textStyle(index, item)),
        c: common_vendor.n(`u-subsection__item--${index}`),
        d: common_vendor.n(index < _ctx.list.length - 1 && "u-subsection__item--no-border-right"),
        e: common_vendor.n(index === 0 && "u-subsection__item--first"),
        f: common_vendor.n(index === _ctx.list.length - 1 && "u-subsection__item--last"),
        g: common_vendor.n($options.getTextViewDisableClass(index)),
        h: `u-subsection__item--${index}`,
        i: common_vendor.s($options.itemStyle(index)),
        j: common_vendor.o(($event) => $options.clickHandler(index), index),
        k: index
      };
    }),
    g: common_vendor.n(_ctx.disabled ? "u-subsection--disabled" : ""),
    h: common_vendor.n(`u-subsection--${_ctx.mode}`),
    i: common_vendor.s($options.addStyle(_ctx.customStyle)),
    j: common_vendor.s($options.wrapperStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b5ccb67e"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uview-plus/components/u-subsection/u-subsection.js.map
