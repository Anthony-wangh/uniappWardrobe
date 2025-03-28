"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "ConfirmModal",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "确认删除？"
    },
    message: {
      type: String,
      default: "删除后，该类目下的衣物不会被删除。"
    },
    cancelText: {
      type: String,
      default: "取消"
    },
    confirmText: {
      type: String,
      default: "删除"
    }
  },
  methods: {
    onCancel() {
      this.$emit("cancel");
    },
    onConfirm() {
      this.$emit("confirm");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: common_vendor.t($props.title),
    c: common_vendor.t($props.message),
    d: common_vendor.t($props.cancelText),
    e: common_vendor.o((...args) => $options.onCancel && $options.onCancel(...args)),
    f: common_vendor.t($props.confirmText),
    g: common_vendor.o((...args) => $options.onConfirm && $options.onConfirm(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5d0d13a1"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ConfirmModal.js.map
