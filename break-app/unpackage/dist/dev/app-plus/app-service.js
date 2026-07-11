if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LAUNCH = "onLaunch";
  const ON_LOAD = "onLoad";
  const ON_SHARE_TIMELINE = "onShareTimeline";
  const ON_SHARE_APP_MESSAGE = "onShareAppMessage";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onHide = /* @__PURE__ */ createLifeCycleHook(
    ON_HIDE,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLaunch = /* @__PURE__ */ createLifeCycleHook(
    ON_LAUNCH,
    1
    /* HookFlags.APP */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const onShareTimeline = /* @__PURE__ */ createLifeCycleHook(
    ON_SHARE_TIMELINE,
    2
    /* HookFlags.PAGE */
  );
  const onShareAppMessage = /* @__PURE__ */ createLifeCycleHook(
    ON_SHARE_APP_MESSAGE,
    2
    /* HookFlags.PAGE */
  );
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation({
        ...options
      });
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config2 = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config2
        }, (res) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config: config2
        } = obj;
        this._animateRun(styles, config2).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config2 = {}) {
      this.animation.step(config2);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _export_sfc = (sfc, props2) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props2) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$q = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 0,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i in styles) {
          let line = this.toLine(i);
          transform += line + ":" + styles[i] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config2 = {}) {
        if (!this.animation)
          return this;
        Object.keys(obj).forEach((key) => {
          const value = obj[key];
          if (typeof this.animation[key] === "function") {
            Array.isArray(value) ? this.animation[key](...value) : this.animation[key](value);
          }
        });
        this.animation.step(config2);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.isShow = true;
        this.transform = this.styleInit(false).transform || "";
        this.opacity = this.styleInit(false).opacity || 0;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run(() => {
              this.transform = "";
              this.opacity = this.styleInit(false).opacity || 1;
              this.$emit("change", {
                detail: this.isShow
              });
            });
          }, 80);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = { transform: "", opacity: 1 };
        const buildStyle = (type2, mode) => {
          const value = this.animationType(type2)[mode];
          if (mode.startsWith("fade")) {
            styles.opacity = value;
          } else {
            styles.transform += value + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => buildStyle(type, mode));
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 1 : 0,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])), [
      [vue.vShow, $data.isShow]
    ]);
  }
  const __easycom_0$5 = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uni-transition/components/uni-transition/uni-transition.vue"]]);
  const _sfc_main$p = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      // 开启动画
      animation: {
        type: Boolean,
        default: true
      },
      // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
      // message: 消息提示 ; dialog : 对话框
      type: {
        type: String,
        default: "center"
      },
      // maskClick
      isMaskClick: {
        type: Boolean,
        default: null
      },
      // TODO 2 个版本后废弃属性 ，使用 isMaskClick
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: true
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      },
      borderRadius: {
        type: String
      }
    },
    watch: {
      /**
       * 监听type类型
       */
      type: {
        handler: function(type) {
          if (!this.config[type])
            return;
          this[this.config[type]](true);
        },
        immediate: true
      },
      isDesktop: {
        handler: function(newVal) {
          if (!this.config[newVal])
            return;
          this[this.config[this.type]](true);
        },
        immediate: true
      },
      /**
       * 监听遮罩是否可点击
       * @param {Object} val
       */
      maskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      isMaskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      // H5 下禁止底部滚动
      showPopup(show) {
      }
    },
    data() {
      return {
        duration: 300,
        ani: [],
        showPopup: false,
        showTrans: false,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          backgroundColor: "transparent",
          borderRadius: this.borderRadius || "0",
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: true,
        mkclick: true,
        popupstyle: "top"
      };
    },
    computed: {
      getStyles() {
        let res = { backgroundColor: this.bg };
        if (this.borderRadius || "0") {
          res = Object.assign(res, { borderRadius: this.borderRadius });
        }
        return res;
      },
      isDesktop() {
        return this.popupWidth >= 500 && this.popupHeight >= 500;
      },
      bg() {
        if (this.backgroundColor === "" || this.backgroundColor === "none") {
          return "transparent";
        }
        return this.backgroundColor;
      }
    },
    mounted() {
      const fixSize = () => {
        const {
          windowWidth,
          windowHeight,
          windowTop,
          safeArea,
          screenHeight,
          safeAreaInsets
        } = uni.getSystemInfoSync();
        this.popupWidth = windowWidth;
        this.popupHeight = windowHeight + (windowTop || 0);
        if (safeArea && this.safeArea) {
          this.safeAreaInsets = safeAreaInsets.bottom;
        } else {
          this.safeAreaInsets = 0;
        }
      };
      fixSize();
    },
    // TODO vue3
    unmounted() {
      this.setH5Visible();
    },
    activated() {
      this.setH5Visible(!this.showPopup);
    },
    deactivated() {
      this.setH5Visible(true);
    },
    created() {
      if (this.isMaskClick === null && this.maskClick === null) {
        this.mkclick = true;
      } else {
        this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick;
      }
      if (this.animation) {
        this.duration = 300;
      } else {
        this.duration = 0;
      }
      this.messageChild = null;
      this.clearPropagation = false;
      this.maskClass.backgroundColor = this.maskBackgroundColor;
    },
    methods: {
      setH5Visible(visible = true) {
      },
      /**
       * 公用方法，不显示遮罩层
       */
      closeMask() {
        this.maskShow = false;
      },
      /**
       * 公用方法，遮罩层禁止点击
       */
      disableMask() {
        this.mkclick = false;
      },
      // TODO nvue 取消冒泡
      clear(e2) {
        e2.stopPropagation();
        this.clearPropagation = true;
      },
      open(direction) {
        if (this.showPopup) {
          return;
        }
        let innerType = ["top", "center", "bottom", "left", "right", "message", "dialog", "share"];
        if (!(direction && innerType.indexOf(direction) !== -1)) {
          direction = this.type;
        }
        if (!this.config[direction]) {
          formatAppLog("error", "at uni_modules/uni-popup/components/uni-popup/uni-popup.vue:310", "缺少类型：", direction);
          return;
        }
        this[this.config[direction]]();
        this.$emit("change", {
          show: true,
          type: direction
        });
      },
      close(type) {
        this.showTrans = false;
        this.$emit("change", {
          show: false,
          type: this.type
        });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showPopup = false;
        }, 300);
      },
      // TODO 处理冒泡事件，头条的冒泡事件有问题 ，先这样兼容
      touchstart() {
        this.clearPropagation = false;
      },
      onTap() {
        if (this.clearPropagation) {
          this.clearPropagation = false;
          return;
        }
        this.$emit("maskClick");
        if (!this.mkclick)
          return;
        this.close();
      },
      /**
       * 顶部弹出样式处理
       */
      top(type) {
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top";
        this.ani = ["slide-top"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
        this.$nextTick(() => {
          this.showPoptrans();
          if (this.messageChild && this.type === "message") {
            this.messageChild.timerClose();
          }
        });
      },
      /**
       * 底部弹出样式处理
       */
      bottom(type) {
        this.popupstyle = "bottom";
        this.ani = ["slide-bottom"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      /**
       * 中间弹出样式处理
       */
      center(type) {
        this.popupstyle = "center";
        this.ani = ["zoom-out", "fade"];
        this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      left(type) {
        this.popupstyle = "left";
        this.ani = ["slide-left"];
        this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      right(type) {
        this.popupstyle = "right";
        this.ani = ["slide-right"];
        this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      showPoptrans() {
        this.$nextTick(() => {
          this.showPopup = true;
          this.showTrans = true;
        });
      }
    }
  };
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_0$5);
    return $data.showPopup ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["uni-popup", [$data.popupstyle, $options.isDesktop ? "fixforpc-z-index" : ""]])
      },
      [
        vue.createElementVNode(
          "view",
          {
            onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.touchstart && $options.touchstart(...args))
          },
          [
            $data.maskShow ? (vue.openBlock(), vue.createBlock(_component_uni_transition, {
              key: "1",
              name: "mask",
              "mode-class": "fade",
              styles: $data.maskClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, null, 8, ["styles", "duration", "show", "onClick"])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_uni_transition, {
              key: "2",
              "mode-class": $data.ani,
              name: "content",
              styles: $data.transClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["uni-popup__wrapper", [$data.popupstyle]]),
                    style: vue.normalizeStyle($options.getStyles),
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.clear && $options.clear(...args))
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["mode-class", "styles", "duration", "show", "onClick"])
          ],
          32
          /* NEED_HYDRATION */
        )
      ],
      2
      /* CLASS */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-4dd3c44b"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"]]);
  const defineMixin = (options) => {
    return options;
  };
  const version = "3";
  {
    formatAppLog("log", "at uni_modules/uview-plus/libs/config/config.js:5", `
 %c uview-plus V${version} %c https://ijry.github.io/uview-plus/ 

`, "color: #ffffff; background: #3c9cff; padding:5px 0;", "color: #3c9cff;background: #ffffff; padding:5px 0;");
  }
  const config$1 = {
    v: version,
    version,
    // 主题名称
    type: [
      "primary",
      "success",
      "info",
      "error",
      "warning"
    ],
    // 颜色部分，本来可以通过scss的:export导出供js使用，但是奈何nvue不支持
    color: {
      "u-primary": "#2979ff",
      "u-warning": "#ff9900",
      "u-success": "#19be6b",
      "u-error": "#fa3534",
      "u-info": "#909399",
      "u-main-color": "#303133",
      "u-content-color": "#606266",
      "u-tips-color": "#909399",
      "u-light-color": "#c0c4cc",
      "up-primary": "#2979ff",
      "up-warning": "#ff9900",
      "up-success": "#19be6b",
      "up-error": "#fa3534",
      "up-info": "#909399",
      "up-main-color": "#303133",
      "up-content-color": "#606266",
      "up-tips-color": "#909399",
      "up-light-color": "#c0c4cc"
    },
    // 字体图标地址
    iconUrl: "https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf",
    // 自定义图标
    customIcon: {
      family: "",
      url: ""
    },
    customIcons: {},
    // 自定义图标与unicode对应关系
    // 默认单位，可以通过配置为rpx，那么在用于传入组件大小参数为数值时，就默认为rpx
    unit: "px",
    // 拦截器
    interceptor: {
      navbarLeftClick: null
    },
    // 只加载一次字体
    loadFontOnce: false
  };
  const zIndex = {
    toast: 10090,
    noNetwork: 10080,
    // popup包含popup，actionsheet，keyboard，picker的值
    popup: 10075,
    mask: 10070,
    navbar: 980,
    topTips: 975,
    sticky: 970,
    indexListSticky: 965
  };
  const color$3 = {
    primary: "#3c9cff",
    info: "#909399",
    default: "#909399",
    warning: "#f9ae3d",
    error: "#f56c6c",
    success: "#5ac725",
    mainColor: "#303133",
    contentColor: "#606266",
    tipsColor: "#909399",
    lightColor: "#c0c4cc",
    borderColor: "#e4e7ed"
  };
  const { toString } = Object.prototype;
  function isArray(val) {
    return toString.call(val) === "[object Array]";
  }
  function isObject(val) {
    return val !== null && typeof val === "object";
  }
  function isDate(val) {
    return toString.call(val) === "[object Date]";
  }
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== "undefined" && val instanceof URLSearchParams;
  }
  function forEach(obj, fn) {
    if (obj === null || typeof obj === "undefined") {
      return;
    }
    if (typeof obj !== "object") {
      obj = [obj];
    }
    if (isArray(obj)) {
      for (let i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }
  function isPlainObject$1(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
  }
  function deepMerge$1() {
    const result = {};
    function assignValue(val, key) {
      if (typeof result[key] === "object" && typeof val === "object") {
        result[key] = deepMerge$1(result[key], val);
      } else if (typeof val === "object") {
        result[key] = deepMerge$1({}, val);
      } else {
        result[key] = val;
      }
    }
    for (let i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }
  function isUndefined(val) {
    return typeof val === "undefined";
  }
  function encode(val) {
    return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function buildURL(url2, params) {
    if (!params) {
      return url2;
    }
    let serializedParams;
    if (isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      const parts = [];
      forEach(params, (val, key) => {
        if (val === null || typeof val === "undefined") {
          return;
        }
        if (isArray(val)) {
          key = `${key}[]`;
        } else {
          val = [val];
        }
        forEach(val, (v) => {
          if (isDate(v)) {
            v = v.toISOString();
          } else if (isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(`${encode(key)}=${encode(v)}`);
        });
      });
      serializedParams = parts.join("&");
    }
    if (serializedParams) {
      const hashmarkIndex = url2.indexOf("#");
      if (hashmarkIndex !== -1) {
        url2 = url2.slice(0, hashmarkIndex);
      }
      url2 += (url2.indexOf("?") === -1 ? "?" : "&") + serializedParams;
    }
    return url2;
  }
  function isAbsoluteURL(url2) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
  }
  function combineURLs(baseURL2, relativeURL) {
    return relativeURL ? `${baseURL2.replace(/\/+$/, "")}/${relativeURL.replace(/^\/+/, "")}` : baseURL2;
  }
  function buildFullPath(baseURL2, requestedURL) {
    if (baseURL2 && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL2, requestedURL);
    }
    return requestedURL;
  }
  function settle(resolve, reject, response) {
    const { validateStatus } = response.config;
    const status = response.statusCode;
    if (status && (!validateStatus || validateStatus(status))) {
      resolve(response);
    } else {
      reject(response);
    }
  }
  const mergeKeys$1 = (keys, config2) => {
    const config3 = {};
    keys.forEach((prop) => {
      if (!isUndefined(config2[prop])) {
        config3[prop] = config2[prop];
      }
    });
    return config3;
  };
  const adapter = (config2) => new Promise((resolve, reject) => {
    const fullPath = buildURL(buildFullPath(config2.baseURL, config2.url), config2.params);
    const _config = {
      url: fullPath,
      header: config2.header,
      complete: (response) => {
        config2.fullPath = fullPath;
        response.config = config2;
        try {
          if (typeof response.data === "string") {
            response.data = JSON.parse(response.data);
          }
        } catch (e2) {
        }
        settle(resolve, reject, response);
      }
    };
    let requestTask;
    if (config2.method === "UPLOAD") {
      delete _config.header["content-type"];
      delete _config.header["Content-Type"];
      const otherConfig = {
        filePath: config2.filePath,
        name: config2.name
      };
      const optionalKeys = [
        "files",
        "timeout",
        "formData"
      ];
      requestTask = uni.uploadFile({ ..._config, ...otherConfig, ...mergeKeys$1(optionalKeys, config2) });
    } else if (config2.method === "DOWNLOAD") {
      if (!isUndefined(config2.timeout)) {
        _config.timeout = config2.timeout;
      }
      requestTask = uni.downloadFile(_config);
    } else {
      const optionalKeys = [
        "data",
        "method",
        "timeout",
        "dataType",
        "responseType",
        "sslVerify",
        "firstIpv4"
      ];
      requestTask = uni.request({ ..._config, ...mergeKeys$1(optionalKeys, config2) });
    }
    if (config2.getTask) {
      config2.getTask(requestTask, config2);
    }
  });
  const dispatchRequest = (config2) => adapter(config2);
  function InterceptorManager() {
    this.handlers = [];
  }
  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled,
      rejected
    });
    return this.handlers.length - 1;
  };
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };
  InterceptorManager.prototype.forEach = function forEach2(fn) {
    this.handlers.forEach((h) => {
      if (h !== null) {
        fn(h);
      }
    });
  };
  const mergeKeys = (keys, globalsConfig, config2) => {
    const config3 = {};
    keys.forEach((prop) => {
      if (!isUndefined(config2[prop])) {
        config3[prop] = config2[prop];
      } else if (!isUndefined(globalsConfig[prop])) {
        config3[prop] = globalsConfig[prop];
      }
    });
    return config3;
  };
  const mergeConfig = (globalsConfig, config2 = {}) => {
    const method = config2.method || globalsConfig.method || "GET";
    let config3 = {
      baseURL: globalsConfig.baseURL || "",
      method,
      url: config2.url || "",
      params: config2.params || {},
      custom: { ...globalsConfig.custom || {}, ...config2.custom || {} },
      header: deepMerge$1(globalsConfig.header || {}, config2.header || {})
    };
    const defaultToConfig2Keys = ["getTask", "validateStatus"];
    config3 = { ...config3, ...mergeKeys(defaultToConfig2Keys, globalsConfig, config2) };
    if (method === "DOWNLOAD") {
      if (!isUndefined(config2.timeout)) {
        config3.timeout = config2.timeout;
      } else if (!isUndefined(globalsConfig.timeout)) {
        config3.timeout = globalsConfig.timeout;
      }
    } else if (method === "UPLOAD") {
      delete config3.header["content-type"];
      delete config3.header["Content-Type"];
      const uploadKeys = [
        "files",
        "filePath",
        "name",
        "timeout",
        "formData"
      ];
      uploadKeys.forEach((prop) => {
        if (!isUndefined(config2[prop])) {
          config3[prop] = config2[prop];
        }
      });
      if (isUndefined(config3.timeout) && !isUndefined(globalsConfig.timeout)) {
        config3.timeout = globalsConfig.timeout;
      }
    } else {
      const defaultsKeys = [
        "data",
        "timeout",
        "dataType",
        "responseType",
        "sslVerify",
        "firstIpv4"
      ];
      config3 = { ...config3, ...mergeKeys(defaultsKeys, globalsConfig, config2) };
    }
    return config3;
  };
  const defaults = {
    baseURL: "",
    header: {},
    method: "GET",
    dataType: "json",
    responseType: "text",
    custom: {},
    timeout: 6e4,
    sslVerify: true,
    firstIpv4: false,
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };
  var clone = function() {
    function _instanceof(obj, type) {
      return type != null && obj instanceof type;
    }
    var nativeMap;
    try {
      nativeMap = Map;
    } catch (_) {
      nativeMap = function() {
      };
    }
    var nativeSet;
    try {
      nativeSet = Set;
    } catch (_) {
      nativeSet = function() {
      };
    }
    var nativePromise;
    try {
      nativePromise = Promise;
    } catch (_) {
      nativePromise = function() {
      };
    }
    function clone2(parent, circular, depth, prototype, includeNonEnumerable) {
      if (typeof circular === "object") {
        depth = circular.depth;
        prototype = circular.prototype;
        includeNonEnumerable = circular.includeNonEnumerable;
        circular = circular.circular;
      }
      var allParents = [];
      var allChildren = [];
      var useBuffer = typeof Buffer != "undefined";
      if (typeof circular == "undefined")
        circular = true;
      if (typeof depth == "undefined")
        depth = Infinity;
      function _clone(parent2, depth2) {
        if (parent2 === null)
          return null;
        if (depth2 === 0)
          return parent2;
        var child;
        var proto;
        if (typeof parent2 != "object") {
          return parent2;
        }
        if (_instanceof(parent2, nativeMap)) {
          child = new nativeMap();
        } else if (_instanceof(parent2, nativeSet)) {
          child = new nativeSet();
        } else if (_instanceof(parent2, nativePromise)) {
          child = new nativePromise(function(resolve, reject) {
            parent2.then(function(value) {
              resolve(_clone(value, depth2 - 1));
            }, function(err) {
              reject(_clone(err, depth2 - 1));
            });
          });
        } else if (clone2.__isArray(parent2)) {
          child = [];
        } else if (clone2.__isRegExp(parent2)) {
          child = new RegExp(parent2.source, __getRegExpFlags(parent2));
          if (parent2.lastIndex)
            child.lastIndex = parent2.lastIndex;
        } else if (clone2.__isDate(parent2)) {
          child = new Date(parent2.getTime());
        } else if (useBuffer && Buffer.isBuffer(parent2)) {
          if (Buffer.from) {
            child = Buffer.from(parent2);
          } else {
            child = new Buffer(parent2.length);
            parent2.copy(child);
          }
          return child;
        } else if (_instanceof(parent2, Error)) {
          child = Object.create(parent2);
        } else {
          if (typeof prototype == "undefined") {
            proto = Object.getPrototypeOf(parent2);
            child = Object.create(proto);
          } else {
            child = Object.create(prototype);
            proto = prototype;
          }
        }
        if (circular) {
          var index = allParents.indexOf(parent2);
          if (index != -1) {
            return allChildren[index];
          }
          allParents.push(parent2);
          allChildren.push(child);
        }
        if (_instanceof(parent2, nativeMap)) {
          parent2.forEach(function(value, key) {
            var keyChild = _clone(key, depth2 - 1);
            var valueChild = _clone(value, depth2 - 1);
            child.set(keyChild, valueChild);
          });
        }
        if (_instanceof(parent2, nativeSet)) {
          parent2.forEach(function(value) {
            var entryChild = _clone(value, depth2 - 1);
            child.add(entryChild);
          });
        }
        for (var i in parent2) {
          var attrs = Object.getOwnPropertyDescriptor(parent2, i);
          if (attrs) {
            child[i] = _clone(parent2[i], depth2 - 1);
          }
          try {
            var objProperty = Object.getOwnPropertyDescriptor(parent2, i);
            if (objProperty.set === "undefined") {
              continue;
            }
            child[i] = _clone(parent2[i], depth2 - 1);
          } catch (e2) {
            if (e2 instanceof TypeError) {
              continue;
            } else if (e2 instanceof ReferenceError) {
              continue;
            }
          }
        }
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(parent2);
          for (var i = 0; i < symbols.length; i++) {
            var symbol = symbols[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent2, symbol);
            if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
              continue;
            }
            child[symbol] = _clone(parent2[symbol], depth2 - 1);
            Object.defineProperty(child, symbol, descriptor);
          }
        }
        if (includeNonEnumerable) {
          var allPropertyNames = Object.getOwnPropertyNames(parent2);
          for (var i = 0; i < allPropertyNames.length; i++) {
            var propertyName = allPropertyNames[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent2, propertyName);
            if (descriptor && descriptor.enumerable) {
              continue;
            }
            child[propertyName] = _clone(parent2[propertyName], depth2 - 1);
            Object.defineProperty(child, propertyName, descriptor);
          }
        }
        return child;
      }
      return _clone(parent, depth);
    }
    clone2.clonePrototype = function clonePrototype(parent) {
      if (parent === null)
        return null;
      var c = function() {
      };
      c.prototype = parent;
      return new c();
    };
    function __objToStr(o) {
      return Object.prototype.toString.call(o);
    }
    clone2.__objToStr = __objToStr;
    function __isDate(o) {
      return typeof o === "object" && __objToStr(o) === "[object Date]";
    }
    clone2.__isDate = __isDate;
    function __isArray(o) {
      return typeof o === "object" && __objToStr(o) === "[object Array]";
    }
    clone2.__isArray = __isArray;
    function __isRegExp(o) {
      return typeof o === "object" && __objToStr(o) === "[object RegExp]";
    }
    clone2.__isRegExp = __isRegExp;
    function __getRegExpFlags(re) {
      var flags = "";
      if (re.global)
        flags += "g";
      if (re.ignoreCase)
        flags += "i";
      if (re.multiline)
        flags += "m";
      return flags;
    }
    clone2.__getRegExpFlags = __getRegExpFlags;
    return clone2;
  }();
  class Request {
    /**
    * @param {Object} arg - 全局配置
    * @param {String} arg.baseURL - 全局根路径
    * @param {Object} arg.header - 全局header
    * @param {String} arg.method = [GET|POST|PUT|DELETE|CONNECT|HEAD|OPTIONS|TRACE] - 全局默认请求方式
    * @param {String} arg.dataType = [json] - 全局默认的dataType
    * @param {String} arg.responseType = [text|arraybuffer] - 全局默认的responseType。支付宝小程序不支持
    * @param {Object} arg.custom - 全局默认的自定义参数
    * @param {Number} arg.timeout - 全局默认的超时时间，单位 ms。默认60000。H5(HBuilderX 2.9.9+)、APP(HBuilderX 2.9.9+)、微信小程序（2.10.0）、支付宝小程序
    * @param {Boolean} arg.sslVerify - 全局默认的是否验证 ssl 证书。默认true.仅App安卓端支持（HBuilderX 2.3.3+）
    * @param {Boolean} arg.withCredentials - 全局默认的跨域请求时是否携带凭证（cookies）。默认false。仅H5支持（HBuilderX 2.6.15+）
    * @param {Boolean} arg.firstIpv4 - 全DNS解析时优先使用ipv4。默认false。仅 App-Android 支持 (HBuilderX 2.8.0+)
    * @param {Function(statusCode):Boolean} arg.validateStatus - 全局默认的自定义验证器。默认statusCode >= 200 && statusCode < 300
    */
    constructor(arg = {}) {
      if (!isPlainObject$1(arg)) {
        arg = {};
        formatAppLog("warn", "at uni_modules/uview-plus/libs/luch-request/core/Request.js:40", "设置全局参数必须接收一个Object");
      }
      this.config = clone({ ...defaults, ...arg });
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }
    /**
    * @Function
    * @param {Request~setConfigCallback} f - 设置全局默认配置
    */
    setConfig(f) {
      this.config = f(this.config);
    }
    middleware(config2) {
      config2 = mergeConfig(this.config, config2);
      const chain = [dispatchRequest, void 0];
      let promise2 = Promise.resolve(config2);
      this.interceptors.request.forEach((interceptor) => {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      this.interceptors.response.forEach((interceptor) => {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });
      while (chain.length) {
        promise2 = promise2.then(chain.shift(), chain.shift());
      }
      return promise2;
    }
    /**
    * @Function
    * @param {Object} config - 请求配置项
    * @prop {String} options.url - 请求路径
    * @prop {Object} options.data - 请求参数
    * @prop {Object} [options.responseType = config.responseType] [text|arraybuffer] - 响应的数据类型
    * @prop {Object} [options.dataType = config.dataType] - 如果设为 json，会尝试对返回的数据做一次 JSON.parse
    * @prop {Object} [options.header = config.header] - 请求header
    * @prop {Object} [options.method = config.method] - 请求方法
    * @returns {Promise<unknown>}
    */
    request(config2 = {}) {
      return this.middleware(config2);
    }
    get(url2, options = {}) {
      return this.middleware({
        url: url2,
        method: "GET",
        ...options
      });
    }
    post(url2, data, options = {}) {
      return this.middleware({
        url: url2,
        data,
        method: "POST",
        ...options
      });
    }
    put(url2, data, options = {}) {
      return this.middleware({
        url: url2,
        data,
        method: "PUT",
        ...options
      });
    }
    delete(url2, data, options = {}) {
      return this.middleware({
        url: url2,
        data,
        method: "DELETE",
        ...options
      });
    }
    options(url2, data, options = {}) {
      return this.middleware({
        url: url2,
        data,
        method: "OPTIONS",
        ...options
      });
    }
    upload(url2, config2 = {}) {
      config2.url = url2;
      config2.method = "UPLOAD";
      return this.middleware(config2);
    }
    download(url2, config2 = {}) {
      config2.url = url2;
      config2.method = "DOWNLOAD";
      return this.middleware(config2);
    }
  }
  const http$1 = new Request();
  function email(value) {
    return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(value);
  }
  function mobile(value) {
    return /^1[23456789]\d{9}$/.test(value);
  }
  function url(value) {
    return /^((https|http|ftp|rtsp|mms):\/\/)(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?(([0-9]{1,3}.){3}[0-9]{1,3}|([0-9a-zA-Z_!~*'()-]+.)*([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z].[a-zA-Z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+\/?)$/.test(value);
  }
  function date(value) {
    if (!value)
      return false;
    if (typeof value === "number") {
      if (value.toString().length !== 10 && value.toString().length !== 13) {
        return false;
      }
      return !isNaN(new Date(value).getTime());
    }
    if (typeof value === "string") {
      const numV = Number(value);
      if (!isNaN(numV)) {
        if (numV.toString().length === 10 || numV.toString().length === 13) {
          return !isNaN(new Date(numV).getTime());
        }
      }
      if (value.length < 10 || value.length > 19) {
        return false;
      }
      const dateRegex = /^\d{4}[-\/]\d{2}[-\/]\d{2}( \d{1,2}:\d{2}(:\d{2})?)?$/;
      if (!dateRegex.test(value)) {
        return false;
      }
      const dateValue = new Date(value);
      return !isNaN(dateValue.getTime());
    }
    return false;
  }
  function dateISO(value) {
    return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
  }
  function number(value) {
    return /^[\+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(value);
  }
  function string(value) {
    return typeof value === "string";
  }
  function digits(value) {
    return /^\d+$/.test(value);
  }
  function idCard(value) {
    return /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(
      value
    );
  }
  function carNo(value) {
    const xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
    const creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
    if (value.length === 7) {
      return creg.test(value);
    }
    if (value.length === 8) {
      return xreg.test(value);
    }
    return false;
  }
  function amount(value) {
    return /^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(value);
  }
  function chinese(value) {
    const reg = /^[\u4e00-\u9fa5]+$/gi;
    return reg.test(value);
  }
  function letter(value) {
    return /^[a-zA-Z]*$/.test(value);
  }
  function enOrNum(value) {
    const reg = /^[0-9a-zA-Z]*$/g;
    return reg.test(value);
  }
  function contains(value, param) {
    return value.indexOf(param) >= 0;
  }
  function range$1(value, param) {
    return value >= param[0] && value <= param[1];
  }
  function rangeLength(value, param) {
    return value.length >= param[0] && value.length <= param[1];
  }
  function landline(value) {
    const reg = /^\d{3,4}-\d{7,8}(-\d{3,4})?$/;
    return reg.test(value);
  }
  function empty(value) {
    switch (typeof value) {
      case "undefined":
        return true;
      case "string":
        if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, "").length == 0)
          return true;
        break;
      case "boolean":
        if (!value)
          return true;
        break;
      case "number":
        if (value === 0 || isNaN(value))
          return true;
        break;
      case "object":
        if (value === null || value.length === 0)
          return true;
        for (const i in value) {
          return false;
        }
        return true;
    }
    return false;
  }
  function jsonString(value) {
    if (typeof value === "string") {
      try {
        const obj = JSON.parse(value);
        if (typeof obj === "object" && obj) {
          return true;
        }
        return false;
      } catch (e2) {
        return false;
      }
    }
    return false;
  }
  function array(value) {
    if (typeof Array.isArray === "function") {
      return Array.isArray(value);
    }
    return Object.prototype.toString.call(value) === "[object Array]";
  }
  function object(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }
  function objectPromise(value) {
    return Object.prototype.toString.call(value) === "[object Promise]";
  }
  function code(value, len = 6) {
    return new RegExp(`^\\d{${len}}$`).test(value);
  }
  function func(value) {
    return typeof value === "function";
  }
  function promise(value) {
    return objectPromise(value) && func(value.then) && func(value.catch);
  }
  function image(value) {
    const newValue = value.split("?")[0];
    const IMAGE_REGEXP = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)/i;
    return IMAGE_REGEXP.test(newValue);
  }
  function video(value) {
    const VIDEO_REGEXP = /\.(mp4|mpg|mpeg|dat|asf|avi|rm|rmvb|mov|wmv|flv|mkv|m3u8)/i;
    return VIDEO_REGEXP.test(value);
  }
  function regExp(o) {
    return o && Object.prototype.toString.call(o) === "[object RegExp]";
  }
  const test = {
    email,
    mobile,
    url,
    date,
    dateISO,
    number,
    digits,
    idCard,
    carNo,
    amount,
    chinese,
    letter,
    enOrNum,
    contains,
    range: range$1,
    rangeLength,
    empty,
    isEmpty: empty,
    jsonString,
    landline,
    object,
    array,
    code,
    func,
    promise,
    video,
    image,
    regExp,
    string
  };
  function range(min = 0, max = 0, value = 0) {
    return Math.max(min, Math.min(max, Number(value)));
  }
  function sleep$1(value = 30) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, value);
    });
  }
  function getWindowInfo$1() {
    let ret = {};
    ret = uni.getWindowInfo();
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
    if (empty(customStyle) || typeof customStyle === "object" && target === "object" || target === "string" && typeof customStyle === "string") {
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
    let string2 = "";
    if (typeof customStyle === "object") {
      customStyle.forEach((val, i) => {
        const key = i.replace(/([A-Z])/g, "-$1").toLowerCase();
        string2 += `${key}:${val};`;
      });
    }
    return trim(string2);
  }
  function addUnit(value = "auto", unit = "") {
    if (!unit) {
      unit = config$1.unit || "px";
    }
    if (unit == "rpx" && number(String(value))) {
      value = value * 2;
    }
    value = String(value);
    return number(value) ? `${value}${unit}` : value;
  }
  function deepClone(obj) {
    if ([null, void 0, NaN, false].includes(obj))
      return obj;
    if (typeof obj !== "object" && typeof obj !== "function") {
      return obj;
    }
    const o = array(obj) ? [] : {};
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
      formatAppLog("error", "at uni_modules/uview-plus/libs/function/index.js:318", `uView提示：${err}`);
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
      let times2 = Math.ceil(fillLength / fillString.length);
      while (times2 >>= 1) {
        fillString += fillString;
        if (times2 === 1) {
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
  const ActionSheet = {
    // action-sheet组件
    actionSheet: {
      show: false,
      title: "",
      description: "",
      actions: [],
      index: "",
      cancelText: "",
      closeOnClickAction: true,
      safeAreaInsetBottom: true,
      openType: "",
      closeOnClickOverlay: true,
      round: 0,
      wrapMaxHeight: "600px"
    }
  };
  const Album = {
    // album 组件
    album: {
      urls: [],
      keyName: "",
      singleSize: 180,
      multipleSize: 70,
      space: 6,
      singleMode: "scaleToFill",
      multipleMode: "aspectFill",
      maxCount: 9,
      previewFullImage: true,
      rowCount: 3,
      showMore: true,
      autoWrap: false,
      unit: "px",
      stop: true
    }
  };
  const Alert = {
    // alert警告组件
    alert: {
      title: "",
      type: "warning",
      description: "",
      closable: false,
      showIcon: false,
      effect: "light",
      center: false,
      fontSize: 14,
      transitionMode: "fade",
      duration: 0,
      icon: "",
      value: true
    }
  };
  const Avatar = {
    // avatar 组件
    avatar: {
      src: "",
      shape: "circle",
      size: 40,
      mode: "scaleToFill",
      text: "",
      bgColor: "#c0c4cc",
      color: "#ffffff",
      fontSize: 18,
      icon: "",
      mpAvatar: false,
      randomBgColor: false,
      defaultUrl: "",
      colorIndex: "",
      name: ""
    }
  };
  const AvatarGroup = {
    // avatarGroup 组件
    avatarGroup: {
      urls: [],
      maxCount: 5,
      shape: "circle",
      mode: "scaleToFill",
      showMore: true,
      size: 40,
      keyName: "",
      gap: 0.5,
      extraValue: 0
    }
  };
  const Backtop = {
    // backtop组件
    backtop: {
      mode: "circle",
      icon: "arrow-upward",
      text: "",
      duration: 100,
      scrollTop: 0,
      top: 400,
      bottom: 100,
      right: 20,
      zIndex: 9,
      iconStyle: {
        color: "#909399",
        fontSize: "19px"
      }
    }
  };
  const Badge = {
    // 徽标数组件
    badge: {
      isDot: false,
      value: "",
      show: true,
      max: 999,
      type: "error",
      showZero: false,
      bgColor: null,
      color: null,
      shape: "circle",
      numberType: "overflow",
      offset: [],
      inverted: false,
      absolute: false
    }
  };
  const Button = {
    // button组件
    button: {
      hairline: false,
      type: "info",
      size: "normal",
      shape: "square",
      plain: false,
      disabled: false,
      loading: false,
      loadingText: "",
      loadingMode: "spinner",
      loadingSize: 15,
      openType: "",
      formType: "",
      appParameter: "",
      hoverStopPropagation: true,
      lang: "en",
      sessionFrom: "",
      sendMessageTitle: "",
      sendMessagePath: "",
      sendMessageImg: "",
      showMessageCard: false,
      dataName: "",
      throttleTime: 0,
      hoverStartTime: 0,
      hoverStayTime: 200,
      text: "",
      icon: "",
      iconColor: "",
      color: "",
      stop: true
    }
  };
  const zhHans = {
    "up.common.cancel": "取消",
    "up.common.confirm": "确定",
    "up.common.start": "开始",
    "up.common.end": "结束",
    "up.common.stop": "停止",
    "up.common.copy": "复制",
    "up.common.none": "暂无",
    "up.common.tip": "提示",
    "up.common.success": "成功",
    "up.common.fail": "失败",
    "up.common.close": "关闭",
    "up.common.preview": "预览",
    "up.common.re-select": "重选",
    "up.common.rotate": "旋转",
    "up.common.pleaseChoose": "请选择",
    "up.common.loading": "加载中",
    "up.common.loading2": "正在加载",
    "up.common.inOperation": "操作中",
    "up.common.settings": "设置",
    "up.common.retry": "重试",
    "up.common.search": "搜索",
    "up.common.more": "更多",
    "up.common.video": "视频",
    "up.common.file": "文件",
    "up.week.one": "一",
    "up.week.two": "二",
    "up.week.three": "三",
    "up.week.four": "四",
    "up.week.five": "五",
    "up.week.six": "六",
    "up.week.seven": "日",
    "up.barcode.error": "生成条码失败",
    "up.calendar.chooseDates": "日期选择",
    "up.calendar.disabled": "该日期已禁用",
    "up.calendar.daysExceed": "选择天数不能超过{days}天",
    "up.cityLocate.locateCity": "定位城市",
    "up.cityLocate.fail": "定位失败，请点击重试。",
    "up.cityLocate.locating": "定位中",
    "up.code.send": "获取验证码",
    "up.code.resendAfter": "X秒重新获取",
    "up.code.resend": "重新获取",
    "up.cropper.emptyWidhtOrHeight": "裁剪框的宽或高没有设置",
    "up.empty.car": "购物车为空",
    "up.empty.page": "页面不存在",
    "up.empty.search": "没有搜索结果",
    "up.empty.address": "没有收货地址",
    "up.empty.wifi": "没有WiFi",
    "up.empty.order": "订单为空",
    "up.empty.coupon": "没有优惠券",
    "up.empty.favor": "暂无收藏",
    "up.empty.permission": "无权限",
    "up.empty.history": "无历史记录",
    "up.empty.news": "无新闻列表",
    "up.empty.message": "消息列表为空",
    "up.empty.list": "列表为空",
    "up.empty.data": "数据为空",
    "up.empty.comment": "暂无评论",
    "up.link.copyed": "链接已复制，请在浏览器打开",
    "up.loadmoe.loadmore": "加载更多",
    "up.loadmoe.nomore": "没有更多了",
    "up.noNetwork.text": "哎呀，网络信号丢失",
    "up.noNetwork.pleaseCheck": "请检查网络，或前往",
    "up.noNetwork.connect": "网络已连接",
    "up.noNetwork.disconnect": "无网络连接",
    "up.pagination.previous": "上一页",
    "up.pagination.next": "下一页",
    "up.pullRefresh.pull": "下拉刷新",
    "up.pullRefresh.release": "释放刷新",
    "up.pullRefresh.refreshing": "正在刷新",
    "up.readMore.expand": "展开阅读全文",
    "up.readMore.fold": "收起",
    "up.search.placeholder": "请输入关键字",
    "up.signature.penSize": "笔画大小",
    "up.signature.penColor": "笔画颜色",
    "up.upload.sizeExceed": "超过大小限制",
    "up.upload.uploading": "上传中",
    "up.upload.previewImageFail": "预览图片失败",
    "up.upload.previewVideoFail": "预览视频失败",
    "up.goodsSku.stock": "库存",
    "up.goodsSku.price": "价格",
    "up.goodsSku.amount": "件",
    "up.goodsSku.choosed": "已选",
    "up.goodsSku.buyAmount": "购买数量"
  };
  const zhHant = {
    "up.common.cancel": "取消",
    "up.common.confirm": "確定",
    "up.common.start": "開始",
    "up.common.end": "結束",
    "up.common.stop": "停止",
    "up.common.copy": "複製",
    "up.common.none": "暫無",
    "up.common.tip": "提示",
    "up.common.success": "成功",
    "up.common.fail": "失敗",
    "up.common.close": "關閉",
    "up.common.preview": "預覽",
    "up.common.re-select": "重選",
    "up.common.rotate": "旋轉",
    "up.common.pleaseChoose": "請選擇",
    "up.common.loading": "加載中",
    "up.common.loading2": "正在加載",
    "up.common.inOperation": "操作中",
    "up.common.settings": "設置",
    "up.common.retry": "重試",
    "up.common.search": "搜索",
    "up.common.more": "更多",
    "up.common.video": "視頻",
    "up.common.file": "文件",
    "up.week.one": "一",
    "up.week.two": "二",
    "up.week.three": "三",
    "up.week.four": "四",
    "up.week.five": "五",
    "up.week.six": "六",
    "up.week.seven": "日",
    "up.barcode.error": "生成條碼失敗",
    "up.calendar.chooseDates": "日期選擇",
    "up.calendar.disabled": "該日期已禁用",
    "up.calendar.daysExceed": "選擇天數不能超過{days}天",
    "up.cityLocate.locateCity": "定位城市",
    "up.cityLocate.fail": "定位失敗，請點擊重試。",
    "up.cityLocate.locating": "定位中",
    "up.code.send": "獲取驗證碼",
    "up.code.resendAfter": "X秒重新獲取",
    "up.code.resend": "重新獲取",
    "up.cropper.emptyWidhtOrHeight": "裁剪框的寬或高沒有設置",
    "up.empty.car": "購物車為空",
    "up.empty.page": "頁面不存在",
    "up.empty.search": "沒有搜索結果",
    "up.empty.address": "沒有收貨地址",
    "up.empty.wifi": "沒有WiFi",
    "up.empty.order": "訂單為空",
    "up.empty.coupon": "沒有優惠券",
    "up.empty.favor": "暫無收藏",
    "up.empty.permission": "無權限",
    "up.empty.history": "無歷史記錄",
    "up.empty.news": "無新聞列表",
    "up.empty.message": "消息列表為空",
    "up.empty.list": "列表為空",
    "up.empty.data": "數據為空",
    "up.empty.comment": "暫無評論",
    "up.link.copyed": "鏈接已複製，請在瀏覽器打開",
    "up.loadmoe.loadmore": "加載更多",
    "up.loadmoe.nomore": "沒有更多了",
    "up.noNetwork.text": "哎呀，網絡信號丟失",
    "up.noNetwork.pleaseCheck": "請檢查網絡，或前往",
    "up.noNetwork.connect": "網絡已連接",
    "up.noNetwork.disconnect": "無網絡連接",
    "up.pagination.previous": "上一頁",
    "up.pagination.next": "下一頁",
    "up.pullRefresh.pull": "下拉刷新",
    "up.pullRefresh.release": "釋放刷新",
    "up.pullRefresh.refreshing": "正在刷新",
    "up.readMore.expand": "展開閱讀全文",
    "up.readMore.fold": "收起",
    "up.search.placeholder": "請輸入關鍵字",
    "up.signature.penSize": "筆畫大小",
    "up.signature.penColor": "筆畫顏色",
    "up.upload.sizeExceed": "超過大小限制",
    "up.upload.uploading": "上傳中",
    "up.upload.previewImageFail": "預覽圖片失敗",
    "up.upload.previewVideoFail": "預覽視頻失敗",
    "up.goodsSku.stock": "庫存",
    "up.goodsSku.price": "價格",
    "up.goodsSku.amount": "件",
    "up.goodsSku.choosed": "已選",
    "up.goodsSku.buyAmount": "購買數量"
  };
  const en = {
    "up.common.cancel": "Cancel",
    "up.common.confirm": "Confirm",
    "up.common.start": "Start",
    "up.common.end": "End",
    "up.common.stop": "Stop",
    "up.common.copy": "Copy",
    "up.common.none": "None",
    "up.common.tip": "Tip",
    "up.common.success": "Success",
    "up.common.fail": "Fail",
    "up.common.close": "Close",
    "up.common.preview": "Preview",
    "up.common.re-select": "Re-select",
    "up.common.rotate": "Rotate",
    "up.common.pleaseChoose": "Please choose",
    "up.common.loading": "Loading",
    "up.common.loading2": "Loading",
    "up.common.inOperation": "In operation",
    "up.common.settings": "Settings",
    "up.common.retry": "Retry",
    "up.common.search": "Search",
    "up.common.more": "More",
    "up.common.video": "Video",
    "up.common.file": "File",
    "up.week.one": "Mon",
    "up.week.two": "Tue",
    "up.week.three": "Wed",
    "up.week.four": "Thu",
    "up.week.five": "Fri",
    "up.week.six": "Sat",
    "up.week.seven": "Sun",
    "up.barcode.error": "Failed to generate barcode",
    "up.calendar.chooseDates": "Date selection",
    "up.calendar.disabled": "This date is disabled",
    "up.calendar.daysExceed": "The number of selected days cannot exceed {days} days",
    "up.cityLocate.locateCity": "Locate city",
    "up.cityLocate.fail": "Location failed, please click to retry.",
    "up.cityLocate.locating": "Locating",
    "up.code.send": "Get verification code",
    "up.code.resendAfter": "Resend after X seconds",
    "up.code.resend": "Resend",
    "up.cropper.emptyWidhtOrHeight": "The width or height of the cropping box is not set",
    "up.empty.car": "Shopping cart is empty",
    "up.empty.page": "Page not found",
    "up.empty.search": "No search results",
    "up.empty.address": "No shipping address",
    "up.empty.wifi": "No WiFi",
    "up.empty.order": "Order is empty",
    "up.empty.coupon": "No coupons",
    "up.empty.favor": "No favorites",
    "up.empty.permission": "No permission",
    "up.empty.history": "No history",
    "up.empty.news": "No news list",
    "up.empty.message": "Message list is empty",
    "up.empty.list": "List is empty",
    "up.empty.data": "Data is empty",
    "up.empty.comment": "No comments",
    "up.link.copyed": "Link copied, please open in browser",
    "up.loadmoe.loadmore": "Load more",
    "up.loadmoe.nomore": "No more",
    "up.noNetwork.text": "Oops, network signal lost",
    "up.noNetwork.pleaseCheck": "Please check the network, or go to",
    "up.noNetwork.connect": "Network connected",
    "up.noNetwork.disconnect": "No network connection",
    "up.pagination.previous": "Previous",
    "up.pagination.next": "Next",
    "up.pullRefresh.pull": "Pull to refresh",
    "up.pullRefresh.release": "Release to refresh",
    "up.pullRefresh.refreshing": "Refreshing",
    "up.readMore.expand": "Expand to read more",
    "up.readMore.fold": "Collapse",
    "up.search.placeholder": "Please enter keywords",
    "up.signature.penSize": "Stroke size",
    "up.signature.penColor": "Stroke color",
    "up.upload.sizeExceed": "Size limit exceeded",
    "up.upload.uploading": "Uploading",
    "up.upload.previewImageFail": "Failed to preview image",
    "up.upload.previewVideoFail": "Failed to preview video",
    "up.goodsSku.stock": "Stock",
    "up.goodsSku.price": "Price",
    "up.goodsSku.amount": "Items",
    "up.goodsSku.choosed": "Selected",
    "up.goodsSku.buyAmount": "Quantity"
  };
  const es = {
    "up.common.cancel": "Cancelar",
    "up.common.confirm": "Confirmar",
    "up.common.start": "Iniciar",
    "up.common.end": "Finalizar",
    "up.common.stop": "Detener",
    "up.common.copy": "Copiar",
    "up.common.none": "Ninguno",
    "up.common.tip": "Consejo",
    "up.common.success": "Éxito",
    "up.common.fail": "Fallido",
    "up.common.close": "Cerrar",
    "up.common.preview": "Vista previa",
    "up.common.re-select": "Re seleccionar",
    "up.common.rotate": "Rotar",
    "up.common.pleaseChoose": "Por favor seleccione",
    "up.common.loading": "Cargando",
    "up.common.loading2": "Cargando",
    "up.common.inOperation": "En operación",
    "up.common.settings": "Configuración",
    "up.common.retry": "Reintentar",
    "up.common.search": "Buscar",
    "up.common.more": "Más",
    "up.common.video": "Vídeo",
    "up.common.file": "Archivo",
    "up.week.one": "Lun",
    "up.week.two": "Mar",
    "up.week.three": "Mié",
    "up.week.four": "Jue",
    "up.week.five": "Vie",
    "up.week.six": "Sáb",
    "up.week.seven": "Dom",
    "up.barcode.error": "Error al generar código de barras",
    "up.calendar.chooseDates": "Selección de fecha",
    "up.calendar.disabled": "Esta fecha está deshabilitada",
    "up.calendar.daysExceed": "Los días seleccionados no pueden exceder {days} días",
    "up.cityLocate.locateCity": "Localizar ciudad",
    "up.cityLocate.fail": "Error de localización, haga clic para reintentar.",
    "up.cityLocate.locating": "Localizando",
    "up.code.send": "Obtener código de verificación",
    "up.code.resendAfter": "Reenviar en X segundos",
    "up.code.resend": "Reenviar",
    "up.cropper.emptyWidhtOrHeight": "El ancho o alto del recorte no está configurado",
    "up.empty.car": "Carrito de compras vacío",
    "up.empty.page": "Página no encontrada",
    "up.empty.search": "Sin resultados de búsqueda",
    "up.empty.address": "Sin dirección de envío",
    "up.empty.wifi": "Sin WiFi",
    "up.empty.order": "Pedido vacío",
    "up.empty.coupon": "Sin cupones",
    "up.empty.favor": "Sin favoritos",
    "up.empty.permission": "Sin permisos",
    "up.empty.history": "Sin historial",
    "up.empty.news": "Sin noticias",
    "up.empty.message": "Lista de mensajes vacía",
    "up.empty.list": "Lista vacía",
    "up.empty.data": "Datos vacíos",
    "up.empty.comment": "Sin comentarios",
    "up.link.copyed": "Enlace copiado, por favor abra en el navegador",
    "up.loadmoe.loadmore": "Cargar más",
    "up.loadmoe.nomore": "No hay más",
    "up.noNetwork.text": "¡Ups! Se perdió la señal de red",
    "up.noNetwork.pleaseCheck": "Por favor verifique la red, o vaya a",
    "up.noNetwork.connect": "Red conectada",
    "up.noNetwork.disconnect": "Sin conexión a internet",
    "up.pagination.previous": "Página anterior",
    "up.pagination.next": "Página siguiente",
    "up.pullRefresh.pull": "Deslizar hacia abajo para actualizar",
    "up.pullRefresh.release": "Soltar para actualizar",
    "up.pullRefresh.refreshing": "Actualizando",
    "up.readMore.expand": "Expandir para leer más",
    "up.readMore.fold": "Contraer",
    "up.search.placeholder": "Ingrese palabra clave",
    "up.signature.penSize": "Tamaño del trazo",
    "up.signature.penColor": "Color del trazo",
    "up.upload.sizeExceed": "Excede el límite de tamaño",
    "up.upload.uploading": "Subiendo",
    "up.upload.previewImageFail": "Error al previsualizar imagen",
    "up.upload.previewVideoFail": "Error al previsualizar vídeo",
    "up.goodsSku.stock": "Inventario",
    "up.goodsSku.price": "Precio",
    "up.goodsSku.amount": "Piezas",
    "up.goodsSku.choosed": "Seleccionado",
    "up.goodsSku.buyAmount": "Cantidad"
  };
  const fr = {
    "up.common.cancel": "Annuler",
    "up.common.confirm": "Confirmer",
    "up.common.start": "Démarrer",
    "up.common.end": "Terminer",
    "up.common.stop": "Arrêter",
    "up.common.copy": "Copier",
    "up.common.none": "Aucun",
    "up.common.tip": "Conseil",
    "up.common.success": "Succès",
    "up.common.fail": "Échec",
    "up.common.close": "Fermer",
    "up.common.preview": "Aperçu",
    "up.common.re-select": "Resélectionner",
    "up.common.rotate": "Rotation",
    "up.common.pleaseChoose": "Veuillez choisir",
    "up.common.loading": "Chargement",
    "up.common.loading2": "Chargement en cours",
    "up.common.inOperation": "En cours d'opération",
    "up.common.settings": "Paramètres",
    "up.common.retry": "Réessayer",
    "up.common.search": "Rechercher",
    "up.common.more": "Plus",
    "up.common.video": "Vidéo",
    "up.common.file": "Fichier",
    "up.week.one": "Lun",
    "up.week.two": "Mar",
    "up.week.three": "Mer",
    "up.week.four": "Jeu",
    "up.week.five": "Ven",
    "up.week.six": "Sam",
    "up.week.seven": "Dim",
    "up.barcode.error": "Échec de génération du code-barres",
    "up.calendar.chooseDates": "Sélection de dates",
    "up.calendar.disabled": "Cette date est désactivée",
    "up.calendar.daysExceed": "Le nombre de jours sélectionnés ne peut pas dépasser {days} jours",
    "up.cityLocate.locateCity": "Localiser la ville",
    "up.cityLocate.fail": "Échec de localisation, veuillez cliquer pour réessayer.",
    "up.cityLocate.locating": "Localisation en cours",
    "up.code.send": "Obtenir le code de vérification",
    "up.code.resendAfter": "Renvoyer dans X secondes",
    "up.code.resend": "Renvoyer",
    "up.cropper.emptyWidhtOrHeight": "La largeur ou la hauteur de recadrage n'est pas définie",
    "up.empty.car": "Panier vide",
    "up.empty.page": "Page introuvable",
    "up.empty.search": "Aucun résultat de recherche",
    "up.empty.address": "Aucune adresse de livraison",
    "up.empty.wifi": "Aucun Wi-Fi",
    "up.empty.order": "Commande vide",
    "up.empty.coupon": "Aucun coupon",
    "up.empty.favor": "Aucun favori",
    "up.empty.permission": "Aucune autorisation",
    "up.empty.history": "Aucun historique",
    "up.empty.news": "Aucune actualité",
    "up.empty.message": "Liste de messages vide",
    "up.empty.list": "Liste vide",
    "up.empty.data": "Données vides",
    "up.empty.comment": "Aucun commentaire",
    "up.link.copyed": "Lien copié, veuillez ouvrir dans le navigateur",
    "up.loadmoe.loadmore": "Charger plus",
    "up.loadmoe.nomore": "Plus de contenu",
    "up.noNetwork.text": "Oups, le signal réseau est perdu",
    "up.noNetwork.pleaseCheck": "Veuillez vérifier le réseau, ou aller à",
    "up.noNetwork.connect": "Réseau connecté",
    "up.noNetwork.disconnect": "Aucune connexion réseau",
    "up.pagination.previous": "Page précédente",
    "up.pagination.next": "Page suivante",
    "up.pullRefresh.pull": "Tirer pour actualiser",
    "up.pullRefresh.release": "Relâcher pour actualiser",
    "up.pullRefresh.refreshing": "Actualisation en cours",
    "up.readMore.expand": "Développer pour lire la suite",
    "up.readMore.fold": "Réduire",
    "up.search.placeholder": "Veuillez saisir un mot-clé",
    "up.signature.penSize": "Taille du trait",
    "up.signature.penColor": "Couleur du trait",
    "up.upload.sizeExceed": "Dépassement de la limite de taille",
    "up.upload.uploading": "Téléchargement en cours",
    "up.upload.previewImageFail": "Échec de l'aperçu de l'image",
    "up.upload.previewVideoFail": "Échec de l'aperçu de la vidéo",
    "up.goodsSku.stock": "Stock",
    "up.goodsSku.price": "Prix",
    "up.goodsSku.amount": "Pièces",
    "up.goodsSku.choosed": "Sélectionné",
    "up.goodsSku.buyAmount": "Quantité"
  };
  const de = {
    "up.common.cancel": "Abbrechen",
    "up.common.confirm": "Bestätigen",
    "up.common.start": "Start",
    "up.common.end": "Ende",
    "up.common.stop": "Stopp",
    "up.common.copy": "Kopieren",
    "up.common.none": "Keine",
    "up.common.tip": "Hinweis",
    "up.common.success": "Erfolg",
    "up.common.fail": "Fehlgeschlagen",
    "up.common.close": "Schließen",
    "up.common.preview": "Vorschau",
    "up.common.re-select": "Erneut auswählen",
    "up.common.rotate": "Drehen",
    "up.common.pleaseChoose": "Bitte wählen",
    "up.common.loading": "Laden",
    "up.common.loading2": "Wird geladen",
    "up.common.inOperation": "In Bearbeitung",
    "up.common.settings": "Einstellungen",
    "up.common.retry": "Wiederholen",
    "up.common.search": "Suchen",
    "up.common.more": "Mehr",
    "up.common.video": "Video",
    "up.common.file": "Datei",
    "up.week.one": "Mo",
    "up.week.two": "Di",
    "up.week.three": "Mi",
    "up.week.four": "Do",
    "up.week.five": "Fr",
    "up.week.six": "Sa",
    "up.week.seven": "So",
    "up.barcode.error": "Barcode-Generierung fehlgeschlagen",
    "up.calendar.chooseDates": "Datumsauswahl",
    "up.calendar.disabled": "Dieses Datum ist deaktiviert",
    "up.calendar.daysExceed": "Die Anzahl der ausgewählten Tage darf {days} Tage nicht überschreiten",
    "up.cityLocate.locateCity": "Stadt lokalisieren",
    "up.cityLocate.fail": "Lokalisierung fehlgeschlagen, bitte klicken Sie zum Wiederholen.",
    "up.cityLocate.locating": "Lokalisierung läuft",
    "up.code.send": "Bestätigungscode erhalten",
    "up.code.resendAfter": "Erneut senden in X Sekunden",
    "up.code.resend": "Erneut senden",
    "up.cropper.emptyWidhtOrHeight": "Breite oder Höhe des Zuschneidebereichs nicht festgelegt",
    "up.empty.car": "Warenkorb ist leer",
    "up.empty.page": "Seite existiert nicht",
    "up.empty.search": "Keine Suchergebnisse",
    "up.empty.address": "Keine Lieferadresse",
    "up.empty.wifi": "Kein WLAN",
    "up.empty.order": "Bestellungen sind leer",
    "up.empty.coupon": "Keine Gutscheine",
    "up.empty.favor": "Keine Favoriten",
    "up.empty.permission": "Keine Berechtigung",
    "up.empty.history": "Kein Verlauf",
    "up.empty.news": "Keine Nachrichtenliste",
    "up.empty.message": "Nachrichtenliste ist leer",
    "up.empty.list": "Liste ist leer",
    "up.empty.data": "Daten sind leer",
    "up.empty.comment": "Keine Kommentare",
    "up.link.copyed": "Link kopiert, bitte im Browser öffnen",
    "up.loadmoe.loadmore": "Mehr laden",
    "up.loadmoe.nomore": "Keine weiteren Daten",
    "up.noNetwork.text": "Ups, Netzwerksignal verloren",
    "up.noNetwork.pleaseCheck": "Bitte überprüfen Sie das Netzwerk oder gehen Sie zu",
    "up.noNetwork.connect": "Netzwerk verbunden",
    "up.noNetwork.disconnect": "Keine Netzwerkverbindung",
    "up.pagination.previous": "Vorherige Seite",
    "up.pagination.next": "Nächste Seite",
    "up.pullRefresh.pull": "Zum Aktualisieren nach unten ziehen",
    "up.pullRefresh.release": "Loslassen zum Aktualisieren",
    "up.pullRefresh.refreshing": "Aktualisierung läuft",
    "up.readMore.expand": "Erweitern zum vollständigen Lesen",
    "up.readMore.fold": "Einklappen",
    "up.search.placeholder": "Bitte Schlüsselwort eingeben",
    "up.signature.penSize": "Strichstärke",
    "up.signature.penColor": "Strichfarbe",
    "up.upload.sizeExceed": "Größenbegrenzung überschritten",
    "up.upload.uploading": "Upload läuft",
    "up.upload.previewImageFail": "Bildvorschau fehlgeschlagen",
    "up.upload.previewVideoFail": "Videovorschau fehlgeschlagen",
    "up.goodsSku.stock": "Lagerbestand",
    "up.goodsSku.price": "Preis",
    "up.goodsSku.amount": "Stück",
    "up.goodsSku.choosed": "Ausgewählt",
    "up.goodsSku.buyAmount": "Anzahl"
  };
  const ko = {
    "up.common.cancel": "취소",
    "up.common.confirm": "확인",
    "up.common.start": "시작",
    "up.common.end": "종료",
    "up.common.stop": "정지",
    "up.common.copy": "복사",
    "up.common.none": "없음",
    "up.common.tip": "팁",
    "up.common.success": "성공",
    "up.common.fail": "실패",
    "up.common.close": "닫기",
    "up.common.preview": "미리보기",
    "up.common.re-select": "재선택",
    "up.common.rotate": "회전",
    "up.common.pleaseChoose": "선택해주세요",
    "up.common.loading": "로딩중",
    "up.common.loading2": "로딩중",
    "up.common.inOperation": "작업중",
    "up.common.settings": "설정",
    "up.common.retry": "재시도",
    "up.common.search": "검색",
    "up.common.more": "더보기",
    "up.common.video": "비디오",
    "up.common.file": "파일",
    "up.week.one": "월",
    "up.week.two": "화",
    "up.week.three": "수",
    "up.week.four": "목",
    "up.week.five": "금",
    "up.week.six": "토",
    "up.week.seven": "일",
    "up.barcode.error": "바코드 생성 실패",
    "up.calendar.chooseDates": "날짜 선택",
    "up.calendar.disabled": "해당 날짜는 사용할 수 없습니다",
    "up.calendar.daysExceed": "선택한 날짜 수가 {days}일을 초과할 수 없습니다",
    "up.cityLocate.locateCity": "도시 위치 찾기",
    "up.cityLocate.fail": "위치 찾기 실패, 다시 시도하려면 클릭하세요.",
    "up.cityLocate.locating": "위치 찾는 중",
    "up.code.send": "인증코드 받기",
    "up.code.resendAfter": "X초 후 재전송",
    "up.code.resend": "재전송",
    "up.cropper.emptyWidhtOrHeight": "자르기 영역의 너비 또는 높이가 설정되지 않았습니다",
    "up.empty.car": "장바구니가 비어 있습니다",
    "up.empty.page": "페이지가 존재하지 않습니다",
    "up.empty.search": "검색 결과가 없습니다",
    "up.empty.address": "배송 주소가 없습니다",
    "up.empty.wifi": "Wi-Fi가 없습니다",
    "up.empty.order": "주문이 없습니다",
    "up.empty.coupon": "쿠폰이 없습니다",
    "up.empty.favor": "즐겨찾기가 없습니다",
    "up.empty.permission": "권한이 없습니다",
    "up.empty.history": "기록이 없습니다",
    "up.empty.news": "뉴스가 없습니다",
    "up.empty.message": "메시지가 없습니다",
    "up.empty.list": "목록이 비어 있습니다",
    "up.empty.data": "데이터가 없습니다",
    "up.empty.comment": "댓글이 없습니다",
    "up.link.copyed": "링크가 복사되었습니다. 브라우저에서 열어주세요",
    "up.loadmoe.loadmore": "더 불러오기",
    "up.loadmoe.nomore": "더 이상 데이터가 없습니다",
    "up.noNetwork.text": "네트워크 신호가 없습니다",
    "up.noNetwork.pleaseCheck": "네트워크를 확인하거나 이동하세요",
    "up.noNetwork.connect": "네트워크 연결됨",
    "up.noNetwork.disconnect": "네트워크 연결 끊김",
    "up.pagination.previous": "이전 페이지",
    "up.pagination.next": "다음 페이지",
    "up.pullRefresh.pull": "당겨서 새로고침",
    "up.pullRefresh.release": "놓아서 새로고침",
    "up.pullRefresh.refreshing": "새로고침 중",
    "up.readMore.expand": "펼쳐서 전체 보기",
    "up.readMore.fold": "접기",
    "up.search.placeholder": "키워드를 입력하세요",
    "up.signature.penSize": "선 굵기",
    "up.signature.penColor": "선 색상",
    "up.upload.sizeExceed": "용량 제한 초과",
    "up.upload.uploading": "업로드 중",
    "up.upload.previewImageFail": "이미지 미리보기 실패",
    "up.upload.previewVideoFail": "비디오 미리보기 실패",
    "up.goodsSku.stock": "재고",
    "up.goodsSku.price": "가격",
    "up.goodsSku.amount": "개",
    "up.goodsSku.choosed": "선택됨",
    "up.goodsSku.buyAmount": "구매 수량"
  };
  const ja = {
    "up.common.cancel": "キャンセル",
    "up.common.confirm": "確認",
    "up.common.start": "開始",
    "up.common.end": "終了",
    "up.common.stop": "停止",
    "up.common.copy": "コピー",
    "up.common.none": "なし",
    "up.common.tip": "ヒント",
    "up.common.success": "成功",
    "up.common.fail": "失敗",
    "up.common.close": "閉じる",
    "up.common.preview": "プレビュー",
    "up.common.re-select": "再選択",
    "up.common.rotate": "回転",
    "up.common.pleaseChoose": "選択してください",
    "up.common.loading": "読み込み中",
    "up.common.loading2": "読み込み中",
    "up.common.inOperation": "操作中",
    "up.common.settings": "設定",
    "up.common.retry": "再試行",
    "up.common.search": "検索",
    "up.common.more": "もっと見る",
    "up.common.video": "ビデオ",
    "up.common.file": "ファイル",
    "up.week.one": "月",
    "up.week.two": "火",
    "up.week.three": "水",
    "up.week.four": "木",
    "up.week.five": "金",
    "up.week.six": "土",
    "up.week.seven": "日",
    "up.barcode.error": "バーコードの生成に失敗しました",
    "up.calendar.chooseDates": "日付選択",
    "up.calendar.disabled": "この日付は無効です",
    "up.calendar.daysExceed": "選択日数は{days}日を超えることはできません",
    "up.cityLocate.locateCity": "都市の位置を特定",
    "up.cityLocate.fail": "位置特定に失敗しました。再試行するにはクリックしてください。",
    "up.cityLocate.locating": "位置特定中",
    "up.code.send": "認証コードを取得",
    "up.code.resendAfter": "X秒後に再送信",
    "up.code.resend": "再送信",
    "up.cropper.emptyWidhtOrHeight": "切り抜き枠の幅または高さが設定されていません",
    "up.empty.car": "ショッピングカートは空です",
    "up.empty.page": "ページが存在しません",
    "up.empty.search": "検索結果がありません",
    "up.empty.address": "配送先住所がありません",
    "up.empty.wifi": "Wi-Fiがありません",
    "up.empty.order": "注文がありません",
    "up.empty.coupon": "クーポンがありません",
    "up.empty.favor": "お気に入りがありません",
    "up.empty.permission": "権限がありません",
    "up.empty.history": "履歴がありません",
    "up.empty.news": "ニュースがありません",
    "up.empty.message": "メッセージがありません",
    "up.empty.list": "リストが空です",
    "up.empty.data": "データがありません",
    "up.empty.comment": "コメントがありません",
    "up.link.copyed": "リンクがコピーされました。ブラウザで開いてください",
    "up.loadmoe.loadmore": "さらに読み込む",
    "up.loadmoe.nomore": "これ以上データがありません",
    "up.noNetwork.text": "ネットワーク信号が失われました",
    "up.noNetwork.pleaseCheck": "ネットワークを確認するか、移動してください",
    "up.noNetwork.connect": "ネットワーク接続済み",
    "up.noNetwork.disconnect": "ネットワーク未接続",
    "up.pagination.previous": "前へ",
    "up.pagination.next": "次へ",
    "up.pullRefresh.pull": "引き下げて更新",
    "up.pullRefresh.release": "指を離して更新",
    "up.pullRefresh.refreshing": "更新中",
    "up.readMore.expand": "全文表示",
    "up.readMore.fold": "折りたたむ",
    "up.search.placeholder": "キーワードを入力してください",
    "up.signature.penSize": "線の太さ",
    "up.signature.penColor": "線の色",
    "up.upload.sizeExceed": "サイズ制限を超えています",
    "up.upload.uploading": "アップロード中",
    "up.upload.previewImageFail": "画像プレビュー失敗",
    "up.upload.previewVideoFail": "ビデオプレビュー失敗",
    "up.goodsSku.stock": "在庫",
    "up.goodsSku.price": "価格",
    "up.goodsSku.amount": "個",
    "up.goodsSku.choosed": "選択済み",
    "up.goodsSku.buyAmount": "購入数量"
  };
  const ru = {
    "up.common.cancel": "Отмена",
    "up.common.confirm": "Подтвердить",
    "up.common.start": "Начало",
    "up.common.end": "Конец",
    "up.common.stop": "Стоп",
    "up.common.copy": "Копировать",
    "up.common.none": "Нет",
    "up.common.tip": "Подсказка",
    "up.common.success": "Успех",
    "up.common.fail": "Ошибка",
    "up.common.close": "Закрыть",
    "up.common.preview": "Предпросмотр",
    "up.common.re-select": "Выбрать снова",
    "up.common.rotate": "Повернуть",
    "up.common.pleaseChoose": "Пожалуйста, выберите",
    "up.common.loading": "Загрузка",
    "up.common.loading2": "Загружается",
    "up.common.inOperation": "В процессе",
    "up.common.settings": "Настройки",
    "up.common.retry": "Повторить",
    "up.common.search": "Поиск",
    "up.common.more": "Больше",
    "up.common.video": "Видео",
    "up.common.file": "Файл",
    "up.week.one": "Пн",
    "up.week.two": "Вт",
    "up.week.three": "Ср",
    "up.week.four": "Чт",
    "up.week.five": "Пт",
    "up.week.six": "Сб",
    "up.week.seven": "Вс",
    "up.barcode.error": "Ошибка генерации штрихкода",
    "up.calendar.chooseDates": "Выбор даты",
    "up.calendar.disabled": "Эта дата отключена",
    "up.calendar.daysExceed": "Количество выбранных дней не может превышать {days} дней",
    "up.cityLocate.locateCity": "Определение города",
    "up.cityLocate.fail": "Ошибка определения местоположения, нажмите для повтора.",
    "up.cityLocate.locating": "Определение местоположения",
    "up.code.send": "Получить код подтверждения",
    "up.code.resendAfter": "Повторная отправка через X секунд",
    "up.code.resend": "Отправить снова",
    "up.cropper.emptyWidhtOrHeight": "Ширина или высота области обрезки не задана",
    "up.empty.car": "Корзина пуста",
    "up.empty.page": "Страница не существует",
    "up.empty.search": "Нет результатов поиска",
    "up.empty.address": "Нет адреса доставки",
    "up.empty.wifi": "Нет Wi-Fi",
    "up.empty.order": "Заказы отсутствуют",
    "up.empty.coupon": "Нет купонов",
    "up.empty.favor": "Нет избранного",
    "up.empty.permission": "Нет разрешения",
    "up.empty.history": "Нет истории",
    "up.empty.news": "Нет новостей",
    "up.empty.message": "Список сообщений пуст",
    "up.empty.list": "Список пуст",
    "up.empty.data": "Нет данных",
    "up.empty.comment": "Нет комментариев",
    "up.link.copyed": "Ссылка скопирована, откройте в браузере",
    "up.loadmoe.loadmore": "Загрузить еще",
    "up.loadmoe.nomore": "Больше нет данных",
    "up.noNetwork.text": "Ой, потеряно сетевое соединение",
    "up.noNetwork.pleaseCheck": "Проверьте сеть или перейдите к",
    "up.noNetwork.connect": "Сеть подключена",
    "up.noNetwork.disconnect": "Нет сетевого подключения",
    "up.pagination.previous": "Предыдущая страница",
    "up.pagination.next": "Следующая страница",
    "up.pullRefresh.pull": "Потяните вниз для обновления",
    "up.pullRefresh.release": "Отпустите для обновления",
    "up.pullRefresh.refreshing": "Обновление",
    "up.readMore.expand": "Развернуть для полного чтения",
    "up.readMore.fold": "Свернуть",
    "up.search.placeholder": "Введите ключевое слово",
    "up.signature.penSize": "Размер штриха",
    "up.signature.penColor": "Цвет штриха",
    "up.upload.sizeExceed": "Превышен лимит размера",
    "up.upload.uploading": "Загрузка",
    "up.upload.previewImageFail": "Ошибка предпросмотра изображения",
    "up.upload.previewVideoFail": "Ошибка предпросмотра видео",
    "up.goodsSku.stock": "Запас",
    "up.goodsSku.price": "Цена",
    "up.goodsSku.amount": "Штук",
    "up.goodsSku.choosed": "Выбрано",
    "up.goodsSku.buyAmount": "Количество"
  };
  let settings = {
    lang: uni.getLocale(),
    locales: {
      en,
      es,
      fr,
      de,
      ko,
      ja,
      ru,
      "zh-Hant": zhHant,
      "zh-Hans": zhHans
    }
  };
  uni.onLocaleChange((locale) => {
    settings.lang = locale;
  });
  function t(value, params = {}) {
    if (value) {
      let lang = settings.lang;
      if (!settings.locales[settings.lang]) {
        lang = "zh-Hans";
      }
      let result = settings.locales[lang][value] || value;
      Object.keys(params).forEach((key) => {
        const reg = new RegExp(`{${key}}`, "g");
        result = result.replace(reg, params[key]);
      });
      return result;
    } else {
      return value;
    }
  }
  const Calendar = {
    // calendar 组件
    calendar: {
      title: t("up.calendar.chooseDates"),
      showTitle: true,
      showSubtitle: true,
      mode: "single",
      startText: t("up.common.start"),
      endText: t("up.common.end"),
      customList: [],
      color: "#3c9cff",
      minDate: 0,
      maxDate: 0,
      defaultDate: null,
      maxCount: Number.MAX_SAFE_INTEGER,
      // Infinity
      rowHeight: 56,
      formatter: null,
      showLunar: false,
      showMark: true,
      confirmText: t("up.common.confirm"),
      confirmDisabledText: t("up.common.confirm"),
      show: false,
      closeOnClickOverlay: false,
      readonly: false,
      showConfirm: true,
      maxRange: Number.MAX_SAFE_INTEGER,
      // Infinity
      rangePrompt: "",
      showRangePrompt: true,
      allowSameDay: false,
      round: 0,
      monthNum: 3,
      weekText: [t("up.week.one"), t("up.week.two"), t("up.week.three"), t("up.week.four"), t("up.week.five"), t("up.week.six"), t("up.week.seven")],
      forbidDays: [],
      forbidDaysToast: t("up.calendar.disabled"),
      monthFormat: "",
      pageInline: false
    }
  };
  const CarKeyboard = {
    // 车牌号键盘
    carKeyboard: {
      random: false
    }
  };
  const Card = {
    // card组件的props
    card: {
      full: false,
      title: "",
      titleColor: "#303133",
      titleSize: "15px",
      subTitle: "",
      subTitleColor: "#909399",
      subTitleSize: "13px",
      border: true,
      index: "",
      margin: "15px",
      borderRadius: "8px",
      headStyle: {},
      bodyStyle: {},
      footStyle: {},
      headBorderBottom: true,
      footBorderTop: true,
      thumb: "",
      thumbWidth: "30px",
      thumbCircle: false,
      padding: "15px",
      paddingHead: "",
      paddingBody: "",
      paddingFoot: "",
      showHead: true,
      showFoot: true,
      boxShadow: "none"
    }
  };
  const Cell = {
    // cell组件的props
    cell: {
      customClass: "",
      title: "",
      label: "",
      value: "",
      icon: "",
      disabled: false,
      border: true,
      center: false,
      url: "",
      linkType: "navigateTo",
      clickable: false,
      isLink: false,
      required: false,
      arrowDirection: "",
      iconStyle: {},
      rightIconStyle: {},
      rightIcon: "arrow-right",
      titleStyle: {},
      size: "",
      stop: true,
      name: ""
    }
  };
  const CellGroup = {
    // cell-group组件的props
    cellGroup: {
      title: "",
      border: true,
      customStyle: {}
    }
  };
  const Checkbox = {
    // checkbox组件
    checkbox: {
      name: "",
      shape: "",
      size: "",
      checkbox: false,
      disabled: "",
      activeColor: "",
      inactiveColor: "",
      iconSize: "",
      iconColor: "",
      label: "",
      labelSize: "",
      labelColor: "",
      labelDisabled: ""
    }
  };
  const CheckboxGroup = {
    // checkbox-group组件
    checkboxGroup: {
      name: "",
      value: [],
      shape: "square",
      disabled: false,
      activeColor: "#2979ff",
      inactiveColor: "#c8c9cc",
      size: 18,
      placement: "row",
      labelSize: 14,
      labelColor: "#303133",
      labelDisabled: false,
      iconColor: "#ffffff",
      iconSize: 12,
      iconPlacement: "left",
      borderBottom: false
    }
  };
  const CircleProgress = {
    // circleProgress 组件
    circleProgress: {
      percentage: 30
    }
  };
  const Code = {
    // code 组件
    code: {
      seconds: 60,
      startText: t("up.code.send"),
      changeText: t("up.code.resendAfter"),
      endText: t("up.code.resend"),
      keepRunning: false,
      uniqueKey: ""
    }
  };
  const CodeInput = {
    // codeInput 组件
    codeInput: {
      adjustPosition: true,
      maxlength: 6,
      dot: false,
      mode: "box",
      hairline: false,
      space: 10,
      value: "",
      focus: false,
      bold: false,
      color: "#606266",
      fontSize: 18,
      size: 35,
      disabledKeyboard: false,
      borderColor: "#c9cacc",
      disabledDot: true
    }
  };
  const Col = {
    // col 组件
    col: {
      span: 12,
      offset: 0,
      justify: "start",
      align: "stretch",
      textAlign: "left"
    }
  };
  const Collapse = {
    // collapse 组件
    collapse: {
      value: null,
      accordion: false,
      border: true
    }
  };
  const CollapseItem = {
    // collapseItem 组件
    collapseItem: {
      title: "",
      value: "",
      label: "",
      disabled: false,
      isLink: true,
      clickable: true,
      border: true,
      align: "left",
      name: "",
      icon: "",
      duration: 300,
      showRight: true,
      titleStyle: {},
      iconStyle: {},
      rightIconStyle: {},
      cellCustomStyle: {},
      cellCustomClass: ""
    }
  };
  const ColumnNotice = {
    // columnNotice 组件
    columnNotice: {
      text: "",
      icon: "volume",
      mode: "",
      color: "#f9ae3d",
      bgColor: "#fdf6ec",
      fontSize: 14,
      speed: 80,
      step: false,
      duration: 1500,
      disableTouch: true,
      justifyContent: "flex-start"
    }
  };
  const CountDown = {
    // u-count-down 计时器组件
    countDown: {
      time: 0,
      format: "HH:mm:ss",
      autoStart: true,
      millisecond: false
    }
  };
  const CountTo = {
    // countTo 组件
    countTo: {
      startVal: 0,
      endVal: 0,
      duration: 2e3,
      autoplay: true,
      decimals: 0,
      useEasing: true,
      decimal: ".",
      color: "#606266",
      fontSize: 22,
      bold: false,
      separator: ""
    }
  };
  const DatetimePicker = {
    // datetimePicker 组件
    datetimePicker: {
      show: false,
      popupMode: "bottom",
      showToolbar: true,
      value: "",
      title: "",
      mode: "datetime",
      maxDate: new Date((/* @__PURE__ */ new Date()).getFullYear() + 10, 0, 1).getTime(),
      minDate: new Date((/* @__PURE__ */ new Date()).getFullYear() - 10, 0, 1).getTime(),
      minHour: 0,
      maxHour: 23,
      minMinute: 0,
      maxMinute: 59,
      filter: null,
      formatter: null,
      loading: false,
      itemHeight: 44,
      cancelText: t("up.common.cancel"),
      confirmText: t("up.common.confirm"),
      cancelColor: "#909193",
      confirmColor: "#3c9cff",
      visibleItemCount: 5,
      closeOnClickOverlay: false,
      defaultIndex: [],
      inputBorder: "surround",
      disabled: false,
      disabledColor: "",
      placeholder: t("up.common.pleaseChoose"),
      inputProps: {},
      pageInline: false
    }
  };
  const Divider = {
    // divider组件
    divider: {
      dashed: false,
      hairline: true,
      dot: false,
      textPosition: "center",
      text: "",
      textSize: 14,
      textColor: "#909399",
      lineColor: "#dcdfe6"
    }
  };
  const Empty = {
    // empty组件
    empty: {
      icon: "",
      text: "",
      textColor: "#c0c4cc",
      textSize: 14,
      iconColor: "#c0c4cc",
      iconSize: 90,
      mode: "data",
      width: 160,
      height: 160,
      show: true,
      marginTop: 0
    }
  };
  const Form = {
    // form 组件
    form: {
      model: {},
      rules: {},
      errorType: "message",
      borderBottom: true,
      labelPosition: "left",
      labelWidth: 45,
      labelAlign: "left",
      labelStyle: {}
    }
  };
  const GormItem = {
    // formItem 组件
    formItem: {
      label: "",
      prop: "",
      rules: [],
      borderBottom: "",
      labelPosition: "",
      labelWidth: "",
      rightIcon: "",
      leftIcon: "",
      required: false,
      leftIconStyle: ""
    }
  };
  const Gap = {
    // gap组件
    gap: {
      bgColor: "transparent",
      height: 20,
      marginTop: 0,
      marginBottom: 0,
      customStyle: {}
    }
  };
  const Grid = {
    // grid组件
    grid: {
      col: 3,
      border: false,
      align: "left"
    }
  };
  const GridItem = {
    // grid-item组件
    gridItem: {
      name: null,
      bgColor: "transparent"
    }
  };
  const {
    color: color$2
  } = config$1;
  const Icon = {
    // icon组件
    icon: {
      name: "",
      color: color$2["u-content-color"],
      size: "16px",
      bold: false,
      index: "",
      hoverClass: "",
      customPrefix: "uicon",
      label: "",
      labelPos: "right",
      labelSize: "15px",
      labelColor: color$2["u-content-color"],
      space: "3px",
      imgMode: "",
      width: "",
      height: "",
      top: 0,
      stop: false
    }
  };
  const Image$1 = {
    // image组件
    image: {
      src: "",
      mode: "aspectFill",
      width: "300",
      height: "225",
      shape: "square",
      radius: 0,
      lazyLoad: true,
      showMenuByLongpress: true,
      loadingIcon: "photo",
      errorIcon: "error-circle",
      showLoading: true,
      showError: true,
      fade: true,
      webp: false,
      duration: 500,
      bgColor: "#f3f4f6"
    }
  };
  const IndexAnchor = {
    // indexAnchor 组件
    indexAnchor: {
      text: "",
      color: "#606266",
      size: 14,
      bgColor: "#f1f1f1",
      height: 32
    }
  };
  const IndexList = {
    // indexList 组件
    indexList: {
      inactiveColor: "#606266",
      activeColor: "#5677fc",
      indexList: [],
      sticky: true,
      customNavHeight: 0,
      safeBottomFix: false,
      itemMargin: "0rpx"
    }
  };
  const Input = {
    // index 组件
    input: {
      value: "",
      type: "text",
      fixed: false,
      disabled: false,
      disabledColor: "#f5f7fa",
      clearable: false,
      password: false,
      maxlength: 140,
      placeholder: null,
      placeholderClass: "input-placeholder",
      placeholderStyle: "color: #c0c4cc",
      showWordLimit: false,
      confirmType: "done",
      confirmHold: false,
      holdKeyboard: false,
      focus: false,
      autoBlur: false,
      disableDefaultPadding: false,
      cursor: -1,
      cursorSpacing: 30,
      selectionStart: -1,
      selectionEnd: -1,
      adjustPosition: true,
      inputAlign: "left",
      fontSize: "15px",
      color: "#303133",
      prefixIcon: "",
      prefixIconStyle: "",
      suffixIcon: "",
      suffixIconStyle: "",
      border: "surround",
      readonly: false,
      shape: "square",
      formatter: null,
      cursorColor: "",
      passwordVisibilityToggle: true
    }
  };
  const Keyboard = {
    // 键盘组件
    keyboard: {
      mode: "number",
      dotDisabled: false,
      tooltip: true,
      showTips: true,
      tips: "",
      showCancel: true,
      showConfirm: true,
      random: false,
      safeAreaInsetBottom: true,
      closeOnClickOverlay: true,
      show: false,
      overlay: true,
      zIndex: 10075,
      cancelText: t("up.common.cancel"),
      confirmText: t("up.common.confirm"),
      autoChange: false
    }
  };
  const Line = {
    // line组件
    line: {
      color: "#d6d7d9",
      length: "100%",
      direction: "row",
      hairline: true,
      margin: 0,
      dashed: false
    }
  };
  const LineProgress = {
    // lineProgress 组件
    lineProgress: {
      activeColor: "#19be6b",
      inactiveColor: "#ececec",
      percentage: 0,
      showText: true,
      height: 12,
      fromRight: false
    }
  };
  const {
    color: color$1
  } = config$1;
  const Link = {
    // link超链接组件props参数
    link: {
      color: color$1["u-primary"],
      fontSize: 15,
      underLine: false,
      href: "",
      mpTips: t("up.link.copyed"),
      lineColor: "",
      text: ""
    }
  };
  const List = {
    // list 组件
    list: {
      showScrollbar: false,
      lowerThreshold: 50,
      upperThreshold: 0,
      scrollTop: 0,
      offsetAccuracy: 10,
      enableFlex: false,
      pagingEnabled: false,
      scrollable: true,
      scrollIntoView: "",
      scrollWithAnimation: false,
      enableBackToTop: false,
      height: 0,
      width: 0,
      preLoadScreen: 1
    }
  };
  const ListItem = {
    // listItem 组件
    listItem: {
      anchor: ""
    }
  };
  const {
    color
  } = config$1;
  const LoadingIcon = {
    // loading-icon加载中图标组件
    loadingIcon: {
      show: true,
      color: color["u-tips-color"],
      textColor: color["u-tips-color"],
      vertical: false,
      mode: "spinner",
      size: 24,
      textSize: 15,
      text: "",
      timingFunction: "ease-in-out",
      duration: 1200,
      inactiveColor: ""
    }
  };
  const LoadingPage = {
    // loading-page组件
    loadingPage: {
      loadingText: t("up.common.loading2"),
      image: "",
      loadingMode: "circle",
      loading: false,
      bgColor: "#ffffff",
      color: "#C8C8C8",
      fontSize: 19,
      iconSize: 28,
      loadingColor: "#C8C8C8",
      zIndex: 10
    }
  };
  const Loadmore = {
    // loadmore 组件
    loadmore: {
      status: "loadmore",
      bgColor: "transparent",
      icon: true,
      fontSize: 14,
      iconSize: 17,
      color: "#606266",
      loadingIcon: "spinner",
      loadmoreText: t("up.loadmoe.loadmore"),
      loadingText: t("up.common.loading2") + "...",
      nomoreText: t("up.loadmoe.nomore"),
      isDot: false,
      iconColor: "#b7b7b7",
      marginTop: 10,
      marginBottom: 10,
      height: "auto",
      line: false,
      lineColor: "#E6E8EB",
      dashed: false
    }
  };
  const Modal = {
    // modal 组件
    modal: {
      show: false,
      title: "",
      content: "",
      confirmText: t("up.common.confirm"),
      cancelText: t("up.common.cancel"),
      showConfirmButton: true,
      showCancelButton: false,
      confirmColor: "#2979ff",
      cancelColor: "#606266",
      buttonReverse: false,
      zoom: true,
      asyncClose: false,
      closeOnClickOverlay: false,
      negativeTop: 0,
      width: "650rpx",
      confirmButtonShape: "",
      duration: 400,
      contentTextAlign: "left",
      asyncCloseTip: t("up.common.inOperatio") + "...",
      asyncCancelClose: false,
      contentStyle: {}
    }
  };
  const Navbar = {
    // navbar 组件
    navbar: {
      safeAreaInsetTop: true,
      placeholder: false,
      fixed: true,
      border: false,
      leftIcon: "arrow-left",
      leftText: "",
      rightText: "",
      rightIcon: "",
      title: "",
      titleColor: "",
      bgColor: "#ffffff",
      titleWidth: "400rpx",
      height: "44px",
      leftIconSize: 20,
      leftIconColor: color$3.mainColor,
      autoBack: false,
      titleStyle: ""
    }
  };
  const NoNetwork = {
    // noNetwork
    noNetwork: {
      tips: t("up.noNetwork.text"),
      zIndex: "",
      image: "data:image/png;base64,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"
    }
  };
  const NoticeBar = {
    // noticeBar
    noticeBar: {
      text: [],
      direction: "row",
      step: false,
      icon: "volume",
      mode: "",
      color: "#f9ae3d",
      bgColor: "#fdf6ec",
      speed: 80,
      fontSize: 14,
      duration: 2e3,
      disableTouch: true,
      url: "",
      linkType: "navigateTo",
      justifyContent: "flex-start"
    }
  };
  const Notify = {
    // notify组件
    notify: {
      top: 0,
      type: "primary",
      color: "#ffffff",
      bgColor: "",
      message: "",
      duration: 3e3,
      fontSize: 15,
      safeAreaInsetTop: false
    }
  };
  const NumberBox = {
    // 步进器组件
    numberBox: {
      name: "",
      value: 0,
      min: 1,
      max: Number.MAX_SAFE_INTEGER,
      step: 1,
      integer: false,
      disabled: false,
      disabledInput: false,
      asyncChange: false,
      inputWidth: 35,
      showMinus: true,
      showPlus: true,
      decimalLength: null,
      longPress: true,
      color: "#323233",
      buttonWidth: 30,
      buttonSize: 30,
      buttonRadius: "0px",
      bgColor: "#EBECEE",
      disabledBgColor: "#f7f8fa",
      inputBgColor: "#EBECEE",
      cursorSpacing: 100,
      disableMinus: false,
      disablePlus: false,
      iconStyle: "",
      miniMode: false
    }
  };
  const NumberKeyboard = {
    // 数字键盘
    numberKeyboard: {
      mode: "number",
      dotDisabled: false,
      random: false
    }
  };
  const Overlay = {
    // overlay组件
    overlay: {
      show: false,
      zIndex: 10070,
      duration: 300,
      opacity: 0.5
    }
  };
  const Parse = {
    // parse
    parse: {
      copyLink: true,
      errorImg: "",
      lazyLoad: false,
      loadingImg: "",
      pauseVideo: true,
      previewImg: true,
      setTitle: true,
      showImgMenu: true
    }
  };
  const Picker = {
    // picker
    picker: {
      show: false,
      popupMode: "bottom",
      showToolbar: true,
      title: "",
      columns: [],
      loading: false,
      itemHeight: 44,
      cancelText: t("up.common.cancel"),
      confirmText: t("up.common.confirm"),
      cancelColor: "#909193",
      confirmColor: "",
      visibleItemCount: 5,
      keyName: "text",
      valueName: "value",
      closeOnClickOverlay: false,
      defaultIndex: [],
      immediateChange: true,
      zIndex: 10076,
      disabled: false,
      disabledColor: "",
      placeholder: t("up.common.pleaseChoose"),
      inputProps: {},
      bgColor: "",
      round: 0,
      duration: 300,
      overlayOpacity: 0.5,
      pageInline: false
    }
  };
  const Popup = {
    // popup组件
    popup: {
      show: false,
      overlay: true,
      mode: "bottom",
      duration: 300,
      closeable: false,
      overlayStyle: {},
      closeOnClickOverlay: true,
      zIndex: 10075,
      safeAreaInsetBottom: true,
      safeAreaInsetTop: false,
      closeIconPos: "top-right",
      round: "20px",
      zoom: true,
      bgColor: "",
      overlayOpacity: 0.5,
      pageInline: false,
      touchable: false,
      minHeight: "200px",
      maxHeight: "600px"
    }
  };
  const Radio = {
    // radio组件
    radio: {
      name: "",
      shape: "",
      disabled: "",
      labelDisabled: "",
      activeColor: "",
      inactiveColor: "",
      iconSize: "",
      labelSize: "",
      label: "",
      labelColor: "",
      size: "",
      iconColor: "",
      placement: ""
    }
  };
  const RadioGroup = {
    // radio-group组件
    radioGroup: {
      value: "",
      disabled: false,
      shape: "circle",
      activeColor: "#2979ff",
      inactiveColor: "#c8c9cc",
      name: "",
      size: 18,
      placement: "row",
      label: "",
      labelColor: "#303133",
      labelSize: 14,
      labelDisabled: false,
      iconColor: "#ffffff",
      iconSize: 12,
      borderBottom: false,
      iconPlacement: "left",
      gap: "10px"
    }
  };
  const Rate = {
    // rate组件
    rate: {
      value: 1,
      count: 5,
      disabled: false,
      size: 18,
      inactiveColor: "#b2b2b2",
      activeColor: "#FA3534",
      gutter: 4,
      minCount: 1,
      allowHalf: false,
      activeIcon: "star-fill",
      inactiveIcon: "star",
      touchable: true
    }
  };
  const ReadMore = {
    // readMore
    readMore: {
      showHeight: 400,
      toggle: false,
      closeText: t("up.readMore.expand"),
      openText: t("up.readMore.fold"),
      color: "#2979ff",
      fontSize: 14,
      textIndent: "2em",
      name: ""
    }
  };
  const Row = {
    // row
    row: {
      gutter: 0,
      justify: "start",
      align: "center"
    }
  };
  const RowNotice = {
    // rowNotice
    rowNotice: {
      text: "",
      icon: "volume",
      mode: "",
      color: "#f9ae3d",
      bgColor: "#fdf6ec",
      fontSize: 14,
      speed: 80
    }
  };
  const ScrollList = {
    // scrollList
    scrollList: {
      indicatorWidth: 50,
      indicatorBarWidth: 20,
      indicator: true,
      indicatorColor: "#f2f2f2",
      indicatorActiveColor: "#3c9cff",
      indicatorStyle: ""
    }
  };
  const Search = {
    // search
    search: {
      shape: "round",
      bgColor: "#f2f2f2",
      placeholder: t("up.search.placeholder"),
      clearabled: true,
      focus: false,
      showAction: true,
      actionStyle: {},
      actionText: t("up.common.search"),
      inputAlign: "left",
      inputStyle: {},
      disabled: false,
      borderColor: "transparent",
      searchIconColor: "#909399",
      searchIconSize: 22,
      color: "#606266",
      placeholderColor: "#909399",
      searchIcon: "search",
      iconPosition: "left",
      margin: "0",
      animation: false,
      value: "",
      maxlength: "-1",
      height: 32,
      label: null
    }
  };
  const Section = {
    // u-section组件
    section: {
      title: "",
      subTitle: t("up.common.more"),
      right: true,
      fontSize: 15,
      bold: true,
      color: "#303133",
      subColor: "#909399",
      showLine: true,
      lineColor: "",
      arrow: true
    }
  };
  const Skeleton = {
    // skeleton
    skeleton: {
      loading: true,
      animate: true,
      rows: 0,
      rowsWidth: "100%",
      rowsHeight: 18,
      title: true,
      titleWidth: "50%",
      titleHeight: 18,
      avatar: false,
      avatarSize: 32,
      avatarShape: "circle"
    }
  };
  const Slider = {
    // slider组件
    slider: {
      value: 0,
      blockSize: 18,
      min: 0,
      max: 100,
      step: 1,
      activeColor: "#2979ff",
      inactiveColor: "#c0c4cc",
      blockColor: "#ffffff",
      showValue: false,
      disabled: false,
      blockStyle: {},
      useNative: false,
      height: "2px",
      innerStyle: {}
    }
  };
  const StatusBar = {
    // statusBar
    statusBar: {
      bgColor: "transparent",
      height: 0
    }
  };
  const Steps = {
    // steps组件
    steps: {
      direction: "row",
      current: 0,
      activeColor: "#3c9cff",
      inactiveColor: "#969799",
      activeIcon: "",
      inactiveIcon: "",
      dot: false
    }
  };
  const StepsItem = {
    // steps-item组件
    stepsItem: {
      title: "",
      desc: "",
      iconSize: 17,
      error: false
    }
  };
  const Sticky = {
    // sticky组件
    sticky: {
      offsetTop: 0,
      customNavHeight: 0,
      disabled: false,
      bgColor: "transparent",
      zIndex: "",
      index: ""
    }
  };
  const Subsection = {
    // subsection组件
    subsection: {
      list: [],
      current: 0,
      activeColor: "#3c9cff",
      inactiveColor: "#303133",
      mode: "button",
      fontSize: 12,
      bold: true,
      bgColor: "#eeeeef",
      keyName: "name",
      activeColorKeyName: "activeColorKey",
      inactiveColorKeyName: "inactiveColorKey",
      disabled: false
    }
  };
  const SwipeAction = {
    // swipe-action组件
    swipeAction: {
      autoClose: true
    }
  };
  const SwipeActionItem = {
    // swipeActionItem 组件
    swipeActionItem: {
      show: false,
      closeOnClick: true,
      name: "",
      disabled: false,
      threshold: 20,
      autoClose: true,
      options: [],
      duration: 300
    }
  };
  const Swiper = {
    // swiper 组件
    swiper: {
      list: [],
      indicator: false,
      indicatorActiveColor: "#FFFFFF",
      indicatorInactiveColor: "rgba(255, 255, 255, 0.35)",
      indicatorStyle: "",
      indicatorMode: "line",
      autoplay: true,
      current: 0,
      currentItemId: "",
      interval: 3e3,
      duration: 300,
      circular: false,
      previousMargin: 0,
      nextMargin: 0,
      acceleration: false,
      displayMultipleItems: 1,
      easingFunction: "default",
      keyName: "url",
      imgMode: "aspectFill",
      height: 130,
      bgColor: "#f3f4f6",
      radius: 4,
      loading: false,
      showTitle: false
    }
  };
  const SwipterIndicator = {
    // swiperIndicator 组件
    swiperIndicator: {
      length: 0,
      current: 0,
      indicatorActiveColor: "",
      indicatorInactiveColor: "",
      indicatorMode: "line"
    }
  };
  const Switch = {
    // switch
    switch: {
      loading: false,
      disabled: false,
      size: 25,
      activeColor: "#2979ff",
      inactiveColor: "#ffffff",
      value: false,
      activeValue: true,
      inactiveValue: false,
      asyncChange: false,
      space: 0
    }
  };
  const Tabbar = {
    // tabbar
    tabbar: {
      value: null,
      safeAreaInsetBottom: true,
      border: true,
      zIndex: 1,
      activeColor: "#1989fa",
      inactiveColor: "#7d7e80",
      fixed: true,
      placeholder: true,
      borderColor: "",
      backgroundColor: ""
    }
  };
  const TabbarItem = {
    //
    tabbarItem: {
      name: null,
      icon: "",
      badge: null,
      dot: false,
      text: "",
      badgeStyle: "top: 6px;right:2px;",
      mode: ""
    }
  };
  const Tabs = {
    //
    tabs: {
      duration: 300,
      list: [],
      lineColor: "",
      activeStyle: {
        color: "#303133"
      },
      inactiveStyle: {
        color: "#606266"
      },
      lineWidth: 20,
      lineHeight: 3,
      lineBgSize: "cover",
      itemStyle: {
        height: "44px"
      },
      scrollable: true,
      current: 0,
      keyName: "name",
      iconStyle: {}
    }
  };
  const Tag = {
    // tag 组件
    tag: {
      type: "primary",
      disabled: false,
      size: "medium",
      shape: "square",
      text: "",
      bgColor: "",
      color: "",
      borderColor: "",
      closeColor: "#C6C7CB",
      name: "",
      plainFill: false,
      plain: false,
      closable: false,
      show: true,
      icon: "",
      iconColor: "",
      textSize: "",
      height: "",
      padding: "",
      borderRadius: "",
      autoBgColor: 0
    }
  };
  const Text = {
    // text 组件
    text: {
      type: "",
      show: true,
      text: "",
      prefixIcon: "",
      suffixIcon: "",
      mode: "",
      href: "",
      format: "",
      call: false,
      openType: "",
      bold: false,
      block: false,
      lines: "",
      color: "#303133",
      size: 15,
      iconStyle: {
        fontSize: "15px"
      },
      decoration: "none",
      margin: 0,
      lineHeight: "",
      align: "left",
      wordWrap: "normal",
      flex1: true
    }
  };
  const Textarea = {
    // textarea 组件
    textarea: {
      value: "",
      placeholder: "",
      placeholderClass: "textarea-placeholder",
      placeholderStyle: "color: #c0c4cc",
      height: 70,
      confirmType: "done",
      disabled: false,
      count: false,
      focus: false,
      autoHeight: false,
      fixed: false,
      cursorSpacing: 0,
      cursor: "",
      showConfirmBar: true,
      selectionStart: -1,
      selectionEnd: -1,
      adjustPosition: true,
      disableDefaultPadding: false,
      holdKeyboard: false,
      maxlength: 140,
      border: "surround",
      formatter: null
    }
  };
  const Toast = {
    // toast组件
    toast: {
      zIndex: 10090,
      loading: false,
      message: "",
      icon: "",
      type: "",
      loadingMode: "",
      show: "",
      overlay: false,
      position: "center",
      params: {},
      duration: 2e3,
      isTab: false,
      url: "",
      callback: null,
      back: false
    }
  };
  const Toolbar = {
    // toolbar 组件
    toolbar: {
      show: true,
      cancelText: t("up.common.cancel"),
      confirmText: t("up.common.confirm"),
      cancelColor: "#909193",
      confirmColor: "",
      title: ""
    }
  };
  const Tooltip = {
    // tooltip 组件
    tooltip: {
      text: "",
      copyText: "",
      size: 14,
      color: "#606266",
      bgColor: "transparent",
      direction: "top",
      zIndex: 10071,
      showCopy: true,
      buttons: [],
      overlay: true,
      showToast: true,
      popupBgColor: "",
      triggerMode: "longpress",
      forcePosition: {}
    }
  };
  const Transition = {
    // transition动画组件的props
    transition: {
      show: false,
      mode: "fade",
      duration: "300",
      timingFunction: "ease-out"
    }
  };
  const Upload = {
    // upload组件
    upload: {
      accept: "image",
      extension: [],
      capture: ["album", "camera"],
      compressed: true,
      camera: "back",
      maxDuration: 60,
      uploadIcon: "camera-fill",
      uploadIconColor: "#D3D4D6",
      useBeforeRead: false,
      previewFullImage: true,
      maxCount: 52,
      disabled: false,
      imageMode: "aspectFill",
      name: "",
      sizeType: ["original", "compressed"],
      multiple: false,
      deletable: true,
      maxSize: Number.MAX_VALUE,
      fileList: [],
      uploadText: "",
      width: 80,
      height: 80,
      previewImage: true,
      autoDelete: false,
      autoUpload: false,
      autoUploadApi: "",
      autoUploadAuthUrl: "",
      autoUploadDriver: "",
      autoUploadHeader: {},
      getVideoThumb: false,
      customAfterAutoUpload: false,
      videoPreviewObjectFit: "cover"
    }
  };
  const props$a = {
    ...ActionSheet,
    ...Album,
    ...Alert,
    ...Avatar,
    ...AvatarGroup,
    ...Backtop,
    ...Badge,
    ...Button,
    ...Calendar,
    ...CarKeyboard,
    ...Card,
    ...Cell,
    ...CellGroup,
    ...Checkbox,
    ...CheckboxGroup,
    ...CircleProgress,
    ...Code,
    ...CodeInput,
    ...Col,
    ...Collapse,
    ...CollapseItem,
    ...ColumnNotice,
    ...CountDown,
    ...CountTo,
    ...DatetimePicker,
    ...Divider,
    ...Empty,
    ...Form,
    ...GormItem,
    ...Gap,
    ...Grid,
    ...GridItem,
    ...Icon,
    ...Image$1,
    ...IndexAnchor,
    ...IndexList,
    ...Input,
    ...Keyboard,
    ...Line,
    ...LineProgress,
    ...Link,
    ...List,
    ...ListItem,
    ...LoadingIcon,
    ...LoadingPage,
    ...Loadmore,
    ...Modal,
    ...Navbar,
    ...NoNetwork,
    ...NoticeBar,
    ...Notify,
    ...NumberBox,
    ...NumberKeyboard,
    ...Overlay,
    ...Parse,
    ...Picker,
    ...Popup,
    ...Radio,
    ...RadioGroup,
    ...Rate,
    ...ReadMore,
    ...Row,
    ...RowNotice,
    ...ScrollList,
    ...Search,
    ...Section,
    ...Skeleton,
    ...Slider,
    ...StatusBar,
    ...Steps,
    ...StepsItem,
    ...Sticky,
    ...Subsection,
    ...SwipeAction,
    ...SwipeActionItem,
    ...Swiper,
    ...SwipterIndicator,
    ...Switch,
    ...Tabbar,
    ...TabbarItem,
    ...Tabs,
    ...Tag,
    ...Text,
    ...Textarea,
    ...Toast,
    ...Toolbar,
    ...Tooltip,
    ...Transition,
    ...Upload
  };
  function setConfig(configs) {
    shallowMerge(config$1, configs.config || {});
    shallowMerge(props$a, configs.props || {});
    shallowMerge(color$3, configs.color || {});
    shallowMerge(zIndex, configs.zIndex || {});
  }
  if (uni && uni.upuiParams) {
    formatAppLog("log", "at uni_modules/uview-plus/libs/config/props.js:206", "setting uview-plus");
    let temp = uni.upuiParams();
    if (temp.httpIns) {
      temp.httpIns(http$1);
    }
    if (temp.options) {
      setConfig(temp.options);
    }
  }
  const props$9 = defineMixin({
    props: {
      // 是否展示工具条
      show: {
        type: Boolean,
        default: () => props$a.toolbar.show
      },
      // 取消按钮的文字
      cancelText: {
        type: String,
        default: () => props$a.toolbar.cancelText
      },
      // 确认按钮的文字
      confirmText: {
        type: String,
        default: () => props$a.toolbar.confirmText
      },
      // 取消按钮的颜色
      cancelColor: {
        type: String,
        default: () => props$a.toolbar.cancelColor
      },
      // 确认按钮的颜色
      confirmColor: {
        type: String,
        default: () => props$a.toolbar.confirmColor
      },
      // 标题文字
      title: {
        type: String,
        default: () => props$a.toolbar.title
      },
      // 开启右侧插槽
      rightSlot: {
        type: Boolean,
        default: false
      }
    }
  });
  const mpMixin = defineMixin({});
  class Router {
    constructor() {
      this.config = {
        type: "navigateTo",
        url: "",
        delta: 1,
        // navigateBack页面后退时,回退的层数
        params: {},
        // 传递的参数
        animationType: "pop-in",
        // 窗口动画,只在APP有效
        animationDuration: 300,
        // 窗口动画持续时间,单位毫秒,只在APP有效
        intercept: false
        // 是否需要拦截
      };
      this.route = this.route.bind(this);
    }
    // 判断url前面是否有"/"，如果没有则加上，否则无法跳转
    addRootPath(url2) {
      return url2[0] === "/" ? url2 : `/${url2}`;
    }
    // 整合路由参数
    mixinParam(url2, params) {
      url2 = url2 && this.addRootPath(url2);
      let query = "";
      if (/.*\/.*\?.*=.*/.test(url2)) {
        query = queryParams(params, false);
        return url2 += `&${query}`;
      }
      query = queryParams(params);
      return url2 += query;
    }
    // 对外的方法名称
    async route(options = {}, params = {}) {
      let mergeConfig2 = {};
      if (typeof options === "string") {
        mergeConfig2.url = this.mixinParam(options, params);
        mergeConfig2.type = "navigateTo";
      } else {
        mergeConfig2 = deepMerge(this.config, options);
        mergeConfig2.url = this.mixinParam(options.url, options.params);
      }
      if (mergeConfig2.url === page())
        return;
      if (params.intercept) {
        this.config.intercept = params.intercept;
      }
      mergeConfig2.params = params;
      mergeConfig2 = deepMerge(this.config, mergeConfig2);
      if (typeof uni.$u.routeIntercept === "function") {
        const isNext = await new Promise((resolve, reject) => {
          uni.$u.routeIntercept(mergeConfig2, resolve);
        });
        isNext && this.openPage(mergeConfig2);
      } else {
        this.openPage(mergeConfig2);
      }
    }
    // 执行路由跳转
    openPage(config2) {
      const {
        url: url2,
        type,
        delta,
        animationType,
        animationDuration
      } = config2;
      if (config2.type == "navigateTo" || config2.type == "to") {
        uni.navigateTo({
          url: url2,
          animationType,
          animationDuration
        });
      }
      if (config2.type == "redirectTo" || config2.type == "redirect") {
        uni.redirectTo({
          url: url2
        });
      }
      if (config2.type == "switchTab" || config2.type == "tab") {
        uni.switchTab({
          url: url2
        });
      }
      if (config2.type == "reLaunch" || config2.type == "launch") {
        uni.reLaunch({
          url: url2
        });
      }
      if (config2.type == "navigateBack" || config2.type == "back") {
        uni.navigateBack({
          delta
        });
      }
    }
  }
  const route = new Router().route;
  const mixin = defineMixin({
    // 定义每个组件都可能需要用到的外部样式以及类名
    props: {
      // 每个组件都有的父组件传递的样式，可以为字符串或者对象形式
      customStyle: {
        type: [Object, String],
        default: () => ({})
      },
      customClass: {
        type: String,
        default: ""
      },
      // 跳转的页面路径
      url: {
        type: String,
        default: ""
      },
      // 页面跳转的类型
      linkType: {
        type: String,
        default: "navigateTo"
      }
    },
    data() {
      return {};
    },
    onLoad() {
      this.$u.getRect = this.$uGetRect;
    },
    created() {
      this.$u.getRect = this.$uGetRect;
    },
    computed: {
      // 在2.x版本中，将会把$u挂载到uni对象下，导致在模板中无法使用uni.$u.xxx形式
      // 所以这里通过computed计算属性将其附加到this.$u上，就可以在模板或者js中使用uni.$u.xxx
      // 只在nvue环境通过此方式引入完整的$u，其他平台会出现性能问题，非nvue则按需引入（主要原因是props过大）
      $u() {
        return deepMerge(uni.$u, {
          props: void 0,
          http: void 0,
          mixin: void 0
        });
      },
      /**
       * 生成bem规则类名
       * 由于微信小程序，H5，nvue之间绑定class的差异，无法通过:class="[bem()]"的形式进行同用
       * 故采用如下折中做法，最后返回的是数组（一般平台）或字符串（支付宝和字节跳动平台），类似['a', 'b', 'c']或'a b c'的形式
       * @param {String} name 组件名称
       * @param {Array} fixed 一直会存在的类名
       * @param {Array} change 会根据变量值为true或者false而出现或者隐藏的类名
       * @returns {Array|string}
       */
      bem() {
        return function(name, fixed, change) {
          const prefix = `u-${name}--`;
          const classes = {};
          if (fixed) {
            fixed.map((item) => {
              classes[prefix + this[item]] = true;
            });
          }
          if (change) {
            change.map((item) => {
              this[item] ? classes[prefix + item] = this[item] : delete classes[prefix + item];
            });
          }
          return Object.keys(classes);
        };
      }
    },
    methods: {
      // 跳转某一个页面
      openPage(urlKey = "url") {
        const url2 = this[urlKey];
        if (url2) {
          route({ type: this.linkType, url: url2 });
        }
      },
      navTo(url2 = "", linkType = "navigateTo") {
        route({ type: this.linkType, url: url2 });
      },
      // 查询节点信息
      // 目前此方法在支付宝小程序中无法获取组件跟接点的尺寸，为支付宝的bug(2020-07-21)
      // 解决办法为在组件根部再套一个没有任何作用的view元素
      $uGetRect(selector, all) {
        return new Promise((resolve) => {
          uni.createSelectorQuery().in(this)[all ? "selectAll" : "select"](selector).boundingClientRect((rect) => {
            if (all && Array.isArray(rect) && rect.length) {
              resolve(rect);
            }
            if (!all && rect) {
              resolve(rect);
            }
          }).exec();
        });
      },
      getParentData(parentName = "") {
        if (!this.parent)
          this.parent = {};
        this.parent = $parent.call(this, parentName);
        if (this.parent.children) {
          this.parent.children.indexOf(this) === -1 && this.parent.children.push(this);
        }
        if (this.parent && this.parentData) {
          Object.keys(this.parentData).map((key) => {
            this.parentData[key] = this.parent[key];
          });
        }
      },
      // 阻止事件冒泡
      preventEvent(e2) {
        e2 && typeof e2.stopPropagation === "function" && e2.stopPropagation();
      },
      // 空操作
      noop(e2) {
        this.preventEvent(e2);
      }
    },
    onReachBottom() {
      uni.$emit("uOnReachBottom");
    },
    beforeUnmount() {
      if (this.parent && test.array(this.parent.children)) {
        const childrenList = this.parent.children;
        childrenList.map((child, index) => {
          if (child === this) {
            childrenList.splice(index, 1);
          }
        });
      }
    }
  });
  const _sfc_main$o = {
    name: "u-toolbar",
    mixins: [mpMixin, mixin, props$9],
    emits: ["confirm", "cancel"],
    created() {
    },
    methods: {
      // 点击取消按钮
      cancel() {
        this.$emit("cancel");
      },
      // 点击确定按钮
      confirm() {
        this.$emit("confirm");
      }
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    return _ctx.show ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: "u-toolbar",
        onTouchmove: _cache[2] || (_cache[2] = vue.withModifiers((...args) => _ctx.noop && _ctx.noop(...args), ["stop", "prevent"]))
      },
      [
        vue.createElementVNode("view", { class: "u-toolbar__left" }, [
          vue.createElementVNode("view", {
            class: "u-toolbar__cancel__wrapper",
            "hover-class": "u-hover-class"
          }, [
            vue.createElementVNode(
              "text",
              {
                class: "u-toolbar__wrapper__cancel",
                onClick: _cache[0] || (_cache[0] = (...args) => $options.cancel && $options.cancel(...args)),
                style: vue.normalizeStyle({
                  color: _ctx.cancelColor
                })
              },
              vue.toDisplayString(_ctx.cancelText),
              5
              /* TEXT, STYLE */
            )
          ])
        ]),
        _ctx.title ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "u-toolbar__title u-line-1"
          },
          vue.toDisplayString(_ctx.title),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "u-toolbar__right" }, [
          !_ctx.rightSlot ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "u-toolbar__confirm__wrapper",
            "hover-class": "u-hover-class"
          }, [
            vue.createElementVNode(
              "text",
              {
                class: "u-toolbar__wrapper__confirm",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.confirm && $options.confirm(...args)),
                style: vue.normalizeStyle({
                  color: _ctx.confirmColor
                })
              },
              vue.toDisplayString(_ctx.confirmText),
              5
              /* TEXT, STYLE */
            )
          ])) : vue.renderSlot(_ctx.$slots, "right", { key: 1 }, void 0, true)
        ])
      ],
      32
      /* NEED_HYDRATION */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__scopeId", "data-v-eadae74e"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-toolbar/u-toolbar.vue"]]);
  const props$8 = defineMixin({
    props: {
      // 是否显示组件
      show: {
        type: Boolean,
        default: () => props$a.loadingIcon.show
      },
      // 颜色
      color: {
        type: String,
        default: () => props$a.loadingIcon.color
      },
      // 提示文字颜色
      textColor: {
        type: String,
        default: () => props$a.loadingIcon.textColor
      },
      // 文字和图标是否垂直排列
      vertical: {
        type: Boolean,
        default: () => props$a.loadingIcon.vertical
      },
      // 模式选择，circle-圆形，spinner-花朵形，semicircle-半圆形
      mode: {
        type: String,
        default: () => props$a.loadingIcon.mode
      },
      // 图标大小，单位默认px
      size: {
        type: [String, Number],
        default: () => props$a.loadingIcon.size
      },
      // 文字大小
      textSize: {
        type: [String, Number],
        default: () => props$a.loadingIcon.textSize
      },
      // 文字内容
      text: {
        type: [String, Number],
        default: () => props$a.loadingIcon.text
      },
      // 动画模式
      timingFunction: {
        type: String,
        default: () => props$a.loadingIcon.timingFunction
      },
      // 动画执行周期时间
      duration: {
        type: [String, Number],
        default: () => props$a.loadingIcon.duration
      },
      // mode=circle时的暗边颜色
      inactiveColor: {
        type: String,
        default: () => props$a.loadingIcon.inactiveColor
      }
    }
  });
  function colorGradient(startColor = "rgb(0, 0, 0)", endColor = "rgb(255, 255, 255)", step = 10) {
    const startRGB = hexToRgb(startColor, false);
    const startR = startRGB[0];
    const startG = startRGB[1];
    const startB = startRGB[2];
    const endRGB = hexToRgb(endColor, false);
    const endR = endRGB[0];
    const endG = endRGB[1];
    const endB = endRGB[2];
    const sR = (endR - startR) / step;
    const sG = (endG - startG) / step;
    const sB = (endB - startB) / step;
    const colorArr = [];
    for (let i = 0; i < step; i++) {
      let hex = rgbToHex(`rgb(${Math.round(sR * i + startR)},${Math.round(sG * i + startG)},${Math.round(sB * i + startB)})`);
      if (i === 0)
        hex = rgbToHex(startColor);
      if (i === step - 1)
        hex = rgbToHex(endColor);
      colorArr.push(hex);
    }
    return colorArr;
  }
  function hexToRgb(sColor, str = true) {
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    sColor = String(sColor).toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      const sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`));
      }
      if (!str) {
        return sColorChange;
      }
      return `rgb(${sColorChange[0]},${sColorChange[1]},${sColorChange[2]})`;
    }
    if (/^(rgb|RGB)/.test(sColor)) {
      const arr = sColor.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      return arr.map((val) => Number(val));
    }
    return sColor;
  }
  function rgbToHex(rgb) {
    const _this = rgb;
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(_this)) {
      const aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      let strHex = "#";
      for (let i = 0; i < aColor.length; i++) {
        let hex = Number(aColor[i]).toString(16);
        hex = String(hex).length == 1 ? `${0}${hex}` : hex;
        if (hex === "0") {
          hex += hex;
        }
        strHex += hex;
      }
      if (strHex.length !== 7) {
        strHex = _this;
      }
      return strHex;
    }
    if (reg.test(_this)) {
      const aNum = _this.replace(/#/, "").split("");
      if (aNum.length === 6) {
        return _this;
      }
      if (aNum.length === 3) {
        let numHex = "#";
        for (let i = 0; i < aNum.length; i += 1) {
          numHex += aNum[i] + aNum[i];
        }
        return numHex;
      }
    } else {
      return _this;
    }
  }
  const _sfc_main$n = {
    name: "u-loading-icon",
    mixins: [mpMixin, mixin, props$8],
    data() {
      return {
        // Array.form可以通过一个伪数组对象创建指定长度的数组
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/from
        array12: Array.from({
          length: 12
        }),
        // 这里需要设置默认值为360，否则在安卓nvue上，会延迟一个duration周期后才执行
        // 在iOS nvue上，则会一开始默认执行两个周期的动画
        aniAngel: 360,
        // 动画旋转角度
        webviewHide: false,
        // 监听webview的状态，如果隐藏了页面，则停止动画，以免性能消耗
        loading: false
        // 是否运行中，针对nvue使用
      };
    },
    computed: {
      // 当为circle类型时，给其另外三边设置一个更轻一些的颜色
      // 之所以需要这么做的原因是，比如父组件传了color为红色，那么需要另外的三个边为浅红色
      // 而不能是固定的某一个其他颜色(因为这个固定的颜色可能浅蓝，导致效果没有那么细腻良好)
      otherBorderColor() {
        const lightColor = colorGradient(this.color, "#ffffff", 100)[80];
        if (this.mode === "circle") {
          return this.inactiveColor ? this.inactiveColor : lightColor;
        } else {
          return "transparent";
        }
      }
    },
    watch: {
      show(n) {
      }
    },
    mounted() {
      this.init();
    },
    methods: {
      addUnit,
      addStyle,
      init() {
        setTimeout(() => {
          this.show && this.addEventListenerToWebview();
        }, 20);
      },
      // 监听webview的显示与隐藏
      addEventListenerToWebview() {
        const pages = getCurrentPages();
        const page2 = pages[pages.length - 1];
        const currentWebview = page2.$getAppWebview();
        currentWebview.addEventListener("hide", () => {
          this.webviewHide = true;
        });
        currentWebview.addEventListener("show", () => {
          this.webviewHide = false;
        });
      }
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return _ctx.show ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["u-loading-icon", [_ctx.vertical && "u-loading-icon--vertical"]]),
        style: vue.normalizeStyle([$options.addStyle(_ctx.customStyle)])
      },
      [
        !$data.webviewHide ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(["u-loading-icon__spinner", [`u-loading-icon__spinner--${_ctx.mode}`]]),
            ref: "ani",
            style: vue.normalizeStyle({
              color: _ctx.color,
              width: $options.addUnit(_ctx.size),
              height: $options.addUnit(_ctx.size),
              borderTopColor: _ctx.color,
              borderBottomColor: $options.otherBorderColor,
              borderLeftColor: $options.otherBorderColor,
              borderRightColor: $options.otherBorderColor,
              "animation-duration": `${_ctx.duration}ms`,
              "animation-timing-function": _ctx.mode === "semicircle" || _ctx.mode === "circle" ? _ctx.timingFunction : ""
            })
          },
          [
            _ctx.mode === "spinner" ? (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              vue.renderList($data.array12, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: "u-loading-icon__dot"
                });
              }),
              128
              /* KEYED_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true),
        _ctx.text ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 1,
            class: "u-loading-icon__text",
            style: vue.normalizeStyle({
              fontSize: $options.addUnit(_ctx.textSize),
              color: _ctx.textColor
            })
          },
          vue.toDisplayString(_ctx.text),
          5
          /* TEXT, STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__scopeId", "data-v-2af81691"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-loading-icon/u-loading-icon.vue"]]);
  const props$7 = defineMixin({
    props: {
      // 是否展示组件
      show: {
        type: Boolean,
        default: () => props$a.transition.show
      },
      // 使用的动画模式
      mode: {
        type: String,
        default: () => props$a.transition.mode
      },
      // 动画的执行时间，单位ms
      duration: {
        type: [String, Number],
        default: () => props$a.transition.duration
      },
      // 使用的动画过渡函数
      timingFunction: {
        type: String,
        default: () => props$a.transition.timingFunction
      }
    }
  });
  const getClassNames = (name) => ({
    enter: `u-${name}-enter u-${name}-enter-active`,
    "enter-to": `u-${name}-enter-to u-${name}-enter-active`,
    leave: `u-${name}-leave u-${name}-leave-active`,
    "leave-to": `u-${name}-leave-to u-${name}-leave-active`
  });
  const transitionMixin = {
    methods: {
      // 组件被点击发出事件
      clickHandler() {
        this.$emit("click");
      },
      // vue版本的组件进场处理
      async vueEnter() {
        const classNames = getClassNames(this.mode);
        this.status = "enter";
        this.$emit("beforeEnter");
        this.inited = true;
        this.display = true;
        this.classes = classNames.enter;
        await vue.nextTick();
        {
          await sleep$1(20);
          this.$emit("enter");
          this.transitionEnded = false;
          this.$emit("afterEnter");
          this.classes = classNames["enter-to"];
        }
      },
      // 动画离场处理
      async vueLeave() {
        if (!this.display)
          return;
        const classNames = getClassNames(this.mode);
        this.status = "leave";
        this.$emit("beforeLeave");
        this.classes = classNames.leave;
        await vue.nextTick();
        {
          this.transitionEnded = false;
          this.$emit("leave");
          setTimeout(this.onTransitionEnd, this.duration);
          this.classes = classNames["leave-to"];
        }
      },
      // 完成过渡后触发
      onTransitionEnd() {
        if (this.transitionEnded)
          return;
        this.transitionEnded = true;
        this.$emit(this.status === "leave" ? "afterLeave" : "afterEnter");
        if (!this.show && this.display) {
          this.display = false;
          this.inited = false;
        }
      }
    }
  };
  const _sfc_main$m = {
    name: "u-transition",
    data() {
      return {
        inited: false,
        // 是否显示/隐藏组件
        viewStyle: {},
        // 组件内部的样式
        status: "",
        // 记录组件动画的状态
        transitionEnded: false,
        // 组件是否结束的标记
        display: false,
        // 组件是否展示
        classes: ""
        // 应用的类名
      };
    },
    emits: ["click", "beforeEnter", "enter", "afterEnter", "beforeLeave", "leave", "afterLeave"],
    computed: {
      mergeStyle() {
        const { viewStyle, customStyle } = this;
        return {
          transitionDuration: `${this.duration}ms`,
          // display: `${this.display ? '' : 'none'}`,
          transitionTimingFunction: this.timingFunction,
          // 避免自定义样式影响到动画属性，所以写在viewStyle前面
          ...addStyle(customStyle),
          ...viewStyle
        };
      }
    },
    // 将mixin挂在到组件中，实际上为一个vue格式对象。
    mixins: [mpMixin, mixin, transitionMixin, props$7],
    watch: {
      show: {
        handler(newVal) {
          newVal ? this.vueEnter() : this.vueLeave();
        },
        // 表示同时监听初始化时的props的show的意思
        immediate: true
      }
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return $data.inited ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["u-transition", $data.classes]),
        ref: "u-transition",
        onClick: _cache[0] || (_cache[0] = (...args) => _ctx.clickHandler && _ctx.clickHandler(...args)),
        style: vue.normalizeStyle([$options.mergeStyle]),
        onTouchmove: _cache[1] || (_cache[1] = (...args) => _ctx.noop && _ctx.noop(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      38
      /* CLASS, STYLE, NEED_HYDRATION */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__scopeId", "data-v-5cec8177"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-transition/u-transition.vue"]]);
  const props$6 = defineMixin({
    props: {
      // 是否显示遮罩
      show: {
        type: Boolean,
        default: () => props$a.overlay.show
      },
      // 层级z-index
      zIndex: {
        type: [String, Number],
        default: () => props$a.overlay.zIndex
      },
      // 遮罩的过渡时间，单位为ms
      duration: {
        type: [String, Number],
        default: () => props$a.overlay.duration
      },
      // 不透明度值，当做rgba的第四个参数
      opacity: {
        type: [String, Number],
        default: () => props$a.overlay.opacity
      }
    }
  });
  const _sfc_main$l = {
    name: "u-overlay",
    mixins: [mpMixin, mixin, props$6],
    computed: {
      overlayStyle() {
        const style = {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: this.zIndex,
          bottom: 0,
          "background-color": `rgba(0, 0, 0, ${this.opacity})`
        };
        return deepMerge(style, addStyle(this.customStyle));
      }
    },
    emits: ["click"],
    methods: {
      clickHandler() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_transition = resolveEasycom(vue.resolveDynamicComponent("u-transition"), __easycom_3);
    return vue.openBlock(), vue.createBlock(_component_u_transition, {
      show: _ctx.show,
      "custom-class": "u-overlay",
      duration: _ctx.duration,
      "custom-style": $options.overlayStyle,
      onClick: $options.clickHandler,
      onTouchmove: vue.withModifiers(_ctx.noop, ["stop", "prevent"])
    }, {
      default: vue.withCtx(() => [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ]),
      _: 3
      /* FORWARDED */
    }, 8, ["show", "duration", "custom-style", "onClick", "onTouchmove"]);
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-9112bed9"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-overlay/u-overlay.vue"]]);
  const props$5 = defineMixin({
    props: {
      bgColor: {
        type: String,
        default: () => props$a.statusBar.bgColor
      },
      // 状态栏获取得高度
      height: {
        type: Number,
        default: () => props$a.statusBar.height
      }
    }
  });
  const _sfc_main$k = {
    name: "u-status-bar",
    mixins: [mpMixin, mixin, props$5],
    data() {
      return {
        isH5: false
      };
    },
    created() {
    },
    emits: ["update:height"],
    computed: {
      style() {
        const style = {};
        let sheight = getWindowInfo$1().statusBarHeight;
        this.$emit("update:height", sheight);
        if (sheight == 0) {
          this.isH5 = true;
        } else {
          style.height = addUnit(sheight, "px");
        }
        style.backgroundColor = this.bgColor;
        return deepMerge(style, addStyle(this.customStyle));
      }
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        style: vue.normalizeStyle([$options.style]),
        class: vue.normalizeClass(["u-status-bar", [$data.isH5 && "u-safe-area-inset-top"]])
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-eb8e0cdd"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-status-bar/u-status-bar.vue"]]);
  const props$4 = defineMixin({
    props: {}
  });
  const _sfc_main$j = {
    name: "u-safe-bottom",
    mixins: [mpMixin, mixin, props$4],
    data() {
      return {
        safeAreaBottomHeight: 0,
        isNvue: false
      };
    },
    computed: {
      style() {
        const style = {};
        return deepMerge(style, addStyle(this.customStyle));
      }
    },
    mounted() {
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-safe-bottom", [!$data.isNvue && "u-safe-area-inset-bottom"]]),
        style: vue.normalizeStyle([$options.style])
      },
      null,
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_2$1 = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-f3d22cfe"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-safe-bottom/u-safe-bottom.vue"]]);
  const props$3 = defineMixin({
    props: {
      // 是否展示弹窗
      show: {
        type: Boolean,
        default: () => props$a.popup.show
      },
      // 是否显示遮罩
      overlay: {
        type: Boolean,
        default: () => props$a.popup.overlay
      },
      // 弹出的方向，可选值为 top bottom right left center
      mode: {
        type: String,
        default: () => props$a.popup.mode
      },
      // 动画时长，单位ms
      duration: {
        type: [String, Number],
        default: () => props$a.popup.duration
      },
      // 是否显示关闭图标
      closeable: {
        type: Boolean,
        default: () => props$a.popup.closeable
      },
      // 自定义遮罩的样式
      overlayStyle: {
        type: [Object, String],
        default: () => props$a.popup.overlayStyle
      },
      // 点击遮罩是否关闭弹窗
      closeOnClickOverlay: {
        type: Boolean,
        default: () => props$a.popup.closeOnClickOverlay
      },
      // 层级
      zIndex: {
        type: [String, Number],
        default: () => props$a.popup.zIndex
      },
      // 是否为iPhoneX留出底部安全距离
      safeAreaInsetBottom: {
        type: Boolean,
        default: () => props$a.popup.safeAreaInsetBottom
      },
      // 是否留出顶部安全距离（状态栏高度）
      safeAreaInsetTop: {
        type: Boolean,
        default: () => props$a.popup.safeAreaInsetTop
      },
      // 自定义关闭图标位置，top-left为左上角，top-right为右上角，bottom-left为左下角，bottom-right为右下角
      closeIconPos: {
        type: String,
        default: () => props$a.popup.closeIconPos
      },
      // 是否显示圆角
      round: {
        type: [Boolean, String, Number],
        default: () => props$a.popup.round
      },
      // mode=center，也即中部弹出时，是否使用缩放模式
      zoom: {
        type: Boolean,
        default: () => props$a.popup.zoom
      },
      // 弹窗背景色，设置为transparent可去除白色背景
      bgColor: {
        type: String,
        default: () => props$a.popup.bgColor
      },
      // 遮罩的透明度，0-1之间
      overlayOpacity: {
        type: [Number, String],
        default: () => props$a.popup.overlayOpacity
      },
      // 是否页面内展示
      pageInline: {
        type: Boolean,
        default: () => props$a.popup.pageInline
      },
      // 是否页开启手势滑动
      touchable: {
        type: Boolean,
        default: () => props$a.popup.touchable
      },
      // 手势滑动最小高度
      minHeight: {
        type: [String],
        default: () => props$a.popup.minHeight
      },
      // 手势滑动最大高度
      maxHeight: {
        type: [String],
        default: () => props$a.popup.maxHeight
      }
    }
  });
  const _sfc_main$i = {
    name: "u-popup",
    mixins: [mpMixin, mixin, props$3],
    data() {
      return {
        overlayDuration: this.duration + 50,
        // 触摸相关数据
        touchStartY: 0,
        touchStartHeight: 0,
        isTouching: false,
        // 当前弹窗高度
        currentHeight: "auto"
      };
    },
    watch: {
      show(newValue, oldValue) {
      }
    },
    computed: {
      transitionStyle() {
        const style = {
          display: "flex"
        };
        if (!this.pageInline) {
          style.zIndex = this.zIndex;
          style.position = "fixed";
        }
        style[this.mode] = 0;
        if (this.mode === "left") {
          return deepMerge(style, {
            bottom: 0,
            top: 0
          });
        } else if (this.mode === "right") {
          return deepMerge(style, {
            bottom: 0,
            top: 0
          });
        } else if (this.mode === "top") {
          return deepMerge(style, {
            left: 0,
            right: 0
          });
        } else if (this.mode === "bottom") {
          return deepMerge(style, {
            left: 0,
            right: 0
          });
        } else if (this.mode === "center") {
          return deepMerge(style, {
            alignItems: "center",
            "justify-content": "center",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          });
        }
      },
      contentStyleWrap() {
        const style = {};
        if (this.mode === "bottom" && this.touchable) {
          if (this.currentHeight !== "auto") {
            style.height = this.currentHeight;
          }
          if (this.maxHeight) {
            style.maxHeight = addUnit(this.maxHeight);
          }
          if (this.minHeight) {
            style.minHeight = addUnit(this.minHeight);
          }
        }
        return style;
      },
      contentStyle() {
        const style = {};
        getWindowInfo$1();
        if (this.mode !== "center") {
          style.flex = 1;
        }
        if (this.bgColor) {
          style.backgroundColor = this.bgColor;
        }
        if (this.round) {
          const value = addUnit(this.round);
          if (this.mode === "top") {
            style.borderBottomLeftRadius = value;
            style.borderBottomRightRadius = value;
          } else if (this.mode === "bottom") {
            style.borderTopLeftRadius = value;
            style.borderTopRightRadius = value;
          } else if (this.mode === "center") {
            style.borderRadius = value;
          }
        }
        return deepMerge(style, addStyle(this.customStyle));
      },
      position() {
        if (this.mode === "center") {
          return this.zoom ? "fade-zoom" : "fade";
        }
        if (this.mode === "left") {
          return "slide-left";
        }
        if (this.mode === "right") {
          return "slide-right";
        }
        if (this.mode === "bottom") {
          return "slide-up";
        }
        if (this.mode === "top") {
          return "slide-down";
        }
      }
    },
    emits: ["open", "close", "click", "update:show"],
    methods: {
      // 点击遮罩
      overlayClick() {
        if (this.closeOnClickOverlay) {
          this.$emit("update:show", false);
          this.$emit("close");
        }
      },
      open(e2) {
        this.$emit("update:show", true);
      },
      close(e2) {
        this.$emit("update:show", false);
        this.$emit("close");
      },
      afterEnter() {
        this.$emit("open");
      },
      clickHandler() {
        if (this.mode === "center") {
          this.overlayClick();
        }
        this.$emit("click");
      },
      // 触摸开始
      onTouchStart(e2) {
        if (!this.touchable || this.mode !== "bottom")
          return;
        this.isTouching = true;
        this.touchStartY = e2.touches[0].clientY;
        this.touchStartHeight = this.$el.querySelector(".u-popup__content—transition").offsetHeight;
      },
      // 触摸移动
      onTouchMove(e2) {
        if (!this.isTouching || !this.touchable || this.mode !== "bottom")
          return;
        const touchY = e2.touches[0].clientY;
        const deltaY = touchY - this.touchStartY;
        if (deltaY !== 0) {
          const newHeight = this.touchStartHeight - deltaY;
          const minHeight = parseFloat(addUnit(this.minHeight)) || 200;
          const maxHeight = this.maxHeight ? this.maxHeight.toString().includes("%") ? getWindowInfo$1().windowHeight * (parseFloat(this.maxHeight) / 100) : parseFloat(addUnit(this.maxHeight)) : getWindowInfo$1().windowHeight * 0.8;
          if (newHeight >= minHeight && newHeight <= maxHeight) {
            this.currentHeight = newHeight + "px";
          }
        }
        e2.preventDefault();
      },
      // 触摸结束
      onTouchEnd(e2) {
        if (!this.isTouching || !this.touchable || this.mode !== "bottom")
          return;
        this.isTouching = false;
        const touchY = e2.changedTouches[0].clientY;
        const deltaY = touchY - this.touchStartY;
        const velocity = Math.abs(deltaY) / (e2.timeStamp - e2.changedTouches[0].timestamp);
        if (deltaY > 100 || deltaY > 30 && velocity > 0.5) {
          this.close();
        }
      }
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_overlay = resolveEasycom(vue.resolveDynamicComponent("u-overlay"), __easycom_0$2);
    const _component_u_status_bar = resolveEasycom(vue.resolveDynamicComponent("u-status-bar"), __easycom_1$1);
    const _component_up_icon = vue.resolveComponent("up-icon");
    const _component_u_safe_bottom = resolveEasycom(vue.resolveDynamicComponent("u-safe-bottom"), __easycom_2$1);
    const _component_u_transition = resolveEasycom(vue.resolveDynamicComponent("u-transition"), __easycom_3);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-popup", [_ctx.customClass]]),
        style: vue.normalizeStyle({
          width: _ctx.show == false ? "0px" : "",
          height: _ctx.show == false ? "0px" : ""
        })
      },
      [
        vue.createElementVNode("view", { class: "u-popup__trigger" }, [
          vue.renderSlot(_ctx.$slots, "trigger", {}, void 0, true),
          vue.createElementVNode("view", {
            onClick: _cache[0] || (_cache[0] = (...args) => $options.open && $options.open(...args)),
            class: "u-popup__trigger__cover"
          })
        ]),
        _ctx.overlay ? (vue.openBlock(), vue.createBlock(_component_u_overlay, {
          key: 0,
          show: _ctx.show && _ctx.pageInline == false,
          onClick: $options.overlayClick,
          zIndex: _ctx.zIndex,
          duration: $data.overlayDuration,
          customStyle: _ctx.overlayStyle,
          opacity: _ctx.overlayOpacity
        }, null, 8, ["show", "onClick", "zIndex", "duration", "customStyle", "opacity"])) : vue.createCommentVNode("v-if", true),
        vue.createVNode(_component_u_transition, {
          class: "u-popup__content—transition",
          style: vue.normalizeStyle($options.contentStyleWrap),
          show: _ctx.pageInline ? true : _ctx.show,
          customStyle: $options.transitionStyle,
          mode: _ctx.pageInline ? "none" : $options.position,
          duration: _ctx.duration,
          onAfterEnter: $options.afterEnter,
          onClick: $options.clickHandler
        }, {
          default: vue.withCtx(() => [
            vue.createElementVNode(
              "view",
              {
                class: "u-popup__content",
                style: vue.normalizeStyle([$options.contentStyle]),
                onClick: _cache[6] || (_cache[6] = vue.withModifiers((...args) => _ctx.noop && _ctx.noop(...args), ["stop"])),
                onTouchmove: _cache[7] || (_cache[7] = vue.withModifiers((...args) => _ctx.noop && _ctx.noop(...args), ["stop", "prevent"]))
              },
              [
                _ctx.safeAreaInsetTop ? (vue.openBlock(), vue.createBlock(_component_u_status_bar, { key: 0 })) : vue.createCommentVNode("v-if", true),
                _ctx.touchable && _ctx.mode === "bottom" ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 1,
                    class: "u-popup__content__touch-area",
                    onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.onTouchStart && $options.onTouchStart(...args)),
                    onTouchmove: _cache[2] || (_cache[2] = (...args) => $options.onTouchMove && $options.onTouchMove(...args)),
                    onTouchend: _cache[3] || (_cache[3] = (...args) => $options.onTouchEnd && $options.onTouchEnd(...args)),
                    onTouchcancel: _cache[4] || (_cache[4] = (...args) => $options.onTouchEnd && $options.onTouchEnd(...args))
                  },
                  [
                    vue.createElementVNode("view", { class: "u-popup__content__indicator" })
                  ],
                  32
                  /* NEED_HYDRATION */
                )) : vue.createCommentVNode("v-if", true),
                vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
                _ctx.closeable ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 2,
                    onClick: _cache[5] || (_cache[5] = vue.withModifiers((...args) => $options.close && $options.close(...args), ["stop"])),
                    class: vue.normalizeClass(["u-popup__content__close", ["u-popup__content__close--" + _ctx.closeIconPos]]),
                    "hover-class": "u-popup__content__close--hover",
                    "hover-stay-time": "150"
                  },
                  [
                    vue.createVNode(_component_up_icon, {
                      name: "close",
                      color: "#909399",
                      size: "18",
                      bold: ""
                    })
                  ],
                  2
                  /* CLASS */
                )) : vue.createCommentVNode("v-if", true),
                _ctx.safeAreaInsetBottom ? (vue.openBlock(), vue.createBlock(_component_u_safe_bottom, { key: 3 })) : vue.createCommentVNode("v-if", true)
              ],
              36
              /* STYLE, NEED_HYDRATION */
            ),
            vue.renderSlot(_ctx.$slots, "bottom", {}, void 0, true)
          ]),
          _: 3
          /* FORWARDED */
        }, 8, ["style", "show", "customStyle", "mode", "duration", "onAfterEnter", "onClick"])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-05c24e9b"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-popup/u-popup.vue"]]);
  const props$2 = defineMixin({
    props: {
      modelValue: {
        type: Array,
        default: () => []
      },
      hasInput: {
        type: Boolean,
        default: false
      },
      inputProps: {
        type: Object,
        default: () => {
          return {};
        }
      },
      disabled: {
        type: Boolean,
        default: () => props$a.picker.disabled
      },
      disabledColor: {
        type: String,
        default: () => props$a.picker.disabledColor
      },
      placeholder: {
        type: String,
        default: () => props$a.picker.placeholder
      },
      // 是否展示picker弹窗
      show: {
        type: Boolean,
        default: () => props$a.picker.show
      },
      // 弹出的方向，可选值为 top bottom right left center
      popupMode: {
        type: String,
        default: () => props$a.picker.popupMode
      },
      // 是否展示顶部的操作栏
      showToolbar: {
        type: Boolean,
        default: () => props$a.picker.showToolbar
      },
      // 顶部标题
      title: {
        type: String,
        default: () => props$a.picker.title
      },
      // 对象数组，设置每一列的数据
      columns: {
        type: Array,
        default: () => props$a.picker.columns
      },
      // 是否显示加载中状态
      loading: {
        type: Boolean,
        default: () => props$a.picker.loading
      },
      // 各列中，单个选项的高度
      itemHeight: {
        type: [String, Number],
        default: () => props$a.picker.itemHeight
      },
      // 取消按钮的文字
      cancelText: {
        type: String,
        default: () => props$a.picker.cancelText
      },
      // 确认按钮的文字
      confirmText: {
        type: String,
        default: () => props$a.picker.confirmText
      },
      // 取消按钮的颜色
      cancelColor: {
        type: String,
        default: () => props$a.picker.cancelColor
      },
      // 确认按钮的颜色
      confirmColor: {
        type: String,
        default: () => props$a.picker.confirmColor
      },
      // 每列中可见选项的数量
      visibleItemCount: {
        type: [String, Number],
        default: () => props$a.picker.visibleItemCount
      },
      // 选项对象中，需要展示的属性键名
      keyName: {
        type: String,
        default: () => props$a.picker.keyName
      },
      // 选项对象中，需要获取的属性值键名
      valueName: {
        type: String,
        default: () => props$a.picker.valueName
      },
      // 是否允许点击遮罩关闭选择器
      closeOnClickOverlay: {
        type: Boolean,
        default: () => props$a.picker.closeOnClickOverlay
      },
      // 各列的默认索引
      defaultIndex: {
        type: Array,
        default: () => props$a.picker.defaultIndex
      },
      // 是否在手指松开时立即触发 change 事件。若不开启则会在滚动动画结束后触发 change 事件，只在微信2.21.1及以上有效
      immediateChange: {
        type: Boolean,
        default: () => props$a.picker.immediateChange
      },
      // 工具栏右侧插槽是否开启
      toolbarRightSlot: {
        type: Boolean,
        default: false
      },
      // 层级
      zIndex: {
        type: [String, Number],
        default: () => props$a.picker.zIndex
      },
      // 弹窗背景色，设置为transparent可去除白色背景
      bgColor: {
        type: String,
        default: () => props$a.picker.bgColor
      },
      // 是否显示圆角
      round: {
        type: [Boolean, String, Number],
        default: () => props$a.picker.round
      },
      // 动画时长，单位ms
      duration: {
        type: [String, Number],
        default: () => props$a.picker.duration
      },
      // 遮罩的透明度，0-1之间
      overlayOpacity: {
        type: [Number, String],
        default: () => props$a.picker.overlayOpacity
      },
      // 是否页面内展示
      pageInline: {
        type: Boolean,
        default: () => props$a.picker.pageInline
      }
    }
  });
  const _sfc_main$h = {
    name: "u-picker",
    mixins: [mpMixin, mixin, props$2],
    data() {
      return {
        // 上一次选择的列索引
        lastIndex: [],
        // 索引值 ，对应picker-view的value
        innerIndex: [],
        // 各列的值
        innerColumns: [],
        // 上一次的变化列索引
        columnIndex: 0,
        showByClickInput: false,
        currentActiveValue: []
        //当前用户选中，但是还没确认的值，用户没做change操作时候，点击确认可以默认选中第一个
      };
    },
    watch: {
      // 监听columns参数的变化
      columns: {
        immediate: true,
        deep: true,
        handler(n) {
          this.setColumns(n);
        }
      },
      // 监听默认索引的变化，重新设置对应的值
      defaultIndex: {
        immediate: true,
        deep: true,
        handler(n, o) {
          if (!o || n.join("/") != o.join("/")) {
            this.setIndexs(n, true);
          }
        }
      },
      modelValue: {
        immediate: true,
        deep: true,
        handler(n, o) {
          if (!o || n.join("/") != o.join("/")) {
            let arr = [];
            if (n != null) {
              n.forEach((element, index) => {
                let currentCols = this.getColumnValues(index);
                if (!Array.isArray(currentCols) && currentCols.length === 0) {
                  return;
                }
                if (typeof currentCols[0] === "object") {
                  currentCols.forEach((item, index2) => {
                    if (item[this.valueName] == element) {
                      arr.push(index2);
                    }
                  });
                } else {
                  currentCols.forEach((item, index2) => {
                    if (item == element) {
                      arr.push(index2);
                    }
                  });
                }
              });
              if (arr.length == 0 && this.defaultIndex)
                ;
              else {
                this.setIndexs(arr, true);
              }
            }
          }
        }
      }
    },
    emits: ["close", "cancel", "confirm", "change", "update:modelValue", "update:show"],
    computed: {
      // input的props
      inputPropsInner() {
        return {
          border: this.inputBorder,
          placeholder: this.placeholder,
          disabled: this.disabled,
          disabledColor: this.disabledColor,
          ...this.inputProps
        };
      },
      //已选&&已确认的值显示在input上面的文案
      inputLabel() {
        let firstItem = this.innerColumns[0] && this.innerColumns[0][0];
        if (firstItem && Object.prototype.toString.call(firstItem) === "[object Object]") {
          let res = this.innerColumns[0].filter((item) => this.modelValue.includes(item["id"]));
          res = res.map((item) => item[this.keyName]);
          return res.join("/");
        } else {
          return this.modelValue.join("/");
        }
      },
      //已选，待确认的值
      inputValue() {
        let items = this.innerColumns.map((item, index) => item[this.innerIndex[index]]);
        let res = [];
        if (items[0] && Object.prototype.toString.call(items[0]) === "[object Object]") {
          items.forEach((element) => {
            res.push(element && element[this.valueName]);
          });
        } else {
          items.forEach((element, index) => {
            res.push(element);
          });
        }
        return res;
      }
    },
    methods: {
      addUnit,
      testArray: test.array,
      onShowByClickInput() {
        if (!this.disabled) {
          this.showByClickInput = !this.showByClickInput;
        }
      },
      // 获取item需要显示的文字，判别为对象还是文本
      getItemText(item) {
        if (test.object(item)) {
          return item[this.keyName];
        } else {
          return item;
        }
      },
      // 关闭选择器
      closeHandler() {
        if (this.closeOnClickOverlay) {
          if (this.hasInput) {
            this.showByClickInput = false;
          }
          this.setDefault();
          this.$emit("update:show", false);
          this.$emit("close");
        }
      },
      // 点击工具栏的取消按钮
      cancel() {
        if (this.hasInput) {
          this.showByClickInput = false;
        }
        this.setDefault();
        this.$emit("update:show", false);
        this.$emit("cancel");
      },
      setDefault() {
        let arr = [0];
        if (this.lastIndex.length == 0) {
          if (Array.isArray(this.defaultIndex) && this.defaultIndex.length == this.innerColumns.length) {
            arr = [...this.defaultIndex];
          } else {
            arr = Array(this.innerColumns.length).fill(0);
          }
        } else {
          arr = deepClone(this.lastIndex);
        }
        this.setLastIndex(arr);
        this.setIndexs(arr);
      },
      // 点击工具栏的确定按钮
      confirm() {
        if (!this.currentActiveValue.length) {
          this.setDefault();
        }
        this.$emit("update:modelValue", this.inputValue);
        if (this.hasInput) {
          this.showByClickInput = false;
        }
        this.setLastIndex(this.innerIndex);
        this.$emit("update:show", false);
        this.$emit("confirm", {
          indexs: this.innerIndex,
          value: this.innerColumns.map((item, index) => item[this.innerIndex[index]]),
          values: this.innerColumns
        });
      },
      // 选择器某一列的数据发生变化时触发
      changeHandler(e2) {
        const {
          value
        } = e2.detail;
        let index = 0, columnIndex = 0;
        this.currentActiveValue = value;
        for (let i = 0; i < value.length; i++) {
          let item = value[i];
          if (item !== void 0 && item !== (this.lastIndex[i] || 0)) {
            columnIndex = i;
            index = item;
            break;
          }
        }
        this.columnIndex = columnIndex;
        const values = this.innerColumns;
        this.setIndexs(value);
        this.$emit("change", {
          // 微信小程序不能传递this，会因为循环引用而报错
          // picker: this,
          value: this.innerColumns.map((item, index2) => item[value[index2]]),
          index,
          indexs: value,
          // values为当前变化列的数组内容
          values,
          columnIndex
        });
      },
      // 设置index索引，此方法可被外部调用设置
      setIndexs(index, setLastIndex) {
        this.innerIndex = deepClone(index);
        if (setLastIndex) {
          this.setLastIndex(index);
        }
      },
      // 记录上一次的各列索引位置
      setLastIndex(index) {
        this.lastIndex = deepClone(index);
      },
      // 设置对应列选项的所有值
      setColumnValues(columnIndex, values) {
        this.innerColumns.splice(columnIndex, 1, values);
        this.setLastIndex(this.innerIndex.slice(0, columnIndex));
        let tmpIndex = deepClone(this.innerIndex);
        for (let i = 0; i < this.innerColumns.length; i++) {
          if (i > this.columnIndex) {
            tmpIndex[i] = 0;
          }
        }
        this.setIndexs(tmpIndex);
      },
      // 获取对应列的所有选项
      getColumnValues(columnIndex) {
        (async () => {
          await sleep$1();
        })();
        return this.innerColumns[columnIndex];
      },
      // 设置整体各列的columns的值
      setColumns(columns) {
        this.innerColumns = deepClone(columns);
        if (this.innerIndex.length === 0) {
          this.innerIndex = new Array(columns.length).fill(0);
        }
      },
      // 获取各列选中值对应的索引
      getIndexs() {
        return this.innerIndex;
      },
      // 获取各列选中的值
      getValues() {
        (async () => {
          await sleep$1();
        })();
        return this.innerColumns.map((item, index) => item[this.innerIndex[index]]);
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_up_input = vue.resolveComponent("up-input");
    const _component_u_toolbar = resolveEasycom(vue.resolveDynamicComponent("u-toolbar"), __easycom_0$3);
    const _component_u_loading_icon = resolveEasycom(vue.resolveDynamicComponent("u-loading-icon"), __easycom_1$2);
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "u-picker-wraper" }, [
      _ctx.hasInput ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "u-picker-input cursor-pointer",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.onShowByClickInput && $options.onShowByClickInput(...args))
      }, [
        vue.renderSlot(_ctx.$slots, "default", { value: $options.inputLabel }, void 0, true),
        vue.renderSlot(_ctx.$slots, "trigger", { value: $options.inputLabel }, void 0, true),
        !_ctx.$slots["default"] && !_ctx.$slots["$default"] && !_ctx.$slots["trigger"] ? (vue.openBlock(), vue.createBlock(_component_up_input, vue.mergeProps({
          key: 0,
          readonly: true,
          modelValue: $options.inputLabel,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $options.inputLabel = $event)
        }, $options.inputPropsInner), null, 16, ["modelValue"])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("cover-view", { class: "input-cover" })
      ])) : vue.createCommentVNode("v-if", true),
      vue.createVNode(_component_u_popup, {
        show: _ctx.show || _ctx.hasInput && $data.showByClickInput,
        mode: _ctx.popupMode,
        zIndex: _ctx.zIndex,
        bgColor: _ctx.bgColor,
        round: _ctx.round,
        duration: _ctx.duration,
        pageInline: _ctx.pageInline,
        overlayOpacity: _ctx.overlayOpacity,
        onClose: $options.closeHandler
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "u-picker" }, [
            _ctx.showToolbar ? (vue.openBlock(), vue.createBlock(_component_u_toolbar, {
              key: 0,
              cancelColor: _ctx.cancelColor,
              confirmColor: _ctx.confirmColor,
              cancelText: _ctx.cancelText,
              confirmText: _ctx.confirmText,
              title: _ctx.title,
              rightSlot: _ctx.toolbarRightSlot ? true : false,
              onCancel: $options.cancel,
              onConfirm: $options.confirm
            }, {
              right: vue.withCtx(() => [
                vue.renderSlot(_ctx.$slots, "toolbar-right", {}, void 0, true)
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["cancelColor", "confirmColor", "cancelText", "confirmText", "title", "rightSlot", "onCancel", "onConfirm"])) : vue.createCommentVNode("v-if", true),
            vue.renderSlot(_ctx.$slots, "toolbar-bottom", {}, void 0, true),
            vue.createElementVNode("picker-view", {
              class: "u-picker__view",
              indicatorStyle: `height: ${$options.addUnit(_ctx.itemHeight, "px")}`,
              value: $data.innerIndex,
              immediateChange: _ctx.immediateChange,
              style: vue.normalizeStyle({
                height: `${$options.addUnit(_ctx.visibleItemCount * _ctx.itemHeight, "px")}`
              }),
              onChange: _cache[2] || (_cache[2] = (...args) => $options.changeHandler && $options.changeHandler(...args))
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.innerColumns, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("picker-view-column", {
                    key: index,
                    class: "u-picker__view__column"
                  }, [
                    $options.testArray(item) ? (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      { key: 0 },
                      vue.renderList(item, (item1, index1) => {
                        return vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            class: vue.normalizeClass(["u-picker__view__column__item u-line-1", [index1 === $data.innerIndex[index] && "u-picker__view__column__item--selected"]]),
                            key: index1,
                            style: vue.normalizeStyle({
                              height: $options.addUnit(_ctx.itemHeight, "px"),
                              lineHeight: $options.addUnit(_ctx.itemHeight, "px"),
                              fontWeight: index1 === $data.innerIndex[index] ? "bold" : "normal",
                              display: "block"
                            })
                          },
                          vue.toDisplayString($options.getItemText(item1)),
                          7
                          /* TEXT, CLASS, STYLE */
                        );
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    )) : vue.createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 44, ["indicatorStyle", "value", "immediateChange"]),
            _ctx.loading ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "u-picker--loading"
            }, [
              vue.createVNode(_component_u_loading_icon, { mode: "circle" })
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["show", "mode", "zIndex", "bgColor", "round", "duration", "pageInline", "overlayOpacity", "onClose"])
    ]);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-91b05052"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-picker/u-picker.vue"]]);
  const props$1 = defineMixin({
    props: {
      // 是否显示input
      hasInput: {
        type: Boolean,
        default: false
      },
      inputProps: {
        type: Object,
        default: () => {
          return {};
        }
      },
      inputBorder: {
        type: String,
        default: () => props$a.input.inputBorder
      },
      disabled: {
        type: Boolean,
        default: () => props$a.input.disabled
      },
      disabledColor: {
        type: String,
        default: () => props$a.input.disabledColor
      },
      placeholder: {
        type: String,
        default: () => props$a.input.placeholder
      },
      format: {
        type: String,
        default: () => ""
      },
      // 是否打开组件
      show: {
        type: Boolean,
        default: () => props$a.datetimePicker.show
      },
      // 弹出的方向，可选值为 top bottom right left center
      popupMode: {
        type: String,
        default: () => props$a.picker.popupMode
      },
      // 是否展示顶部的操作栏
      showToolbar: {
        type: Boolean,
        default: () => props$a.datetimePicker.showToolbar
      },
      // 工具栏右侧内容
      toolbarRightSlot: {
        type: Boolean,
        default: false
      },
      // 绑定值
      modelValue: {
        type: [String, Number],
        default: () => props$a.datetimePicker.value
      },
      // 顶部标题
      title: {
        type: String,
        default: () => props$a.datetimePicker.title
      },
      // 展示格式，mode=date为日期选择，mode=time为时间选择，mode=year-month为年月选择，mode=datetime为日期时间选择
      mode: {
        type: String,
        default: () => props$a.datetimePicker.mode
      },
      // 可选的最大时间
      maxDate: {
        type: Number,
        // 最大默认值为后10年
        default: () => props$a.datetimePicker.maxDate
      },
      // 可选的最小时间
      minDate: {
        type: Number,
        // 最小默认值为前10年
        default: () => props$a.datetimePicker.minDate
      },
      // 可选的最小小时，仅mode=time有效
      minHour: {
        type: Number,
        default: () => props$a.datetimePicker.minHour
      },
      // 可选的最大小时，仅mode=time有效
      maxHour: {
        type: Number,
        default: () => props$a.datetimePicker.maxHour
      },
      // 可选的最小分钟，仅mode=time有效
      minMinute: {
        type: Number,
        default: () => props$a.datetimePicker.minMinute
      },
      // 可选的最大分钟，仅mode=time有效
      maxMinute: {
        type: Number,
        default: () => props$a.datetimePicker.maxMinute
      },
      // 选项过滤函数
      filter: {
        type: [Function, null],
        default: () => props$a.datetimePicker.filter
      },
      // 选项格式化函数
      formatter: {
        type: [Function, null],
        default: () => props$a.datetimePicker.formatter
      },
      // 是否显示加载中状态
      loading: {
        type: Boolean,
        default: () => props$a.datetimePicker.loading
      },
      // 各列中，单个选项的高度
      itemHeight: {
        type: [String, Number],
        default: () => props$a.datetimePicker.itemHeight
      },
      // 取消按钮的文字
      cancelText: {
        type: String,
        default: () => props$a.datetimePicker.cancelText
      },
      // 确认按钮的文字
      confirmText: {
        type: String,
        default: () => props$a.datetimePicker.confirmText
      },
      // 取消按钮的颜色
      cancelColor: {
        type: String,
        default: () => props$a.datetimePicker.cancelColor
      },
      // 确认按钮的颜色
      confirmColor: {
        type: String,
        default: () => props$a.datetimePicker.confirmColor
      },
      // 每列中可见选项的数量
      visibleItemCount: {
        type: [String, Number],
        default: () => props$a.datetimePicker.visibleItemCount
      },
      // 是否允许点击遮罩关闭选择器
      closeOnClickOverlay: {
        type: Boolean,
        default: () => props$a.datetimePicker.closeOnClickOverlay
      },
      // 各列的默认索引
      defaultIndex: {
        type: Array,
        default: () => props$a.datetimePicker.defaultIndex
      },
      // 是否页面内展示
      pageInline: {
        type: Boolean,
        default: () => props$a.datetimePicker.pageInline
      }
    }
  });
  var e = function() {
    var t2 = 1e3, e2 = 6e4, n = 36e5, r = "millisecond", s = "second", i = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t3) {
      var e3 = ["th", "st", "nd", "rd"], n2 = t3 % 100;
      return "[" + t3 + (e3[(n2 - 20) % 10] || e3[n2] || e3[0]) + "]";
    } }, g = function(t3, e3, n2) {
      var r2 = String(t3);
      return !r2 || r2.length >= e3 ? t3 : "" + Array(e3 + 1 - r2.length).join(n2) + t3;
    }, v = { s: g, z: function(t3) {
      var e3 = -t3.utcOffset(), n2 = Math.abs(e3), r2 = Math.floor(n2 / 60), s2 = n2 % 60;
      return (e3 <= 0 ? "+" : "-") + g(r2, 2, "0") + ":" + g(s2, 2, "0");
    }, m: function t3(e3, n2) {
      if (e3.date() < n2.date())
        return -t3(n2, e3);
      var r2 = 12 * (n2.year() - e3.year()) + (n2.month() - e3.month()), s2 = e3.clone().add(r2, c), i2 = n2 - s2 < 0, u2 = e3.clone().add(r2 + (i2 ? -1 : 1), c);
      return +(-(r2 + (n2 - s2) / (i2 ? s2 - u2 : u2 - s2)) || 0);
    }, a: function(t3) {
      return t3 < 0 ? Math.ceil(t3) || 0 : Math.floor(t3);
    }, p: function(t3) {
      return { M: c, y: h, w: o, d: a, D: d, h: u, m: i, s, ms: r, Q: f }[t3] || String(t3 || "").toLowerCase().replace(/s$/, "");
    }, u: function(t3) {
      return void 0 === t3;
    } }, m = "en", D = {};
    D[m] = M;
    var p = "$isDayjsObject", S = function(t3) {
      return t3 instanceof _ || !(!t3 || !t3[p]);
    }, w = function t3(e3, n2, r2) {
      var s2;
      if (!e3)
        return m;
      if ("string" == typeof e3) {
        var i2 = e3.toLowerCase();
        D[i2] && (s2 = i2), n2 && (D[i2] = n2, s2 = i2);
        var u2 = e3.split("-");
        if (!s2 && u2.length > 1)
          return t3(u2[0]);
      } else {
        var a2 = e3.name;
        D[a2] = e3, s2 = a2;
      }
      return !r2 && s2 && (m = s2), s2 || !r2 && m;
    }, b = function(t3, e3) {
      if (S(t3))
        return t3.clone();
      var n2 = "object" == typeof e3 ? e3 : {};
      return n2.date = t3, n2.args = arguments, new _(n2);
    }, O = v;
    O.l = w, O.i = S, O.w = function(t3, e3) {
      return b(t3, { locale: e3.$L, utc: e3.$u, x: e3.$x, $offset: e3.$offset });
    };
    var _ = function() {
      function M2(t3) {
        this.$L = w(t3.locale, null, true), this.parse(t3), this.$x = this.$x || t3.x || {}, this[p] = true;
      }
      var g2 = M2.prototype;
      return g2.parse = function(t3) {
        this.$d = function(t4) {
          var e3 = t4.date, n2 = t4.utc;
          if (null === e3)
            return /* @__PURE__ */ new Date(NaN);
          if (O.u(e3))
            return /* @__PURE__ */ new Date();
          if (e3 instanceof Date)
            return new Date(e3);
          if ("string" == typeof e3 && !/Z$/i.test(e3)) {
            var r2 = e3.match($);
            if (r2) {
              var s2 = r2[2] - 1 || 0, i2 = (r2[7] || "0").substring(0, 3);
              return n2 ? new Date(Date.UTC(r2[1], s2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, i2)) : new Date(r2[1], s2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, i2);
            }
          }
          return new Date(e3);
        }(t3), this.init();
      }, g2.init = function() {
        var t3 = this.$d;
        this.$y = t3.getFullYear(), this.$M = t3.getMonth(), this.$D = t3.getDate(), this.$W = t3.getDay(), this.$H = t3.getHours(), this.$m = t3.getMinutes(), this.$s = t3.getSeconds(), this.$ms = t3.getMilliseconds();
      }, g2.$utils = function() {
        return O;
      }, g2.isValid = function() {
        return !(this.$d.toString() === l);
      }, g2.isSame = function(t3, e3) {
        var n2 = b(t3);
        return this.startOf(e3) <= n2 && n2 <= this.endOf(e3);
      }, g2.isAfter = function(t3, e3) {
        return b(t3) < this.startOf(e3);
      }, g2.isBefore = function(t3, e3) {
        return this.endOf(e3) < b(t3);
      }, g2.$g = function(t3, e3, n2) {
        return O.u(t3) ? this[e3] : this.set(n2, t3);
      }, g2.unix = function() {
        return Math.floor(this.valueOf() / 1e3);
      }, g2.valueOf = function() {
        return this.$d.getTime();
      }, g2.startOf = function(t3, e3) {
        var n2 = this, r2 = !!O.u(e3) || e3, f2 = O.p(t3), l2 = function(t4, e4) {
          var s2 = O.w(n2.$u ? Date.UTC(n2.$y, e4, t4) : new Date(n2.$y, e4, t4), n2);
          return r2 ? s2 : s2.endOf(a);
        }, $2 = function(t4, e4) {
          return O.w(n2.toDate()[t4].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e4)), n2);
        }, y2 = this.$W, M3 = this.$M, g3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
        switch (f2) {
          case h:
            return r2 ? l2(1, 0) : l2(31, 11);
          case c:
            return r2 ? l2(1, M3) : l2(0, M3 + 1);
          case o:
            var m2 = this.$locale().weekStart || 0, D2 = (y2 < m2 ? y2 + 7 : y2) - m2;
            return l2(r2 ? g3 - D2 : g3 + (6 - D2), M3);
          case a:
          case d:
            return $2(v2 + "Hours", 0);
          case u:
            return $2(v2 + "Minutes", 1);
          case i:
            return $2(v2 + "Seconds", 2);
          case s:
            return $2(v2 + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, g2.endOf = function(t3) {
        return this.startOf(t3, false);
      }, g2.$set = function(t3, e3) {
        var n2, o2 = O.p(t3), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[i] = f2 + "Minutes", n2[s] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e3 - this.$W) : e3;
        if (o2 === c || o2 === h) {
          var y2 = this.clone().set(d, 1);
          y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
        } else
          l2 && this.$d[l2]($2);
        return this.init(), this;
      }, g2.set = function(t3, e3) {
        return this.clone().$set(t3, e3);
      }, g2.get = function(t3) {
        return this[O.p(t3)]();
      }, g2.add = function(r2, f2) {
        var d2, l2 = this;
        r2 = Number(r2);
        var $2 = O.p(f2), y2 = function(t3) {
          var e3 = b(l2);
          return O.w(e3.date(e3.date() + Math.round(t3 * r2)), l2);
        };
        if ($2 === c)
          return this.set(c, this.$M + r2);
        if ($2 === h)
          return this.set(h, this.$y + r2);
        if ($2 === a)
          return y2(1);
        if ($2 === o)
          return y2(7);
        var M3 = (d2 = {}, d2[i] = e2, d2[u] = n, d2[s] = t2, d2)[$2] || 1, g3 = this.$d.getTime() + r2 * M3;
        return O.w(g3, this);
      }, g2.subtract = function(t3, e3) {
        return this.add(-1 * t3, e3);
      }, g2.format = function(t3) {
        var e3 = this, n2 = this.$locale();
        if (!this.isValid())
          return n2.invalidDate || l;
        var r2 = t3 || "YYYY-MM-DDTHH:mm:ssZ", s2 = O.z(this), i2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t4, n3, s3, i3) {
          return t4 && (t4[n3] || t4(e3, r2)) || s3[n3].slice(0, i3);
        }, d2 = function(t4) {
          return O.s(i2 % 12 || 12, t4, "0");
        }, $2 = f2 || function(t4, e4, n3) {
          var r3 = t4 < 12 ? "AM" : "PM";
          return n3 ? r3.toLowerCase() : r3;
        };
        return r2.replace(y, function(t4, r3) {
          return r3 || function(t5) {
            switch (t5) {
              case "YY":
                return String(e3.$y).slice(-2);
              case "YYYY":
                return O.s(e3.$y, 4, "0");
              case "M":
                return a2 + 1;
              case "MM":
                return O.s(a2 + 1, 2, "0");
              case "MMM":
                return h2(n2.monthsShort, a2, c2, 3);
              case "MMMM":
                return h2(c2, a2);
              case "D":
                return e3.$D;
              case "DD":
                return O.s(e3.$D, 2, "0");
              case "d":
                return String(e3.$W);
              case "dd":
                return h2(n2.weekdaysMin, e3.$W, o2, 2);
              case "ddd":
                return h2(n2.weekdaysShort, e3.$W, o2, 3);
              case "dddd":
                return o2[e3.$W];
              case "H":
                return String(i2);
              case "HH":
                return O.s(i2, 2, "0");
              case "h":
                return d2(1);
              case "hh":
                return d2(2);
              case "a":
                return $2(i2, u2, true);
              case "A":
                return $2(i2, u2, false);
              case "m":
                return String(u2);
              case "mm":
                return O.s(u2, 2, "0");
              case "s":
                return String(e3.$s);
              case "ss":
                return O.s(e3.$s, 2, "0");
              case "SSS":
                return O.s(e3.$ms, 3, "0");
              case "Z":
                return s2;
            }
            return null;
          }(t4) || s2.replace(":", "");
        });
      }, g2.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, g2.diff = function(r2, d2, l2) {
        var $2, y2 = this, M3 = O.p(d2), g3 = b(r2), v2 = (g3.utcOffset() - this.utcOffset()) * e2, m2 = this - g3, D2 = function() {
          return O.m(y2, g3);
        };
        switch (M3) {
          case h:
            $2 = D2() / 12;
            break;
          case c:
            $2 = D2();
            break;
          case f:
            $2 = D2() / 3;
            break;
          case o:
            $2 = (m2 - v2) / 6048e5;
            break;
          case a:
            $2 = (m2 - v2) / 864e5;
            break;
          case u:
            $2 = m2 / n;
            break;
          case i:
            $2 = m2 / e2;
            break;
          case s:
            $2 = m2 / t2;
            break;
          default:
            $2 = m2;
        }
        return l2 ? $2 : O.a($2);
      }, g2.daysInMonth = function() {
        return this.endOf(c).$D;
      }, g2.$locale = function() {
        return D[this.$L];
      }, g2.locale = function(t3, e3) {
        if (!t3)
          return this.$L;
        var n2 = this.clone(), r2 = w(t3, e3, true);
        return r2 && (n2.$L = r2), n2;
      }, g2.clone = function() {
        return O.w(this.$d, this);
      }, g2.toDate = function() {
        return new Date(this.valueOf());
      }, g2.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, g2.toISOString = function() {
        return this.$d.toISOString();
      }, g2.toString = function() {
        return this.$d.toUTCString();
      }, M2;
    }(), k = _.prototype;
    return b.prototype = k, [["$ms", r], ["$s", s], ["$m", i], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t3) {
      k[t3[1]] = function(e3) {
        return this.$g(e3, t3[0], t3[1]);
      };
    }), b.extend = function(t3, e3) {
      return t3.$i || (t3(e3, _, b), t3.$i = true), b;
    }, b.locale = w, b.isDayjs = S, b.unix = function(t3) {
      return b(1e3 * t3);
    }, b.en = D[m], b.Ls = D, b.p = {}, b;
  }();
  function times(n, iteratee) {
    let index = -1;
    const result = Array(n < 0 ? 0 : n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  const _sfc_main$g = {
    name: "up-datetime-picker",
    mixins: [mpMixin, mixin, props$1],
    data() {
      return {
        // 原来的日期选择器不方便，这里增加一个hasInput选项支持类似element的自带输入框的功能。
        inputValue: "",
        // 表单显示值
        showByClickInput: false,
        // 是否在hasInput模式下显示日期选择弹唱
        columns: [],
        innerDefaultIndex: [],
        innerFormatter: (type, value) => value
      };
    },
    watch: {
      show(newValue, oldValue) {
        if (newValue) {
          this.innerValue = this.correctValue(this.modelValue);
          this.updateColumnValue(this.innerValue);
        }
      },
      modelValue(newValue) {
        this.init();
      },
      propsChange() {
        this.init();
      }
    },
    computed: {
      // 如果以下这些变量发生了变化，意味着需要重新初始化各列的值
      propsChange() {
        return [this.mode, this.maxDate, this.minDate, this.minHour, this.maxHour, this.minMinute, this.maxMinute, this.filter, this.modelValue];
      },
      // input的props
      inputPropsInner() {
        return {
          border: this.inputBorder,
          placeholder: this.placeholder,
          disabled: this.disabled,
          disabledColor: this.disabledColor,
          ...this.inputProps
        };
      }
    },
    mounted() {
      this.init();
    },
    emits: ["close", "cancel", "confirm", "change", "update:modelValue"],
    methods: {
      getInputValue(newValue) {
        if (newValue == "" || !newValue || newValue == void 0) {
          this.inputValue = "";
          return;
        }
        if (this.mode == "time") {
          this.inputValue = newValue;
        } else {
          if (this.format) {
            this.inputValue = e(newValue).format(this.format);
          } else {
            let format = "";
            switch (this.mode) {
              case "date":
                format = "YYYY-MM-DD";
                break;
              case "year-month":
                format = "YYYY-MM";
                break;
              case "datehour":
                format = "YYYY-MM-DD HH";
                break;
              case "datetime":
                format = "YYYY-MM-DD HH:mm";
                break;
              case "time":
                format = "HH:mm";
                break;
            }
            this.inputValue = e(newValue).format(format);
          }
        }
      },
      init() {
        this.innerValue = this.correctValue(this.modelValue);
        this.updateColumnValue(this.innerValue);
        this.getInputValue(this.innerValue);
      },
      // 在微信小程序中，不支持将函数当做props参数，故只能通过ref形式调用
      setFormatter(e2) {
        this.innerFormatter = e2;
      },
      // 关闭选择器
      close() {
        if (this.closeOnClickOverlay) {
          this.$emit("close");
        }
      },
      // 点击工具栏的取消按钮
      cancel() {
        if (this.hasInput) {
          this.showByClickInput = false;
        }
        this.$emit("cancel");
      },
      // 点击工具栏的确定按钮
      confirm() {
        this.$emit("update:modelValue", this.innerValue);
        if (this.hasInput) {
          this.getInputValue(this.innerValue);
          this.showByClickInput = false;
        }
        this.$emit("confirm", {
          value: this.innerValue,
          mode: this.mode
        });
      },
      //用正则截取输出值,当出现多组数字时,抛出错误
      intercept(e2, type) {
        let judge = e2.match(/\d+/g);
        if (judge.length > 1) {
          error("请勿在过滤或格式化函数时添加数字");
          return 0;
        } else if (type && judge[0].length == 4) {
          return judge[0];
        } else if (judge[0].length > 2) {
          error("请勿在过滤或格式化函数时添加数字");
          return 0;
        } else {
          return judge[0];
        }
      },
      // 列发生变化时触发
      change(e$1) {
        const { indexs, values } = e$1;
        let selectValue = "";
        if (this.mode === "time") {
          selectValue = `${this.intercept(values[0][indexs[0]])}:${this.intercept(values[1][indexs[1]])}`;
        } else {
          const year = parseInt(this.intercept(values[0][indexs[0]], "year"));
          const month = parseInt(this.intercept(values[1][indexs[1]]));
          let date2 = parseInt(values[2] ? this.intercept(values[2][indexs[2]]) : 1);
          let hour = 0, minute = 0;
          const maxDate = e(`${year}-${month}`).daysInMonth();
          if (this.mode === "year-month") {
            date2 = 1;
          }
          date2 = Math.min(maxDate, date2);
          if (this.mode === "datetime") {
            hour = parseInt(this.intercept(values[3][indexs[3]]));
            minute = parseInt(this.intercept(values[4][indexs[4]]));
          }
          selectValue = Number(new Date(year, month - 1, date2, hour, minute));
        }
        selectValue = this.correctValue(selectValue);
        this.innerValue = selectValue;
        this.updateColumnValue(selectValue);
        this.$emit("change", {
          value: selectValue,
          // 微信小程序不能传递this实例，会因为循环引用而报错
          // picker: this.$refs.picker,
          mode: this.mode
        });
      },
      // 更新各列的值，进行补0、格式化等操作
      updateColumnValue(value) {
        this.innerValue = value;
        this.updateColumns();
        setTimeout(() => {
          this.updateIndexs(value);
        }, 0);
      },
      // 更新索引
      updateIndexs(value) {
        let values = [];
        const formatter = this.formatter || this.innerFormatter;
        if (this.mode === "time") {
          const timeArr = value.split(":");
          values = [formatter("hour", timeArr[0]), formatter("minute", timeArr[1])];
        } else {
          values = [
            formatter("year", `${e(value).year()}`),
            // 月份补0
            formatter("month", padZero(e(value).month() + 1))
          ];
          if (this.mode === "date") {
            values.push(formatter("day", padZero(e(value).date())));
          }
          if (this.mode === "datetime") {
            values.push(formatter("day", padZero(e(value).date())), formatter("hour", padZero(e(value).hour())), formatter("minute", padZero(e(value).minute())));
          }
        }
        const indexs = this.columns.map((column, index) => {
          return Math.max(0, column.findIndex((item) => item === values[index]));
        });
        this.innerDefaultIndex = indexs;
      },
      // 更新各列的值
      updateColumns() {
        const formatter = this.formatter || this.innerFormatter;
        const results = this.getOriginColumns().map((column) => column.values.map((value) => formatter(column.type, value)));
        this.columns = results;
      },
      getOriginColumns() {
        const results = this.getRanges().map(({ type, range: range2 }) => {
          let values = times(range2[1] - range2[0] + 1, (index) => {
            let value = range2[0] + index;
            value = type === "year" ? `${value}` : padZero(value);
            return value;
          });
          if (this.filter) {
            values = this.filter(type, values);
            if (!values || values && values.length == 0) {
              formatAppLog("log", "at uni_modules/uview-plus/components/u-datetime-picker/u-datetime-picker.vue:366", "日期filter结果不能为空");
            }
          }
          return { type, values };
        });
        return results;
      },
      // 通过最大值和最小值生成数组
      generateArray(start, end) {
        return Array.from(new Array(end + 1).keys()).slice(start);
      },
      // 得出合法的时间
      correctValue(value) {
        const isDateMode = this.mode !== "time";
        if (isDateMode && !e.unix(value).isValid()) {
          value = this.minDate;
        } else if (!isDateMode && !value) {
          value = `${padZero(this.minHour)}:${padZero(this.minMinute)}`;
        }
        if (!isDateMode) {
          if (String(value).indexOf(":") === -1)
            return error("时间错误，请传递如12:24的格式");
          let [hour, minute] = value.split(":");
          hour = padZero(range(this.minHour, this.maxHour, Number(hour)));
          minute = padZero(range(this.minMinute, this.maxMinute, Number(minute)));
          return `${hour}:${minute}`;
        } else {
          value = e(value).isBefore(e(this.minDate)) ? this.minDate : value;
          value = e(value).isAfter(e(this.maxDate)) ? this.maxDate : value;
          return value;
        }
      },
      // 获取每列的最大和最小值
      getRanges() {
        if (this.mode === "time") {
          return [
            {
              type: "hour",
              range: [this.minHour, this.maxHour]
            },
            {
              type: "minute",
              range: [this.minMinute, this.maxMinute]
            }
          ];
        }
        const { maxYear, maxDate, maxMonth, maxHour, maxMinute } = this.getBoundary("max", this.innerValue);
        const { minYear, minDate, minMonth, minHour, minMinute } = this.getBoundary("min", this.innerValue);
        const result = [
          {
            type: "year",
            range: [minYear, maxYear]
          },
          {
            type: "month",
            range: [minMonth, maxMonth]
          },
          {
            type: "day",
            range: [minDate, maxDate]
          },
          {
            type: "hour",
            range: [minHour, maxHour]
          },
          {
            type: "minute",
            range: [minMinute, maxMinute]
          }
        ];
        if (this.mode === "date")
          result.splice(3, 2);
        if (this.mode === "year-month")
          result.splice(2, 3);
        return result;
      },
      // 根据minDate、maxDate、minHour、maxHour等边界值，判断各列的开始和结束边界值
      getBoundary(type, innerValue) {
        let value = new Date(innerValue);
        if (isNaN(value.getTime())) {
          value = /* @__PURE__ */ new Date();
        }
        const boundary = new Date(this[`${type}Date`]);
        const year = e(boundary).year();
        let month = 1;
        let date2 = 1;
        let hour = 0;
        let minute = 0;
        if (type === "max") {
          month = 12;
          date2 = e(value).daysInMonth();
          hour = 23;
          minute = 59;
        }
        if (e(value).year() === year) {
          month = e(boundary).month() + 1;
          if (e(value).month() + 1 === month) {
            date2 = e(boundary).date();
            if (e(value).date() === date2) {
              hour = e(boundary).hour();
              if (e(value).hour() === hour) {
                minute = e(boundary).minute();
              }
            }
          }
        }
        return {
          [`${type}Year`]: year,
          [`${type}Month`]: month,
          [`${type}Date`]: date2,
          [`${type}Hour`]: hour,
          [`${type}Minute`]: minute
        };
      },
      onShowByClickInput() {
        if (!this.disabled) {
          this.showByClickInput = !this.showByClickInput;
        }
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_up_input = vue.resolveComponent("up-input");
    const _component_u_picker = resolveEasycom(vue.resolveDynamicComponent("u-picker"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "u-datetime-picker" }, [
      _ctx.hasInput ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "u-datetime-picker__has-input",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.onShowByClickInput && $options.onShowByClickInput(...args))
      }, [
        vue.renderSlot(_ctx.$slots, "trigger", { value: $data.inputValue }, () => [
          vue.createVNode(_component_up_input, vue.mergeProps({
            readonly: !!$data.showByClickInput,
            modelValue: $data.inputValue,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.inputValue = $event)
          }, $options.inputPropsInner), null, 16, ["readonly", "modelValue"]),
          vue.createElementVNode("cover-view", { class: "input-cover" })
        ], true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.createVNode(_component_u_picker, {
        ref: "picker",
        show: _ctx.pageInline || _ctx.show || _ctx.hasInput && $data.showByClickInput,
        popupMode: _ctx.popupMode,
        closeOnClickOverlay: _ctx.closeOnClickOverlay,
        columns: $data.columns,
        title: _ctx.title,
        itemHeight: _ctx.itemHeight,
        showToolbar: _ctx.showToolbar,
        visibleItemCount: _ctx.visibleItemCount,
        defaultIndex: $data.innerDefaultIndex,
        cancelText: _ctx.cancelText,
        confirmText: _ctx.confirmText,
        cancelColor: _ctx.cancelColor,
        confirmColor: _ctx.confirmColor,
        toolbarRightSlot: _ctx.toolbarRightSlot,
        pageInline: _ctx.pageInline,
        onClose: $options.close,
        onCancel: $options.cancel,
        onConfirm: $options.confirm,
        onChange: $options.change
      }, {
        "toolbar-right": vue.withCtx(() => [
          vue.renderSlot(_ctx.$slots, "toolbar-right", {}, void 0, true)
        ]),
        "toolbar-bottom": vue.withCtx(() => [
          vue.renderSlot(_ctx.$slots, "toolbar-bottom", {}, void 0, true)
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["show", "popupMode", "closeOnClickOverlay", "columns", "title", "itemHeight", "showToolbar", "visibleItemCount", "defaultIndex", "cancelText", "confirmText", "cancelColor", "confirmColor", "toolbarRightSlot", "pageInline", "onClose", "onCancel", "onConfirm", "onChange"])
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-e7a0f1eb"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-datetime-picker/u-datetime-picker.vue"]]);
  var isVue2 = false;
  function set$1(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e2) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e2) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia2) => activePinia = pinia2;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject(o) {
    return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url2, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url2);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url2) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url2, false);
    try {
      xhr.send();
    } catch (e2) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e2) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url2 = reader.result;
        if (typeof url2 !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url2 = isChromeIOS ? url2 : url2.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url2;
        } else {
          location.assign(url2);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url2 = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url2);
      else
        location.href = url2;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url2);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error2) {
    if (error2 instanceof Error && error2.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia2) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia2.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error2) {
      if (checkNotFocusedError(error2))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error2);
    }
  }
  async function actionGlobalPasteState(pinia2) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia2, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error2) {
      if (checkNotFocusedError(error2))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error2);
    }
  }
  async function actionGlobalSaveState(pinia2) {
    try {
      saveAs(new Blob([JSON.stringify(pinia2.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error2) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error2);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia2) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia2, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error2) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error2);
    }
  }
  function loadStoresState(pinia2, state) {
    for (const key in state) {
      const storeState = pinia2.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia2.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store) {
    return isPinia(store) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store.$id,
      label: store.$id
    };
  }
  function formatStoreForInspectorState(store) {
    if (isPinia(store)) {
      const storeNames = Array.from(store._s.keys());
      const storeMap = store._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store2 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store2._getters.reduce((getters, key) => {
              getters[key] = store2[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store.$state).map((key) => ({
        editable: true,
        key,
        value: store.$state[key]
      }))
    };
    if (store._getters && store._getters.length) {
      state.getters = store._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store[getterName]
      }));
    }
    if (store._customProperties.size) {
      state.customProperties = Array.from(store._customProperties).map((key) => ({
        editable: true,
        key,
        value: store[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia2) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia2);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia2);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia2);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia2);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store = pinia2._s.get(nodeId);
              if (!store) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store) => {
            payload.instanceData.state.push({
              type: getStoreType(store.$id),
              key: "state",
              editable: true,
              value: store._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store.$state).reduce((state, key) => {
                  state[key] = store.$state[key];
                  return state;
                }, {})
              )
            });
            if (store._getters && store._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store.$id),
                key: "getters",
                editable: false,
                value: store._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store[key];
                  } catch (error2) {
                    getters[key] = error2;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia2];
          stores = stores.concat(Array.from(pinia2._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store) => "$id" in store ? store.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia2 : pinia2._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia2 : pinia2._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store = pinia2._s.get(storeId);
          if (!store) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store) {
    if (!componentStateTypes.includes(getStoreType(store.$id))) {
      componentStateTypes.push(getStoreType(store.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error2) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                error: error2
              },
              groupId
            }
          });
        });
      }, true);
      store._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store._hotUpdate;
      store._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store;
      store.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`"${store.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store, options }) {
    if (store.$id.startsWith("__hot:")) {
      return;
    }
    store._isOptionsAPI = !!options.state;
    patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
    const originalHotUpdate = store._hotUpdate;
    vue.toRaw(store)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia2 = vue.markRaw({
      install(app) {
        setActivePinia(pinia2);
        {
          pinia2._a = app;
          app.provide(piniaSymbol, pinia2);
          app.config.globalProperties.$pinia = pinia2;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia2);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia2.use(devtoolsPlugin);
    }
    return pinia2;
  }
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o) {
    return !!(vue.isRef(o) && o.effect);
  }
  function createOptionsStore(id, options, pinia2, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia2.state.value[id];
    let store;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia2.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia2.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia2);
          const store2 = pinia2._s.get(id);
          return getters[name].call(store2, store2);
        }));
        return computedGetters;
      }, {}));
    }
    store = createSetupStore(id, setup, options, pinia2, hot, true);
    return store;
  }
  function createSetupStore($id, setup, options = {}, pinia2, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia2._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia2.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia2.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia2.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia2.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia2.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia2._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia2);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store, args);
        } catch (error2) {
          triggerSubscriptions(onErrorCallbackList, error2);
          throw error2;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error2) => {
            triggerSubscriptions(onErrorCallbackList, error2);
            return Promise.reject(error2);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia2,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia2.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia2._s.set($id, store);
    const runWithContext = pinia2._a && pinia2._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia2._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set$1(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia2.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store, setupStore);
      assign(vue.toRaw(store), setupStore);
    }
    Object.defineProperty(store, "$state", {
      get: () => hot ? hotState.value : pinia2.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store._hotUpdate = vue.markRaw((newStore) => {
        store._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set$1(store, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia2.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set$1(store, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia2);
              return getter.call(store, store);
            })
          ) : getter;
          set$1(store, getterName, getterValue);
        }
        Object.keys(store._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store, key);
          }
        });
        Object.keys(store._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store, key);
          }
        });
        store._hmrPayload = newStore._hmrPayload;
        store._getters = newStore._getters;
        store._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
        Object.defineProperty(store, p, assign({ value: store[p] }, nonEnumerable));
      });
    }
    pinia2._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store,
          app: pinia2._a,
          pinia: pinia2,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
        assign(store, extensions);
      } else {
        assign(store, scope.run(() => extender({
          store,
          app: pinia2._a,
          pinia: pinia2,
          options: optionsForPlugin
        })));
      }
    });
    if (store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore(pinia2, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia2 = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia2 || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia2)
        setActivePinia(pinia2);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia2 = activePinia;
      if (!pinia2._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia2);
        } else {
          createOptionsStore(id, options, pinia2);
        }
        {
          useStore._pinia = pinia2;
        }
      }
      const store = pinia2._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia2, true) : createOptionsStore(hotId, assign({}, options), pinia2, true);
        hot._hotUpdate(newStore);
        delete pinia2.state.value[hotId];
        pinia2._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store;
        }
      }
      return store;
    }
    useStore.$id = id;
    return useStore;
  }
  const useUserStore = defineStore("user", {
    // 定义 state
    state: () => ({
      userInfo: {},
      token: "",
      tokenExpireTime: 0,
      openid: ""
      // 微信 openid，用于快速登录
    }),
    // 定义 getters
    getters: {
      // 获取用户昵称
      nickname: (state) => {
        var _a;
        return ((_a = state.userInfo) == null ? void 0 : _a.nickname) || "新手屁屁";
      },
      // 获取用户头像
      avatar: (state) => {
        var _a;
        return ((_a = state.userInfo) == null ? void 0 : _a.avatar) || "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png";
      },
      // 获取用户等级
      level: (state) => {
        var _a;
        return ((_a = state.userInfo) == null ? void 0 : _a.level) || 1;
      },
      levelName: (state) => {
        var _a;
        return ((_a = state.userInfo) == null ? void 0 : _a.levelName) || "新手屁民";
      },
      // 获取累计放屁次数
      totalFarts: (state) => {
        var _a;
        return ((_a = state.userInfo) == null ? void 0 : _a.totalFarts) || 0;
      },
      // 获取经验值
      experience: (state) => {
        var _a;
        return ((_a = state.userInfo) == null ? void 0 : _a.experience) || 0;
      },
      // 判断是否已登录
      isLogin: (state) => {
        var _a;
        return !!state.token && !!((_a = state.userInfo) == null ? void 0 : _a.id);
      }
    },
    // 定义 actions
    actions: {
      // 设置用户信息
      setUserInfo(userInfo) {
        this.userInfo = userInfo;
        formatAppLog("log", "at src/stores/user.js:33", "保存用户信息:", this.userInfo);
      },
      // 设置 Token
      setToken(token, expireTime) {
        this.token = token;
        this.tokenExpireTime = expireTime;
        formatAppLog("log", "at src/stores/user.js:40", "保存Token:", token);
      },
      // 设置登录信息（用户信息 + Token）
      setLoginInfo(data) {
        if (data.user) {
          this.setUserInfo(data.user);
          if (data.user.openid) {
            this.openid = data.user.openid;
            formatAppLog("log", "at src/stores/user.js:50", "保存 openid:", this.openid);
          }
        }
        if (data.token) {
          this.setToken(data.token, data.expiresAt);
        }
      },
      // 清除用户信息
      clearUserInfo() {
        this.userInfo = {};
        this.token = "";
        this.tokenExpireTime = 0;
        this.openid = "";
        formatAppLog("log", "at src/stores/user.js:64", "已清除用户信息");
      },
      // 更新用户部分信息
      updateUserInfo(updates) {
        this.userInfo = {
          ...this.userInfo,
          ...updates
        };
        formatAppLog("log", "at src/stores/user.js:73", "更新用户信息:", updates);
      }
    },
    // 持久化配置
    persist: {
      storage: {
        getItem(key) {
          return uni.getStorageSync(key);
        },
        setItem(key, value) {
          uni.setStorageSync(key, value);
        }
      }
    }
  });
  const config = {
    development: {
      //https://dev.anzhuhui.com/fresh/v1  http://192.168.1.11:9902/v1
      baseUrl: "http://192.168.1.15:8889"
    },
    production: {
      baseUrl: "https://api.xieminqiang168.cn"
    }
  };
  const baseURL$2 = config.development.baseUrl;
  const httpInterceptor = {
    // 拦截前触发
    invoke(options) {
      if (!options.url.startsWith("http")) {
        options.url = baseURL$2 + options.url;
      }
      options.timeout = 6e5;
      options.header = {
        ...options.header,
        "source-client": "miniapp"
      };
      const userStore = useUserStore();
      const token = userStore.token;
      if (token) {
        options.header["x-token"] = token;
      }
    }
  };
  uni.addInterceptor("request", httpInterceptor);
  uni.addInterceptor("uploadFile", httpInterceptor);
  const http = (options) => {
    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        // 响应成功
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            formatAppLog("log", "at src/util/http.js:41", "222");
            resolve(res);
          } else if (res.statusCode === 401) {
            reject(res);
          } else {
            uni.showToast({
              icon: "none",
              title: res.data.msg || "请求错误"
            });
            reject(res);
          }
        },
        fail(err) {
          uni.showToast({
            icon: "none",
            title: "网络错误，换个网络试试"
          });
          reject(err);
        }
      });
    });
  };
  const createFartRecordAPI = (data) => {
    return http({
      method: "POST",
      url: "/break/record",
      data
    });
  };
  const getTodayRecordsAPI = () => {
    return http({
      method: "GET",
      url: "/break/today"
    });
  };
  const getTrendDataAPI = (type = "day") => {
    return http({
      method: "GET",
      url: "/break/statistics/trend",
      data: { type }
    });
  };
  const getStatisticsSummaryAPI = (type = "day") => {
    return http({
      method: "GET",
      url: "/break/statistics/summary",
      data: { type }
    });
  };
  const makeupFartRecordAPI = (data) => {
    return http({
      method: "POST",
      url: "/break/makeup",
      data
    });
  };
  const getLastFartTogetherRecordAPI = () => {
    return http({
      method: "GET",
      url: "/break/together/last"
    });
  };
  const getFartTogetherRecordByIdAPI = (id) => {
    return http({
      method: "GET",
      url: `/break/together/${id}`
    });
  };
  const createFartTogetherRecordAPI = (data) => {
    return http({
      method: "POST",
      url: "/break/together",
      data
    });
  };
  const updateFartTogetherRecordAPI = (id, data) => {
    return http({
      method: "PUT",
      url: `/break/together/${id}`,
      data
    });
  };
  const updateFartTogetherRecordSexAPI = (data) => {
    return http({
      method: "POST",
      url: "/break/together/sex",
      data
    });
  };
  const baseURL$1 = config.development.baseUrl;
  const getAudioLibraryFeedAPI = (params = {}) => {
    const { page: page2 = 1, pageSize = 20, type } = params;
    const requestParams = {
      page: page2,
      pageSize
    };
    if (type !== void 0 && type !== null) {
      requestParams.type = type;
    }
    return http({
      method: "GET",
      url: "/break/audioLibrary/feed",
      params: requestParams
    });
  };
  const uploadAudioAPI = (filePath) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: baseURL$1 + "/upload/audio",
        filePath,
        name: "file",
        header: {
          "source-client": "miniapp"
        },
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data);
              if (data.code === 0) {
                resolve({ data });
              } else {
                reject(new Error(data.msg || "上传失败"));
              }
            } catch (e2) {
              formatAppLog("error", "at src/api/audio.js:55", "解析响应失败:", e2, res.data);
              reject(new Error("解析响应失败: " + e2.message));
            }
          } else {
            formatAppLog("error", "at src/api/audio.js:59", "上传失败，状态码:", res.statusCode, res.data);
            try {
              const errorData = JSON.parse(res.data);
              reject(new Error(errorData.msg || "上传失败"));
            } catch (e2) {
              reject(new Error("上传失败，状态码: " + res.statusCode));
            }
          }
        },
        fail: (err) => {
          formatAppLog("error", "at src/api/audio.js:69", "上传失败:", err);
          reject(err);
        }
      });
    });
  };
  const createMyAudioAPI = (data) => {
    return http({
      method: "POST",
      url: "/break/audioLibrary/my",
      data
    });
  };
  const deleteAudioLibraryAPI = (id) => {
    return http({
      method: "DELETE",
      url: `/break/audioLibrary/my/${id}`
    });
  };
  const wxLoginAPI = (data) => {
    return http({
      method: "POST",
      url: "/user/login",
      data
    });
  };
  const wxQuickLoginAPI = (code2) => {
    return http({
      method: "POST",
      url: "/wxuser/wxQuickLogin",
      data: {
        code: code2
      }
    });
  };
  const openidLoginAPI = (openid) => {
    return http({
      method: "POST",
      url: "/wxuser/openidLogin",
      data: {
        openid
      }
    });
  };
  const getUserInfoAPI = () => {
    return http({
      method: "GET",
      url: "/wxuser/getUserInfo"
    });
  };
  const setUserAudioUrlAPI = (audioUrl) => {
    return http({
      method: "POST",
      url: "/wxuser/setUserAudioUrl",
      data: {
        audioUrl
      }
    });
  };
  const updateUserInfoAPI = (data) => {
    return http({
      method: "POST",
      url: "/wxuser/updateUserInfo",
      data: {
        nickname: data.nickname,
        avatar: data.avatar
      }
    });
  };
  const getUserInfoByIdAPI = (id) => {
    return http({
      method: "GET",
      url: `/wxuser/getUserInfoById?id=${id}`
    });
  };
  const _imports_0$5 = "/static/img/icon-test.png";
  const _imports_0$4 = "/static/emj/wusheng.png";
  const _imports_2$1 = "/static/img/yinle_icon.png";
  const _imports_3$1 = "/static/img/buka.png";
  const _imports_4 = "/static/img/miaobiao.png";
  const _imports_5 = "/static/img/choose.png";
  const _imports_6 = "/static/img/no_choose.png";
  const defaultAudioUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/audio/fangpi.MP3";
  const _sfc_main$f = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const popup = vue.ref();
      const makeupPopup = vue.ref();
      const achievementPopup = vue.ref();
      const audioSettingPopup = vue.ref();
      const selectedFartType = vue.ref("响亮型");
      const selectedSmellLevel = vue.ref("清香");
      const selectedMood = vue.ref("放松");
      const inputText = vue.ref("");
      const showCloud = vue.ref(false);
      const showGif = vue.ref(false);
      const showGifImage = vue.ref(true);
      const gifTimestamp = vue.ref(Date.now());
      const gifUrl = vue.ref(`https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`);
      const isGifPlaying = vue.ref(false);
      const isSubmitting = vue.ref(false);
      const isSubmittingMakeup = vue.ref(false);
      let audioContext = null;
      let previewAudioContext = null;
      const audioList = vue.ref([]);
      const isLoadingAudio = vue.ref(false);
      const selectedAudioUrl = vue.ref("");
      const playingAudioId = vue.ref(null);
      const audioCurrentPage = vue.ref(1);
      const audioPageSize = vue.ref(20);
      const audioHasMore = vue.ref(true);
      const audioTotal = vue.ref(0);
      const getCardStyle = (item) => {
        const color2 = item.accentColor || "#FFD3B6";
        return {
          background: `linear-gradient(135deg, ${color2}15 0%, ${color2}08 50%, #ffffff 100%)`,
          borderColor: `${color2}40`
        };
      };
      const selectedAchievement = vue.ref(null);
      const newAchievements = vue.ref([]);
      const currentAchievementIndex = vue.ref(0);
      const makeupFartType = vue.ref("响亮型");
      const makeupSmellLevel = vue.ref("清香");
      const makeupMood = vue.ref("放松");
      const makeupInputText = vue.ref("");
      const showTimePicker = vue.ref(false);
      const makeupTimeDisplay = vue.ref("");
      const todayCount = vue.ref(0);
      const mostHappyMood = vue.ref("/static/emj/kaixin.png");
      const lastFartTime = vue.ref("暂无记录");
      const moodEmojiToIcon = {
        "😌": "/static/emj/fangsong.png",
        // 放松
        "🤣": "/static/emj/kaixin.png",
        // 开心
        "😖": "/static/emj/ganga.png"
        // 尴尬
      };
      const moodValueToIcon = {
        "normal": "/static/emj/fangsong.png",
        "happy": "/static/emj/kaixin.png",
        "embarrassed": "/static/emj/ganga.png"
      };
      const fartTypes = vue.reactive([
        { value: "响亮型", icon: "/static/emj/iangliang.png", label: "响亮型" },
        { value: "轻柔型", icon: "/static/emj/qingrou.png", label: "轻柔型" },
        { value: "无声型", icon: "/static/emj/wusheng.png", label: "无声型" }
      ]);
      const smellLevels = vue.reactive([
        { value: "清香", icon: "/static/emj/qingxiang.png", label: "清香" },
        { value: "一般", icon: "/static/emj/yiban.png", label: "一般" },
        { value: "浓烈", icon: "/static/emj/nonglie.png", label: "浓烈" }
      ]);
      const moods = vue.reactive([
        { value: "放松", icon: "/static/emj/fangsong.png", label: "放松" },
        { value: "开心", icon: "/static/emj/kaixin.png", label: "开心" },
        { value: "尴尬", icon: "/static/emj/ganga.png", label: "尴尬" }
      ]);
      const openPopup = () => {
        popup.value.open();
      };
      const onGifLoaded = () => {
        formatAppLog("log", "at pages/index/index.vue:559", "GIF加载完成");
        isGifPlaying.value = true;
        setTimeout(() => {
          isGifPlaying.value = false;
        }, 3e3);
      };
      const replayGif = () => {
        formatAppLog("log", "at pages/index/index.vue:569", "开始重播GIF");
        showGifImage.value = false;
        isGifPlaying.value = false;
        const timestamp = Date.now();
        gifTimestamp.value = timestamp;
        gifUrl.value = `https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${timestamp}`;
        setTimeout(() => {
          showGifImage.value = true;
          formatAppLog("log", "at pages/index/index.vue:585", "GIF重新显示，URL:", gifUrl.value);
        }, 100);
      };
      const playFartSound = () => {
        var _a;
        try {
          if (audioContext) {
            try {
              audioContext.stop();
              audioContext.destroy();
            } catch (e2) {
            }
            audioContext = null;
          }
          audioContext = uni.createInnerAudioContext();
          const userStore = useUserStore();
          const defaultAudioUrl2 = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/audio/fangpi.MP3";
          const audioUrl = ((_a = userStore.userInfo) == null ? void 0 : _a.audioUrl) || defaultAudioUrl2;
          if (audioUrl && audioUrl.startsWith("http")) {
            audioContext.src = audioUrl;
          } else {
            audioContext.src = "@/static/fangpi.MP3";
          }
          audioContext.volume = 0.8;
          audioContext.onPlay(() => {
            formatAppLog("log", "at pages/index/index.vue:633", "开始播放放屁声音，路径:", audioContext.src);
          });
          audioContext.onEnded(() => {
            formatAppLog("log", "at pages/index/index.vue:637", "放屁声音播放完成");
          });
          audioContext.onError((err) => {
            formatAppLog("error", "at pages/index/index.vue:642", "播放放屁声音失败:", err);
            formatAppLog("error", "at pages/index/index.vue:643", "音频路径:", audioContext.src);
            if (audioContext) {
              try {
                audioContext.destroy();
              } catch (e2) {
              }
              audioContext = null;
            }
          });
          audioContext.play();
        } catch (error2) {
          formatAppLog("error", "at pages/index/index.vue:668", "创建音频上下文失败:", error2);
          audioContext = null;
        }
      };
      const goToFartPage = () => {
        uni.navigateTo({
          url: "/pages/index/fart"
        });
      };
      const goToCreateFart = () => {
        uni.navigateTo({
          url: "/pages/entry/creat"
        });
      };
      const openMakeupPopup = () => {
        const now2 = /* @__PURE__ */ new Date();
        makeupTimeDisplay.value = formatTimeDisplay(now2);
        formatAppLog("log", "at pages/index/index.vue:695", "打开补卡弹窗，初始化时间:", makeupTimeDisplay.value);
        makeupPopup.value.open();
      };
      const closeMakeupPopup = () => {
        makeupPopup.value.close();
      };
      const formatTimeDisplay = (date2) => {
        if (!date2 || !(date2 instanceof Date) || isNaN(date2.getTime())) {
          formatAppLog("error", "at pages/index/index.vue:708", "formatTimeDisplay 接收到无效的日期:", date2);
          return "00:00";
        }
        const hours = String(date2.getHours()).padStart(2, "0");
        const minutes = String(date2.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      };
      const onTimeChange = (e2) => {
        formatAppLog("log", "at pages/index/index.vue:719", "时间选择器 change 事件:", e2);
        formatAppLog("log", "at pages/index/index.vue:720", "当前 makeupTimeDisplay:", makeupTimeDisplay.value);
      };
      const onTimeConfirm = (e2) => {
        formatAppLog("log", "at pages/index/index.vue:725", "===== 时间选择器确认 =====");
        formatAppLog("log", "at pages/index/index.vue:726", "e.value:", e2.value);
        formatAppLog("log", "at pages/index/index.vue:727", "当前 makeupTimeDisplay:", makeupTimeDisplay.value);
        const selectedTime = makeupTimeDisplay.value;
        if (selectedTime) {
          const now2 = /* @__PURE__ */ new Date();
          const [selectedHour, selectedMinute] = selectedTime.split(":").map(Number);
          const currentHour = now2.getHours();
          const currentMinute = now2.getMinutes();
          if (selectedHour > currentHour || selectedHour === currentHour && selectedMinute > currentMinute) {
            uni.showToast({
              title: "不能选择未来的时间",
              icon: "none",
              duration: 2e3
            });
            makeupTimeDisplay.value = formatTimeDisplay(now2);
            return;
          }
        }
        showTimePicker.value = false;
      };
      const confirmMakeup = async () => {
        if (isSubmittingMakeup.value) {
          return;
        }
        try {
          isSubmittingMakeup.value = true;
          if (!makeupTimeDisplay.value) {
            uni.showToast({
              title: "请选择时间",
              icon: "none"
            });
            return;
          }
          const typeMap = {
            "响亮型": "loud",
            "轻柔型": "soft",
            "无声型": "silent"
          };
          const smellMap = {
            "清香": 1,
            "一般": 2,
            "浓烈": 3
          };
          const moodMap = {
            "放松": "normal",
            "开心": "happy",
            "尴尬": "embarrassed"
          };
          const requestData = {
            fartType: typeMap[makeupFartType.value],
            smellLevel: smellMap[makeupSmellLevel.value],
            mood: moodMap[makeupMood.value],
            note: makeupInputText.value || "",
            fartTime: makeupTimeDisplay.value
            // HH:mm
          };
          formatAppLog("log", "at pages/index/index.vue:804", "提交补卡记录:", requestData);
          const { data } = await makeupFartRecordAPI(requestData);
          formatAppLog("log", "at pages/index/index.vue:809", "补卡结果:", data);
          if (data.code === 0) {
            uni.vibrateShort({
              type: "heavy"
            });
            playFartSound();
            replayGif();
            closeMakeupPopup();
            notifyDataPageRefresh();
            notifyMePageRefresh();
            loadStatisticsData();
            uni.showToast({
              title: "补卡成功 ✅",
              icon: "none",
              duration: 1500
            });
            if (data.data && data.data.newAchievements && data.data.newAchievements.length > 0) {
              formatAppLog("log", "at pages/index/index.vue:843", "解锁新成就:", data.data.newAchievements);
              showNewAchievements(data.data.newAchievements);
            }
            makeupFartType.value = "响亮型";
            makeupSmellLevel.value = "清香";
            makeupMood.value = "放松";
            makeupInputText.value = "";
            makeupTimeDisplay.value = "";
          } else {
            uni.showToast({
              title: data.msg || "补卡失败",
              icon: "none"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/index.vue:861", "补卡失败:", error2);
          uni.showToast({
            title: "补卡失败，请重试",
            icon: "none"
          });
        } finally {
          isSubmittingMakeup.value = false;
        }
      };
      const loadStatisticsData = async () => {
        try {
          const [todayResponse, statsResponse] = await Promise.all([
            getTodayRecordsAPI(),
            getStatisticsSummaryAPI("day")
          ]);
          if (todayResponse.data.code === 0) {
            const todayData = todayResponse.data.data;
            todayCount.value = todayData.todayCount;
            if (todayData.lastRecord) {
              const lastTime = todayData.lastRecord.fartTime;
              lastFartTime.value = formatLastFartTime(lastTime);
            } else {
              lastFartTime.value = "暂无记录";
            }
          }
          if (statsResponse.data.code === 0) {
            const statsData = statsResponse.data.data;
            formatAppLog("log", "at pages/index/index.vue:895", "统计数据返回:", statsData);
            if (statsData.mostCommonMood) {
              formatAppLog("log", "at pages/index/index.vue:899", "mostCommonMood 数据:", statsData.mostCommonMood);
              let newMoodIcon = null;
              if (statsData.mostCommonMood.moodEmoji) {
                formatAppLog("log", "at pages/index/index.vue:905", "尝试使用 moodEmoji 映射:", statsData.mostCommonMood.moodEmoji);
                newMoodIcon = moodEmojiToIcon[statsData.mostCommonMood.moodEmoji];
                if (newMoodIcon) {
                  formatAppLog("log", "at pages/index/index.vue:908", "moodEmoji 映射成功:", newMoodIcon);
                }
              }
              if (!newMoodIcon && statsData.mostCommonMood.mood) {
                formatAppLog("log", "at pages/index/index.vue:914", "尝试使用 mood 值映射:", statsData.mostCommonMood.mood);
                newMoodIcon = moodValueToIcon[statsData.mostCommonMood.mood];
                if (newMoodIcon) {
                  formatAppLog("log", "at pages/index/index.vue:917", "mood 值映射成功:", newMoodIcon);
                } else {
                  formatAppLog("warn", "at pages/index/index.vue:919", "mood 值映射失败，可用的映射:", Object.keys(moodValueToIcon));
                }
              }
              if (newMoodIcon) {
                mostHappyMood.value = newMoodIcon;
                formatAppLog("log", "at pages/index/index.vue:926", "✅ mostHappyMood 更新成功:", mostHappyMood.value);
              } else {
                formatAppLog("warn", "at pages/index/index.vue:928", "⚠️ 无法映射心情图标，保持当前值:", mostHappyMood.value);
              }
            } else {
              formatAppLog("log", "at pages/index/index.vue:931", "暂无 mostCommonMood 数据");
            }
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/index.vue:935", "加载统计数据失败:", error2);
        }
      };
      const formatLastFartTime = (fartTime) => {
        if (!fartTime)
          return "暂无记录";
        try {
          let timeStr = fartTime;
          if (fartTime.includes("T")) {
            timeStr = fartTime.split("T")[1].split("+")[0].split("-")[0];
          }
          const now2 = /* @__PURE__ */ new Date();
          const today = now2.toISOString().split("T")[0];
          const fartDateTime = /* @__PURE__ */ new Date(`${today}T${timeStr}`);
          const diffMs = now2 - fartDateTime;
          const diffMinutes = Math.floor(diffMs / (1e3 * 60));
          if (diffMinutes < 1) {
            return "刚刚";
          } else if (diffMinutes < 60) {
            return `${diffMinutes}分钟前`;
          } else {
            const diffHours = Math.floor(diffMinutes / 60);
            return `${diffHours}小时前`;
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/index.vue:968", "格式化时间失败:", error2, fartTime);
          return "时间未知";
        }
      };
      const closePopup = () => {
        popup.value.close();
      };
      const selectFartType = (value) => {
        selectedFartType.value = value;
      };
      const selectSmellLevel = (value) => {
        selectedSmellLevel.value = value;
      };
      const selectMood = (value) => {
        selectedMood.value = value;
      };
      const notifyDataPageRefresh = () => {
        uni.$emit("fartRecordAdded");
        const pages = getCurrentPages();
        const dataPage = pages.find((page2) => page2.route === "pages/data/index");
        if (dataPage && dataPage.$vm) {
          dataPage.$vm.clearAllCache();
          dataPage.$vm.loadData(true);
        }
      };
      const notifyMePageRefresh = () => {
        uni.$emit("userInfoUpdated");
        formatAppLog("log", "at pages/index/index.vue:1009", "已发送 userInfoUpdated 事件，通知其他页面刷新");
      };
      const confirmFart = async () => {
        if (isSubmitting.value) {
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
            "浓烈": 3
          };
          const moodMap = {
            "放松": "normal",
            "开心": "happy",
            "尴尬": "embarrassed"
          };
          const now2 = /* @__PURE__ */ new Date();
          const fartDate = now2.toISOString().split("T")[0];
          const fartTime = now2.toTimeString().split(" ")[0];
          const requestData = {
            fartType: typeMap[selectedFartType.value],
            smellLevel: smellMap[selectedSmellLevel.value],
            mood: moodMap[selectedMood.value],
            note: inputText.value || "",
            fartDate,
            fartTime
          };
          formatAppLog("log", "at pages/index/index.vue:1057", "提交放屁记录:", requestData);
          const { data } = await createFartRecordAPI(requestData);
          formatAppLog("log", "at pages/index/index.vue:1062", "打卡结果:", data);
          if (data.code === 0) {
            uni.vibrateShort({
              type: "heavy"
              // 使用重度震动，让用户有明显的反馈感
            });
            playFartSound();
            replayGif();
            closePopup();
            notifyDataPageRefresh();
            notifyMePageRefresh();
            loadStatisticsData();
            if (data.data && data.data.newAchievements && data.data.newAchievements.length > 0) {
              formatAppLog("log", "at pages/index/index.vue:1089", "解锁新成就:", data.data.newAchievements);
              showNewAchievements(data.data.newAchievements);
            }
            selectedFartType.value = "响亮型";
            selectedSmellLevel.value = "清香";
            selectedMood.value = "放松";
            inputText.value = "";
          } else {
            uni.showToast({
              title: data.msg || "打卡失败",
              icon: "none"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/index.vue:1106", "打卡失败:", error2);
          uni.showToast({
            title: "打卡失败，请重试",
            icon: "none"
          });
        } finally {
          isSubmitting.value = false;
        }
      };
      vue.onMounted(() => {
        const userStore = useUserStore();
        if (userStore.token) {
          formatAppLog("log", "at pages/index/index.vue:1123", "已有 token，直接加载统计数据");
          loadStatisticsData();
        } else {
          formatAppLog("log", "at pages/index/index.vue:1126", "暂无 token，等待登录完成...");
        }
        uni.$on("loginSuccess", onLoginSuccess);
      });
      const onLoginSuccess = () => {
        formatAppLog("log", "at pages/index/index.vue:1135", "收到 loginSuccess 事件，开始加载统计数据");
        loadStatisticsData();
      };
      vue.onUnmounted(() => {
        uni.$off("loginSuccess", onLoginSuccess);
        if (audioContext) {
          try {
            audioContext.stop();
            audioContext.destroy();
          } catch (e2) {
          }
          audioContext = null;
        }
        stopPreviewAudio();
      });
      const showNewAchievements = (achievements) => {
        if (!achievements || achievements.length === 0) {
          return;
        }
        newAchievements.value = achievements;
        currentAchievementIndex.value = 0;
        showAchievementAtIndex(0);
      };
      const showAchievementAtIndex = (index) => {
        if (index >= newAchievements.value.length) {
          return;
        }
        selectedAchievement.value = newAchievements.value[index];
        currentAchievementIndex.value = index;
        setTimeout(() => {
          var _a;
          (_a = achievementPopup.value) == null ? void 0 : _a.open();
        }, 500);
      };
      const closeAchievementDetail = () => {
        var _a;
        (_a = achievementPopup.value) == null ? void 0 : _a.close();
        const nextIndex = currentAchievementIndex.value + 1;
        if (nextIndex < newAchievements.value.length) {
          setTimeout(() => {
            showAchievementAtIndex(nextIndex);
          }, 300);
        } else {
          selectedAchievement.value = null;
          newAchievements.value = [];
          currentAchievementIndex.value = 0;
        }
      };
      const handleShare = () => {
        if (!selectedAchievement.value) {
          return;
        }
        formatAppLog("log", "at pages/index/index.vue:1210", "准备分享成就:", selectedAchievement.value.achievementName);
      };
      onShareAppMessage(() => {
        if (selectedAchievement.value) {
          return {
            title: `我解锁了「${selectedAchievement.value.achievementName}」成就！🎉`,
            path: "/pages/index/index",
            imageUrl: selectedAchievement.value.achievementIcon || selectedAchievement.value.achievementGif || ""
          };
        }
        return {
          title: "快来一起记录放屁，解锁成就吧！💨",
          path: "/pages/index/index"
        };
      });
      const openAudioSettingPopup = async () => {
        var _a, _b;
        const userStore = useUserStore();
        await loadAudioList();
        const currentAudioUrl = ((_a = userStore.userInfo) == null ? void 0 : _a.audioUrl) || defaultAudioUrl;
        const audioExists = audioList.value.some((audio) => audio.url === currentAudioUrl);
        if (audioExists || currentAudioUrl === defaultAudioUrl) {
          selectedAudioUrl.value = currentAudioUrl;
        } else {
          selectedAudioUrl.value = defaultAudioUrl;
        }
        formatAppLog("log", "at pages/index/index.vue:1251", "打开音频设置弹窗，当前选中:", selectedAudioUrl.value);
        (_b = audioSettingPopup.value) == null ? void 0 : _b.open();
      };
      const onAudioListScrollToLower = () => {
        if (!isLoadingAudio.value && audioHasMore.value) {
          loadAudioList(true);
        }
      };
      const closeAudioSettingPopup = () => {
        var _a;
        stopPreviewAudio();
        (_a = audioSettingPopup.value) == null ? void 0 : _a.close();
      };
      const loadAudioList = async (isLoadMore = false) => {
        try {
          isLoadingAudio.value = true;
          if (!isLoadMore) {
            audioCurrentPage.value = 1;
            audioList.value = [];
            audioHasMore.value = true;
          }
          const { data } = await getAudioLibraryFeedAPI({
            page: audioCurrentPage.value,
            pageSize: audioPageSize.value
          });
          if (data.code === 0 && data.data) {
            const newList = data.data.list || [];
            audioTotal.value = data.data.total || 0;
            if (isLoadMore) {
              audioList.value = [...audioList.value, ...newList];
            } else {
              audioList.value = newList;
            }
            audioHasMore.value = audioList.value.length < audioTotal.value;
            if (audioHasMore.value) {
              audioCurrentPage.value++;
            }
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/index.vue:1332", "加载音频列表失败:", error2);
          if (!isLoadMore) {
            audioList.value = [];
          }
        } finally {
          isLoadingAudio.value = false;
        }
      };
      const selectAudio = (url2, name) => {
        selectedAudioUrl.value = url2;
        formatAppLog("log", "at pages/index/index.vue:1344", "选择音频:", name, url2);
      };
      const playAudio = (audio) => {
        if (playingAudioId.value === audio.id) {
          stopPreviewAudio();
          return;
        }
        stopPreviewAudio();
        previewAudioContext = uni.createInnerAudioContext();
        previewAudioContext.src = audio.url;
        previewAudioContext.volume = 0.8;
        playingAudioId.value = audio.id;
        previewAudioContext.onPlay(() => {
          formatAppLog("log", "at pages/index/index.vue:1370", "开始播放预览音频:", audio.name);
        });
        previewAudioContext.onEnded(() => {
          formatAppLog("log", "at pages/index/index.vue:1374", "预览音频播放完成");
          playingAudioId.value = null;
          if (previewAudioContext) {
            previewAudioContext.destroy();
            previewAudioContext = null;
          }
        });
        previewAudioContext.onError((err) => {
          formatAppLog("error", "at pages/index/index.vue:1383", "播放预览音频失败:", err);
          playingAudioId.value = null;
          if (previewAudioContext) {
            previewAudioContext.destroy();
            previewAudioContext = null;
          }
          uni.showToast({
            title: "播放失败",
            icon: "none",
            duration: 2e3
          });
        });
        previewAudioContext.play();
      };
      const handleSelectAudio = async (audio) => {
        formatAppLog("log", "at pages/index/index.vue:1401", "选择音频:", audio);
        selectedAudioUrl.value = audio.url;
        await saveAudioSettingDirectly(audio.url);
      };
      const saveAudioSettingDirectly = async (audioUrl) => {
        try {
          if (!audioUrl) {
            return;
          }
          const { data } = await setUserAudioUrlAPI(audioUrl);
          if (data.code === 0) {
            const userStore = useUserStore();
            userStore.updateUserInfo({
              audioUrl
            });
            uni.showToast({
              title: "设置成功 ✅",
              icon: "none",
              duration: 1500
            });
          } else {
            uni.showToast({
              title: data.msg || "设置失败",
              icon: "none"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/index.vue:1439", "保存音频设置失败:", error2);
          uni.showToast({
            title: "设置失败，请重试",
            icon: "none"
          });
        }
      };
      const goToCreateFartFromPopup = () => {
        closeAudioSettingPopup();
        uni.navigateTo({
          url: "/pages/entry/creat"
        });
      };
      const stopPreviewAudio = () => {
        if (previewAudioContext) {
          try {
            previewAudioContext.stop();
            previewAudioContext.destroy();
          } catch (e2) {
          }
          previewAudioContext = null;
        }
        playingAudioId.value = null;
      };
      const saveAudioSetting = async () => {
        try {
          if (!selectedAudioUrl.value) {
            uni.showToast({
              title: "请选择音频",
              icon: "none"
            });
            return;
          }
          const { data } = await setUserAudioUrlAPI(selectedAudioUrl.value);
          if (data.code === 0) {
            const userStore = useUserStore();
            userStore.updateUserInfo({
              audioUrl: selectedAudioUrl.value
            });
            closeAudioSettingPopup();
            uni.showToast({
              title: "设置成功 ✅",
              icon: "none",
              duration: 1500
            });
          } else {
            uni.showToast({
              title: data.msg || "设置失败",
              icon: "none"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/index.vue:1508", "保存音频设置失败:", error2);
          uni.showToast({
            title: "设置失败，请重试",
            icon: "none"
          });
        }
      };
      const __returned__ = { popup, makeupPopup, achievementPopup, audioSettingPopup, selectedFartType, selectedSmellLevel, selectedMood, inputText, showCloud, showGif, showGifImage, gifTimestamp, gifUrl, isGifPlaying, isSubmitting, isSubmittingMakeup, get audioContext() {
        return audioContext;
      }, set audioContext(v) {
        audioContext = v;
      }, get previewAudioContext() {
        return previewAudioContext;
      }, set previewAudioContext(v) {
        previewAudioContext = v;
      }, audioList, isLoadingAudio, selectedAudioUrl, playingAudioId, defaultAudioUrl, audioCurrentPage, audioPageSize, audioHasMore, audioTotal, getCardStyle, selectedAchievement, newAchievements, currentAchievementIndex, makeupFartType, makeupSmellLevel, makeupMood, makeupInputText, showTimePicker, makeupTimeDisplay, todayCount, mostHappyMood, lastFartTime, moodEmojiToIcon, moodValueToIcon, fartTypes, smellLevels, moods, openPopup, onGifLoaded, replayGif, playFartSound, goToFartPage, goToCreateFart, openMakeupPopup, closeMakeupPopup, formatTimeDisplay, onTimeChange, onTimeConfirm, confirmMakeup, loadStatisticsData, formatLastFartTime, closePopup, selectFartType, selectSmellLevel, selectMood, notifyDataPageRefresh, notifyMePageRefresh, confirmFart, onLoginSuccess, showNewAchievements, showAchievementAtIndex, closeAchievementDetail, handleShare, openAudioSettingPopup, onAudioListScrollToLower, closeAudioSettingPopup, loadAudioList, selectAudio, playAudio, handleSelectAudio, saveAudioSettingDirectly, goToCreateFartFromPopup, stopPreviewAudio, saveAudioSetting, get onShareAppMessage() {
        return onShareAppMessage;
      }, get onShareTimeline() {
        return onShareTimeline;
      }, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, nextTick: vue.nextTick, get createFartRecordAPI() {
        return createFartRecordAPI;
      }, get getTodayRecordsAPI() {
        return getTodayRecordsAPI;
      }, get getStatisticsSummaryAPI() {
        return getStatisticsSummaryAPI;
      }, get makeupFartRecordAPI() {
        return makeupFartRecordAPI;
      }, get getAudioLibraryFeedAPI() {
        return getAudioLibraryFeedAPI;
      }, get setUserAudioUrlAPI() {
        return setUserAudioUrlAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$4);
    const _component_u_datetime_picker = resolveEasycom(vue.resolveDynamicComponent("u-datetime-picker"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "fart-app" }, [
      vue.createElementVNode("view", { class: "stats-card" }, [
        vue.createElementVNode("view", { class: "stats-grid" }, [
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-label" }, "今日总数"),
            vue.createElementVNode(
              "text",
              { class: "stat-value" },
              vue.toDisplayString($setup.todayCount),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-label" }, "今日心情"),
            $setup.mostHappyMood ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "stat-mood-icon",
              src: $setup.mostHappyMood,
              mode: "aspectFit"
            }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-label" }, "最近一次"),
            vue.createElementVNode(
              "text",
              { class: "stat-value-small" },
              vue.toDisplayString($setup.lastFartTime),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode("view", {
        class: "audio-setting-btn",
        onClick: $setup.openAudioSettingPopup
      }, [
        vue.createElementVNode("image", {
          class: "audio-setting-icon",
          src: _imports_0$5,
          mode: "aspectFit"
        })
      ]),
      vue.createElementVNode("view", { class: "fart-gif-container" }, [
        vue.createElementVNode("image", {
          class: "fart-gif",
          src: $setup.gifUrl,
          mode: "aspectFit",
          onLoad: $setup.onGifLoaded
        }, null, 40, ["src"])
      ]),
      vue.createElementVNode("view", { class: "main-button-container" }, [
        vue.createElementVNode("button", {
          class: "main-button",
          onClick: $setup.openPopup
        }, [
          vue.createElementVNode("text", { class: "button-text" }, "放了")
        ])
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "popup",
          type: "bottom",
          "safe-area": false
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "popup-content" }, [
              vue.createElementVNode("view", { class: "popup-header" }, [
                vue.createElementVNode("text", { class: "popup-title" }, "记录这次释放")
              ]),
              vue.createElementVNode("view", { class: "section" }, [
                vue.createElementVNode("text", { class: "section-title" }, "屁屁类型"),
                vue.createElementVNode("view", { class: "switch-container" }, [
                  vue.createElementVNode("view", { class: "switch-wrapper" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.fartTypes, (type, index) => {
                        return vue.openBlock(), vue.createElementBlock("button", {
                          key: index,
                          class: vue.normalizeClass(["switch-option", { "selected": $setup.selectedFartType === type.value }]),
                          onClick: ($event) => $setup.selectFartType(type.value)
                        }, [
                          vue.createElementVNode("view", { class: "switch-text" }, [
                            vue.createElementVNode("image", {
                              class: "switch-emoji-img",
                              src: type.icon,
                              mode: "aspectFit"
                            }, null, 8, ["src"]),
                            vue.createElementVNode(
                              "text",
                              null,
                              vue.toDisplayString(type.label),
                              1
                              /* TEXT */
                            )
                          ])
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "section" }, [
                vue.createElementVNode("text", { class: "section-title" }, "气味等级"),
                vue.createElementVNode("view", { class: "switch-container" }, [
                  vue.createElementVNode("view", { class: "switch-wrapper" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.smellLevels, (level, index) => {
                        return vue.openBlock(), vue.createElementBlock("button", {
                          key: index,
                          class: vue.normalizeClass(["switch-option", { "selected": $setup.selectedSmellLevel === level.value }]),
                          onClick: ($event) => $setup.selectSmellLevel(level.value)
                        }, [
                          vue.createElementVNode("view", { class: "switch-text" }, [
                            vue.createElementVNode("image", {
                              class: "switch-emoji-img",
                              src: level.icon,
                              mode: "aspectFit"
                            }, null, 8, ["src"]),
                            vue.createElementVNode(
                              "text",
                              null,
                              vue.toDisplayString(level.label),
                              1
                              /* TEXT */
                            )
                          ])
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "section" }, [
                vue.createElementVNode("text", { class: "section-title" }, "当前心情"),
                vue.createElementVNode("view", { class: "switch-container" }, [
                  vue.createElementVNode("view", { class: "switch-wrapper" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.moods, (mood, index) => {
                        return vue.openBlock(), vue.createElementBlock("button", {
                          key: index,
                          class: vue.normalizeClass(["switch-option", { "selected": $setup.selectedMood === mood.value }]),
                          onClick: ($event) => $setup.selectMood(mood.value)
                        }, [
                          vue.createElementVNode("view", { class: "switch-text" }, [
                            vue.createElementVNode("image", {
                              class: "switch-emoji-img",
                              src: mood.icon,
                              mode: "aspectFit"
                            }, null, 8, ["src"]),
                            vue.createElementVNode(
                              "text",
                              null,
                              vue.toDisplayString(mood.label),
                              1
                              /* TEXT */
                            )
                          ])
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "input-section" }, [
                vue.createElementVNode("image", {
                  class: "input-emoji-img",
                  src: _imports_0$4,
                  mode: "aspectFit"
                }),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "text-input",
                    placeholder: "输入今日饮食或心情",
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.inputText = $event)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.inputText]
                ])
              ]),
              vue.createElementVNode("button", {
                class: "confirm-button",
                disabled: $setup.isSubmitting,
                onClick: $setup.confirmFart
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "confirm-text" },
                  vue.toDisplayString($setup.isSubmitting ? "提交中..." : "确认打卡"),
                  1
                  /* TEXT */
                )
              ], 8, ["disabled"])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      $setup.showCloud ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: vue.normalizeClass(["fart-cloud", { "animate": $setup.showCloud }])
        },
        "💨",
        2
        /* CLASS */
      )) : vue.createCommentVNode("v-if", true),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "achievementPopup",
          type: "center",
          "mask-click": false
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "achievement-detail-popup" }, [
              vue.createElementVNode("view", { class: "popup-header" }, [
                vue.createElementVNode("text", { class: "popup-title" }, "🎉 恭喜解锁新成就！"),
                vue.createElementVNode("text", {
                  class: "popup-close",
                  onClick: $setup.closeAchievementDetail
                }, "✕")
              ]),
              $setup.selectedAchievement ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "popup-content"
              }, [
                vue.createElementVNode("view", { class: "detail-gif-container" }, [
                  $setup.selectedAchievement.achievementGif ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: $setup.selectedAchievement.achievementGif,
                    class: "detail-gif",
                    mode: "aspectFit"
                  }, null, 8, ["src"])) : $setup.selectedAchievement.achievementIcon ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 1,
                    src: $setup.selectedAchievement.achievementIcon,
                    class: "detail-gif",
                    mode: "aspectFit"
                  }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 2,
                      class: "detail-emoji"
                    },
                    vue.toDisplayString($setup.selectedAchievement.achievementEmoji),
                    1
                    /* TEXT */
                  ))
                ]),
                vue.createElementVNode("view", { class: "detail-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "detail-name" },
                    vue.toDisplayString($setup.selectedAchievement.achievementName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "detail-reward" }, [
                    vue.createElementVNode("text", { class: "reward-label" }, "奖励经验："),
                    vue.createElementVNode(
                      "text",
                      { class: "reward-value" },
                      "+" + vue.toDisplayString($setup.selectedAchievement.rewardExp),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "popup-actions" }, [
                  vue.createElementVNode("button", {
                    class: "action-btn primary",
                    "open-type": "share",
                    onClick: $setup.handleShare
                  }, [
                    vue.createElementVNode("text", { class: "btn-icon" }, "🎉"),
                    vue.createElementVNode("text", null, "分享")
                  ]),
                  vue.createElementVNode("button", {
                    class: "action-btn secondary",
                    onClick: $setup.closeAchievementDetail
                  }, [
                    vue.createElementVNode("text", { class: "btn-icon" }, "👌"),
                    vue.createElementVNode("text", null, "知道了")
                  ])
                ])
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      vue.createElementVNode("view", {
        class: "friend-button",
        onClick: $setup.goToFartPage
      }, [
        vue.createElementVNode("image", {
          class: "friend-icon",
          src: _imports_2$1,
          mode: "aspectFit"
        }),
        vue.createElementVNode("text", { class: "friend-text" }, "屁友")
      ]),
      vue.createElementVNode("view", {
        class: "makeup-button",
        onClick: $setup.openMakeupPopup
      }, [
        vue.createElementVNode("image", {
          class: "makeup-icon",
          src: _imports_3$1,
          mode: "aspectFit"
        }),
        vue.createElementVNode("text", { class: "makeup-text" }, "补卡")
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "makeupPopup",
          type: "bottom",
          "safe-area": false
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "popup-content makeup-popup-content" }, [
              vue.createElementVNode("scroll-view", {
                class: "popup-scroll-content",
                "scroll-y": ""
              }, [
                vue.createElementVNode("view", { class: "popup-header" }, [
                  vue.createElementVNode("text", { class: "popup-title" }, "今日补卡")
                ]),
                vue.createElementVNode("view", { class: "section section-compact" }, [
                  vue.createElementVNode("text", { class: "section-title" }, "选择时间"),
                  vue.createElementVNode("view", { class: "time-select-container" }, [
                    vue.createElementVNode("view", {
                      class: "time-select-item",
                      onClick: _cache[1] || (_cache[1] = ($event) => $setup.showTimePicker = true)
                    }, [
                      vue.createElementVNode("image", {
                        class: "time-label-img",
                        src: _imports_4,
                        mode: "aspectFit"
                      }),
                      vue.createElementVNode(
                        "text",
                        { class: "time-value" },
                        vue.toDisplayString($setup.makeupTimeDisplay || "请选择时间"),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "time-arrow" }, "›")
                    ])
                  ])
                ]),
                vue.createElementVNode("view", { class: "section section-compact" }, [
                  vue.createElementVNode("text", { class: "section-title" }, "屁屁类型"),
                  vue.createElementVNode("view", { class: "switch-container" }, [
                    vue.createElementVNode("view", { class: "switch-wrapper" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.fartTypes, (type, index) => {
                          return vue.openBlock(), vue.createElementBlock("button", {
                            key: index,
                            class: vue.normalizeClass(["switch-option", { "selected": $setup.makeupFartType === type.value }]),
                            onClick: ($event) => $setup.makeupFartType = type.value
                          }, [
                            vue.createElementVNode("view", { class: "switch-text" }, [
                              vue.createElementVNode("image", {
                                class: "switch-emoji-img",
                                src: type.icon,
                                mode: "aspectFit"
                              }, null, 8, ["src"]),
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(type.label),
                                1
                                /* TEXT */
                              )
                            ])
                          ], 10, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]),
                vue.createElementVNode("view", { class: "section section-compact" }, [
                  vue.createElementVNode("text", { class: "section-title" }, "气味等级"),
                  vue.createElementVNode("view", { class: "switch-container" }, [
                    vue.createElementVNode("view", { class: "switch-wrapper" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.smellLevels, (level, index) => {
                          return vue.openBlock(), vue.createElementBlock("button", {
                            key: index,
                            class: vue.normalizeClass(["switch-option", { "selected": $setup.makeupSmellLevel === level.value }]),
                            onClick: ($event) => $setup.makeupSmellLevel = level.value
                          }, [
                            vue.createElementVNode("view", { class: "switch-text" }, [
                              vue.createElementVNode("image", {
                                class: "switch-emoji-img",
                                src: level.icon,
                                mode: "aspectFit"
                              }, null, 8, ["src"]),
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(level.label),
                                1
                                /* TEXT */
                              )
                            ])
                          ], 10, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]),
                vue.createElementVNode("view", { class: "section section-compact" }, [
                  vue.createElementVNode("text", { class: "section-title" }, "当前心情"),
                  vue.createElementVNode("view", { class: "switch-container" }, [
                    vue.createElementVNode("view", { class: "switch-wrapper" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.moods, (mood, index) => {
                          return vue.openBlock(), vue.createElementBlock("button", {
                            key: index,
                            class: vue.normalizeClass(["switch-option", { "selected": $setup.makeupMood === mood.value }]),
                            onClick: ($event) => $setup.makeupMood = mood.value
                          }, [
                            vue.createElementVNode("view", { class: "switch-text" }, [
                              vue.createElementVNode("image", {
                                class: "switch-emoji-img",
                                src: mood.icon,
                                mode: "aspectFit"
                              }, null, 8, ["src"]),
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(mood.label),
                                1
                                /* TEXT */
                              )
                            ])
                          ], 10, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]),
                vue.createElementVNode("view", { class: "input-section" }, [
                  vue.createElementVNode("image", {
                    class: "input-emoji-img",
                    src: _imports_0$4,
                    mode: "aspectFit"
                  }),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      class: "text-input",
                      placeholder: "输入今日饮食或心情",
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.makeupInputText = $event)
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.makeupInputText]
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "popup-footer-fixed" }, [
                vue.createElementVNode("button", {
                  class: "confirm-button",
                  disabled: $setup.isSubmittingMakeup,
                  onClick: $setup.confirmMakeup
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "confirm-text" },
                    vue.toDisplayString($setup.isSubmittingMakeup ? "提交中..." : "确认补卡"),
                    1
                    /* TEXT */
                  )
                ], 8, ["disabled"])
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      vue.createVNode(_component_u_datetime_picker, {
        ref: "timePickerRef",
        modelValue: $setup.makeupTimeDisplay,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.makeupTimeDisplay = $event),
        mode: "time",
        show: $setup.showTimePicker,
        title: "选择时间",
        onConfirm: $setup.onTimeConfirm,
        onChange: $setup.onTimeChange,
        onCancel: _cache[4] || (_cache[4] = ($event) => $setup.showTimePicker = false),
        onClose: _cache[5] || (_cache[5] = ($event) => $setup.showTimePicker = false)
      }, null, 8, ["modelValue", "show"]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "audioSettingPopup",
          type: "bottom",
          "safe-area": false,
          class: "audio-setting-popup"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "popup-content audio-setting-popup-wrapper" }, [
              vue.createElementVNode("view", { class: "popup-header" }, [
                vue.createElementVNode("text", { class: "popup-title" }, "选择放屁音频")
              ]),
              vue.createElementVNode(
                "scroll-view",
                {
                  class: "audio-list-container",
                  "scroll-y": "",
                  onScrolltolower: $setup.onAudioListScrollToLower,
                  "lower-threshold": 100
                },
                [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.audioList, (audio) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: audio.id,
                        id: `audio-${audio.id}`,
                        class: vue.normalizeClass(["audio-setting-card", { "selected": $setup.selectedAudioUrl === audio.url }]),
                        style: vue.normalizeStyle($setup.getCardStyle(audio)),
                        onClick: ($event) => $setup.handleSelectAudio(audio)
                      }, [
                        $setup.selectedAudioUrl === audio.url ? (vue.openBlock(), vue.createElementBlock("image", {
                          key: 0,
                          class: "audio-item-check-small",
                          src: _imports_5,
                          mode: "aspectFit",
                          onClick: vue.withModifiers(($event) => $setup.handleSelectAudio(audio), ["stop"])
                        }, null, 8, ["onClick"])) : (vue.openBlock(), vue.createElementBlock("image", {
                          key: 1,
                          class: "audio-item-check-small",
                          src: _imports_6,
                          mode: "aspectFit",
                          onClick: vue.withModifiers(($event) => $setup.handleSelectAudio(audio), ["stop"])
                        }, null, 8, ["onClick"])),
                        vue.createElementVNode("view", { class: "card-image-wrapper-small" }, [
                          audio.image ? (vue.openBlock(), vue.createElementBlock("image", {
                            key: 0,
                            src: audio.image,
                            class: "card-image-small",
                            mode: "aspectFill"
                          }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                            key: 1,
                            class: "card-image-small placeholder"
                          }, [
                            vue.createElementVNode("text", { class: "placeholder-emoji-small" }, "💨")
                          ])),
                          $setup.playingAudioId === audio.id ? (vue.openBlock(), vue.createElementBlock("view", {
                            key: 2,
                            class: "play-indicator-small"
                          }, [
                            vue.createElementVNode("view", { class: "scan-line-small scan-line-1" }),
                            vue.createElementVNode("view", { class: "scan-line-small scan-line-2" }),
                            vue.createElementVNode("view", { class: "scan-line-small scan-line-3" })
                          ])) : vue.createCommentVNode("v-if", true),
                          vue.createElementVNode("view", {
                            class: vue.normalizeClass(["play-btn-small", { "playing": $setup.playingAudioId === audio.id }]),
                            onClick: vue.withModifiers(($event) => $setup.playAudio(audio), ["stop"])
                          }, [
                            vue.createElementVNode("image", {
                              class: "play-icon-small",
                              src: $setup.playingAudioId === audio.id ? "/static/img/24gf-pause2.png" : "/static/img/24gl-playCircle.png",
                              mode: "aspectFit"
                            }, null, 8, ["src"])
                          ], 10, ["onClick"])
                        ]),
                        vue.createElementVNode("view", { class: "card-content-small" }, [
                          vue.createElementVNode("view", { class: "card-header-small" }, [
                            vue.createElementVNode(
                              "view",
                              { class: "card-title-small" },
                              vue.toDisplayString(audio.name),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "view",
                              { class: "card-desc-small" },
                              vue.toDisplayString(audio.description || ""),
                              1
                              /* TEXT */
                            )
                          ]),
                          audio.tags && audio.tags.length ? (vue.openBlock(), vue.createElementBlock("view", {
                            key: 0,
                            class: "card-tags-small"
                          }, [
                            (vue.openBlock(true), vue.createElementBlock(
                              vue.Fragment,
                              null,
                              vue.renderList(audio.tags.slice(0, 3), (tag) => {
                                return vue.openBlock(), vue.createElementBlock(
                                  "view",
                                  {
                                    class: "card-tag-small",
                                    key: tag
                                  },
                                  vue.toDisplayString(tag),
                                  1
                                  /* TEXT */
                                );
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            )),
                            audio.tags.length > 3 ? (vue.openBlock(), vue.createElementBlock(
                              "text",
                              {
                                key: 0,
                                class: "more-tags-small"
                              },
                              "+" + vue.toDisplayString(audio.tags.length - 3),
                              1
                              /* TEXT */
                            )) : vue.createCommentVNode("v-if", true)
                          ])) : vue.createCommentVNode("v-if", true)
                        ])
                      ], 14, ["id", "onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  $setup.audioList.length === 0 && !$setup.isLoadingAudio ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "empty-audio"
                  }, [
                    vue.createElementVNode("text", { class: "empty-text" }, "暂无音频，使用默认音频")
                  ])) : vue.createCommentVNode("v-if", true),
                  $setup.isLoadingAudio && $setup.audioList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "loading-audio"
                  }, [
                    vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
                  ])) : vue.createCommentVNode("v-if", true),
                  $setup.isLoadingAudio && $setup.audioList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 2,
                    class: "loading-more-audio"
                  }, [
                    vue.createElementVNode("text", { class: "loading-text" }, "加载更多...")
                  ])) : vue.createCommentVNode("v-if", true),
                  !$setup.audioHasMore && $setup.audioList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 3,
                    class: "no-more-audio"
                  }, [
                    vue.createElementVNode("text", { class: "no-more-text" }, "没有更多音频了")
                  ])) : vue.createCommentVNode("v-if", true)
                ],
                32
                /* NEED_HYDRATION */
              ),
              vue.createElementVNode("view", { class: "popup-footer popup-footer-fixed" }, [
                vue.createElementVNode("button", {
                  class: "create-fart-btn",
                  onClick: $setup.goToCreateFartFromPopup
                }, [
                  vue.createElementVNode("text", { class: "create-fart-btn-text" }, "创建自己的屁")
                ])
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-1cf27b2a"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/index/index.vue"]]);
  const _imports_0$3 = "/static/home/logo.jpg";
  const _sfc_main$e = {
    name: "LoginPage",
    setup() {
      const statusBarHeight = vue.ref(0);
      const userStore = useUserStore();
      vue.onMounted(() => {
        const systemInfo = uni.getSystemInfoSync();
        statusBarHeight.value = systemInfo.statusBarHeight || 0;
      });
      const saveUserInfo = (data) => {
        userStore.setUserInfo(data);
      };
      const getPhoneNumber = async (e2) => {
        formatAppLog("log", "at pages/login/index.vue:64", "手机号授权结果:", e2);
        if (e2.detail.errMsg === "getPhoneNumber:ok") {
          formatAppLog("log", "at pages/login/index.vue:68", "授权成功，加密数据:", e2.detail);
          uni.showLoading({
            title: "登录中..."
          });
          try {
            const loginRes = await uni.login();
            const code2 = loginRes.code;
            const {
              data
            } = await wxLoginAPI({
              login_code: code2,
              phone_code: e2.detail.code
            });
            formatAppLog("log", "at pages/login/index.vue:87", "返回的data ===>", data);
            uni.hideLoading();
            if (data.code === 0) {
              saveUserInfo(data.data.token_info);
              uni.showToast({
                title: "登录成功",
                icon: "none"
              });
              setTimeout(() => {
                uni.navigateBack({
                  delta: 1
                  // 返回的页面数，默认值为1，即返回上一级页面
                });
              }, 1e3);
            } else {
              uni.showToast({
                title: "登录失败",
                icon: "none"
              });
            }
          } catch (error2) {
            formatAppLog("error", "at pages/login/index.vue:110", "登录失败:", error2);
            uni.hideLoading();
            uni.showToast({
              title: "登录失败，请重试",
              icon: "none"
            });
          }
        } else {
          uni.showToast({
            title: "授权失败，请重试",
            icon: "none"
          });
        }
      };
      return {
        statusBarHeight,
        getPhoneNumber
      };
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode(
        "view",
        {
          class: "status-bar",
          style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
        },
        null,
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "main-content g-flex-col g-col-center" }, [
        vue.createElementVNode("view", { class: "logo-section g-flex-col g-col-center g-row-center" }, [
          vue.createElementVNode("image", {
            class: "logo-image",
            src: _imports_0$3,
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "app-name" }, "蓝球"),
          vue.createElementVNode("text", { class: "app-slogan" }, "让运动更简单")
        ]),
        vue.createElementVNode("view", { class: "login-section g-flex-col g-col-center" }, [
          vue.createElementVNode(
            "button",
            {
              class: "phone-login-btn",
              "open-type": "getPhoneNumber",
              onGetphonenumber: _cache[0] || (_cache[0] = (...args) => $setup.getPhoneNumber && $setup.getPhoneNumber(...args))
            },
            [
              vue.createElementVNode("text", { class: "btn-text" }, "手机号快捷登录")
            ],
            32
            /* NEED_HYDRATION */
          )
        ])
      ])
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-d08ef7d4"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/login/index.vue"]]);
  const _imports_0$2 = "/static/img/fenlei.png";
  const _sfc_main$d = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const feed = vue.ref({
        list: [],
        empty: false,
        total: 0
      });
      const isLoading = vue.ref(true);
      const isRefreshing = vue.ref(false);
      const isRefreshingPull = vue.ref(false);
      const errorMessage = vue.ref("");
      const currentPage = vue.ref(1);
      const pageSize = vue.ref(20);
      const hasMore = vue.ref(true);
      const groupedList = vue.computed(() => {
        if (!feed.value.list || feed.value.list.length === 0) {
          return [];
        }
        const groupMap = /* @__PURE__ */ new Map();
        feed.value.list.forEach((item) => {
          const className = item.class_name || "其他类屁";
          if (!groupMap.has(className)) {
            groupMap.set(className, []);
          }
          groupMap.get(className).push(item);
        });
        const groups = Array.from(groupMap.entries()).map(([className, items]) => ({
          className,
          items
        }));
        return groups;
      });
      const getCardStyle = (item) => {
        const color2 = item.accentColor || "#FFD3B6";
        return {
          background: `linear-gradient(135deg, ${color2}12 0%, ${color2}06 50%, #ffffff 100%)`,
          borderColor: `${color2}30`
        };
      };
      const goToDetail = (item) => {
        const itemData = JSON.stringify(item);
        uni.navigateTo({
          url: `/pages/entry/detail?data=${encodeURIComponent(itemData)}`
        });
      };
      const goToCreateFart = () => {
        uni.navigateTo({
          url: "/pages/entry/creat"
        });
      };
      const handleDelete = async (item) => {
        uni.showModal({
          title: "确认删除",
          content: `确定要删除"${item.name}"吗？删除后无法恢复。`,
          confirmText: "删除",
          cancelText: "取消",
          confirmColor: "#ff3b30",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "删除中..."
                });
                const { data } = await deleteAudioLibraryAPI(item.id);
                uni.hideLoading();
                if (data.code === 0) {
                  uni.showToast({
                    title: "删除成功",
                    icon: "success",
                    duration: 1500
                  });
                  const index = feed.value.list.findIndex((i) => i.id === item.id);
                  if (index !== -1) {
                    feed.value.list.splice(index, 1);
                    feed.value.total--;
                    feed.value.empty = feed.value.list.length === 0;
                  }
                  uni.$emit("audioLibraryUpdated");
                } else {
                  uni.showToast({
                    title: data.msg || "删除失败",
                    icon: "none",
                    duration: 2e3
                  });
                }
              } catch (error2) {
                uni.hideLoading();
                formatAppLog("error", "at pages/entry/index.vue:279", "删除失败:", error2);
                uni.showToast({
                  title: "删除失败，请重试",
                  icon: "none",
                  duration: 2e3
                });
              }
            }
          }
        });
      };
      const normalizeFeed = (data) => {
        if (!data) {
          return {
            list: [],
            empty: true,
            total: 0
          };
        }
        return {
          list: data.list || [],
          empty: data.empty || false,
          total: data.total || 0
        };
      };
      const loadFeed = async (isRefresh = false, isPullRefresh = false) => {
        if (isPullRefresh) {
          isRefreshingPull.value = true;
        } else if (isRefresh) {
          isRefreshing.value = true;
        } else {
          isLoading.value = true;
        }
        errorMessage.value = "";
        try {
          if (isPullRefresh) {
            currentPage.value = 1;
            feed.value.list = [];
            hasMore.value = true;
          }
          const { data } = await getAudioLibraryFeedAPI({
            page: currentPage.value,
            pageSize: pageSize.value,
            type: 1
            // 1表示屁的全家族大全
          });
          if (data.code === 0) {
            const newFeed = normalizeFeed(data.data);
            if (currentPage.value === 1) {
              feed.value = newFeed;
            } else {
              feed.value.list = [...feed.value.list, ...newFeed.list];
              feed.value.total = newFeed.total;
              feed.value.empty = feed.value.list.length === 0;
            }
            hasMore.value = feed.value.list.length < feed.value.total;
            if (hasMore.value) {
              currentPage.value++;
            }
          } else {
            errorMessage.value = data.msg || "加载失败，请稍后重试";
          }
        } catch (error2) {
          errorMessage.value = "网络走神了，稍后再试";
        } finally {
          isLoading.value = false;
          isRefreshing.value = false;
          isRefreshingPull.value = false;
        }
      };
      const refreshFeed = () => {
        currentPage.value = 1;
        feed.value.list = [];
        hasMore.value = true;
        loadFeed(true, false);
      };
      const onPullRefresh = () => {
        if (isRefreshingPull.value || isLoading.value || isRefreshing.value) {
          return;
        }
        loadFeed(false, true);
      };
      const onReachBottom = () => {
        if (isRefreshing.value || isLoading.value || isRefreshingPull.value || !hasMore.value) {
          return;
        }
        loadFeed(true, false);
      };
      const onAudioLibraryUpdated = () => {
        formatAppLog("log", "at pages/entry/index.vue:389", "收到音频库更新事件，刷新数据");
        currentPage.value = 1;
        feed.value.list = [];
        hasMore.value = true;
        loadFeed();
      };
      vue.onMounted(() => {
        loadFeed();
        uni.$on("audioLibraryUpdated", onAudioLibraryUpdated);
      });
      vue.onUnmounted(() => {
        uni.$off("audioLibraryUpdated", onAudioLibraryUpdated);
      });
      const __returned__ = { feed, isLoading, isRefreshing, isRefreshingPull, errorMessage, currentPage, pageSize, hasMore, groupedList, getCardStyle, goToDetail, goToCreateFart, handleDelete, normalizeFeed, loadFeed, refreshFeed, onPullRefresh, onReachBottom, onAudioLibraryUpdated, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get getAudioLibraryFeedAPI() {
        return getAudioLibraryFeedAPI;
      }, get deleteAudioLibraryAPI() {
        return deleteAudioLibraryAPI;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "audio-page" }, [
      vue.createElementVNode("scroll-view", {
        class: "scroll-content",
        "scroll-y": "true",
        enhanced: true,
        "show-scrollbar": false,
        onScrolltolower: $setup.onReachBottom,
        "lower-threshold": 100,
        "refresher-enabled": true,
        "refresher-triggered": $setup.isRefreshingPull,
        onRefresherrefresh: $setup.onPullRefresh,
        "refresher-background": "#f7fbf7"
      }, [
        $setup.isLoading && $setup.feed.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-container"
        }, [
          vue.createElementVNode("view", { class: "pulse" }),
          vue.createElementVNode("text", { class: "loading-text" }, "屁趣音效装填中...")
        ])) : $setup.errorMessage ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "error-container"
        }, [
          vue.createElementVNode("text", { class: "error-emoji" }, "😅"),
          vue.createElementVNode(
            "text",
            { class: "error-text" },
            vue.toDisplayString($setup.errorMessage),
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            class: "retry-btn",
            onClick: $setup.refreshFeed
          }, "再试一次")
        ])) : $setup.feed.empty ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-container"
        }, [
          vue.createElementVNode("view", { class: "empty-illustration" }, [
            vue.createElementVNode("view", { class: "empty-icon-wrapper" }, [
              vue.createElementVNode("text", { class: "empty-icon" }, "📚")
            ]),
            vue.createElementVNode("view", { class: "empty-sparkles" }, [
              vue.createElementVNode("text", { class: "sparkle sparkle-1" }, "✨"),
              vue.createElementVNode("text", { class: "sparkle sparkle-2" }, "💫"),
              vue.createElementVNode("text", { class: "sparkle sparkle-3" }, "⭐")
            ])
          ]),
          vue.createElementVNode("text", { class: "empty-title" }, "图鉴库正在建设中"),
          vue.createElementVNode("text", { class: "empty-desc" }, "管理员正在整理屁趣家族成员，稍后再来探索吧～"),
          vue.createElementVNode("view", { class: "empty-hint" }, [
            vue.createElementVNode("text", { class: "hint-text" }, "期待更多精彩内容")
          ])
        ])) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 3 },
          [
            vue.createElementVNode("view", { class: "grouped-catalog-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.groupedList, (group) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "catalog-group",
                    key: group.className
                  }, [
                    vue.createElementVNode("view", { class: "group-header" }, [
                      vue.createElementVNode("view", { class: "group-title-wrapper" }, [
                        vue.createElementVNode("image", {
                          class: "group-icon",
                          src: _imports_0$2,
                          mode: "aspectFit"
                        }),
                        vue.createElementVNode(
                          "text",
                          { class: "group-title" },
                          vue.toDisplayString(group.className),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "group-count" },
                          "(" + vue.toDisplayString(group.items.length) + ")",
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "group-divider" })
                    ]),
                    vue.createElementVNode("view", { class: "group-items" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(group.items, (item) => {
                          return vue.openBlock(), vue.createElementBlock(
                            "view",
                            {
                              class: "catalog-card",
                              key: item.id,
                              style: vue.normalizeStyle($setup.getCardStyle(item))
                            },
                            [
                              item.class_name === "自己放的屁" ? (vue.openBlock(), vue.createElementBlock("view", {
                                key: 0,
                                class: "delete-btn",
                                onClick: vue.withModifiers(($event) => $setup.handleDelete(item), ["stop"])
                              }, [
                                vue.createElementVNode("text", { class: "delete-icon" }, "🗑️")
                              ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                              vue.createElementVNode("view", {
                                class: "card-body",
                                onClick: ($event) => $setup.goToDetail(item)
                              }, [
                                vue.createElementVNode("view", { class: "card-image-wrapper" }, [
                                  item.image ? (vue.openBlock(), vue.createElementBlock("image", {
                                    key: 0,
                                    src: item.image,
                                    class: "card-image",
                                    mode: "aspectFill"
                                  }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                                    key: 1,
                                    class: "card-image placeholder"
                                  }, [
                                    vue.createElementVNode("text", { class: "placeholder-emoji" }, "💨")
                                  ]))
                                ]),
                                vue.createElementVNode("view", { class: "card-content" }, [
                                  vue.createElementVNode("view", { class: "content-header" }, [
                                    vue.createElementVNode(
                                      "text",
                                      { class: "card-title" },
                                      vue.toDisplayString(item.name),
                                      1
                                      /* TEXT */
                                    ),
                                    vue.createElementVNode(
                                      "text",
                                      { class: "card-desc" },
                                      vue.toDisplayString(item.description || item.moodText),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  item.tags && item.tags.length ? (vue.openBlock(), vue.createElementBlock("view", {
                                    key: 0,
                                    class: "card-tags"
                                  }, [
                                    (vue.openBlock(true), vue.createElementBlock(
                                      vue.Fragment,
                                      null,
                                      vue.renderList(item.tags.slice(0, 4), (tag) => {
                                        return vue.openBlock(), vue.createElementBlock(
                                          "view",
                                          {
                                            class: "card-tag",
                                            key: tag
                                          },
                                          vue.toDisplayString(tag),
                                          1
                                          /* TEXT */
                                        );
                                      }),
                                      128
                                      /* KEYED_FRAGMENT */
                                    )),
                                    item.tags.length > 4 ? (vue.openBlock(), vue.createElementBlock(
                                      "text",
                                      {
                                        key: 0,
                                        class: "more-tags"
                                      },
                                      "+" + vue.toDisplayString(item.tags.length - 4),
                                      1
                                      /* TEXT */
                                    )) : vue.createCommentVNode("v-if", true)
                                  ])) : vue.createCommentVNode("v-if", true),
                                  vue.createElementVNode("view", { class: "card-footer" }, [
                                    vue.createElementVNode("text", { class: "view-detail-hint" }, "点击查看详情 →")
                                  ])
                                ])
                              ], 8, ["onClick"])
                            ],
                            4
                            /* STYLE */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            $setup.isRefreshing ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "refresh-tip"
            }, [
              vue.createElementVNode("view", { class: "refresh-spinner" }),
              vue.createElementVNode("text", { class: "refresh-text" }, "正在刷新...")
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "footer-spacer" })
          ],
          64
          /* STABLE_FRAGMENT */
        ))
      ], 40, ["refresher-triggered"]),
      vue.createElementVNode("view", { class: "bottom-view" }, [
        vue.createElementVNode("view", { class: "bottom-confirm-wrapper" }, [
          vue.createElementVNode("button", {
            class: "bottom-confirm-button",
            onClick: $setup.goToCreateFart
          }, [
            vue.createElementVNode("text", { class: "bottom-confirm-text" }, "创建自己的屁")
          ])
        ])
      ])
    ]);
  }
  const PagesEntryIndex = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-ced29d0a"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/entry/index.vue"]]);
  const meImg = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/me_img.png";
  const taImg = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/ta_img.png";
  const _sfc_main$c = {
    __name: "fart",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const nickname = vue.computed(() => userStore.nickname);
      const avatar = vue.computed(() => userStore.avatar);
      const isMe = vue.ref(true);
      const leftDefaultImg = vue.ref(meImg);
      const leftAvatarImg = vue.ref(meImg);
      const rightDefaultImg = vue.ref(taImg);
      const rightAvatarImg = vue.ref(taImg);
      const currentLeftImg = vue.ref(meImg);
      const currentRightImg = vue.ref(taImg);
      const inviterInfo = vue.ref(null);
      const inviterPosition = vue.ref(null);
      const isInviteShareMode = vue.ref(false);
      const currentTogetherRecordId = vue.ref(null);
      const lastFartTogetherRecord = vue.ref(null);
      const isCanlastFartTogether = vue.ref(false);
      const hasUnfinishedRecord = vue.computed(() => {
        return lastFartTogetherRecord.value && lastFartTogetherRecord.value.inviteeRecordInfo && lastFartTogetherRecord.value.inviteeRecordInfo.fartType === "";
      });
      const currentInviteeId = vue.ref(null);
      const currentInviterSex = vue.ref(1);
      const currentInviteeSex = vue.ref(2);
      const fartPopup = vue.ref();
      const nickname_left = vue.ref("");
      const nickname_right = vue.ref("");
      const isCompleted = vue.computed(() => {
        return nickname_left.value !== "" && nickname_right.value !== "";
      });
      const selectedFartType = vue.ref("响亮型");
      const selectedSmellLevel = vue.ref("清香");
      const selectedVolume = vue.ref("大当量");
      const selectedMood = vue.ref("放松");
      const isSubmitting = vue.ref(false);
      const gifUrl = vue.ref(`https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/niao-fp.gif?t=${Date.now()}`);
      const isPopupOpen = vue.ref(false);
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
        { value: "微单量", icon: "/static/emj/teddy-bear.png", label: "微单量", sizeClass: "volume-micro" }
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
            "微单量": "micro"
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
          formatAppLog("log", "at pages/index/fart.vue:500", "提交一起打屁记录:", requestData);
          const { data } = await createFartTogetherRecordAPI(requestData);
          formatAppLog("log", "at pages/index/fart.vue:505", "打卡结果:", data);
          if (data.code === 0) {
            uni.vibrateShort({
              type: "heavy"
            });
            fartPopup.value.close();
            loadLastFartTogetherRecord();
            uni.$emit("fartRecordAdded");
            uni.$emit("userInfoUpdated");
            uni.showToast({
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
            uni.showToast({
              title: data.msg || "打卡失败",
              icon: "none"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/fart.vue:546", "打卡失败:", error2);
          uni.showToast({
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
          uni.showToast({
            title: "缺少一起放屁记录ID",
            icon: "none"
          });
          return;
        }
        goToFartPage();
      };
      const goToHomePage = () => {
        uni.switchTab({
          url: "/pages/index/index"
        });
      };
      const updateTogetherFartRecord = async () => {
        if (isSubmitting.value) {
          return;
        }
        if (!currentTogetherRecordId.value) {
          uni.showToast({
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
            "微单量": "micro"
          };
          const updateData = {
            inviteeRecordInfo: {
              fartType: typeMap[selectedFartType.value],
              mood: moodMap[selectedMood.value],
              smellLevel: smellMap[selectedSmellLevel.value],
              volumeLevel: volumeMap[selectedVolume.value]
            }
          };
          formatAppLog("log", "at pages/index/fart.vue:642", "更新一起打屁记录:", currentTogetherRecordId.value, updateData);
          const { data } = await updateFartTogetherRecordAPI(currentTogetherRecordId.value, updateData);
          formatAppLog("log", "at pages/index/fart.vue:647", "更新结果:", data);
          if (data.code === 0) {
            uni.vibrateShort({
              type: "heavy"
            });
            fartPopup.value.close();
            const recordId = currentTogetherRecordId.value;
            await loadFartTogetherRecordById(recordId);
            uni.$emit("fartRecordAdded");
            uni.$emit("userInfoUpdated");
            uni.showToast({
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
            uni.showToast({
              title: data.msg || "更新失败",
              icon: "none"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/fart.vue:692", "更新失败:", error2);
          uni.showToast({
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
            formatAppLog("error", "at pages/index/fart.vue:712", "记录ID不存在");
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
            formatAppLog("log", "at pages/index/fart.vue:729", "切换身份，更新性别:", updateData);
            uni.showLoading({
              title: "切换中..."
            });
            const { data } = await updateFartTogetherRecordSexAPI(updateData);
            uni.hideLoading();
            if (data.code === 0) {
              lastFartTogetherRecord.value.inviterSex = newInviterSex;
              lastFartTogetherRecord.value.inviteeSex = newInviteeSex;
              await loadLastFartTogetherRecord();
              uni.showToast({
                title: "切换成功",
                icon: "none",
                duration: 1500
              });
            } else {
              uni.showToast({
                title: data.msg || "切换失败",
                icon: "none"
              });
            }
          } catch (error2) {
            formatAppLog("error", "at pages/index/fart.vue:757", "切换身份失败:", error2);
            uni.showToast({
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
          formatAppLog("log", "at pages/index/fart.vue:829", "开始微信 code 登录...");
          const loginRes = await uni.login();
          const code2 = loginRes.code;
          formatAppLog("log", "at pages/index/fart.vue:835", "获取到的 code:", code2);
          const { data } = await wxQuickLoginAPI(code2);
          formatAppLog("log", "at pages/index/fart.vue:840", "微信登录结果:", data);
          if (data.code === 0) {
            userStore.setLoginInfo(data.data);
            uni.$emit("loginSuccess");
            formatAppLog("log", "at pages/index/fart.vue:849", "✅ 微信登录成功");
            return true;
          } else {
            formatAppLog("log", "at pages/index/fart.vue:852", "❌ 微信登录失败:", data.msg);
            return false;
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/fart.vue:856", "❌ 微信登录异常:", error2);
          return false;
        }
      };
      const handleSmartLogin = async () => {
        formatAppLog("log", "at pages/index/fart.vue:863", "===== 开始智能登录 =====");
        const savedOpenid = userStore.openid;
        if (savedOpenid) {
          formatAppLog("log", "at pages/index/fart.vue:869", "检测到保存的 openid，尝试快速登录");
          try {
            const { data } = await openidLoginAPI(savedOpenid);
            formatAppLog("log", "at pages/index/fart.vue:873", "openid 登录结果:", data.data);
            if (data.code === 0) {
              userStore.setLoginInfo(data.data);
              uni.$emit("loginSuccess");
              formatAppLog("log", "at pages/index/fart.vue:882", "✅ openid 登录成功");
              return true;
            } else {
              formatAppLog("log", "at pages/index/fart.vue:885", "❌ openid 登录失败:", data.msg);
              return await handleWxLogin();
            }
          } catch (error2) {
            formatAppLog("error", "at pages/index/fart.vue:889", "❌ openid 登录异常:", error2);
            return await handleWxLogin();
          }
        } else {
          return await handleWxLogin();
        }
      };
      const loadUserInfo = async () => {
        try {
          const { data } = await getUserInfoAPI();
          if (data.code === 0) {
            userStore.setUserInfo(data.data);
            formatAppLog("log", "at pages/index/fart.vue:904", "用户信息已更新:", data.data);
          } else {
            formatAppLog("log", "at pages/index/fart.vue:906", "获取用户信息失败，可能需要登录:", data.msg);
            const loginSuccess = await handleSmartLogin();
            if (loginSuccess) {
              await loadUserInfo();
            }
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/fart.vue:915", "获取用户信息失败:", error2);
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
            formatAppLog("log", "at pages/index/fart.vue:931", "未登录，跳过加载最近一次屁友一起打屁记录");
            return;
          }
          nickname_left.value = "";
          nickname_right.value = "";
          const { data } = await getLastFartTogetherRecordAPI();
          if (data.code === 0 && data.data) {
            lastFartTogetherRecord.value = data.data;
            formatAppLog("log", "at pages/index/fart.vue:939", "最近一次屁友一起打屁记录:", data.data);
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
            formatAppLog("log", "at pages/index/fart.vue:1003", "没有最近一次屁友一起打屁记录");
            lastFartTogetherRecord.value = null;
            leftDefaultImg.value = meImg;
            rightDefaultImg.value = taImg;
            leftAvatarImg.value = meImg;
            rightAvatarImg.value = taImg;
            nickname_left.value = "";
            nickname_right.value = "";
            isMe.value = true;
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/fart.vue:1015", "获取最近一次屁友一起打屁记录失败:", error2);
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
          "micro": "微单量"
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
        formatAppLog("log", "at pages/index/fart.vue:1096", "recordInfo", recordInfo);
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
      const handlePopupChange = (e2) => {
        isPopupOpen.value = e2.show;
      };
      const onLoginSuccess = () => {
        formatAppLog("log", "at pages/index/fart.vue:1176", "收到 loginSuccess 事件，开始加载用户信息");
        loadUserInfo();
      };
      const handleInvite = () => {
        var _a, _b;
        formatAppLog("log", "at pages/index/fart.vue:1182", "邀请屁友按钮点击", (_a = userStore.userInfo) == null ? void 0 : _a.ID);
        if (!((_b = userStore.userInfo) == null ? void 0 : _b.ID)) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        goToFartPage();
      };
      onShareAppMessage(() => {
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
      const loadInviterInfo = async (inviteId) => {
        try {
          const { data } = await getUserInfoByIdAPI(inviteId);
          if (data.code === 0 && data.data) {
            inviterInfo.value = {
              id: data.data.id,
              nickname: data.data.nickname || "未知用户",
              avatar: data.data.avatar || "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png"
            };
            return true;
          } else {
            formatAppLog("error", "at pages/index/fart.vue:1246", "获取邀请人信息失败:", data.msg);
            return false;
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/fart.vue:1250", "获取邀请人信息异常:", error2);
          return false;
        }
      };
      const loadFartTogetherRecordById = async (recordId) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i;
        try {
          const { data } = await getFartTogetherRecordByIdAPI(recordId);
          formatAppLog("log", "at pages/index/fart.vue:1259", "dsdssdss", data);
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
            formatAppLog("error", "at pages/index/fart.vue:1355", "获取一起放屁记录失败:", data.msg);
            return false;
          }
        } catch (error2) {
          formatAppLog("error", "at pages/index/fart.vue:1359", "获取一起放屁记录异常:", error2);
          return false;
        }
      };
      const handleInviteParams = async (togetherRecordId) => {
        formatAppLog("log", "at pages/index/fart.vue:1366", "收到邀请参数:", { togetherRecordId });
        isInviteShareMode.value = true;
        if (!togetherRecordId) {
          return;
        }
        const success = await loadFartTogetherRecordById(parseInt(togetherRecordId));
        if (!success) {
          return;
        }
      };
      vue.onMounted(() => {
      });
      onLoad((options) => {
        formatAppLog("log", "at pages/index/fart.vue:1390", "页面加载参数:", options);
        if (options.togetherRecordId) {
          isInviteShareMode.value = true;
          const togetherRecordId = options.togetherRecordId;
          setTimeout(() => {
            handleInviteParams(togetherRecordId);
          }, 500);
          if (userStore.token) {
            formatAppLog("log", "at pages/index/fart.vue:1402", "已有 token，直接加载用户信息");
            loadUserInfo().then(() => {
            });
          } else {
            formatAppLog("log", "at pages/index/fart.vue:1407", "暂无 token，开始自动登录...");
            handleSmartLogin().then((loginSuccess) => {
              if (loginSuccess) {
                loadUserInfo().then(() => {
                });
              }
            });
          }
        } else {
          if (userStore.token) {
            formatAppLog("log", "at pages/index/fart.vue:1419", "已有 token，直接加载用户信息");
            loadUserInfo().then(() => {
              if (!isInviteShareMode.value) {
                loadLastFartTogetherRecord();
              }
            });
          } else {
            formatAppLog("log", "at pages/index/fart.vue:1427", "暂无 token，开始自动登录...");
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
      onShow(() => {
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
      vue.onUnmounted(() => {
      });
      const __returned__ = { userStore, nickname, avatar, isMe, meImg, taImg, leftDefaultImg, leftAvatarImg, rightDefaultImg, rightAvatarImg, currentLeftImg, currentRightImg, inviterInfo, inviterPosition, isInviteShareMode, currentTogetherRecordId, lastFartTogetherRecord, isCanlastFartTogether, hasUnfinishedRecord, currentInviteeId, currentInviterSex, currentInviteeSex, fartPopup, nickname_left, nickname_right, isCompleted, selectedFartType, selectedSmellLevel, selectedVolume, selectedMood, isSubmitting, gifUrl, isPopupOpen, fartTypes, smellLevels, volumeLevels, moods, selectFartType, selectSmellLevel, selectVolume, selectMood, confirmFart, handleTogetherFart, goToHomePage, updateTogetherFartRecord, switchIdentity, handleWxLogin, handleSmartLogin, loadUserInfo, loadLastFartTogetherRecord, getFartTypeName, getFartTypeNameByRecord, getSmellLevelName, getSmellLevelNameByRecord, getMoodName, getMoodNameByRecord, getVolumeName, getVolumeNameByRecord, hasRecordData, getInviteButtonText, getLeftRecordInfo, getRightRecordInfo, goToFartPage, handlePopupChange, onLoginSuccess, handleInvite, loadInviterInfo, loadFartTogetherRecordById, handleInviteParams, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get onShow() {
        return onShow;
      }, get onLoad() {
        return onLoad;
      }, get onShareAppMessage() {
        return onShareAppMessage;
      }, get getUserInfoAPI() {
        return getUserInfoAPI;
      }, get wxQuickLoginAPI() {
        return wxQuickLoginAPI;
      }, get openidLoginAPI() {
        return openidLoginAPI;
      }, get getUserInfoByIdAPI() {
        return getUserInfoByIdAPI;
      }, get getLastFartTogetherRecordAPI() {
        return getLastFartTogetherRecordAPI;
      }, get createFartTogetherRecordAPI() {
        return createFartTogetherRecordAPI;
      }, get getFartTogetherRecordByIdAPI() {
        return getFartTogetherRecordByIdAPI;
      }, get updateFartTogetherRecordAPI() {
        return updateFartTogetherRecordAPI;
      }, get updateFartTogetherRecordSexAPI() {
        return updateFartTogetherRecordSexAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "fart-page" }, [
      vue.createElementVNode("scroll-view", {
        class: "scroll-view",
        "scroll-y": ""
      }, [
        vue.createElementVNode("view", { class: "content-wrapper" }, [
          vue.createElementVNode("image", {
            class: "top-image",
            src: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/top_text.png",
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { class: "floating-me-view" }, [
            vue.createElementVNode("view", { class: "floating-side-wrapper" }, [
              $setup.nickname_left === "" ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                class: "floating-me-img",
                src: $setup.leftDefaultImg,
                mode: "aspectFill"
              }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "avatar-content-wrapper"
              }, [
                vue.createElementVNode("image", {
                  class: "avatar-image inviter-avatar",
                  src: $setup.leftAvatarImg,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode(
                  "text",
                  { class: "inviter-name" },
                  vue.toDisplayString($setup.nickname_left),
                  1
                  /* TEXT */
                )
              ]))
            ]),
            !$setup.isInviteShareMode ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "switch-center",
              onClick: $setup.switchIdentity
            }, [
              vue.createElementVNode("view", null, [
                vue.createElementVNode("text", { class: "switch-name-text" }, "切换身份")
              ]),
              vue.createElementVNode("image", {
                class: "img-center",
                src: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-09/qiehuan_img.png",
                mode: "aspectFit"
              })
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "floating-side-wrapper" }, [
              $setup.nickname_right === "" ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                class: "floating-ta-img",
                src: $setup.rightDefaultImg,
                mode: "aspectFill"
              }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "avatar-content-wrapper"
              }, [
                vue.createElementVNode("image", {
                  class: "avatar-image inviter-avatar",
                  src: $setup.rightAvatarImg,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode(
                  "text",
                  { class: "inviter-name" },
                  vue.toDisplayString($setup.nickname_right),
                  1
                  /* TEXT */
                )
              ]))
            ])
          ]),
          vue.createElementVNode("view", { class: "bg-image-wrapper" }, [
            vue.createElementVNode("image", {
              class: "bg-image",
              src: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/xin_bg.png",
              mode: "aspectFit"
            }),
            vue.createElementVNode("image", {
              class: "floating-image",
              src: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/xing_xing.png",
              mode: "aspectFit"
            }),
            vue.createElementVNode("view", { class: "floating-image-wrapper" }, [
              vue.createElementVNode("image", {
                class: "man-image",
                src: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/man_bg.png",
                mode: "aspectFit"
              }),
              vue.createElementVNode("image", {
                class: "girl-image",
                src: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/girl_bg.png",
                mode: "aspectFit"
              })
            ]),
            vue.createElementVNode("image", {
              class: "line-img",
              src: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-08/line_bg.png",
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("view", { class: "floating-info-view" }, [
            $setup.lastFartTogetherRecord ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "together-record-info"
            }, [
              vue.createElementVNode("view", { class: "record-item" }, [
                $setup.hasRecordData($setup.getLeftRecordInfo()) ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 0 },
                  [
                    vue.createElementVNode("view", { class: "record-item-row" }, [
                      vue.createElementVNode("text", { class: "record-label" }, "放了"),
                      vue.createElementVNode("view", { class: "record-type-wrapper" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "record-type" },
                          vue.toDisplayString($setup.getVolumeNameByRecord($setup.getLeftRecordInfo())),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "record-type-gap" }),
                        vue.createElementVNode(
                          "text",
                          { class: "record-type" },
                          vue.toDisplayString($setup.getFartTypeNameByRecord($setup.getLeftRecordInfo())),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("text", { class: "record-label" }, "屁")
                    ]),
                    vue.createElementVNode("view", { class: "record-item-row" }, [
                      vue.createElementVNode("text", { class: "record-label" }, "气味等级："),
                      vue.createElementVNode(
                        "text",
                        { class: "record-type" },
                        vue.toDisplayString($setup.getSmellLevelNameByRecord($setup.getLeftRecordInfo())),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "record-item-row" }, [
                      vue.createElementVNode("text", { class: "record-label" }, "心情："),
                      vue.createElementVNode(
                        "text",
                        { class: "record-type" },
                        vue.toDisplayString($setup.getMoodNameByRecord($setup.getLeftRecordInfo())),
                        1
                        /* TEXT */
                      )
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "record-item-row"
                }, [
                  vue.createElementVNode("text", { class: "record-label" }, "等待放屁。。。")
                ]))
              ]),
              vue.createElementVNode("view", { class: "record-item" }, [
                $setup.hasRecordData($setup.getRightRecordInfo()) ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 0 },
                  [
                    vue.createElementVNode("view", { class: "record-item-row" }, [
                      vue.createElementVNode("text", { class: "record-label" }, "放了"),
                      vue.createElementVNode("view", { class: "record-type-wrapper" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "record-type" },
                          vue.toDisplayString($setup.getVolumeNameByRecord($setup.getRightRecordInfo())),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "record-type-gap" }),
                        vue.createElementVNode(
                          "text",
                          { class: "record-type" },
                          vue.toDisplayString($setup.getFartTypeNameByRecord($setup.getRightRecordInfo())),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("text", { class: "record-label" }, "屁")
                    ]),
                    vue.createElementVNode("view", { class: "record-item-row" }, [
                      vue.createElementVNode("text", { class: "record-label" }, "气味等级："),
                      vue.createElementVNode(
                        "text",
                        { class: "record-type" },
                        vue.toDisplayString($setup.getSmellLevelNameByRecord($setup.getRightRecordInfo())),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "record-item-row" }, [
                      vue.createElementVNode("text", { class: "record-label" }, "心情："),
                      vue.createElementVNode(
                        "text",
                        { class: "record-type" },
                        vue.toDisplayString($setup.getMoodNameByRecord($setup.getRightRecordInfo())),
                        1
                        /* TEXT */
                      )
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "record-item-row"
                }, [
                  vue.createElementVNode("text", { class: "record-label" }, "等待放屁。。。")
                ]))
              ])
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "bottom-view" }, [
        $setup.isPopupOpen ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "bottom-confirm-wrapper"
        }, [
          vue.createElementVNode("button", {
            class: "bottom-confirm-button",
            disabled: $setup.isSubmitting,
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.isInviteShareMode ? $setup.updateTogetherFartRecord() : $setup.confirmFart())
          }, [
            vue.createElementVNode(
              "text",
              { class: "bottom-confirm-text" },
              vue.toDisplayString($setup.isSubmitting ? "提交中..." : "确认放屁"),
              1
              /* TEXT */
            )
          ], 8, ["disabled"])
        ])) : $setup.isInviteShareMode ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "bottom-confirm-wrapper"
        }, [
          vue.createElementVNode("button", {
            class: "bottom-confirm-button",
            disabled: $setup.isSubmitting,
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.isCompleted ? $setup.goToHomePage() : $setup.handleTogetherFart())
          }, [
            vue.createElementVNode(
              "text",
              { class: "bottom-confirm-text" },
              vue.toDisplayString($setup.isSubmitting ? "提交中..." : $setup.isCompleted ? "我们的空气，共同完成了今天的默契" : "和TA一起放个屁吧"),
              1
              /* TEXT */
            )
          ], 8, ["disabled"])
        ])) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 2 },
          [
            vue.createElementVNode("view", { class: "user-info" }, [
              vue.createElementVNode("image", {
                class: "user-avatar",
                src: $setup.avatar,
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode(
                "text",
                { class: "user-name" },
                vue.toDisplayString($setup.nickname),
                1
                /* TEXT */
              )
            ]),
            $setup.lastFartTogetherRecord && $setup.lastFartTogetherRecord.inviteeRecordInfo && (!$setup.lastFartTogetherRecord.inviteeRecordInfo.fartType || $setup.lastFartTogetherRecord.inviteeRecordInfo.fartType === "") ? (vue.openBlock(), vue.createElementBlock("button", {
              key: 0,
              class: "invite-btn",
              "open-type": "share"
            }, [
              vue.createElementVNode("text", { class: "invite-text" }, "邀请屁友")
            ])) : (vue.openBlock(), vue.createElementBlock("button", {
              key: 1,
              class: "invite-btn",
              onClick: $setup.handleInvite
            }, [
              vue.createElementVNode(
                "text",
                { class: "invite-text" },
                vue.toDisplayString($setup.getInviteButtonText()),
                1
                /* TEXT */
              )
            ]))
          ],
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "fartPopup",
          type: "bottom",
          "safe-area": false,
          onChange: $setup.handlePopupChange
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "popup-content" }, [
              vue.createElementVNode("view", { class: "popup-header" }, [
                vue.createElementVNode("view", { class: "popup-gif-container" }, [
                  vue.createElementVNode("image", {
                    class: "popup-gif",
                    src: $setup.gifUrl,
                    mode: "aspectFit"
                  }, null, 8, ["src"])
                ])
              ]),
              vue.createElementVNode("view", { class: "section" }, [
                vue.createElementVNode("text", { class: "section-title" }, "屁屁类型"),
                vue.createElementVNode("view", { class: "switch-container" }, [
                  vue.createElementVNode("view", { class: "switch-wrapper" }, [
                    (vue.openBlock(), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.fartTypes, (type, index) => {
                        return vue.createElementVNode("button", {
                          key: index,
                          class: vue.normalizeClass(["switch-option", { "selected": $setup.selectedFartType === type.value }]),
                          onClick: ($event) => $setup.selectFartType(type.value)
                        }, [
                          vue.createElementVNode("image", {
                            class: "switch-emoji-img",
                            src: type.icon,
                            mode: "aspectFit"
                          }, null, 8, ["src"]),
                          vue.createElementVNode(
                            "text",
                            { class: "switch-text" },
                            vue.toDisplayString(type.label),
                            1
                            /* TEXT */
                          )
                        ], 10, ["onClick"]);
                      }),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "section" }, [
                vue.createElementVNode("text", { class: "section-title" }, "气味等级"),
                vue.createElementVNode("view", { class: "switch-container" }, [
                  vue.createElementVNode("scroll-view", {
                    class: "switch-scroll-view",
                    "scroll-x": ""
                  }, [
                    vue.createElementVNode("view", { class: "switch-wrapper" }, [
                      (vue.openBlock(), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.smellLevels, (level, index) => {
                          return vue.createElementVNode("button", {
                            key: index,
                            class: vue.normalizeClass(["switch-option", { "selected": $setup.selectedSmellLevel === level.value }]),
                            onClick: ($event) => $setup.selectSmellLevel(level.value)
                          }, [
                            vue.createElementVNode("image", {
                              class: "switch-emoji-img",
                              src: level.icon,
                              mode: "aspectFit"
                            }, null, 8, ["src"]),
                            vue.createElementVNode(
                              "text",
                              { class: "switch-emoji-text" },
                              vue.toDisplayString(level.label),
                              1
                              /* TEXT */
                            )
                          ], 10, ["onClick"]);
                        }),
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ])
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "section" }, [
                vue.createElementVNode("text", { class: "section-title" }, "放屁当量"),
                vue.createElementVNode("view", { class: "switch-container" }, [
                  vue.createElementVNode("scroll-view", {
                    class: "switch-scroll-view",
                    "scroll-x": ""
                  }, [
                    vue.createElementVNode("view", { class: "switch-wrapper" }, [
                      (vue.openBlock(), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.volumeLevels, (volume, index) => {
                          return vue.createElementVNode("button", {
                            key: index,
                            class: vue.normalizeClass(["switch-option", { "selected": $setup.selectedVolume === volume.value }]),
                            onClick: ($event) => $setup.selectVolume(volume.value)
                          }, [
                            vue.createElementVNode("image", {
                              class: vue.normalizeClass(["switch-emoji-img", volume.sizeClass]),
                              src: volume.icon,
                              mode: "aspectFit"
                            }, null, 10, ["src"]),
                            vue.createElementVNode(
                              "text",
                              { class: "switch-emoji-text" },
                              vue.toDisplayString(volume.label),
                              1
                              /* TEXT */
                            )
                          ], 10, ["onClick"]);
                        }),
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ])
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "section" }, [
                vue.createElementVNode("text", { class: "section-title" }, "当前心情"),
                vue.createElementVNode("view", { class: "switch-container" }, [
                  vue.createElementVNode("view", { class: "switch-wrapper" }, [
                    (vue.openBlock(), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.moods, (mood, index) => {
                        return vue.createElementVNode("button", {
                          key: index,
                          class: vue.normalizeClass(["switch-option", { "selected": $setup.selectedMood === mood.value }]),
                          onClick: ($event) => $setup.selectMood(mood.value)
                        }, [
                          vue.createElementVNode("image", {
                            class: "switch-emoji-img",
                            src: mood.icon,
                            mode: "aspectFit"
                          }, null, 8, ["src"]),
                          vue.createElementVNode(
                            "text",
                            { class: "switch-emoji-text" },
                            vue.toDisplayString(mood.label),
                            1
                            /* TEXT */
                          )
                        ], 10, ["onClick"]);
                      }),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ])
                ])
              ]),
              vue.createElementVNode("view", { style: { "height": "200rpx" } })
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesIndexFart = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-90342e36"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/index/fart.vue"]]);
  const _imports_0$1 = "/static/img/24gl-playCircle.png";
  const _imports_1$4 = "/static/img/24gf-pause2.png";
  const _sfc_main$b = {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const loading = vue.ref(true);
      const itemData = vue.ref(null);
      const isPlaying = vue.ref(false);
      let innerAudioContext = null;
      vue.onMounted(() => {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const options = currentPage.options || {};
        if (options.data) {
          try {
            const decodedData = decodeURIComponent(options.data);
            itemData.value = JSON.parse(decodedData);
          } catch (error2) {
            formatAppLog("error", "at pages/entry/detail.vue:131", "解析数据失败:", error2);
            itemData.value = null;
          }
        } else {
          itemData.value = null;
        }
        loading.value = false;
      });
      const ensureAudioContext = () => {
        var _a;
        if (!innerAudioContext && ((_a = itemData.value) == null ? void 0 : _a.url)) {
          try {
            innerAudioContext = uni.createInnerAudioContext();
            if (!innerAudioContext) {
              throw new Error("无法创建音频上下文");
            }
            innerAudioContext.autoplay = false;
            innerAudioContext.obeyMuteSwitch = false;
            innerAudioContext.onEnded(() => {
              isPlaying.value = false;
            });
            innerAudioContext.onStop(() => {
              isPlaying.value = false;
            });
            innerAudioContext.onError((err) => {
              formatAppLog("error", "at pages/entry/detail.vue:161", "音频播放错误:", err);
              isPlaying.value = false;
              let errorMsg = "音频播放失败";
              if (err && typeof err === "object" && err.errMsg) {
                const errMsgLower = err.errMsg.toLowerCase();
                if (errMsgLower.includes("decode") || errMsgLower.includes("解码")) {
                  errorMsg = "该手机不支持此音频播放";
                } else if (errMsgLower.includes("network") || errMsgLower.includes("网络")) {
                  errorMsg = "网络错误，请检查网络连接";
                } else if (errMsgLower.includes("404") || errMsgLower.includes("not found")) {
                  errorMsg = "音频文件不存在";
                }
              }
              uni.showToast({
                title: errorMsg,
                icon: "none",
                duration: 2500
              });
              try {
                if (innerAudioContext) {
                  innerAudioContext.destroy();
                }
              } catch (e2) {
                formatAppLog("error", "at pages/entry/detail.vue:187", "清理音频上下文失败:", e2);
              }
              innerAudioContext = null;
            });
          } catch (error2) {
            formatAppLog("error", "at pages/entry/detail.vue:192", "创建音频上下文失败:", error2);
            uni.showToast({
              title: "音频初始化失败",
              icon: "none",
              duration: 2e3
            });
            innerAudioContext = null;
          }
        }
      };
      const isValidUrl = (url2) => {
        if (!url2 || typeof url2 !== "string") {
          return false;
        }
        try {
          new URL(url2);
          return true;
        } catch {
          return url2.startsWith("/") || url2.startsWith("http://") || url2.startsWith("https://");
        }
      };
      const togglePlay = () => {
        var _a;
        if (!((_a = itemData.value) == null ? void 0 : _a.url)) {
          uni.showToast({
            title: "音频地址缺失",
            icon: "none",
            duration: 2e3
          });
          return;
        }
        if (!isValidUrl(itemData.value.url)) {
          uni.showToast({
            title: "音频地址格式错误",
            icon: "none",
            duration: 2e3
          });
          return;
        }
        if (isPlaying.value) {
          try {
            if (innerAudioContext) {
              innerAudioContext.pause();
              isPlaying.value = false;
            }
          } catch (error2) {
            formatAppLog("error", "at pages/entry/detail.vue:245", "暂停音频失败:", error2);
            isPlaying.value = false;
          }
          return;
        }
        ensureAudioContext();
        if (!innerAudioContext) {
          uni.showToast({
            title: "音频播放器初始化失败",
            icon: "none",
            duration: 2e3
          });
          return;
        }
        try {
          innerAudioContext.src = itemData.value.url;
          isPlaying.value = true;
          setTimeout(() => {
            try {
              if (innerAudioContext && isPlaying.value && innerAudioContext.src === itemData.value.url) {
                innerAudioContext.play();
              }
            } catch (playError) {
              formatAppLog("error", "at pages/entry/detail.vue:277", "播放音频失败:", playError);
              isPlaying.value = false;
              uni.showToast({
                title: "播放失败，请稍后重试",
                icon: "none",
                duration: 2e3
              });
              try {
                if (innerAudioContext) {
                  innerAudioContext.destroy();
                }
              } catch (e2) {
                formatAppLog("error", "at pages/entry/detail.vue:290", "清理音频上下文失败:", e2);
              }
              innerAudioContext = null;
            }
          }, 100);
        } catch (error2) {
          formatAppLog("error", "at pages/entry/detail.vue:296", "设置音频源失败:", error2);
          isPlaying.value = false;
          uni.showToast({
            title: "播放失败，请稍后重试",
            icon: "none",
            duration: 2e3
          });
          try {
            if (innerAudioContext) {
              innerAudioContext.destroy();
            }
          } catch (e2) {
            formatAppLog("error", "at pages/entry/detail.vue:309", "清理音频上下文失败:", e2);
          }
          innerAudioContext = null;
        }
      };
      const destroyAudio = () => {
        if (innerAudioContext) {
          try {
            innerAudioContext.stop();
            innerAudioContext.destroy();
          } catch (e2) {
            formatAppLog("error", "at pages/entry/detail.vue:322", "销毁音频上下文失败:", e2);
          }
          innerAudioContext = null;
        }
        isPlaying.value = false;
      };
      const goBack = () => {
        destroyAudio();
        uni.navigateBack();
      };
      const handleDelete = async () => {
        if (!itemData.value) {
          return;
        }
        uni.showModal({
          title: "确认删除",
          content: `确定要删除"${itemData.value.name}"吗？删除后无法恢复。`,
          confirmText: "删除",
          cancelText: "取消",
          confirmColor: "#ff3b30",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "删除中..."
                });
                const { data } = await deleteAudioLibraryAPI(itemData.value.id);
                uni.hideLoading();
                if (data.code === 0) {
                  uni.showToast({
                    title: "删除成功",
                    icon: "success",
                    duration: 1500
                  });
                  uni.$emit("audioLibraryUpdated");
                  setTimeout(() => {
                    goBack();
                  }, 1500);
                } else {
                  uni.showToast({
                    title: data.msg || "删除失败",
                    icon: "none",
                    duration: 2e3
                  });
                }
              } catch (error2) {
                uni.hideLoading();
                formatAppLog("error", "at pages/entry/detail.vue:382", "删除失败:", error2);
                uni.showToast({
                  title: "删除失败，请重试",
                  icon: "none",
                  duration: 2e3
                });
              }
            }
          }
        });
      };
      vue.onUnmounted(() => {
        destroyAudio();
      });
      const __returned__ = { loading, itemData, isPlaying, get innerAudioContext() {
        return innerAudioContext;
      }, set innerAudioContext(v) {
        innerAudioContext = v;
      }, ensureAudioContext, isValidUrl, togglePlay, destroyAudio, goBack, handleDelete, ref: vue.ref, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get deleteAudioLibraryAPI() {
        return deleteAudioLibraryAPI;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "detail-page" }, [
      vue.createElementVNode("scroll-view", {
        class: "scroll-content",
        "scroll-y": "true",
        enhanced: true,
        "show-scrollbar": false
      }, [
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-container"
        }, [
          vue.createElementVNode("view", { class: "pulse" }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : $setup.itemData ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "detail-content"
        }, [
          vue.createElementVNode("view", { class: "header-image-section" }, [
            vue.createElementVNode("view", { class: "image-wrapper" }, [
              $setup.itemData.image ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                src: $setup.itemData.image,
                class: "detail-image",
                mode: "aspectFill"
              }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "detail-image placeholder"
              }, [
                vue.createElementVNode("text", { class: "placeholder-emoji" }, "💨")
              ]))
            ]),
            $setup.itemData.url ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "play-button-wrapper"
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["play-button", { playing: $setup.isPlaying }]),
                  onClick: _cache[0] || (_cache[0] = ($event) => !$setup.isPlaying && $setup.togglePlay())
                },
                [
                  !$setup.isPlaying ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    class: "play-icon",
                    src: _imports_0$1,
                    mode: "aspectFit"
                  })) : (vue.openBlock(), vue.createElementBlock("image", {
                    key: 1,
                    class: "play-icon",
                    src: _imports_1$4,
                    mode: "aspectFit"
                  }))
                ],
                2
                /* CLASS */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "info-card" }, [
            $setup.itemData.class_name ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "class-section"
            }, [
              vue.createElementVNode("view", { class: "class-header" }, [
                vue.createElementVNode("view", { class: "class-badge-large" }, [
                  vue.createElementVNode("text", { class: "class-icon" }, "📚"),
                  vue.createElementVNode(
                    "text",
                    { class: "class-name" },
                    vue.toDisplayString($setup.itemData.class_name),
                    1
                    /* TEXT */
                  )
                ]),
                $setup.itemData.class_name === "自己放的屁" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "delete-btn",
                  onClick: $setup.handleDelete
                }, [
                  vue.createElementVNode("text", { class: "delete-icon" }, "🗑️"),
                  vue.createElementVNode("text", { class: "delete-text" }, "删除")
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "title-section" }, [
              vue.createElementVNode(
                "text",
                { class: "detail-title" },
                vue.toDisplayString($setup.itemData.name),
                1
                /* TEXT */
              ),
              $setup.itemData.badge ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "detail-badge"
                },
                vue.toDisplayString($setup.itemData.badge),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            $setup.itemData.description ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "desc-section"
            }, [
              vue.createElementVNode(
                "text",
                { class: "desc-content" },
                vue.toDisplayString($setup.itemData.description),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $setup.itemData.tags && $setup.itemData.tags.length ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "tags-section"
            }, [
              vue.createElementVNode("view", { class: "tags-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.itemData.tags, (tag) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "tag-item",
                      key: tag
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "tag-text" },
                        vue.toDisplayString(tag),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "footer-spacer" })
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "error-container"
        }, [
          vue.createElementVNode("text", { class: "error-emoji" }, "😅"),
          vue.createElementVNode("text", { class: "error-text" }, "数据加载失败"),
          vue.createElementVNode("button", {
            class: "retry-btn",
            onClick: $setup.goBack
          }, "返回列表")
        ]))
      ])
    ]);
  }
  const PagesEntryDetail = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-70e86f9f"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/entry/detail.vue"]]);
  const props = defineMixin({
    props: {
      // tab的数据
      list: {
        type: Array,
        default: () => props$a.subsection.list
      },
      // 当前活动的tab的index
      current: {
        type: [String, Number],
        default: () => props$a.subsection.current
      },
      // 激活的颜色
      activeColor: {
        type: String,
        default: () => props$a.subsection.activeColor
      },
      // 未激活的颜色
      inactiveColor: {
        type: String,
        default: () => props$a.subsection.inactiveColor
      },
      // 模式选择，mode=button为按钮形式，mode=subsection时为分段模式
      mode: {
        type: String,
        default: () => props$a.subsection.mode
      },
      // 字体大小
      fontSize: {
        type: [String, Number],
        default: () => props$a.subsection.fontSize
      },
      // 激活tab的字体是否加粗
      bold: {
        type: Boolean,
        default: () => props$a.subsection.bold
      },
      // mode = button时，组件背景颜色
      bgColor: {
        type: String,
        default: () => props$a.subsection.bgColor
      },
      // 从list元素对象中读取的键名
      keyName: {
        type: String,
        default: () => props$a.subsection.keyName
      },
      // 从`list`元素对象中读取激活时的颜色  如果存在字段 优先级大于 activeColor
      activeColorKeyName: {
        type: String,
        default: () => props$a.subsection.activeColorKeyName
      },
      // 从`list`元素对象中读取未激活时的颜色 如果存在字段 优先级大于 inactiveColor
      inactiveColorKeyName: {
        type: String,
        default: () => props$a.subsection.inactiveColorKeyName
      },
      // 是否禁用
      disabled: {
        type: Boolean,
        default: () => props$a.subsection.disabled
      }
    }
  });
  const _sfc_main$a = {
    name: "u-subsection",
    mixins: [mpMixin, mixin, props],
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
          style.fontSize = addUnit(this.fontSize);
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
      addStyle,
      init() {
        this.innerCurrent = this.current;
        sleep$1().then(() => this.getRect());
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
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-subsection", [`u-subsection--${_ctx.mode}`]]),
        ref: "u-subsection",
        style: vue.normalizeStyle([$options.addStyle(_ctx.customStyle), $options.wrapperStyle])
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["u-subsection__bar cursor-pointer", [
              _ctx.mode === "button" && "u-subsection--button__bar",
              $data.innerCurrent === 0 && _ctx.mode === "subsection" && "u-subsection__bar--first",
              $data.innerCurrent > 0 && $data.innerCurrent < _ctx.list.length - 1 && _ctx.mode === "subsection" && "u-subsection__bar--center",
              $data.innerCurrent === _ctx.list.length - 1 && _ctx.mode === "subsection" && "u-subsection__bar--last"
            ]]),
            ref: "u-subsection__bar",
            style: vue.normalizeStyle([$options.barStyle])
          },
          null,
          6
          /* CLASS, STYLE */
        ),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList(_ctx.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass(["u-subsection__item cursor-pointer", [
                `u-subsection__item--${index}`,
                index < _ctx.list.length - 1 && "u-subsection__item--no-border-right",
                index === 0 && "u-subsection__item--first",
                index === _ctx.list.length - 1 && "u-subsection__item--last",
                $options.getTextViewDisableClass(index)
              ]]),
              ref_for: true,
              ref: `u-subsection__item--${index}`,
              style: vue.normalizeStyle([$options.itemStyle(index)]),
              onClick: ($event) => $options.clickHandler(index),
              key: index
            }, [
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["u-subsection__item__text", [_ctx.disabled ? "u-subsection--disabled" : ""]]),
                  style: vue.normalizeStyle([$options.textStyle(index, item)])
                },
                vue.toDisplayString($options.getText(item)),
                7
                /* TEXT, CLASS, STYLE */
              )
            ], 14, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-b5ccb67e"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/uview-plus/components/u-subsection/u-subsection.vue"]]);
  function getDeviceInfo() {
    if (uni.getDeviceInfo || uni.canIUse("getDeviceInfo")) {
      return uni.getDeviceInfo();
    } else {
      return uni.getSystemInfoSync();
    }
  }
  function getWindowInfo() {
    if (uni.getWindowInfo || uni.canIUse("getWindowInfo")) {
      return uni.getWindowInfo();
    } else {
      return uni.getSystemInfoSync();
    }
  }
  function canIUseCanvas2d() {
    return false;
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
      const dom = uni.createSelectorQuery().in(context).select(selector);
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
  const cacheChart = {};
  const fontSizeReg = /([\d\.]+)px/;
  class EventEmit {
    constructor() {
      this.__events = {};
    }
    on(type, listener) {
      if (!type || !listener) {
        return;
      }
      const events = this.__events[type] || [];
      events.push(listener);
      this.__events[type] = events;
    }
    emit(type, e2) {
      if (type.constructor === Object) {
        e2 = type;
        type = e2 && e2.type;
      }
      if (!type) {
        return;
      }
      const events = this.__events[type];
      if (!events || !events.length) {
        return;
      }
      events.forEach((listener) => {
        listener.call(this, e2);
      });
    }
    off(type, listener) {
      const __events = this.__events;
      const events = __events[type];
      if (!events || !events.length) {
        return;
      }
      if (!listener) {
        delete __events[type];
        return;
      }
      for (let i = 0, len = events.length; i < len; i++) {
        if (events[i] === listener) {
          events.splice(i, 1);
          i--;
        }
      }
    }
  }
  class Image {
    constructor() {
      this.currentSrc = null;
      this.naturalHeight = 0;
      this.naturalWidth = 0;
      this.width = 0;
      this.height = 0;
      this.tagName = "IMG";
    }
    set src(src) {
      this.currentSrc = src;
      uni.getImageInfo({
        src,
        success: (res) => {
          this.naturalWidth = this.width = res.width;
          this.naturalHeight = this.height = res.height;
          this.onload();
        },
        fail: () => {
          this.onerror();
        }
      });
    }
    get src() {
      return this.currentSrc;
    }
  }
  class OffscreenCanvas {
    constructor(ctx, com, canvasId) {
      this.tagName = "canvas";
      this.com = com;
      this.canvasId = canvasId;
      this.ctx = ctx;
    }
    set width(w) {
      this.com.offscreenWidth = w;
    }
    set height(h) {
      this.com.offscreenHeight = h;
    }
    get width() {
      return this.com.offscreenWidth || 0;
    }
    get height() {
      return this.com.offscreenHeight || 0;
    }
    getContext(type) {
      return this.ctx;
    }
    getImageData() {
      return new Promise((resolve, reject) => {
        this.com.$nextTick(() => {
          uni.canvasGetImageData({
            x: 0,
            y: 0,
            width: this.com.offscreenWidth,
            height: this.com.offscreenHeight,
            canvasId: this.canvasId,
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          }, this.com);
        });
      });
    }
  }
  class Canvas {
    constructor(ctx, com, isNew, canvasNode = {}) {
      cacheChart[com.canvasId] = { ctx };
      this.canvasId = com.canvasId;
      this.chart = null;
      this.isNew = isNew;
      this.tagName = "canvas";
      this.canvasNode = canvasNode;
      this.com = com;
      if (!isNew) {
        this._initStyle(ctx);
      }
      this._initEvent();
      this._ee = new EventEmit();
    }
    getContext(type) {
      if (type === "2d") {
        return this.ctx;
      }
    }
    setAttribute(key, value) {
      if (key === "aria-label") {
        this.com["ariaLabel"] = value;
      }
    }
    setChart(chart) {
      this.chart = chart;
    }
    createOffscreenCanvas(param) {
      if (!this.children) {
        this.com.isOffscreenCanvas = true;
        this.com.offscreenWidth = param.width || 300;
        this.com.offscreenHeight = param.height || 300;
        const com = this.com;
        const canvasId = this.com.offscreenCanvasId;
        const context = uni.createCanvasContext(canvasId, this.com);
        this._initStyle(context);
        this.children = new OffscreenCanvas(context, com, canvasId);
      }
      return this.children;
    }
    appendChild(child) {
      formatAppLog("log", "at uni_modules/lime-echart/components/l-echart/canvas.js:162", "child", child);
    }
    dispatchEvent(type, e2) {
      if (typeof type == "object") {
        this._ee.emit(type.type, type);
      } else {
        this._ee.emit(type, e2);
      }
      return true;
    }
    attachEvent() {
    }
    detachEvent() {
    }
    addEventListener(type, listener) {
      this._ee.on(type, listener);
    }
    removeEventListener(type, listener) {
      this._ee.off(type, listener);
    }
    _initCanvas(zrender, ctx) {
    }
    _initStyle(ctx, child) {
      const styles = [
        "fillStyle",
        "strokeStyle",
        "fontSize",
        "globalAlpha",
        "opacity",
        "textAlign",
        "textBaseline",
        "shadow",
        "lineWidth",
        "lineCap",
        "lineJoin",
        "lineDash",
        "miterLimit",
        "font"
      ];
      styles.forEach((style) => {
        Object.defineProperty(ctx, style, {
          set: (value) => {
            if (style === "font" && fontSizeReg.test(value)) {
              const match = fontSizeReg.exec(value);
              ctx.setFontSize(match[1]);
              return;
            }
            if (style === "opacity") {
              ctx.setGlobalAlpha(value);
              return;
            }
            if (style !== "fillStyle" && style !== "strokeStyle" || value !== "none" && value !== null) {
              if (typeof value == "object") {
                if (value.hasOwnProperty("colorStop") || value.hasOwnProperty("colors")) {
                  ctx["set" + style.charAt(0).toUpperCase() + style.slice(1)](value);
                }
                return;
              }
              ctx["set" + style.charAt(0).toUpperCase() + style.slice(1)](value);
            }
          }
        });
      });
      if (!this.isNew && !child) {
        ctx.uniDrawImage = ctx.drawImage;
        ctx.drawImage = (...a) => {
          a[0] = a[0].src;
          ctx.uniDrawImage(...a);
        };
      }
      if (!ctx.createRadialGradient) {
        ctx.createRadialGradient = function() {
          return ctx.createCircularGradient(...[...arguments].slice(-3));
        };
      }
      if (!ctx.strokeText) {
        ctx.strokeText = (...a) => {
          ctx.fillText(...a);
        };
      }
      if (!ctx.measureText || getDeviceInfo().osName == "harmonyos") {
        ctx._measureText = ctx.measureText;
        const strLen = (str) => {
          let len = 0;
          for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
              len++;
            } else {
              len += 2;
            }
          }
          return len;
        };
        ctx.measureText = (text, font) => {
          var _a;
          let fontSize = ((_a = ctx == null ? void 0 : ctx.state) == null ? void 0 : _a.fontSize) || 12;
          if (font) {
            fontSize = parseInt(font.match(/([\d\.]+)px/)[1]);
          }
          fontSize /= 2;
          let isBold = fontSize >= 16;
          const widthFactor = isBold ? 1.3 : 1;
          return {
            width: strLen(text) * fontSize * widthFactor
          };
        };
      }
    }
    _initEvent(e2) {
      this.event = {};
      const eventNames = [{
        wxName: "touchStart",
        ecName: "mousedown"
      }, {
        wxName: "touchMove",
        ecName: "mousemove"
      }, {
        wxName: "touchEnd",
        ecName: "mouseup"
      }, {
        wxName: "touchEnd",
        ecName: "click"
      }];
      eventNames.forEach((name) => {
        this.event[name.wxName] = (e3) => {
          const touch = e3.touches[0];
          this.chart.getZr().handler.dispatch(name.ecName, {
            zrX: name.wxName === "tap" ? touch.clientX : touch.x,
            zrY: name.wxName === "tap" ? touch.clientY : touch.y
          });
        };
      });
    }
    set width(w) {
      this.canvasNode.width = w;
    }
    set height(h) {
      this.canvasNode.height = h;
    }
    get width() {
      return this.canvasNode.width || 0;
    }
    get height() {
      return this.canvasNode.height || 0;
    }
    get ctx() {
      return cacheChart[this.canvasId]["ctx"] || null;
    }
    set chart(chart) {
      cacheChart[this.canvasId]["chart"] = chart;
    }
    get chart() {
      return cacheChart[this.canvasId]["chart"] || null;
    }
  }
  function dispatch(name, { x, y, wheelDelta }) {
    this.dispatch(name, {
      zrX: x,
      zrY: y,
      zrDelta: wheelDelta,
      preventDefault: () => {
      },
      stopPropagation: () => {
      }
    });
  }
  function setCanvasCreator(echarts, { canvas, node }) {
    if (echarts && !echarts.registerPreprocessor) {
      return formatAppLog("warn", "at uni_modules/lime-echart/components/l-echart/canvas.js:356", "echarts 版本不对或未传入echarts，vue3请使用esm格式");
    }
    echarts.registerPreprocessor((option) => {
      if (option && option.series) {
        if (option.series.length > 0) {
          option.series.forEach((series) => {
            series.progressive = 0;
          });
        } else if (typeof option.series === "object") {
          option.series.progressive = 0;
        }
      }
    });
    function loadImage(src, onload, onerror) {
      let img = null;
      if (node && node.createImage) {
        img = node.createImage();
        img.onload = onload.bind(img);
        img.onerror = onerror.bind(img);
        img.src = src;
        return img;
      } else {
        img = new Image();
        img.onload = onload.bind(img);
        img.onerror = onerror.bind(img);
        img.src = src;
        return img;
      }
    }
    if (echarts.setPlatformAPI) {
      echarts.setPlatformAPI({
        loadImage: canvas.setChart ? loadImage : null,
        createCanvas() {
          const key = "createOffscreenCanvas";
          return uni.canIUse(key) && uni[key] ? uni[key]({ type: "2d" }) : canvas;
        }
      });
    } else if (echarts.setCanvasCreator) {
      echarts.setCanvasCreator(() => {
        return canvas;
      });
    }
  }
  const _sfc_main$9 = {
    name: "lime-echart",
    props: {
      customStyle: String,
      isDisableScroll: Boolean,
      isClickable: {
        type: Boolean,
        default: true
      },
      enableHover: Boolean,
      beforeDelay: {
        type: Number,
        default: 30
      },
      landscape: Boolean
    },
    data() {
      return {
        use2dCanvas: false,
        ariaLabel: "图表",
        width: null,
        height: null,
        nodeWidth: null,
        nodeHeight: null,
        // canvasNode: null,
        config: {},
        inited: false,
        finished: false,
        file: "",
        platform: "",
        isPC: false,
        isDown: false,
        isOffscreenCanvas: false,
        offscreenWidth: 0,
        offscreenHeight: 0
      };
    },
    computed: {
      rootStyle() {
        if (this.landscape) {
          return `transform: translate(-50%,-50%) rotate(90deg); top:50%; left:50%;`;
        }
      },
      canvasId() {
        return `lime-echart${this._ && this._.uid || this._uid}`;
      },
      offscreenCanvasId() {
        return `${this.canvasId}_offscreen`;
      },
      offscreenStyle() {
        return `width:${this.offscreenWidth}px;height: ${this.offscreenHeight}px; position: fixed; left: 99999px; background: red`;
      },
      canvasStyle() {
        return this.rootStyle + (this.width && this.height ? "width:" + this.width + "px;height:" + this.height + "px" : "");
      }
    },
    beforeUnmount() {
      this.clear();
      this.dispose();
    },
    created() {
      this.use2dCanvas = this.type === "2d" && canIUseCanvas2d();
    },
    mounted() {
      this.$nextTick(() => {
        this.$emit("finished");
      });
    },
    methods: {
      setChart(callback) {
        if (!this.chart) {
          formatAppLog("warn", "at uni_modules/lime-echart/components/l-echart/l-echart.vue:214", `组件还未初始化，请先使用 init`);
          return;
        }
        if (typeof callback === "function" && this.chart) {
          callback(this.chart);
        }
      },
      setOption() {
        if (!this.chart || !this.chart.setOption) {
          formatAppLog("warn", "at uni_modules/lime-echart/components/l-echart/l-echart.vue:228", `组件还未初始化，请先使用 init`);
          return;
        }
        this.chart.setOption(...arguments);
      },
      showLoading() {
        if (this.chart) {
          this.chart.showLoading(...arguments);
        }
      },
      hideLoading() {
        if (this.chart) {
          this.chart.hideLoading();
        }
      },
      clear() {
        if (this.chart && !this.chart.isDisposed()) {
          this.chart.clear();
        }
      },
      dispose() {
        if (this.chart && !this.chart.isDisposed()) {
          this.chart.dispose();
        }
      },
      resize(size) {
        if (size && size.width && size.height) {
          this.height = size.height;
          this.width = size.width;
          if (this.chart) {
            this.chart.resize(size);
          }
        } else {
          this.$nextTick(() => {
            getRect(".lime-echart", this).then((res) => {
              if (res) {
                let { width, height } = res;
                this.width = width = width || 300;
                this.height = height = height || 300;
                this.chart.resize({ width, height });
              }
            });
          });
        }
      },
      canvasToTempFilePath(args = {}) {
        const { use2dCanvas, canvasId } = this;
        return new Promise((resolve, reject) => {
          const copyArgs = Object.assign({
            canvasId,
            success: resolve,
            fail: reject
          }, args);
          if (use2dCanvas) {
            delete copyArgs.canvasId;
            copyArgs.canvas = this.canvasNode;
          }
          uni.canvasToTempFilePath(copyArgs, this);
        });
      },
      async init(echarts, ...args) {
        if (args && args.length == 0 && !echarts) {
          formatAppLog("error", "at uni_modules/lime-echart/components/l-echart/l-echart.vue:306", "缺少参数：init(echarts, theme?:string, opts?: object, callback?: function)");
          return;
        }
        let theme = null, opts = {}, callback;
        args.forEach((item) => {
          if (typeof item === "function") {
            callback = item;
          }
          if (["string"].includes(typeof item)) {
            theme = item;
          }
          if (typeof item === "object") {
            opts = item;
          }
        });
        if (this.beforeDelay) {
          await sleep(this.beforeDelay);
        }
        let config2 = await this.getContext();
        setCanvasCreator(echarts, config2);
        try {
          this.chart = echarts.init(config2.canvas, theme, Object.assign({}, config2, opts || {}));
          callback == null ? void 0 : callback(this.chart);
          return this.chart;
        } catch (e2) {
          formatAppLog("error", "at uni_modules/lime-echart/components/l-echart/l-echart.vue:335", "【lime-echarts】:", e2);
          return null;
        }
      },
      getContext() {
        return getRect(`#${this.canvasId}`, this, this.use2dCanvas).then((res) => {
          if (res) {
            let dpr = devicePixelRatio;
            let { width, height, node } = res;
            let canvas;
            this.width = width = width || 300;
            this.height = height = height || 300;
            if (node) {
              const ctx = node.getContext("2d");
              canvas = new Canvas(ctx, this, true, node);
              this.canvasNode = node;
            } else {
              dpr = this.isPC ? devicePixelRatio : 1;
              this.rect = res;
              this.nodeWidth = width * dpr;
              this.nodeHeight = height * dpr;
              const ctx = uni.createCanvasContext(this.canvasId, this);
              canvas = new Canvas(ctx, this, false);
            }
            return { canvas, width, height, devicePixelRatio: dpr, node };
          } else {
            return {};
          }
        });
      },
      getRelative(e2, touches) {
        let { clientX, clientY } = e2;
        if (!(clientX && clientY) && touches && touches[0]) {
          clientX = touches[0].clientX;
          clientY = touches[0].clientY;
        }
        return { x: clientX - this.rect.left, y: clientY - this.rect.top, wheelDelta: e2.wheelDelta || 0 };
      },
      getTouch(e2, touches) {
        const { x } = touches && touches[0] || {};
        const touch = x ? touches[0] : this.getRelative(e2, touches);
        if (this.landscape) {
          [touch.x, touch.y] = [touch.y, this.height - touch.x];
        }
        return touch;
      },
      touchStart(e2) {
        this.isDown = true;
        const next = () => {
          const touches = convertTouchesToArray(e2.touches);
          if (this.chart) {
            const touch = this.getTouch(e2, touches);
            this.startX = touch.x;
            this.startY = touch.y;
            this.startT = /* @__PURE__ */ new Date();
            const handler = this.chart.getZr().handler;
            dispatch.call(handler, "mousedown", touch);
            dispatch.call(handler, "mousemove", touch);
            handler.processGesture(wrapTouch(e2), "start");
            clearTimeout(this.endTimer);
          }
        };
        if (this.isPC) {
          getRect(`#${this.canvasId}`, { context: this }).then((res) => {
            this.rect = res;
            next();
          });
          return;
        }
        next();
      },
      touchMove(e2) {
        if (this.isPC && this.enableHover && !this.isDown) {
          this.isDown = true;
        }
        const touches = convertTouchesToArray(e2.touches);
        if (this.chart && this.isDown) {
          const handler = this.chart.getZr().handler;
          dispatch.call(handler, "mousemove", this.getTouch(e2, touches));
          handler.processGesture(wrapTouch(e2), "change");
        }
      },
      touchEnd(e2) {
        this.isDown = false;
        if (this.chart) {
          const touches = convertTouchesToArray(e2.changedTouches);
          const { x } = touches && touches[0] || {};
          const touch = (x ? touches[0] : this.getRelative(e2, touches)) || {};
          if (this.landscape) {
            [touch.x, touch.y] = [touch.y, this.height - touch.x];
          }
          const handler = this.chart.getZr().handler;
          const isClick = Math.abs(touch.x - this.startX) < 10 && /* @__PURE__ */ new Date() - this.startT < 200;
          dispatch.call(handler, "mouseup", touch);
          handler.processGesture(wrapTouch(e2), "end");
          if (isClick) {
            dispatch.call(handler, "click", touch);
          } else {
            this.endTimer = setTimeout(() => {
              dispatch.call(handler, "mousemove", { x: 999999999, y: 999999999 });
              dispatch.call(handler, "mouseup", { x: 999999999, y: 999999999 });
            }, 50);
          }
        }
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return $options.canvasId ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "lime-echart",
      style: vue.normalizeStyle([$props.customStyle]),
      ref: "limeEchart",
      "aria-label": $data.ariaLabel
    }, [
      $data.use2dCanvas ? (vue.openBlock(), vue.createElementBlock("canvas", {
        key: 0,
        class: "lime-echart__canvas",
        type: "2d",
        id: $options.canvasId,
        style: vue.normalizeStyle($options.canvasStyle),
        "disable-scroll": $props.isDisableScroll,
        onTouchstart: _cache[0] || (_cache[0] = (...args) => $options.touchStart && $options.touchStart(...args)),
        onTouchmove: _cache[1] || (_cache[1] = (...args) => $options.touchMove && $options.touchMove(...args)),
        onTouchend: _cache[2] || (_cache[2] = (...args) => $options.touchEnd && $options.touchEnd(...args))
      }, null, 44, ["id", "disable-scroll"])) : (vue.openBlock(), vue.createElementBlock("canvas", {
        key: 1,
        class: "lime-echart__canvas",
        width: $data.nodeWidth,
        height: $data.nodeHeight,
        style: vue.normalizeStyle($options.canvasStyle),
        "canvas-id": $options.canvasId,
        id: $options.canvasId,
        "disable-scroll": $props.isDisableScroll,
        onTouchstart: _cache[3] || (_cache[3] = (...args) => $options.touchStart && $options.touchStart(...args)),
        onTouchmove: _cache[4] || (_cache[4] = (...args) => $options.touchMove && $options.touchMove(...args)),
        onTouchend: _cache[5] || (_cache[5] = (...args) => $options.touchEnd && $options.touchEnd(...args))
      }, null, 44, ["width", "height", "canvas-id", "id", "disable-scroll"])),
      $data.isPC ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 2,
          class: "lime-echart__mask",
          onMousedown: _cache[6] || (_cache[6] = (...args) => $options.touchStart && $options.touchStart(...args)),
          onMousemove: _cache[7] || (_cache[7] = (...args) => $options.touchMove && $options.touchMove(...args)),
          onMouseup: _cache[8] || (_cache[8] = (...args) => $options.touchEnd && $options.touchEnd(...args)),
          onTouchstart: _cache[9] || (_cache[9] = (...args) => $options.touchStart && $options.touchStart(...args)),
          onTouchmove: _cache[10] || (_cache[10] = (...args) => $options.touchMove && $options.touchMove(...args)),
          onTouchend: _cache[11] || (_cache[11] = (...args) => $options.touchEnd && $options.touchEnd(...args))
        },
        null,
        32
        /* NEED_HYDRATION */
      )) : vue.createCommentVNode("v-if", true),
      $data.isOffscreenCanvas ? (vue.openBlock(), vue.createElementBlock("canvas", {
        key: 3,
        style: vue.normalizeStyle($options.offscreenStyle),
        "canvas-id": $options.offscreenCanvasId
      }, null, 12, ["canvas-id"])) : vue.createCommentVNode("v-if", true)
    ], 12, ["aria-label"])) : vue.createCommentVNode("v-if", true);
  }
  const LEchart = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-e9a2d99c"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/uni_modules/lime-echart/components/l-echart/l-echart.vue"]]);
  const _imports_1$3 = "/static/img/jqr.png";
  const CACHE_DURATION = 5 * 60 * 1e3;
  const _sfc_main$8 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      const echarts = require("../../uni_modules/lime-echart/static/echarts.min");
      const selectedPeriod = vue.ref("今日");
      const periods = vue.ref(["今日", "本周", "本月"]);
      const currentPeriodIndex = vue.ref(0);
      const timeLabels = vue.ref(["凌晨", "上午", "下午", "晚上"]);
      const trendData = vue.ref(null);
      const summaryData = vue.ref(null);
      const dataCache = vue.ref({
        day: { trendData: null, summaryData: null, timestamp: 0 },
        week: { trendData: null, summaryData: null, timestamp: 0 },
        month: { trendData: null, summaryData: null, timestamp: 0 }
      });
      const dayChartRef = vue.ref(null);
      const weekChartRef = vue.ref(null);
      const monthChartRef = vue.ref(null);
      const chartInstances = {
        day: null,
        week: null,
        month: null
      };
      const isInitializing = {
        day: false,
        week: false,
        month: false
      };
      const isInitialized = {
        day: false,
        week: false,
        month: false
      };
      const chartLoading = vue.ref({
        day: true,
        week: false,
        month: false
      });
      const getChartData = (periodType) => {
        const cache = dataCache.value[periodType];
        if (!cache || !cache.trendData) {
          if (periodType === "day")
            return { labels: ["凌晨", "上午", "下午", "晚上"], data: [0, 0, 0, 0] };
          if (periodType === "week")
            return { labels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"], data: [0, 0, 0, 0, 0, 0, 0] };
          if (periodType === "month")
            return { labels: ["月初", "月中", "月底"], data: [0, 0, 0] };
          return { labels: [], data: [] };
        }
        const trendData2 = cache.trendData;
        if (periodType === "day") {
          const tp = trendData2.timePeriodData || {};
          return {
            labels: ["凌晨", "上午", "下午", "晚上"],
            data: [tp.dawn || 0, tp.morning || 0, tp.afternoon || 0, tp.evening || 0]
          };
        } else if (periodType === "week") {
          return {
            labels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            data: trendData2.weekData || [0, 0, 0, 0, 0, 0, 0]
          };
        } else if (periodType === "month") {
          return {
            labels: ["月初", "月中", "月底"],
            data: trendData2.monthData || [0, 0, 0]
          };
        }
        return { labels: [], data: [] };
      };
      const chartLabels = vue.computed(() => {
        const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
        const periodType = typeMap[selectedPeriod.value];
        return getChartData(periodType).labels;
      });
      const chartData = vue.computed(() => {
        const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
        const periodType = typeMap[selectedPeriod.value];
        return getChartData(periodType).data;
      });
      const getChartHeight = () => {
        const systemInfo = uni.getSystemInfoSync();
        const screenHeight = systemInfo.windowHeight;
        systemInfo.windowWidth;
        if (screenHeight < 600) {
          return "300rpx";
        } else if (screenHeight < 700) {
          return "350rpx";
        } else if (screenHeight < 800) {
          return "400rpx";
        } else {
          return "450rpx";
        }
      };
      const chartStyle = vue.ref(`width: 100%; height: ${getChartHeight()};`);
      const typeNames = {
        loud: "响亮型",
        soft: "轻柔型",
        silent: "无声型"
      };
      const smellLevels = {
        1: "清香",
        2: "一般",
        3: "浓烈"
      };
      const moodNames = {
        happy: "开心",
        normal: "放松",
        sad: "尴尬"
      };
      const moodEmojis = {
        happy: "🤣",
        normal: "😐",
        sad: "😢"
      };
      const totalCount = vue.computed(() => {
        var _a;
        return ((_a = summaryData.value) == null ? void 0 : _a.totalCount) || 0;
      });
      const mostCommonType = vue.computed(() => {
        var _a, _b;
        return ((_b = (_a = summaryData.value) == null ? void 0 : _a.mostCommonType) == null ? void 0 : _b.typeName) || "响亮型";
      });
      const averageSmell = vue.computed(() => {
        var _a, _b;
        return ((_b = (_a = summaryData.value) == null ? void 0 : _a.averageSmell) == null ? void 0 : _b.levelName) || "一般";
      });
      const mostCommonMood = vue.computed(() => {
        var _a;
        const mood = (_a = summaryData.value) == null ? void 0 : _a.mostCommonMood;
        if (!mood)
          return { name: "开心", emoji: "🤣" };
        return {
          name: mood.moodName,
          emoji: mood.moodEmoji
        };
      });
      const statsCards = vue.computed(() => {
        return [
          {
            label: `${selectedPeriod.value}放屁次数`,
            value: `${totalCount.value} 💨`,
            icon: "☁️"
          },
          {
            label: "最多类型",
            value: `${mostCommonType.value} 💥`,
            icon: "🔊"
          },
          {
            label: "平均气味等级",
            value: `${averageSmell.value} 😷`,
            icon: "😖"
          },
          {
            label: "心情指数",
            value: `${mostCommonMood.value.name} ${mostCommonMood.value.emoji}`,
            icon: "😊"
          }
        ];
      });
      const fartTypes = vue.computed(() => {
        var _a;
        const dist = (_a = summaryData.value) == null ? void 0 : _a.typeDistribution;
        if (!dist) {
          return [
            { name: "响亮型", percent: 0, colorClass: "peach-segment" },
            { name: "轻柔型", percent: 0, colorClass: "blue-segment" },
            { name: "无声型", percent: 0, colorClass: "mint-segment" }
          ];
        }
        const total = dist.loud + dist.soft + dist.silent;
        if (total === 0) {
          return [
            { name: "响亮型", percent: 0, colorClass: "peach-segment" },
            { name: "轻柔型", percent: 0, colorClass: "blue-segment" },
            { name: "无声型", percent: 0, colorClass: "mint-segment" }
          ];
        }
        return [
          {
            name: "响亮型",
            percent: Math.round(dist.loud / total * 100),
            colorClass: "peach-segment"
          },
          {
            name: "轻柔型",
            percent: Math.round(dist.soft / total * 100),
            colorClass: "blue-segment"
          },
          {
            name: "无声型",
            percent: Math.round(dist.silent / total * 100),
            colorClass: "mint-segment"
          }
        ];
      });
      const moodEmojiPositions = vue.computed(() => [
        { icon: "😊", top: "20rpx", left: "40rpx", size: "48rpx" },
        { icon: "🤣", top: "60rpx", right: "60rpx", left: "auto", size: "60rpx" },
        { icon: "🌸", top: "200rpx", left: "25%", size: "48rpx" },
        { icon: "😷", top: "160rpx", right: "33%", left: "auto", size: "60rpx" },
        { icon: "💀", top: "50%", left: "50%", size: "80rpx", transform: "translate(-50%, -50%)" },
        { icon: "😖", top: "240rpx", left: "50rpx", size: "48rpx" }
      ]);
      const ensureDataContinuity = (data) => {
        if (!data || data.length === 0)
          return [0];
        return data.map((val) => val === null || val === void 0 || isNaN(val) ? 0 : Number(val));
      };
      const getChartOption = (periodType) => {
        const { labels, data } = getChartData(periodType);
        const safeData = ensureDataContinuity(data);
        const safeLabels = labels.length > 0 ? labels : ["数据"];
        return {
          grid: {
            left: "10%",
            right: "10%",
            bottom: "15%",
            top: "10%",
            containLabel: true
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: safeLabels,
            axisLine: {
              lineStyle: {
                color: "rgba(138, 245, 191, 0.3)"
              }
            },
            axisLabel: {
              color: "rgba(138, 245, 191, 0.8)",
              fontSize: 11,
              fontWeight: "bold"
            },
            axisTick: {
              show: false
            }
          },
          yAxis: {
            type: "value",
            min: 0,
            // 确保最小值从0开始，避免区域线折断
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              color: "rgba(138, 245, 191, 0.6)",
              fontSize: 11
            },
            splitLine: {
              lineStyle: {
                color: "rgba(138, 245, 191, 0.1)",
                type: "dashed"
              }
            }
          },
          series: [{
            data: safeData,
            type: "line",
            smooth: true,
            smoothMonotone: "x",
            symbol: "circle",
            // 显示数据点，便于调试
            symbolSize: 6,
            connectNulls: true,
            // 连接空值，避免折断
            itemStyle: {
              color: "#8af5bf",
              borderColor: "#fff",
              borderWidth: 2
            },
            lineStyle: {
              color: "#8af5bf",
              width: 2,
              shadowColor: "rgba(138, 245, 191, 0.3)",
              shadowBlur: 8,
              shadowOffsetY: 3
            },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(138, 245, 191, 0.3)" },
                  { offset: 1, color: "rgba(138, 245, 191, 0.05)" }
                ]
              }
            },
            emphasis: {
              focus: "series",
              itemStyle: {
                color: "#5BCFA0",
                borderColor: "#fff",
                borderWidth: 3,
                shadowBlur: 10,
                shadowColor: "rgba(138, 245, 191, 0.8)"
              }
            }
          }]
        };
      };
      const chartOption = vue.computed(() => {
        const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
        const periodType = typeMap[selectedPeriod.value];
        return getChartOption(periodType);
      });
      const updateChart = async (periodType) => {
        if (isInitializing[periodType]) {
          return;
        }
        const instance = chartInstances[periodType];
        if (!instance) {
          await initChart(periodType);
          return;
        }
        try {
          await vue.nextTick();
          const option = getChartOption(periodType);
          instance.setOption(option, {
            notMerge: false,
            // 合并配置，保留动画等状态
            lazyUpdate: false
            // 立即更新
          });
          setTimeout(() => {
            if (chartInstances[periodType]) {
              chartInstances[periodType].resize();
            }
          }, 150);
        } catch (error2) {
          formatAppLog("error", "at pages/data/index.vue:530", `更新${periodType}图表失败：`, error2);
          chartInstances[periodType] = null;
          isInitialized[periodType] = false;
          await initChart(periodType);
        }
      };
      const initChart = async (periodType) => {
        if (isInitialized[periodType] && chartInstances[periodType]) {
          await updateChart(periodType);
          return;
        }
        if (isInitializing[periodType]) {
          return;
        }
        isInitializing[periodType] = true;
        await vue.nextTick();
        const { data } = getChartData(periodType);
        if (!data || data.length === 0) {
          formatAppLog("warn", "at pages/data/index.vue:562", `${periodType}图表数据未准备好，延迟初始化`);
          isInitializing[periodType] = false;
          setTimeout(() => {
            if (!isInitialized[periodType]) {
              chartLoading.value[periodType] = false;
            }
          }, 3e3);
          setTimeout(() => initChart(periodType), 300);
          return;
        }
        setTimeout(async () => {
          const chartRef = periodType === "day" ? dayChartRef.value : periodType === "week" ? weekChartRef.value : monthChartRef.value;
          if (!chartRef) {
            formatAppLog("warn", "at pages/data/index.vue:581", `${periodType}图表 ref 未找到`);
            isInitializing[periodType] = false;
            chartLoading.value[periodType] = false;
            return;
          }
          try {
            const myChart = await chartRef.init(echarts, (chart) => {
              formatAppLog("log", "at pages/data/index.vue:590", `${periodType}图表实例创建成功`, chart);
            });
            if (myChart) {
              chartInstances[periodType] = myChart;
              isInitialized[periodType] = true;
              isInitializing[periodType] = false;
              const option = getChartOption(periodType);
              myChart.setOption(option, {
                notMerge: true
                // 首次初始化不合并
              });
              formatAppLog("log", "at pages/data/index.vue:606", `${periodType}图表初始化成功`);
              chartLoading.value[periodType] = false;
              setTimeout(() => {
                if (chartInstances[periodType]) {
                  chartInstances[periodType].resize();
                }
              }, 200);
              uni.onWindowResize(() => {
                if (chartInstances[periodType]) {
                  setTimeout(() => {
                    chartInstances[periodType].resize();
                  }, 100);
                }
              });
            } else {
              isInitializing[periodType] = false;
            }
          } catch (error2) {
            formatAppLog("error", "at pages/data/index.vue:630", `${periodType}图表初始化失败：`, error2);
            chartInstances[periodType] = null;
            isInitialized[periodType] = false;
            isInitializing[periodType] = false;
            chartLoading.value[periodType] = false;
          }
        }, 500);
      };
      const updateTimers = {
        day: null,
        week: null,
        month: null
      };
      vue.watch(selectedPeriod, async (newPeriod) => {
        const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
        const periodType = typeMap[newPeriod];
        const cache = dataCache.value[periodType];
        if (!cache || !cache.trendData) {
          return;
        }
        if (!isInitialized[periodType]) {
          chartLoading.value[periodType] = true;
          await initChart(periodType);
        } else {
          await updateChart(periodType);
        }
      });
      vue.watch(() => dataCache.value, () => {
        Object.keys(chartInstances).forEach((periodType) => {
          if (isInitialized[periodType] && chartInstances[periodType]) {
            if (updateTimers[periodType]) {
              clearTimeout(updateTimers[periodType]);
            }
            updateTimers[periodType] = setTimeout(() => {
              updateChart(periodType);
              updateTimers[periodType] = null;
            }, 100);
          }
        });
      }, { deep: true });
      vue.onMounted(() => {
        const userStore = useUserStore();
        if (userStore.token) {
          formatAppLog("log", "at pages/data/index.vue:694", "已有 token，直接加载数据");
          loadData();
        } else {
          formatAppLog("log", "at pages/data/index.vue:698", "暂无 token，等待登录完成...");
        }
        uni.$on("loginSuccess", onLoginSuccess);
        uni.$on("fartRecordAdded", () => {
          formatAppLog("log", "at pages/data/index.vue:706", "收到放屁记录添加事件，刷新数据");
          clearAllCache();
          loadData(true);
        });
      });
      const onLoginSuccess = () => {
        formatAppLog("log", "at pages/data/index.vue:714", "收到 loginSuccess 事件，开始加载数据");
        loadData();
      };
      vue.onUnmounted(() => {
        uni.$off("loginSuccess", onLoginSuccess);
        uni.$off("fartRecordAdded");
        Object.keys(updateTimers).forEach((periodType) => {
          if (updateTimers[periodType]) {
            clearTimeout(updateTimers[periodType]);
            updateTimers[periodType] = null;
          }
        });
        Object.keys(chartInstances).forEach((periodType) => {
          if (chartInstances[periodType]) {
            chartInstances[periodType].dispose && chartInstances[periodType].dispose();
            chartInstances[periodType] = null;
          }
          isInitialized[periodType] = false;
          isInitializing[periodType] = false;
        });
        chartLoading.value = {
          day: true,
          week: false,
          month: false
        };
      });
      const isCacheValid = (statType) => {
        const cache = dataCache.value[statType];
        if (!cache.trendData || !cache.summaryData)
          return false;
        return Date.now() - cache.timestamp < CACHE_DURATION;
      };
      const loadFromCache = (statType) => {
        const cache = dataCache.value[statType];
        trendData.value = cache.trendData;
        summaryData.value = cache.summaryData;
        formatAppLog("log", "at pages/data/index.vue:761", `从缓存加载${statType}数据`);
      };
      const saveToCache = (statType, trendDataValue, summaryDataValue) => {
        dataCache.value[statType] = {
          trendData: trendDataValue,
          summaryData: summaryDataValue,
          timestamp: Date.now()
        };
        formatAppLog("log", "at pages/data/index.vue:771", `保存${statType}数据到缓存`);
      };
      const clearAllCache = () => {
        dataCache.value = {
          day: { trendData: null, summaryData: null, timestamp: 0 },
          week: { trendData: null, summaryData: null, timestamp: 0 },
          month: { trendData: null, summaryData: null, timestamp: 0 }
        };
        formatAppLog("log", "at pages/data/index.vue:781", "清除所有数据缓存");
      };
      const loadData = async (forceRefresh = false) => {
        try {
          const typeMap = { "今日": "day", "本周": "week", "本月": "month" };
          const statType = typeMap[selectedPeriod.value];
          if (!forceRefresh && isCacheValid(statType)) {
            loadFromCache(statType);
            await vue.nextTick();
            if (!isInitialized[statType]) {
              chartLoading.value[statType] = true;
              await initChart(statType);
            } else {
              updateChart(statType);
            }
            return;
          }
          const [trendRes, summaryRes] = await Promise.all([
            getTrendDataAPI(statType),
            getStatisticsSummaryAPI(statType)
          ]);
          let newTrendData = null;
          let newSummaryData = null;
          if (trendRes.data.code === 0) {
            newTrendData = trendRes.data.data;
            trendData.value = newTrendData;
            formatAppLog("log", "at pages/data/index.vue:821", "趋势数据:", newTrendData);
          }
          if (summaryRes.data.code === 0) {
            newSummaryData = summaryRes.data.data;
            summaryData.value = newSummaryData;
            formatAppLog("log", "at pages/data/index.vue:827", "统计小结:", newSummaryData);
          }
          if (newTrendData && newSummaryData) {
            saveToCache(statType, newTrendData, newSummaryData);
          }
          uni.hideLoading();
          await vue.nextTick();
          if (!isInitialized[statType]) {
            chartLoading.value[statType] = true;
            await initChart(statType);
          } else {
            updateChart(statType);
          }
        } catch (error2) {
          formatAppLog("error", "at pages/data/index.vue:848", "加载数据失败:", error2);
          uni.hideLoading();
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      };
      const changePeriod = (period) => {
        if (selectedPeriod.value === period)
          return;
        selectedPeriod.value = period;
        loadData();
      };
      const onPeriodChange = (index) => {
        currentPeriodIndex.value = index;
        const period = periods.value[index];
        changePeriod(period);
      };
      __expose({
        clearAllCache,
        loadData: (forceRefresh = true) => loadData(forceRefresh)
      });
      const __returned__ = { echarts, selectedPeriod, periods, currentPeriodIndex, timeLabels, trendData, summaryData, dataCache, CACHE_DURATION, dayChartRef, weekChartRef, monthChartRef, chartInstances, isInitializing, isInitialized, chartLoading, getChartData, chartLabels, chartData, getChartHeight, chartStyle, typeNames, smellLevels, moodNames, moodEmojis, totalCount, mostCommonType, averageSmell, mostCommonMood, statsCards, fartTypes, moodEmojiPositions, ensureDataContinuity, getChartOption, chartOption, updateChart, initChart, updateTimers, onLoginSuccess, isCacheValid, loadFromCache, saveToCache, clearAllCache, loadData, changePeriod, onPeriodChange, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, nextTick: vue.nextTick, watch: vue.watch, LEchart, get getTrendDataAPI() {
        return getTrendDataAPI;
      }, get getStatisticsSummaryAPI() {
        return getStatisticsSummaryAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_subsection = resolveEasycom(vue.resolveDynamicComponent("u-subsection"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header-gradient fade-in" }, [
        vue.createElementVNode("view", { class: "header-content" }, [
          vue.createElementVNode("text", { class: "title" }, "实验室"),
          vue.createElementVNode("text", { class: "subtitle" }, "探索你的秘密")
        ])
      ]),
      vue.createElementVNode("view", {
        class: "period-selector",
        style: { "animation-delay": "0.1s" }
      }, [
        vue.createVNode(_component_u_subsection, {
          list: $setup.periods,
          current: $setup.currentPeriodIndex,
          mode: "button",
          activeColor: "#0d1b14",
          inactiveColor: "#8af5bf",
          bgColor: "rgba(138, 245, 191, 0.2)",
          onChange: $setup.onPeriodChange
        }, null, 8, ["list", "current"])
      ]),
      vue.createElementVNode("scroll-view", {
        class: "scroll-content",
        "scroll-y": "true",
        enhanced: true,
        "show-scrollbar": false
      }, [
        vue.createElementVNode("view", { class: "chart-card" }, [
          vue.createElementVNode("view", { class: "trend-data-display" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.chartData, (value, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: "data-point-item"
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "data-time" },
                    vue.toDisplayString($setup.chartLabels[index]),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "data-value" },
                    vue.toDisplayString(value) + "次",
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.withDirectives(vue.createElementVNode(
            "view",
            { class: "trend-chart-echart" },
            [
              $setup.chartLoading.day ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "chart-loading"
              }, [
                vue.createElementVNode("view", { class: "loading-spinner" }),
                vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
              ])) : vue.createCommentVNode("v-if", true),
              vue.createVNode($setup["LEchart"], {
                ref: "dayChartRef",
                "custom-style": $setup.chartStyle,
                type: "2d",
                "is-disable-scroll": false
              }, null, 8, ["custom-style"])
            ],
            512
            /* NEED_PATCH */
          ), [
            [vue.vShow, $setup.selectedPeriod === "今日"]
          ]),
          vue.withDirectives(vue.createElementVNode(
            "view",
            { class: "trend-chart-echart" },
            [
              $setup.chartLoading.week ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "chart-loading"
              }, [
                vue.createElementVNode("view", { class: "loading-spinner" }),
                vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
              ])) : vue.createCommentVNode("v-if", true),
              vue.createVNode($setup["LEchart"], {
                ref: "weekChartRef",
                "custom-style": $setup.chartStyle,
                type: "2d",
                "is-disable-scroll": false
              }, null, 8, ["custom-style"])
            ],
            512
            /* NEED_PATCH */
          ), [
            [vue.vShow, $setup.selectedPeriod === "本周"]
          ]),
          vue.withDirectives(vue.createElementVNode(
            "view",
            { class: "trend-chart-echart" },
            [
              $setup.chartLoading.month ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "chart-loading"
              }, [
                vue.createElementVNode("view", { class: "loading-spinner" }),
                vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
              ])) : vue.createCommentVNode("v-if", true),
              vue.createVNode($setup["LEchart"], {
                ref: "monthChartRef",
                "custom-style": $setup.chartStyle,
                type: "2d",
                "is-disable-scroll": false
              }, null, 8, ["custom-style"])
            ],
            512
            /* NEED_PATCH */
          ), [
            [vue.vShow, $setup.selectedPeriod === "本月"]
          ])
        ]),
        vue.createElementVNode("view", {
          class: "ai-card slide-in",
          style: { "animation-delay": "0.9s" }
        }, [
          vue.createElementVNode("view", { class: "ai-header" }, [
            vue.createElementVNode("image", {
              class: "ai-icon",
              src: _imports_1$3,
              mode: "aspectFit"
            }),
            vue.createElementVNode("text", { class: "ai-title" }, "小结卡片")
          ]),
          vue.createElementVNode("view", { class: "ai-content" }, [
            vue.createElementVNode("text", { class: "ai-item" }, [
              vue.createTextVNode(
                vue.toDisplayString($setup.selectedPeriod) + "共记录 ",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "ai-highlight" },
                vue.toDisplayString($setup.totalCount),
                1
                /* TEXT */
              ),
              vue.createTextVNode(" 次，排气频率适中 ")
            ]),
            vue.createElementVNode(
              "text",
              { class: "ai-item" },
              vue.toDisplayString($setup.mostCommonType) + "占比最高，平均气味为" + vue.toDisplayString($setup.averageSmell) + "～",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "ai-item" },
              "整体心情" + vue.toDisplayString($setup.mostCommonMood.name) + "，保持愉快状态 ",
              1
              /* TEXT */
            )
          ])
        ])
      ])
    ]);
  }
  const PagesDataIndex = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-af28c7f4"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/data/index.vue"]]);
  const _imports_1$2 = "/static/img/yinpin.png";
  const _sfc_main$7 = {
    __name: "creat",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const isRecording = vue.ref(false);
      const recordFilePath = vue.ref("");
      const recordDuration = vue.ref(0);
      const recordTimer = vue.ref(null);
      const recorderManager = vue.ref(null);
      const isPlaying = vue.ref(false);
      const audioContext = vue.ref(null);
      const isUploading = vue.ref(false);
      const initRecorder = () => {
        recorderManager.value = uni.getRecorderManager();
        recorderManager.value.onStart(() => {
          formatAppLog("log", "at pages/entry/creat.vue:139", "录音开始");
          isRecording.value = true;
          recordDuration.value = 0;
          startTimer();
        });
        recorderManager.value.onStop((res) => {
          formatAppLog("log", "at pages/entry/creat.vue:146", "录音停止", res);
          isRecording.value = false;
          stopTimer();
          recordFilePath.value = res.tempFilePath;
          recordDuration.value = Math.floor(res.duration / 1e3);
        });
        recorderManager.value.onError((err) => {
          formatAppLog("error", "at pages/entry/creat.vue:154", "录音错误", err);
          isRecording.value = false;
          stopTimer();
          uni.showToast({
            title: "录音失败，请重试",
            icon: "none"
          });
        });
      };
      const startRecord = () => {
        if (!recorderManager.value) {
          initRecorder();
        }
        uni.authorize({
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
            uni.showModal({
              title: "需要录音权限",
              content: "请在设置中开启录音权限",
              showCancel: true,
              success: (res) => {
                if (res.confirm) {
                  uni.openSetting();
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
            audioContext.value = uni.createInnerAudioContext();
            audioContext.value.src = recordFilePath.value;
            audioContext.value.onPlay(() => {
              isPlaying.value = true;
            });
            audioContext.value.onEnded(() => {
              isPlaying.value = false;
            });
            audioContext.value.onError((err) => {
              formatAppLog("error", "at pages/entry/creat.vue:251", "播放失败", err);
              isPlaying.value = false;
              uni.showToast({
                title: "播放失败",
                icon: "none"
              });
            });
            audioContext.value.play();
          }
        }
      };
      const resetRecord = () => {
        uni.showModal({
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
          uni.showToast({
            title: "请先录音",
            icon: "none"
          });
          return;
        }
        if (!((_a = userStore.userInfo) == null ? void 0 : _a.ID)) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        try {
          isUploading.value = true;
          uni.showLoading({
            title: "上传中..."
          });
          const uploadRes = await uploadAudioAPI(recordFilePath.value);
          if (uploadRes.data.code !== 0) {
            throw new Error(uploadRes.data.msg || "上传失败");
          }
          const audioUrl = uploadRes.data.data.url;
          const createRes = await createMyAudioAPI({
            url: audioUrl,
            class_name: "自己放的屁",
            name: "我的专属放屁音效"
          });
          uni.hideLoading();
          if (createRes.data.code === 0) {
            uni.showToast({
              title: "创建成功 ✅",
              icon: "none",
              duration: 2e3
            });
            uni.$emit("audioLibraryUpdated");
            setTimeout(() => {
              uni.navigateBack();
            }, 2e3);
          } else {
            throw new Error(createRes.data.msg || "创建失败");
          }
        } catch (error2) {
          uni.hideLoading();
          formatAppLog("error", "at pages/entry/creat.vue:349", "上传失败:", error2);
          uni.showToast({
            title: error2.message || "上传失败，请重试",
            icon: "none",
            duration: 2e3
          });
        } finally {
          isUploading.value = false;
        }
      };
      vue.onUnmounted(() => {
        if (recorderManager.value && isRecording.value) {
          recorderManager.value.stop();
        }
        if (audioContext.value) {
          audioContext.value.stop();
          audioContext.value.destroy();
          audioContext.value = null;
        }
        stopTimer();
      });
      const __returned__ = { userStore, isRecording, recordFilePath, recordDuration, recordTimer, recorderManager, isPlaying, audioContext, isUploading, initRecorder, startRecord, stopRecord, startTimer, stopTimer, formatTime, togglePlay, resetRecord, uploadAndCreate, ref: vue.ref, onUnmounted: vue.onUnmounted, get createMyAudioAPI() {
        return createMyAudioAPI;
      }, get uploadAudioAPI() {
        return uploadAudioAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "create-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-content" }, [
          vue.createElementVNode("text", { class: "subtitle" }, "录制你的专属放屁音效")
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        class: "scroll-content",
        "scroll-y": ""
      }, [
        vue.createElementVNode("view", { class: "record-section" }, [
          vue.createElementVNode("view", { class: "record-card" }, [
            vue.createElementVNode("view", { class: "record-status" }, [
              !$setup.isRecording && !$setup.recordFilePath ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "record-placeholder"
              }, [
                vue.createElementVNode("image", {
                  class: "record-icon",
                  src: _imports_1$3,
                  mode: "aspectFit"
                }),
                vue.createElementVNode("text", { class: "record-hint" }, "点击下方按钮开始录音")
              ])) : vue.createCommentVNode("v-if", true),
              $setup.isRecording ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "recording-indicator"
              }, [
                vue.createElementVNode("view", { class: "recording-animation" }, [
                  vue.createElementVNode("view", { class: "wave wave-1" }),
                  vue.createElementVNode("view", { class: "wave wave-2" }),
                  vue.createElementVNode("view", { class: "wave wave-3" })
                ]),
                vue.createElementVNode("text", { class: "recording-text" }, "正在录音中..."),
                vue.createElementVNode(
                  "text",
                  { class: "recording-time" },
                  vue.toDisplayString($setup.formatTime($setup.recordDuration)),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              !$setup.isRecording && $setup.recordFilePath ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "record-complete"
              }, [
                vue.createElementVNode("image", {
                  class: "complete-icon",
                  src: _imports_1$3,
                  mode: "aspectFit"
                }),
                vue.createElementVNode("text", { class: "complete-text" }, "录音完成"),
                vue.createElementVNode(
                  "text",
                  { class: "record-time" },
                  vue.toDisplayString($setup.formatTime($setup.recordDuration)),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "action-section" }, [
          !$setup.recordFilePath ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "action-buttons"
          }, [
            !$setup.isRecording ? (vue.openBlock(), vue.createElementBlock("button", {
              key: 0,
              class: "record-btn start-btn",
              onClick: $setup.startRecord,
              disabled: $setup.isUploading
            }, [
              vue.createElementVNode("image", {
                class: "btn-icon-img",
                src: _imports_1$2,
                mode: "aspectFit"
              }),
              vue.createElementVNode("text", { class: "btn-text" }, "开始录音")
            ], 8, ["disabled"])) : (vue.openBlock(), vue.createElementBlock("button", {
              key: 1,
              class: "record-btn stop-btn",
              onClick: $setup.stopRecord
            }, [
              vue.createElementVNode("text", { class: "btn-text" }, "停止录音")
            ]))
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "action-buttons"
          }, [
            vue.createElementVNode("button", {
              class: "play-btn",
              onClick: $setup.togglePlay,
              disabled: $setup.isUploading
            }, [
              vue.createElementVNode(
                "text",
                { class: "btn-text" },
                vue.toDisplayString($setup.isPlaying ? "暂停" : "播放"),
                1
                /* TEXT */
              )
            ], 8, ["disabled"]),
            vue.createElementVNode("button", {
              class: "re-record-btn",
              onClick: $setup.resetRecord,
              disabled: $setup.isUploading
            }, [
              vue.createElementVNode("text", { class: "btn-text" }, "重新录音")
            ], 8, ["disabled"])
          ]))
        ]),
        vue.createElementVNode("view", { class: "tips-section" }, [
          vue.createElementVNode("view", { class: "tip-item" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "💡"),
            vue.createElementVNode("text", { class: "tip-text" }, "录音时长建议在1-5秒之间")
          ]),
          vue.createElementVNode("view", { class: "tip-item" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "📝"),
            vue.createElementVNode("text", { class: "tip-text" }, "录音完成后点击上传保存")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "bottom-upload-section" }, [
        vue.createElementVNode("button", {
          class: "upload-btn",
          onClick: $setup.uploadAndCreate,
          disabled: !$setup.recordFilePath || $setup.isUploading
        }, [
          vue.createElementVNode(
            "text",
            { class: "upload-text" },
            vue.toDisplayString($setup.isUploading ? "上传中..." : "上传并保存"),
            1
            /* TEXT */
          )
        ], 8, ["disabled"])
      ])
    ]);
  }
  const PagesEntryCreat = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-109a309d"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/entry/creat.vue"]]);
  const getUserAchievementsAPI = () => {
    return http({
      url: "/break/achievements",
      method: "GET"
    });
  };
  const getShowFartEncyclopediaEntryAPI = () => {
    return http({
      method: "GET",
      url: "/break/appConfig/showFartEncyclopediaEntry"
    });
  };
  const getAllLevelConfigsAPI = () => {
    return http({
      method: "GET",
      url: "/break/levelConfig/all"
    });
  };
  const _imports_0 = "/static/img/arrow-right.png";
  const _imports_2 = "/static/img/pi.png";
  const _imports_3 = "/static/img/juanzeng.png";
  const _sfc_main$6 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const userInfo = vue.computed(() => userStore.userInfo);
      const nickname = vue.computed(() => userStore.nickname);
      const avatar = vue.computed(() => userStore.avatar);
      const level = vue.computed(() => userStore.level);
      const levelName = vue.computed(() => userStore.levelName);
      const totalFarts = vue.computed(() => userStore.totalFarts);
      const experience = vue.computed(() => userStore.experience);
      const achievementData = vue.ref({
        achievements: [],
        totalCount: 0,
        unlockedCount: 0
      });
      const selectedAchievement = vue.ref(null);
      const achievementPopup = vue.ref(null);
      const showFartEncyclopediaEntry = vue.ref(true);
      const levelConfigs = vue.ref([]);
      const currentLevelConfig = vue.computed(() => {
        if (levelConfigs.value.length === 0 || !level.value) {
          return null;
        }
        return levelConfigs.value.find((config2) => config2.level === level.value) || null;
      });
      const firstFourAchievements = vue.computed(() => {
        return achievementData.value.achievements.slice(0, 4);
      });
      const weekCount = vue.ref(42);
      const dailyAverage = vue.ref(6);
      const mostType = vue.ref("响亮型");
      const maxSmell = vue.ref("浓烈");
      let videoAd = null;
      vue.onMounted(() => {
        initRewardedVideoAd();
        if (userStore.token) {
          formatAppLog("log", "at pages/me/index.vue:262", "已有 token，直接加载用户信息");
          loadUserInfo();
          loadAchievements();
          loadAppConfig();
          loadLevelConfigs();
        } else {
          formatAppLog("log", "at pages/me/index.vue:268", "暂无 token，等待登录完成...");
        }
        uni.$on("loginSuccess", onLoginSuccess);
        uni.$on("userInfoUpdated", () => {
          formatAppLog("log", "at pages/me/index.vue:276", "收到用户信息更新事件，刷新数据...");
          loadUserInfo();
          loadAchievements();
          loadLevelConfigs();
        });
      });
      const onLoginSuccess = () => {
        formatAppLog("log", "at pages/me/index.vue:285", "收到 loginSuccess 事件，开始加载用户信息");
        loadUserInfo();
        loadAchievements();
        loadAppConfig();
        loadLevelConfigs();
      };
      onShow(() => {
        formatAppLog("log", "at pages/me/index.vue:294", "me页面显示，刷新数据...");
        loadUserInfo();
        loadAchievements();
        loadAppConfig();
        loadLevelConfigs();
      });
      const loadAppConfig = async () => {
      };
      const loadLevelConfigs = async () => {
        try {
          const { data } = await getAllLevelConfigsAPI();
          if (data.code === 0) {
            levelConfigs.value = data.data || [];
            formatAppLog("log", "at pages/me/index.vue:321", "等级配置已加载:", levelConfigs.value);
          }
        } catch (error2) {
          formatAppLog("error", "at pages/me/index.vue:324", "获取等级配置失败:", error2);
        }
      };
      vue.onUnmounted(() => {
        uni.$off("loginSuccess", onLoginSuccess);
        uni.$off("userInfoUpdated");
      });
      const loadUserInfo = async () => {
        try {
          const { data } = await getUserInfoAPI();
          if (data.code === 0) {
            userStore.setUserInfo(data.data);
            formatAppLog("log", "at pages/me/index.vue:348", "用户信息已更新:", data.data);
          }
        } catch (error2) {
          formatAppLog("error", "at pages/me/index.vue:351", "获取用户信息失败:", error2);
        }
      };
      const loadAchievements = async () => {
        try {
          const response = await getUserAchievementsAPI();
          if (response.data.code === 0) {
            achievementData.value = response.data.data;
            formatAppLog("log", "at pages/me/index.vue:361", "成就数据已更新:", response.data.data);
          }
        } catch (error2) {
          formatAppLog("error", "at pages/me/index.vue:364", "获取成就数据失败:", error2);
        }
      };
      const goToAchievements = () => {
        uni.navigateTo({
          url: "/pages/achievement/achievement"
        });
      };
      const goToLevel = () => {
        uni.navigateTo({
          url: "/pages/me/level"
        });
      };
      const goToEdit = () => {
        uni.navigateTo({
          url: "/pages/me/edit"
        });
      };
      const initRewardedVideoAd = () => {
      };
      const goToAiFx = () => {
        uni.navigateTo({
          url: "/pages/me/aiFx"
        });
      };
      const goToIndex = () => {
        uni.navigateTo({
          url: "/pages/entry/index"
        });
      };
      const goToDonation = () => {
        uni.navigateTo({
          url: "/pages/me/jz"
        });
      };
      const showAchievementDetail = (achievement) => {
        selectedAchievement.value = achievement;
        achievementPopup.value.open();
      };
      const closeAchievementDetail = () => {
        achievementPopup.value.close();
        selectedAchievement.value = null;
      };
      const formatTime = (timeStr) => {
        if (!timeStr)
          return "";
        const date2 = new Date(timeStr);
        return date2.toLocaleDateString() + " " + date2.toLocaleTimeString();
      };
      const handleShare = () => {
        if (!selectedAchievement.value || !selectedAchievement.value.isUnlocked) {
          uni.showToast({
            title: "该成就尚未解锁",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/me/index.vue:503", "准备分享成就:", selectedAchievement.value.achievementName);
      };
      onShareAppMessage(() => {
        if (selectedAchievement.value && selectedAchievement.value.isUnlocked) {
          return {
            title: `我解锁了「${selectedAchievement.value.achievementName}」成就！🎉`,
            path: "/pages/index/index",
            imageUrl: selectedAchievement.value.achievementIcon || selectedAchievement.value.achievementGif || ""
          };
        }
        return {
          title: "快来一起记录放屁，解锁成就吧！💨",
          path: "/pages/index/index"
        };
      });
      const __returned__ = { userStore, userInfo, nickname, avatar, level, levelName, totalFarts, experience, achievementData, selectedAchievement, achievementPopup, showFartEncyclopediaEntry, levelConfigs, currentLevelConfig, firstFourAchievements, weekCount, dailyAverage, mostType, maxSmell, get videoAd() {
        return videoAd;
      }, set videoAd(v) {
        videoAd = v;
      }, onLoginSuccess, loadAppConfig, loadLevelConfigs, loadUserInfo, loadAchievements, goToAchievements, goToLevel, goToEdit, initRewardedVideoAd, goToAiFx, goToIndex, goToDonation, showAchievementDetail, closeAchievementDetail, formatTime, handleShare, ref: vue.ref, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, computed: vue.computed, get onShow() {
        return onShow;
      }, get onShareAppMessage() {
        return onShareAppMessage;
      }, get getUserInfoAPI() {
        return getUserInfoAPI;
      }, get getUserAchievementsAPI() {
        return getUserAchievementsAPI;
      }, get getShowFartEncyclopediaEntryAPI() {
        return getShowFartEncyclopediaEntryAPI;
      }, get getAllLevelConfigsAPI() {
        return getAllLevelConfigsAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$4);
    return vue.openBlock(), vue.createElementBlock("scroll-view", {
      class: "me-container",
      "scroll-y": "true"
    }, [
      vue.createElementVNode("view", { class: "header-area" }, [
        vue.createElementVNode("image", {
          class: "avatar",
          src: $setup.avatar,
          mode: "aspectFill",
          onClick: $setup.goToEdit
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "header-info" }, [
          vue.createElementVNode("view", {
            class: "nickname-row",
            onClick: $setup.goToEdit
          }, [
            vue.createElementVNode(
              "text",
              { class: "nickname" },
              vue.toDisplayString($setup.nickname),
              1
              /* TEXT */
            ),
            vue.createElementVNode("image", {
              class: "nickname-arrow",
              src: _imports_0,
              mode: "aspectFill"
            })
          ]),
          vue.createElementVNode("view", { class: "info-row" }, [
            vue.createElementVNode("view", {
              class: "info-badge",
              onClick: $setup.goToLevel
            }, [
              vue.createElementVNode("text", { class: "info-label" }, "累计次数"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.totalFarts),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "info-badge",
              onClick: $setup.goToLevel
            }, [
              vue.createElementVNode("text", { class: "info-label" }, "经验值"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.experience),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", {
            class: "level-info",
            onClick: $setup.goToLevel
          }, [
            $setup.currentLevelConfig && $setup.currentLevelConfig.icon ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "level-icon",
              src: $setup.currentLevelConfig.icon,
              mode: "aspectFit"
            }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode(
              "text",
              { class: "level-name" },
              vue.toDisplayString($setup.levelName),
              1
              /* TEXT */
            ),
            vue.createElementVNode("image", {
              class: "arrow-right",
              src: _imports_0,
              mode: "aspectFit"
            })
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "achievement-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "成就徽章"),
          vue.createElementVNode("view", {
            class: "view-all-btn",
            onClick: $setup.goToAchievements
          }, [
            vue.createElementVNode("text", { class: "btn-text" }, "查看全部"),
            vue.createElementVNode("image", {
              class: "btn-arrow",
              src: _imports_0,
              mode: "aspectFit"
            })
          ])
        ]),
        vue.createElementVNode("view", { class: "achievement-grid" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.firstFourAchievements, (achievement, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: achievement.id,
                class: "achievement-item",
                onClick: ($event) => $setup.showAchievementDetail(achievement)
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["achievement-badge", {
                      "achievement-badge-1": index === 0,
                      "achievement-badge-2": index === 1,
                      "achievement-badge-3": index === 2,
                      "achievement-badge-locked": !achievement.isUnlocked
                    }])
                  },
                  [
                    achievement.achievementIcon ? (vue.openBlock(), vue.createElementBlock("image", {
                      key: 0,
                      src: achievement.achievementIcon,
                      class: "achievement-icon",
                      mode: "aspectFit"
                    }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 1,
                        class: "achievement-emoji"
                      },
                      vue.toDisplayString(achievement.achievementEmoji),
                      1
                      /* TEXT */
                    ))
                  ],
                  2
                  /* CLASS */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "achievement-label" },
                  vue.toDisplayString(achievement.achievementName),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "achievementPopup",
          type: "center",
          "mask-click": false
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "achievement-detail-popup" }, [
              vue.createElementVNode("view", { class: "popup-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "popup-title" },
                  vue.toDisplayString($setup.selectedAchievement && $setup.selectedAchievement.isUnlocked ? `恭喜您已获得了"${$setup.selectedAchievement.achievementName}"` : "您还未解锁该成就"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", {
                  class: "popup-close",
                  onClick: $setup.closeAchievementDetail
                }, "✕")
              ]),
              $setup.selectedAchievement ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "popup-content"
              }, [
                vue.createElementVNode("view", { class: "detail-gif-container" }, [
                  $setup.selectedAchievement.achievementGif ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: $setup.selectedAchievement.achievementGif,
                    class: "detail-gif",
                    mode: "aspectFit"
                  }, null, 8, ["src"])) : $setup.selectedAchievement.achievementIcon ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 1,
                    src: $setup.selectedAchievement.achievementIcon,
                    class: "detail-gif",
                    mode: "aspectFit"
                  }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 2,
                      class: "detail-emoji"
                    },
                    vue.toDisplayString($setup.selectedAchievement.achievementEmoji),
                    1
                    /* TEXT */
                  ))
                ]),
                vue.createElementVNode("view", { class: "detail-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "detail-name" },
                    vue.toDisplayString($setup.selectedAchievement.achievementName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "detail-desc" },
                    vue.toDisplayString($setup.selectedAchievement.achievementDesc),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "detail-progress" }, [
                    vue.createElementVNode("text", { class: "progress-label" }, "进度："),
                    vue.createElementVNode("view", { class: "progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["progress-fill", { "completed": $setup.selectedAchievement.isUnlocked }]),
                          style: vue.normalizeStyle({ width: $setup.selectedAchievement.progress + "%" })
                        },
                        null,
                        6
                        /* CLASS, STYLE */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "progress-value" },
                      vue.toDisplayString($setup.selectedAchievement.progress) + "%",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "detail-reward" }, [
                    vue.createElementVNode("text", { class: "reward-label" }, "奖励经验："),
                    vue.createElementVNode(
                      "text",
                      { class: "reward-value" },
                      "+" + vue.toDisplayString($setup.selectedAchievement.rewardExp),
                      1
                      /* TEXT */
                    )
                  ]),
                  $setup.selectedAchievement.isUnlocked ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "detail-unlock-time"
                  }, [
                    vue.createElementVNode("text", { class: "unlock-label" }, "解锁时间："),
                    vue.createElementVNode(
                      "text",
                      { class: "unlock-value" },
                      vue.toDisplayString($setup.formatTime($setup.selectedAchievement.unlockTime)),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("view", { class: "popup-actions" }, [
                  $setup.selectedAchievement.isUnlocked ? (vue.openBlock(), vue.createElementBlock("button", {
                    key: 0,
                    class: "action-btn primary",
                    "open-type": "share",
                    onClick: $setup.handleShare
                  }, [
                    vue.createElementVNode("text", { class: "btn-icon" }, "🎉"),
                    vue.createElementVNode("text", null, "分享")
                  ])) : (vue.openBlock(), vue.createElementBlock("button", {
                    key: 1,
                    class: "action-btn disabled",
                    disabled: ""
                  }, [
                    vue.createElementVNode("text", { class: "btn-icon" }, "🔒"),
                    vue.createElementVNode("text", null, "未解锁")
                  ])),
                  vue.createElementVNode("button", {
                    class: "action-btn secondary",
                    onClick: $setup.closeAchievementDetail
                  }, " 关闭 ")
                ])
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      $setup.showFartEncyclopediaEntry ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "ai-entry-section"
      }, [
        vue.createElementVNode("view", {
          class: "ai-entry-card",
          onClick: $setup.goToAiFx
        }, [
          vue.createElementVNode("image", {
            class: "entry-icon",
            src: _imports_1$3,
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { class: "entry-content" }, [
            vue.createElementVNode("text", { class: "entry-title" }, "智能肠道健康分析"),
            vue.createElementVNode("text", { class: "entry-desc" }, "查看你的专属健康报告")
          ]),
          vue.createElementVNode("image", {
            class: "entry-arrow",
            src: _imports_0,
            mode: "aspectFit"
          })
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showFartEncyclopediaEntry ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "ai-entry-section"
      }, [
        vue.createElementVNode("view", {
          class: "ai-entry-card",
          onClick: $setup.goToIndex
        }, [
          vue.createElementVNode("image", {
            class: "entry-icon",
            src: _imports_2,
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { class: "entry-content" }, [
            vue.createElementVNode("text", { class: "entry-title" }, "屁的全家族大全"),
            vue.createElementVNode("text", { class: "entry-desc" }, "从空心到实心，从凉到烫，你意想不到的屁都在这里")
          ]),
          vue.createElementVNode("image", {
            class: "entry-arrow",
            src: _imports_0,
            mode: "aspectFit"
          })
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "ai-entry-section" }, [
        vue.createElementVNode("view", {
          class: "ai-entry-card donation-card",
          onClick: $setup.goToDonation
        }, [
          vue.createElementVNode("image", {
            class: "entry-icon",
            src: _imports_3,
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { class: "entry-content" }, [
            vue.createElementVNode("text", { class: "entry-title" }, "给我的屁加油！"),
            vue.createElementVNode("text", { class: "entry-desc" }, "支持我继续创作，让小程序更有趣")
          ]),
          vue.createElementVNode("image", {
            class: "entry-arrow",
            src: _imports_0,
            mode: "aspectFit"
          })
        ])
      ])
    ]);
  }
  const PagesMeIndex = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-c8e26b33"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/me/index.vue"]]);
  const _sfc_main$5 = {
    __name: "jz",
    setup(__props, { expose: __expose }) {
      __expose();
      const handleBack = () => {
        uni.navigateBack({
          delta: 1
        });
      };
      const previewQRCode = () => {
        const largeImageUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG";
        uni.previewImage({
          urls: [largeImageUrl],
          current: largeImageUrl
        });
      };
      const shareToFriend = () => {
        const imageUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG";
        uni.showLoading({
          title: "准备分享...",
          mask: true
        });
        uni.downloadFile({
          url: imageUrl,
          success: (downloadRes) => {
            uni.hideLoading();
            if (downloadRes.statusCode === 200) {
              uni.previewImage({
                urls: [downloadRes.tempFilePath],
                current: downloadRes.tempFilePath,
                success: () => {
                  setTimeout(() => {
                    uni.showToast({
                      title: "长按图片可分享",
                      icon: "none",
                      duration: 2e3
                    });
                  }, 500);
                }
              });
            } else {
              uni.showToast({
                title: "准备失败",
                icon: "none",
                duration: 2e3
              });
            }
          },
          fail: () => {
            uni.hideLoading();
            uni.showToast({
              title: "准备失败",
              icon: "none",
              duration: 2e3
            });
          }
        });
      };
      const downloadQRCode = () => {
        const imageUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/bag_wx.JPG";
        uni.showLoading({
          title: "正在下载...",
          mask: true
        });
        uni.getSetting({
          success: (res) => {
            if (res.authSetting["scope.writePhotosAlbum"] === false) {
              uni.showModal({
                title: "需要授权",
                content: "需要您授权保存图片到相册",
                confirmText: "去设置",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    uni.openSetting();
                  }
                }
              });
              uni.hideLoading();
              return;
            }
            uni.downloadFile({
              url: imageUrl,
              success: (downloadRes) => {
                if (downloadRes.statusCode === 200) {
                  uni.saveImageToPhotosAlbum({
                    filePath: downloadRes.tempFilePath,
                    success: () => {
                      uni.hideLoading();
                      uni.showToast({
                        title: "保存成功",
                        icon: "success",
                        duration: 2e3
                      });
                    },
                    fail: (err) => {
                      uni.hideLoading();
                      if (err.errMsg.includes("auth deny")) {
                        uni.showModal({
                          title: "需要授权",
                          content: "需要您授权保存图片到相册",
                          confirmText: "去设置",
                          success: (modalRes) => {
                            if (modalRes.confirm) {
                              uni.openSetting();
                            }
                          }
                        });
                      } else {
                        uni.showToast({
                          title: "保存失败",
                          icon: "none",
                          duration: 2e3
                        });
                      }
                    }
                  });
                } else {
                  uni.hideLoading();
                  uni.showToast({
                    title: "下载失败",
                    icon: "none",
                    duration: 2e3
                  });
                }
              },
              fail: () => {
                uni.hideLoading();
                uni.showToast({
                  title: "下载失败",
                  icon: "none",
                  duration: 2e3
                });
              }
            });
          }
        });
      };
      const __returned__ = { handleBack, previewQRCode, shareToFriend, downloadQRCode };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("scroll-view", {
      class: "donation-container",
      "scroll-y": "true"
    }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.handleBack
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "header-title" }, "支持我继续创作！")
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-text" }, ' 亲爱的朋友，非常感谢您使用"放屁档案"小程序！作为个人开发者，我很荣幸能够为您带来一些小小的欢乐。如果您在使用过程中感受到了些许乐趣，并且愿意支持我继续改进和优化这个小程序，我会非常感激。当然，这完全取决于您的意愿，无论是否支持，我都衷心感谢您的使用和陪伴。如果您愿意，可以通过下方的方式表达您的支持，每一份善意都会成为我继续前行的温暖动力。 ')
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "你的捐赠将用于："),
          vue.createElementVNode("view", { class: "purpose-list" }, [
            vue.createElementVNode("view", { class: "purpose-item" }, [
              vue.createElementVNode("text", { class: "purpose-icon" }, "💪"),
              vue.createElementVNode("text", { class: "purpose-text" }, "支持我的个人开发和创作动力")
            ]),
            vue.createElementVNode("view", { class: "purpose-item" }, [
              vue.createElementVNode("text", { class: "purpose-icon" }, "✨"),
              vue.createElementVNode("text", { class: "purpose-text" }, "改进和优化小程序的功能")
            ]),
            vue.createElementVNode("view", { class: "purpose-item" }, [
              vue.createElementVNode("text", { class: "purpose-icon" }, "🎉"),
              vue.createElementVNode("text", { class: "purpose-text" }, "让更多人也能享受记录放屁的乐趣")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "捐赠二维码说明："),
          vue.createElementVNode("text", { class: "section-text" }, " 如果您愿意支持我，可以扫描下方的二维码。当然，这完全不是必须的，您能够使用这个小程序已经让我很开心了。如果收到您的支持，我会非常感激，这对我来说是莫大的鼓励。再次感谢您的理解和支持！ "),
          vue.createElementVNode("view", { class: "action-buttons-container" }, [
            vue.createElementVNode("button", {
              class: "action-btn download-btn",
              onClick: $setup.downloadQRCode
            }, [
              vue.createElementVNode("text", { class: "btn-text" }, "保存二维码")
            ]),
            vue.createElementVNode("button", {
              class: "action-btn share-btn",
              onClick: $setup.shareToFriend
            }, [
              vue.createElementVNode("text", { class: "btn-text" }, "分享屁友捐赠")
            ])
          ]),
          vue.createElementVNode("view", { class: "qr-code-container" }, [
            vue.createElementVNode("image", {
              class: "qr-code-image",
              src: "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-12-12/small_wx.JPG",
              mode: "aspectFit",
              onClick: $setup.previewQRCode
            }),
            vue.createElementVNode("text", { class: "qr-code-hint" }, "点击图片可放大查看")
          ])
        ])
      ])
    ]);
  }
  const PagesMeJz = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-ad30fe55"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/me/jz.vue"]]);
  const _sfc_main$4 = {
    __name: "level",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const levelList = vue.ref([]);
      const userLevel = vue.computed(() => userStore.level || 1);
      const userExperience = vue.computed(() => userStore.experience || 0);
      const totalFarts = vue.computed(() => userStore.totalFarts || 0);
      const currentUserLevel = vue.computed(() => {
        return levelList.value.find((item) => item.level === userLevel.value) || {};
      });
      const isMaxLevel = vue.computed(() => {
        if (!levelList.value || levelList.value.length === 0)
          return false;
        const maxLevel = Math.max(...levelList.value.map((item) => item.level || 0));
        return userLevel.value >= maxLevel;
      });
      const nextLevelExp = vue.computed(() => {
        const nextLevel = levelList.value.find((item) => item.level === userLevel.value + 1);
        return nextLevel ? nextLevel.requiredExp : userExperience.value;
      });
      const expProgress = vue.computed(() => {
        if (isMaxLevel.value)
          return 100;
        if (nextLevelExp.value === 0)
          return 100;
        const progress = userExperience.value / nextLevelExp.value * 100;
        return Math.min(progress, 100);
      });
      const isCurrentLevel = (level) => {
        return level === userLevel.value;
      };
      const isUnlocked = (level) => {
        return level <= userLevel.value;
      };
      vue.onMounted(() => {
        if (userStore.token) {
          formatAppLog("log", "at pages/me/level.vue:179", "已有 token，直接加载等级配置");
          loadLevelConfigs();
        } else {
          formatAppLog("log", "at pages/me/level.vue:182", "暂无 token，等待登录完成...");
        }
        uni.$on("loginSuccess", onLoginSuccess);
      });
      const onLoginSuccess = () => {
        formatAppLog("log", "at pages/me/level.vue:191", "收到 loginSuccess 事件，开始加载等级配置");
        loadLevelConfigs();
      };
      vue.onUnmounted(() => {
        uni.$off("loginSuccess", onLoginSuccess);
      });
      const loadLevelConfigs = async () => {
        try {
          uni.showLoading({
            title: "加载中..."
          });
          const response = await getAllLevelConfigsAPI();
          if (response.data.code === 0) {
            const rawData = response.data.data;
            if (Array.isArray(rawData)) {
              levelList.value = rawData.sort((a, b) => a.level - b.level);
              formatAppLog("log", "at pages/me/level.vue:215", "✅ 等级配置加载成功", levelList.value);
            } else {
              formatAppLog("error", "at pages/me/level.vue:217", "❌ 返回的数据不是数组:", rawData);
              uni.showToast({
                title: "数据格式错误",
                icon: "error"
              });
            }
          } else {
            formatAppLog("error", "at pages/me/level.vue:224", "❌ API 返回错误:", response.data.msg);
            uni.showToast({
              title: response.data.msg || "加载失败",
              icon: "error"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/me/level.vue:231", "❌ 加载等级配置失败:", error2);
          uni.showToast({
            title: "加载失败，请重试",
            icon: "error"
          });
        } finally {
          uni.hideLoading();
        }
      };
      const __returned__ = { userStore, levelList, userLevel, userExperience, totalFarts, currentUserLevel, isMaxLevel, nextLevelExp, expProgress, isCurrentLevel, isUnlocked, onLoginSuccess, loadLevelConfigs, ref: vue.ref, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, computed: vue.computed, get getAllLevelConfigsAPI() {
        return getAllLevelConfigsAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "level-page" }, [
      vue.createElementVNode("scroll-view", {
        class: "level-container",
        "scroll-y": "true"
      }, [
        vue.createElementVNode("view", { class: "current-level-card" }, [
          vue.createElementVNode("view", { class: "current-level-content" }, [
            $setup.currentUserLevel.levelImage ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "current-level-image-wrapper"
            }, [
              vue.createElementVNode("image", {
                src: $setup.currentUserLevel.levelImage,
                class: "current-level-image",
                mode: "aspectFit"
              }, null, 8, ["src"])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("text", { class: "level-desc" }, "当前等级"),
            vue.createElementVNode(
              "text",
              { class: "level-name-current" },
              vue.toDisplayString($setup.currentUserLevel.levelName || "新手屁民"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "stats-section" }, [
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode("text", { class: "stat-label" }, "累计次数"),
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.totalFarts),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode("text", { class: "stat-label" }, "经验值"),
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.userExperience),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "全部等级"),
          vue.createElementVNode(
            "text",
            { class: "section-subtitle" },
            "共 " + vue.toDisplayString($setup.levelList.length) + " 个等级",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "level-list" }, [
          $setup.levelList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-state"
          }, [
            vue.createElementVNode("text", { class: "empty-emoji" }, "📋"),
            vue.createElementVNode("text", { class: "empty-text" }, "暂无等级配置")
          ])) : vue.createCommentVNode("v-if", true),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.levelList, (level, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: level.id || index,
                  class: vue.normalizeClass(["level-item", {
                    "level-item-unlocked": $setup.isUnlocked(level.level),
                    "level-item-locked": !$setup.isUnlocked(level.level)
                  }])
                },
                [
                  vue.createElementVNode("view", { class: "level-number" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "number-text" },
                      "Lv." + vue.toDisplayString(level.level || 0),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "level-icon-wrapper" }, [
                    level.levelImage ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "level-image-container"
                    }, [
                      vue.createElementVNode("image", {
                        src: level.levelImage,
                        class: "level-image",
                        mode: "aspectFit"
                      }, null, 8, ["src"])
                    ])) : (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 1,
                        class: vue.normalizeClass(["level-emoji-container", `level-bg-${index % 4}`])
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          { class: "level-emoji" },
                          vue.toDisplayString(level.levelEmoji || "❓"),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )),
                    $setup.isUnlocked(level.level) ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 2,
                      class: "unlocked-badge"
                    }, [
                      vue.createElementVNode("text", { class: "unlocked-icon" }, "✓")
                    ])) : (vue.openBlock(), vue.createElementBlock("view", {
                      key: 3,
                      class: "locked-overlay"
                    }, [
                      vue.createElementVNode("text", { class: "locked-icon" }, "🔒")
                    ]))
                  ]),
                  vue.createElementVNode("view", { class: "level-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "level-name" },
                      vue.toDisplayString(level.levelName || "未命名"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "level-requirements" }, [
                      vue.createElementVNode("view", { class: "requirement-item" }, [
                        vue.createElementVNode("text", { class: "requirement-icon" }, "⭐"),
                        vue.createElementVNode(
                          "text",
                          { class: "requirement-text" },
                          vue.toDisplayString(level.requiredExp || 0) + " 经验",
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "requirement-item" }, [
                        vue.createElementVNode("text", { class: "requirement-icon" }, "💨"),
                        vue.createElementVNode(
                          "text",
                          { class: "requirement-text" },
                          vue.toDisplayString(level.requiredFarts || 0) + " 次",
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "requirement-item" }, [
                        vue.createElementVNode("text", { class: "requirement-icon" }, "📅"),
                        vue.createElementVNode(
                          "text",
                          { class: "requirement-text" },
                          vue.toDisplayString(level.requiredDays || 0) + " 天",
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "level-status" }, [
                    $setup.isUnlocked(level.level) ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "status-tag status-unlocked"
                    }, [
                      vue.createElementVNode("text", { class: "status-text" }, "已达成")
                    ])) : (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "status-tag status-locked"
                    }, [
                      vue.createElementVNode("text", { class: "status-text" }, "未解锁")
                    ]))
                  ])
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "bottom-tips" }, [
          vue.createElementVNode("text", { class: "tip-icon" }, "💡"),
          vue.createElementVNode("text", { class: "tip-text" }, "每次打卡都能获得经验值，坚持打卡解锁更多等级称号吧！")
        ])
      ])
    ]);
  }
  const PagesMeLevel = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-157e7739"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/me/level.vue"]]);
  const getAiPersonalityReviewAPI = () => {
    return http({
      url: "/break/ai/review",
      method: "GET"
    });
  };
  const _imports_1$1 = "/static/img/jiankang.png";
  const CACHE_KEY = "ai_analysis_cache";
  const CACHE_EXPIRE_TIME = 60 * 60 * 1e3;
  const _sfc_main$3 = {
    __name: "aiFx",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const isLoading = vue.ref(true);
      const healthScore = vue.ref(0);
      const patencyIndex = vue.ref(0);
      const airflowActivity = vue.ref(0);
      const reviewText = vue.ref("");
      const healthAdvice = vue.ref([]);
      const getCacheData = () => {
        try {
          const cacheStr = uni.getStorageSync(CACHE_KEY);
          if (!cacheStr)
            return null;
          const cache = JSON.parse(cacheStr);
          const now2 = Date.now();
          if (now2 - cache.timestamp > CACHE_EXPIRE_TIME) {
            uni.removeStorageSync(CACHE_KEY);
            return null;
          }
          return cache.data;
        } catch (error2) {
          formatAppLog("error", "at pages/me/aiFx.vue:131", "读取缓存失败:", error2);
          return null;
        }
      };
      const saveCacheData = (data) => {
        try {
          const cache = {
            timestamp: Date.now(),
            data
          };
          uni.setStorageSync(CACHE_KEY, JSON.stringify(cache));
          formatAppLog("log", "at pages/me/aiFx.vue:144", "缓存已保存");
        } catch (error2) {
          formatAppLog("error", "at pages/me/aiFx.vue:146", "保存缓存失败:", error2);
        }
      };
      const applyDataToPage = (data) => {
        var _a, _b;
        healthScore.value = data.healthScore || 0;
        patencyIndex.value = data.patencyIndex || 0;
        airflowActivity.value = data.airflowActivity || 0;
        reviewText.value = data.reviewText || "";
        const advice = [];
        if (data.dietAdvice)
          advice.push(data.dietAdvice);
        if (data.lifestyleTip)
          advice.push(data.lifestyleTip);
        if (((_b = (_a = data.intestinalHealth) == null ? void 0 : _a.potentialIssues) == null ? void 0 : _b.length) > 0) {
          advice.push(...data.intestinalHealth.potentialIssues.slice(0, 2));
        }
        healthAdvice.value = advice.length > 0 ? advice : ["继续保持良好的生活习惯"];
      };
      const loadAiAnalysis = async (useCache = true) => {
        if (useCache) {
          const cachedData = getCacheData();
          if (cachedData) {
            formatAppLog("log", "at pages/me/aiFx.vue:173", "使用缓存数据");
            applyDataToPage(cachedData);
            isLoading.value = false;
            return;
          }
        }
        isLoading.value = true;
        try {
          const response = await getAiPersonalityReviewAPI();
          if (response.data.code === 0) {
            const data = response.data.data;
            applyDataToPage(data);
            saveCacheData(data);
            formatAppLog("log", "at pages/me/aiFx.vue:193", "智能分析数据已加载:", data);
          }
        } catch (error2) {
          formatAppLog("error", "at pages/me/aiFx.vue:196", "获取智能分析失败:", error2);
          uni.showToast({
            title: "加载失败，请重试",
            icon: "error"
          });
        } finally {
          isLoading.value = false;
        }
      };
      const getHealthClass = (score) => {
        if (score >= 85)
          return "health-excellent";
        if (score >= 70)
          return "health-good";
        if (score >= 60)
          return "health-normal";
        return "health-poor";
      };
      vue.onMounted(() => {
        if (userStore.token) {
          loadAiAnalysis(true);
        } else {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      });
      const refreshData = () => {
        loadAiAnalysis(false);
      };
      const __returned__ = { userStore, CACHE_KEY, CACHE_EXPIRE_TIME, isLoading, healthScore, patencyIndex, airflowActivity, reviewText, healthAdvice, getCacheData, saveCacheData, applyDataToPage, loadAiAnalysis, getHealthClass, refreshData, ref: vue.ref, onMounted: vue.onMounted, get getAiPersonalityReviewAPI() {
        return getAiPersonalityReviewAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("scroll-view", {
      class: "ai-fx-container",
      "scroll-y": "true"
    }, [
      vue.createElementVNode("view", { class: "header-section" }, [
        vue.createElementVNode("image", {
          class: "header-decoration-img decoration-1",
          src: _imports_0$4,
          mode: "aspectFit"
        }),
        vue.createElementVNode("text", { class: "header-title" }, "智能肠道健康分析"),
        vue.createElementVNode("text", { class: "header-subtitle" }, "基于你的记录数据生成")
      ]),
      $setup.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-section"
      }, [
        vue.createElementVNode("view", { class: "loading-spinner" }),
        vue.createElementVNode("text", { class: "loading-text" }, "正在生成你的专属健康报告...")
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "content-section"
      }, [
        vue.createElementVNode("view", { class: "analysis-card health-card" }, [
          vue.createElementVNode("view", { class: "card-header" }, [
            vue.createElementVNode("image", {
              class: "card-icon",
              src: _imports_1$1,
              mode: "aspectFit"
            }),
            vue.createElementVNode("text", { class: "card-title" }, "健康评估")
          ]),
          vue.createElementVNode("view", { class: "card-content" }, [
            vue.createElementVNode("view", { class: "metric-item" }, [
              vue.createElementVNode("view", { class: "metric-header" }, [
                vue.createElementVNode("text", { class: "metric-label" }, "肠道健康评分"),
                vue.createElementVNode(
                  "text",
                  { class: "metric-value" },
                  vue.toDisplayString($setup.healthScore || 0) + "分",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "progress-bar" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["progress-fill health-fill", $setup.getHealthClass($setup.healthScore || 0)]),
                    style: vue.normalizeStyle({ width: ($setup.healthScore || 0) + "%" })
                  },
                  null,
                  6
                  /* CLASS, STYLE */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "metric-item" }, [
              vue.createElementVNode("view", { class: "metric-header" }, [
                vue.createElementVNode("text", { class: "metric-label" }, "肠道通畅指数"),
                vue.createElementVNode(
                  "text",
                  { class: "metric-value" },
                  vue.toDisplayString($setup.patencyIndex || 0) + "分",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "progress-bar" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "progress-fill patency-fill",
                    style: vue.normalizeStyle({ width: ($setup.patencyIndex || 0) + "%" })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "metric-item" }, [
              vue.createElementVNode("view", { class: "metric-header" }, [
                vue.createElementVNode("text", { class: "metric-label" }, "气流活跃度"),
                vue.createElementVNode(
                  "text",
                  { class: "metric-value" },
                  vue.toDisplayString($setup.airflowActivity || 0) + "分",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "progress-bar" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "progress-fill airflow-fill",
                    style: vue.normalizeStyle({ width: ($setup.airflowActivity || 0) + "%" })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "ai-review-section" }, [
              vue.createElementVNode("text", { class: "review-title" }, "智能评估报告"),
              vue.createElementVNode(
                "text",
                { class: "review-text" },
                vue.toDisplayString($setup.reviewText || "正在生成评估报告..."),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "advice-section" }, [
              vue.createElementVNode("text", { class: "advice-title" }, "健康建议"),
              vue.createElementVNode("view", { class: "advice-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.healthAdvice, (advice, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      class: "advice-item"
                    }, [
                      vue.createElementVNode("text", { class: "advice-icon" }, "✓"),
                      vue.createElementVNode(
                        "text",
                        { class: "advice-text" },
                        vue.toDisplayString(advice),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ])
      ]))
    ]);
  }
  const PagesMeAiFx = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-38a9e170"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/me/aiFx.vue"]]);
  const baseURL = config.development.baseUrl;
  const uploadImageAPI = (filePath) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: baseURL + "/upload/image",
        filePath,
        name: "file",
        header: {
          "source-client": "miniapp"
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data);
            resolve(data);
          } else {
            uni.showToast({
              title: "上传失败",
              icon: "none"
            });
            reject(res);
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "上传失败",
            icon: "none"
          });
          reject(err);
        }
      });
    });
  };
  const defaultAvatar = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png";
  const _sfc_main$2 = {
    __name: "edit",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const avatarUrl = vue.ref("");
      const nickname = vue.ref("");
      const isSubmitting = vue.ref(false);
      const originalNickname = vue.ref("");
      const originalAvatar = vue.ref("");
      const canSave = vue.computed(() => {
        const nicknameChanged = nickname.value.trim() !== originalNickname.value;
        const avatarChanged = avatarUrl.value !== originalAvatar.value;
        return (nicknameChanged || avatarChanged) && nickname.value.trim().length > 0;
      });
      const loadUserInfo = async () => {
        try {
          const { data } = await getUserInfoAPI();
          if (data.code === 0) {
            const userInfo = data.data;
            nickname.value = userInfo.nickname || "";
            avatarUrl.value = userInfo.avatar || defaultAvatar;
            originalNickname.value = userInfo.nickname || "";
            originalAvatar.value = userInfo.avatar || defaultAvatar;
          }
        } catch (error2) {
          formatAppLog("error", "at pages/me/edit.vue:98", "获取用户信息失败:", error2);
          uni.showToast({
            title: "获取用户信息失败",
            icon: "none"
          });
        }
      };
      const onChooseAvatar = ({ detail }) => {
        if (detail.avatarUrl) {
          uploadAvatar(detail.avatarUrl);
        }
      };
      const uploadAvatar = async (filePath) => {
        uni.showLoading({
          title: "上传中...",
          mask: true
        });
        try {
          const result = await uploadImageAPI(filePath);
          if (result.code === 0) {
            avatarUrl.value = result.data.url;
            uni.showToast({
              title: "上传成功",
              icon: "success"
            });
          } else {
            uni.showToast({
              title: result.msg || "上传失败",
              icon: "none"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/me/edit.vue:136", "上传头像失败:", error2);
          uni.showToast({
            title: "上传失败，请重试",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      };
      const onNicknameInput = (e2) => {
        nickname.value = e2.detail.value;
      };
      const handleSave = async () => {
        if (isSubmitting.value || !canSave.value) {
          return;
        }
        const trimmedNickname = nickname.value.trim();
        if (!trimmedNickname) {
          uni.showToast({
            title: "请输入昵称",
            icon: "none"
          });
          return;
        }
        if (trimmedNickname.length > 10) {
          uni.showToast({
            title: "昵称不能超过10个字符",
            icon: "none"
          });
          return;
        }
        isSubmitting.value = true;
        try {
          const { data } = await updateUserInfoAPI({
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
            uni.$emit("userInfoUpdated");
            uni.showToast({
              title: "保存成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: data.msg || "保存失败",
              icon: "none"
            });
          }
        } catch (error2) {
          formatAppLog("error", "at pages/me/edit.vue:210", "保存用户信息失败:", error2);
          uni.showToast({
            title: "保存失败，请重试",
            icon: "none"
          });
        } finally {
          isSubmitting.value = false;
        }
      };
      vue.onMounted(() => {
        loadUserInfo();
      });
      onShow(() => {
        loadUserInfo();
      });
      const __returned__ = { userStore, defaultAvatar, avatarUrl, nickname, isSubmitting, originalNickname, originalAvatar, canSave, loadUserInfo, onChooseAvatar, uploadAvatar, onNicknameInput, handleSave, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get onShow() {
        return onShow;
      }, get getUserInfoAPI() {
        return getUserInfoAPI;
      }, get updateUserInfoAPI() {
        return updateUserInfoAPI;
      }, get uploadImageAPI() {
        return uploadImageAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "edit-container" }, [
      vue.createElementVNode("scroll-view", {
        class: "edit-scroll",
        "scroll-y": "true"
      }, [
        vue.createElementVNode("view", { class: "header-decoration" }, [
          vue.createElementVNode("text", { class: "header-subtitle" }, "完善你的个人信息")
        ]),
        vue.createElementVNode("view", { class: "form-wrapper" }, [
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-label" }, "头像"),
            vue.createElementVNode("view", { class: "avatar-section" }, [
              vue.createElementVNode("view", { class: "avatar-wrapper" }, [
                vue.createElementVNode(
                  "button",
                  {
                    class: "btn-normal",
                    "open-type": "chooseAvatar",
                    onChooseavatar: $setup.onChooseAvatar
                  },
                  [
                    vue.createElementVNode("image", {
                      src: $setup.avatarUrl || $setup.defaultAvatar,
                      class: "avatar-image",
                      mode: "aspectFill"
                    }, null, 8, ["src"])
                  ],
                  32
                  /* NEED_HYDRATION */
                )
              ]),
              vue.createElementVNode("text", { class: "avatar-tip" }, "点击头像可以更换")
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-label" }, "昵称"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.nickname = $event),
                  type: "nickname",
                  maxlength: "10",
                  placeholder: "请输入昵称",
                  class: "form-input",
                  onInput: $setup.onNicknameInput
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $setup.nickname]
              ]),
              vue.createElementVNode(
                "text",
                { class: "char-count" },
                vue.toDisplayString($setup.nickname.length) + "/10",
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "footer" }, [
          vue.createElementVNode("button", {
            class: vue.normalizeClass(["save-btn", { disabled: $setup.isSubmitting || !$setup.canSave }]),
            disabled: $setup.isSubmitting || !$setup.canSave,
            onClick: $setup.handleSave
          }, [
            vue.createElementVNode(
              "text",
              { class: "btn-text" },
              vue.toDisplayString($setup.isSubmitting ? "保存中..." : "保存"),
              1
              /* TEXT */
            )
          ], 10, ["disabled"])
        ])
      ])
    ]);
  }
  const PagesMeEdit = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-f2be5884"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/me/edit.vue"]]);
  const _imports_1 = "/static/img/yiwancheng.png";
  const _sfc_main$1 = {
    __name: "achievement",
    setup(__props, { expose: __expose }) {
      __expose();
      const loading = vue.ref(false);
      const achievementData = vue.ref({
        achievements: [],
        totalCount: 0,
        unlockedCount: 0
      });
      const selectedAchievement = vue.ref(null);
      const achievementPopup = vue.ref(null);
      const isSharing = vue.ref(false);
      const completionRate = vue.computed(() => {
        if (achievementData.value.totalCount === 0)
          return 0;
        return Math.round(achievementData.value.unlockedCount / achievementData.value.totalCount * 100);
      });
      vue.onMounted(() => {
        const userStore = useUserStore();
        if (userStore.token) {
          formatAppLog("log", "at pages/achievement/achievement.vue:211", "已有 token，直接加载成就数据");
          loadAchievements();
        } else {
          formatAppLog("log", "at pages/achievement/achievement.vue:214", "暂无 token，等待登录完成...");
        }
        uni.$on("loginSuccess", onLoginSuccess);
        uni.$on("userInfoUpdated", () => {
          formatAppLog("log", "at pages/achievement/achievement.vue:222", "收到用户信息更新事件，刷新成就数据...");
          loadAchievements();
        });
      });
      const onLoginSuccess = () => {
        formatAppLog("log", "at pages/achievement/achievement.vue:229", "收到 loginSuccess 事件，开始加载成就数据");
        loadAchievements();
      };
      onShow(() => {
        formatAppLog("log", "at pages/achievement/achievement.vue:235", "成就页面显示，刷新数据...");
        loadAchievements();
      });
      vue.onUnmounted(() => {
        uni.$off("loginSuccess", onLoginSuccess);
        uni.$off("userInfoUpdated");
      });
      const loadAchievements = async () => {
        loading.value = true;
        try {
          const response = await getUserAchievementsAPI();
          formatAppLog("log", "at pages/achievement/achievement.vue:250", "response", response);
          if (response.data.code === 0) {
            achievementData.value = response.data.data;
          }
        } catch (error2) {
          formatAppLog("error", "at pages/achievement/achievement.vue:255", "加载成就数据失败:", error2);
          uni.showToast({
            title: "网络错误，请重试",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const showAchievementDetail = (achievement) => {
        selectedAchievement.value = achievement;
        achievementPopup.value.open();
      };
      const closeAchievementDetail = () => {
        achievementPopup.value.close();
        selectedAchievement.value = null;
      };
      const formatTime = (timeStr) => {
        if (!timeStr)
          return "";
        const date2 = new Date(timeStr);
        return date2.toLocaleDateString() + " " + date2.toLocaleTimeString();
      };
      const handleShare = () => {
        if (!selectedAchievement.value || !selectedAchievement.value.isUnlocked) {
          uni.showToast({
            title: "该成就尚未解锁",
            icon: "none"
          });
          return;
        }
        isSharing.value = true;
        formatAppLog("log", "at pages/achievement/achievement.vue:293", "准备分享成就:", selectedAchievement.value.achievementName);
      };
      onShareAppMessage(() => {
        if (selectedAchievement.value && selectedAchievement.value.isUnlocked) {
          return {
            title: `我解锁了「${selectedAchievement.value.achievementName}」成就！🎉`,
            path: "/pages/index/index",
            imageUrl: selectedAchievement.value.achievementIcon || selectedAchievement.value.achievementGif || ""
          };
        }
        return {
          title: "快来一起记录放屁，解锁成就吧！💨",
          path: "/pages/index/index"
        };
      });
      const __returned__ = { loading, achievementData, selectedAchievement, achievementPopup, isSharing, completionRate, onLoginSuccess, loadAchievements, showAchievementDetail, closeAchievementDetail, formatTime, handleShare, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get onShow() {
        return onShow;
      }, get onShareAppMessage() {
        return onShareAppMessage;
      }, get getUserAchievementsAPI() {
        return getUserAchievementsAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "achievement-page" }, [
      vue.createElementVNode("scroll-view", {
        class: "scroll-container",
        "scroll-y": "true",
        enhanced: true,
        "show-scrollbar": false,
        "enable-flex": true
      }, [
        vue.createElementVNode("view", { class: "page-header" }, [
          vue.createElementVNode("image", {
            class: "decoration-img decoration-2",
            src: _imports_0$4,
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "page-subtitle" }, "解锁更多成就，成为放屁大师！")
        ]),
        vue.createElementVNode("view", { class: "achievement-stats" }, [
          vue.createElementVNode("view", { class: "stats-grid" }, [
            vue.createElementVNode("view", { class: "stat-card stat-card-1" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-number" },
                vue.toDisplayString($setup.achievementData.unlockedCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "已解锁")
            ]),
            vue.createElementVNode("view", { class: "stat-card stat-card-2" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-number" },
                vue.toDisplayString($setup.achievementData.totalCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "总成就")
            ]),
            vue.createElementVNode("view", { class: "stat-card stat-card-3" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-number" },
                vue.toDisplayString($setup.completionRate) + "%",
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "完成度")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "achievement-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "成就列表"),
          vue.createElementVNode("view", { class: "achievement-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.achievementData.achievements, (achievement) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: achievement.id,
                  class: vue.normalizeClass(["achievement-card", { "unlocked": achievement.isUnlocked, "locked": !achievement.isUnlocked }]),
                  onClick: ($event) => $setup.showAchievementDetail(achievement)
                }, [
                  vue.createElementVNode("view", { class: "achievement-icon-container" }, [
                    achievement.achievementIcon ? (vue.openBlock(), vue.createElementBlock("image", {
                      key: 0,
                      src: achievement.achievementIcon,
                      class: "achievement-icon",
                      mode: "aspectFit"
                    }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "achievement-emoji-fallback"
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "achievement-emoji" },
                        vue.toDisplayString(achievement.achievementEmoji),
                        1
                        /* TEXT */
                      )
                    ])),
                    achievement.isUnlocked ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 2,
                      class: "unlock-indicator"
                    }, [
                      vue.createElementVNode("image", {
                        class: "unlock-icon",
                        src: _imports_1,
                        mode: "aspectFit"
                      })
                    ])) : (vue.openBlock(), vue.createElementBlock("view", {
                      key: 3,
                      class: "progress-indicator"
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "progress-text" },
                        vue.toDisplayString(achievement.progress) + "%",
                        1
                        /* TEXT */
                      )
                    ]))
                  ]),
                  vue.createElementVNode("view", { class: "achievement-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "achievement-name" },
                      vue.toDisplayString(achievement.achievementName),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "achievement-desc" },
                      vue.toDisplayString(achievement.achievementDesc),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "progress-container" }, [
                      vue.createElementVNode("view", { class: "progress-bar" }, [
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["progress-fill", { "completed": achievement.isUnlocked }]),
                            style: vue.normalizeStyle({ width: achievement.progress + "%" })
                          },
                          null,
                          6
                          /* CLASS, STYLE */
                        )
                      ]),
                      vue.createElementVNode(
                        "text",
                        { class: "progress-label" },
                        vue.toDisplayString(achievement.progress) + "%",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "reward-container" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "reward-text" },
                        "+" + vue.toDisplayString(achievement.rewardExp),
                        1
                        /* TEXT */
                      )
                    ])
                  ])
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "achievementPopup",
          type: "center",
          "mask-click": false
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "achievement-detail-popup" }, [
              vue.createElementVNode("view", { class: "popup-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "popup-title" },
                  vue.toDisplayString($setup.selectedAchievement && $setup.selectedAchievement.isUnlocked ? `恭喜您已获得了"${$setup.selectedAchievement.achievementName}"` : "您还未解锁该成就"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", {
                  class: "popup-close",
                  onClick: $setup.closeAchievementDetail
                }, "✕")
              ]),
              $setup.selectedAchievement ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "popup-content"
              }, [
                vue.createElementVNode("view", { class: "detail-gif-container" }, [
                  $setup.selectedAchievement.achievementGif ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: $setup.selectedAchievement.achievementGif,
                    class: "detail-gif",
                    mode: "aspectFit"
                  }, null, 8, ["src"])) : $setup.selectedAchievement.achievementIcon ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 1,
                    src: $setup.selectedAchievement.achievementIcon,
                    class: "detail-gif",
                    mode: "aspectFit"
                  }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 2,
                      class: "detail-emoji"
                    },
                    vue.toDisplayString($setup.selectedAchievement.achievementEmoji),
                    1
                    /* TEXT */
                  ))
                ]),
                vue.createElementVNode("view", { class: "detail-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "detail-name" },
                    vue.toDisplayString($setup.selectedAchievement.achievementName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "detail-desc" },
                    vue.toDisplayString($setup.selectedAchievement.achievementDesc),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "detail-progress" }, [
                    vue.createElementVNode("text", { class: "progress-label" }, "进度："),
                    vue.createElementVNode("view", { class: "progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["progress-fill", { "completed": $setup.selectedAchievement.isUnlocked }]),
                          style: vue.normalizeStyle({ width: $setup.selectedAchievement.progress + "%" })
                        },
                        null,
                        6
                        /* CLASS, STYLE */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "progress-value" },
                      vue.toDisplayString($setup.selectedAchievement.progress) + "%",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "detail-reward" }, [
                    vue.createElementVNode("text", { class: "reward-label" }, "奖励经验："),
                    vue.createElementVNode(
                      "text",
                      { class: "reward-value" },
                      "+" + vue.toDisplayString($setup.selectedAchievement.rewardExp),
                      1
                      /* TEXT */
                    )
                  ]),
                  $setup.selectedAchievement.isUnlocked ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "detail-unlock-time"
                  }, [
                    vue.createElementVNode("text", { class: "unlock-label" }, "解锁时间："),
                    vue.createElementVNode(
                      "text",
                      { class: "unlock-value" },
                      vue.toDisplayString($setup.formatTime($setup.selectedAchievement.unlockTime)),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("view", { class: "popup-actions" }, [
                  $setup.selectedAchievement.isUnlocked ? (vue.openBlock(), vue.createElementBlock("button", {
                    key: 0,
                    class: "action-btn primary",
                    "open-type": "share",
                    onClick: $setup.handleShare
                  }, [
                    vue.createElementVNode("text", { class: "btn-icon" }, "🎉"),
                    vue.createElementVNode("text", null, "分享")
                  ])) : (vue.openBlock(), vue.createElementBlock("button", {
                    key: 1,
                    class: "action-btn disabled",
                    disabled: ""
                  }, [
                    vue.createElementVNode("text", { class: "btn-icon" }, "🔒"),
                    vue.createElementVNode("text", null, "未解锁")
                  ])),
                  vue.createElementVNode("button", {
                    class: "action-btn secondary",
                    onClick: $setup.closeAchievementDetail
                  }, " 关闭 ")
                ])
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-spinner" }, [
          vue.createElementVNode("image", {
            class: "loading-img",
            src: _imports_0$4,
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesAchievementAchievement = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-127b3c96"], ["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/pages/achievement/achievement.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/login/index", PagesLoginIndex);
  __definePage("pages/entry/index", PagesEntryIndex);
  __definePage("pages/index/fart", PagesIndexFart);
  __definePage("pages/entry/detail", PagesEntryDetail);
  __definePage("pages/data/index", PagesDataIndex);
  __definePage("pages/entry/creat", PagesEntryCreat);
  __definePage("pages/me/index", PagesMeIndex);
  __definePage("pages/me/jz", PagesMeJz);
  __definePage("pages/me/level", PagesMeLevel);
  __definePage("pages/me/aiFx", PagesMeAiFx);
  __definePage("pages/me/edit", PagesMeEdit);
  __definePage("pages/achievement/achievement", PagesAchievementAchievement);
  const _sfc_main = {
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const handleWxLogin = async () => {
        try {
          formatAppLog("log", "at App.vue:13", "开始微信 code 登录...");
          const loginRes = await uni.login();
          const code2 = loginRes.code;
          formatAppLog("log", "at App.vue:19", "获取到的 code:", code2);
          const { data } = await wxQuickLoginAPI(code2);
          formatAppLog("log", "at App.vue:24", "微信登录结果:", data);
          if (data.code === 0) {
            userStore.setLoginInfo(data.data);
            uni.$emit("loginSuccess");
            formatAppLog("log", "at App.vue:33", "✅ 微信登录成功，已发送 loginSuccess 事件");
          } else {
            formatAppLog("log", "at App.vue:40", "❌ 微信登录失败:", data.msg);
          }
        } catch (error2) {
          formatAppLog("error", "at App.vue:47", "❌ 微信登录异常:", error2);
        }
      };
      const handleSmartLogin = async () => {
        formatAppLog("log", "at App.vue:57", "===== 开始智能登录 =====");
        const savedOpenid = userStore.openid;
        if (savedOpenid) {
          formatAppLog("log", "at App.vue:63", "检测到保存的 openid，尝试快速登录");
          try {
            const { data } = await openidLoginAPI(savedOpenid);
            formatAppLog("log", "at App.vue:69", "openid 登录结果:", data.data);
            if (data.code === 0) {
              userStore.setLoginInfo(data.data);
              uni.$emit("loginSuccess");
              formatAppLog("log", "at App.vue:78", "✅ openid 登录成功，已发送 loginSuccess 事件");
            } else {
              formatAppLog("log", "at App.vue:81", "❌ openid 登录失败:", data.msg);
              await handleWxLogin();
            }
          } catch (error2) {
            formatAppLog("error", "at App.vue:85", "❌ openid 登录异常:", error2);
            await handleWxLogin();
          }
        } else {
          await handleWxLogin();
        }
      };
      onLaunch(() => {
        formatAppLog("log", "at App.vue:101", "App Launch");
        handleSmartLogin();
      });
      onShow(() => {
        formatAppLog("log", "at App.vue:108", "App Show");
      });
      onHide(() => {
        formatAppLog("log", "at App.vue:114", "App Hide");
      });
      const __returned__ = { userStore, handleWxLogin, handleSmartLogin, get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get wxQuickLoginAPI() {
        return wxQuickLoginAPI;
      }, get openidLoginAPI() {
        return openidLoginAPI;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/xiaoqiang/Documents/xmq-pro/gin-vue-admin/break-app/App.vue"]]);
  const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
  const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
  const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
  function jsonParseTransform(key, value) {
    if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
      warnKeyDropped(key);
      return;
    }
    return value;
  }
  function warnKeyDropped(key) {
    console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
  }
  function destr(value, options = {}) {
    if (typeof value !== "string") {
      return value;
    }
    const _value = value.trim();
    if (
      // eslint-disable-next-line unicorn/prefer-at
      value[0] === '"' && value.endsWith('"') && !value.includes("\\")
    ) {
      return _value.slice(1, -1);
    }
    if (_value.length <= 9) {
      const _lval = _value.toLowerCase();
      if (_lval === "true") {
        return true;
      }
      if (_lval === "false") {
        return false;
      }
      if (_lval === "undefined") {
        return void 0;
      }
      if (_lval === "null") {
        return null;
      }
      if (_lval === "nan") {
        return Number.NaN;
      }
      if (_lval === "infinity") {
        return Number.POSITIVE_INFINITY;
      }
      if (_lval === "-infinity") {
        return Number.NEGATIVE_INFINITY;
      }
    }
    if (!JsonSigRx.test(value)) {
      if (options.strict) {
        throw new SyntaxError("[destr] Invalid JSON");
      }
      return value;
    }
    try {
      if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
        if (options.strict) {
          throw new Error("[destr] Possible prototype pollution");
        }
        return JSON.parse(value, jsonParseTransform);
      }
      return JSON.parse(value);
    } catch (error2) {
      if (options.strict) {
        throw error2;
      }
      return value;
    }
  }
  function get(obj, path) {
    if (obj == null)
      return void 0;
    let value = obj;
    for (let i = 0; i < path.length; i++) {
      if (value == null || value[path[i]] == null)
        return void 0;
      value = value[path[i]];
    }
    return value;
  }
  function set(obj, value, path) {
    if (path.length === 0)
      return value;
    const idx = path[0];
    if (path.length > 1) {
      value = set(
        typeof obj !== "object" || obj === null || !Object.prototype.hasOwnProperty.call(obj, idx) ? Number.isInteger(Number(path[1])) ? [] : {} : obj[idx],
        value,
        Array.prototype.slice.call(path, 1)
      );
    }
    if (Number.isInteger(Number(idx)) && Array.isArray(obj))
      return obj.slice()[idx];
    return Object.assign({}, obj, { [idx]: value });
  }
  function unset(obj, path) {
    if (obj == null || path.length === 0)
      return obj;
    if (path.length === 1) {
      if (obj == null)
        return obj;
      if (Number.isInteger(path[0]) && Array.isArray(obj))
        return Array.prototype.slice.call(obj, 0).splice(path[0], 1);
      const result = {};
      for (const p in obj)
        result[p] = obj[p];
      delete result[path[0]];
      return result;
    }
    if (obj[path[0]] == null) {
      if (Number.isInteger(path[0]) && Array.isArray(obj))
        return Array.prototype.concat.call([], obj);
      const result = {};
      for (const p in obj)
        result[p] = obj[p];
      return result;
    }
    return set(
      obj,
      unset(
        obj[path[0]],
        Array.prototype.slice.call(path, 1)
      ),
      [path[0]]
    );
  }
  function deepPickUnsafe(obj, paths) {
    return paths.map((p) => p.split(".")).map((p) => [p, get(obj, p)]).filter((t2) => t2[1] !== void 0).reduce((acc, cur) => set(acc, cur[1], cur[0]), {});
  }
  function deepOmitUnsafe(obj, paths) {
    return paths.map((p) => p.split(".")).reduce((acc, cur) => unset(acc, cur), obj);
  }
  function hydrateStore(store, {
    storage,
    serializer,
    key,
    debug,
    pick,
    omit,
    beforeHydrate,
    afterHydrate
  }, context, runHooks = true) {
    try {
      if (runHooks)
        beforeHydrate == null ? void 0 : beforeHydrate(context);
      const fromStorage = storage.getItem(key);
      if (fromStorage) {
        const deserialized = serializer.deserialize(fromStorage);
        const picked = pick ? deepPickUnsafe(deserialized, pick) : deserialized;
        const omitted = omit ? deepOmitUnsafe(picked, omit) : picked;
        store.$patch(omitted);
      }
      if (runHooks)
        afterHydrate == null ? void 0 : afterHydrate(context);
    } catch (error2) {
      if (debug)
        console.error("[pinia-plugin-persistedstate]", error2);
    }
  }
  function persistState(state, {
    storage,
    serializer,
    key,
    debug,
    pick,
    omit
  }) {
    try {
      const picked = pick ? deepPickUnsafe(state, pick) : state;
      const omitted = omit ? deepOmitUnsafe(picked, omit) : picked;
      const toStorage = serializer.serialize(omitted);
      storage.setItem(key, toStorage);
    } catch (error2) {
      if (debug)
        console.error("[pinia-plugin-persistedstate]", error2);
    }
  }
  function createPersistence(context, optionsParser, auto) {
    const { pinia: pinia2, store, options: { persist = auto } } = context;
    if (!persist)
      return;
    if (!(store.$id in pinia2.state.value)) {
      const originalStore = pinia2._s.get(store.$id.replace("__hot:", ""));
      if (originalStore)
        Promise.resolve().then(() => originalStore.$persist());
      return;
    }
    const persistenceOptions = Array.isArray(persist) ? persist : persist === true ? [{}] : [persist];
    const persistences = persistenceOptions.map(optionsParser);
    store.$hydrate = ({ runHooks = true } = {}) => {
      persistences.forEach((p) => {
        hydrateStore(store, p, context, runHooks);
      });
    };
    store.$persist = () => {
      persistences.forEach((p) => {
        persistState(store.$state, p);
      });
    };
    persistences.forEach((p) => {
      hydrateStore(store, p, context);
      store.$subscribe(
        (_mutation, state) => persistState(state, p),
        { detached: true }
      );
    });
  }
  function createPersistedState(options = {}) {
    return function(context) {
      createPersistence(
        context,
        (p) => ({
          key: (options.key ? options.key : (x) => x)(p.key ?? context.store.$id),
          debug: p.debug ?? options.debug ?? false,
          serializer: p.serializer ?? options.serializer ?? {
            serialize: (data) => JSON.stringify(data),
            deserialize: (data) => destr(data)
          },
          storage: p.storage ?? options.storage ?? window.localStorage,
          beforeHydrate: p.beforeHydrate,
          afterHydrate: p.afterHydrate,
          pick: p.pick,
          omit: p.omit
        }),
        options.auto ?? false
      );
    };
  }
  var src_default = createPersistedState();
  const pinia = createPinia();
  pinia.use(src_default);
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(pinia);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
