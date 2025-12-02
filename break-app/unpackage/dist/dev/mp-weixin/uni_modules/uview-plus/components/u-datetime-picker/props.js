"use strict";
const uni_modules_uviewPlus_libs_vue = require("../../libs/vue.js");
const uni_modules_uviewPlus_libs_config_props = require("../../libs/config/props.js");
const props = uni_modules_uviewPlus_libs_vue.defineMixin({
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
      default: () => uni_modules_uviewPlus_libs_config_props.props.input.inputBorder
    },
    disabled: {
      type: Boolean,
      default: () => uni_modules_uviewPlus_libs_config_props.props.input.disabled
    },
    disabledColor: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.input.disabledColor
    },
    placeholder: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.input.placeholder
    },
    format: {
      type: String,
      default: () => ""
    },
    // 是否打开组件
    show: {
      type: Boolean,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.show
    },
    // 弹出的方向，可选值为 top bottom right left center
    popupMode: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.picker.popupMode
    },
    // 是否展示顶部的操作栏
    showToolbar: {
      type: Boolean,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.showToolbar
    },
    // 工具栏右侧内容
    toolbarRightSlot: {
      type: Boolean,
      default: false
    },
    // 绑定值
    modelValue: {
      type: [String, Number],
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.value
    },
    // 顶部标题
    title: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.title
    },
    // 展示格式，mode=date为日期选择，mode=time为时间选择，mode=year-month为年月选择，mode=datetime为日期时间选择
    mode: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.mode
    },
    // 可选的最大时间
    maxDate: {
      type: Number,
      // 最大默认值为后10年
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.maxDate
    },
    // 可选的最小时间
    minDate: {
      type: Number,
      // 最小默认值为前10年
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.minDate
    },
    // 可选的最小小时，仅mode=time有效
    minHour: {
      type: Number,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.minHour
    },
    // 可选的最大小时，仅mode=time有效
    maxHour: {
      type: Number,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.maxHour
    },
    // 可选的最小分钟，仅mode=time有效
    minMinute: {
      type: Number,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.minMinute
    },
    // 可选的最大分钟，仅mode=time有效
    maxMinute: {
      type: Number,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.maxMinute
    },
    // 选项过滤函数
    filter: {
      type: [Function, null],
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.filter
    },
    // 选项格式化函数
    formatter: {
      type: [Function, null],
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.formatter
    },
    // 是否显示加载中状态
    loading: {
      type: Boolean,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.loading
    },
    // 各列中，单个选项的高度
    itemHeight: {
      type: [String, Number],
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.itemHeight
    },
    // 取消按钮的文字
    cancelText: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.cancelText
    },
    // 确认按钮的文字
    confirmText: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.confirmText
    },
    // 取消按钮的颜色
    cancelColor: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.cancelColor
    },
    // 确认按钮的颜色
    confirmColor: {
      type: String,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.confirmColor
    },
    // 每列中可见选项的数量
    visibleItemCount: {
      type: [String, Number],
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.visibleItemCount
    },
    // 是否允许点击遮罩关闭选择器
    closeOnClickOverlay: {
      type: Boolean,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.closeOnClickOverlay
    },
    // 各列的默认索引
    defaultIndex: {
      type: Array,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.defaultIndex
    },
    // 是否页面内展示
    pageInline: {
      type: Boolean,
      default: () => uni_modules_uviewPlus_libs_config_props.props.datetimePicker.pageInline
    }
  }
});
exports.props = props;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uview-plus/components/u-datetime-picker/props.js.map
