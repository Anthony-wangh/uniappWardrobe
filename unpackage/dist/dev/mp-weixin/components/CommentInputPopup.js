"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    visible: Boolean
  },
  data() {
    return {
      text: ""
    };
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    submit() {
      if (this.text.trim()) {
        this.$emit("submit", this.text.trim());
        this.text = "";
        this.close();
      } else {
        common_vendor.index.showToast({ title: "内容不能为空", icon: "none" });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: $data.text,
    c: common_vendor.o(($event) => $data.text = $event.detail.value),
    d: common_vendor.o((...args) => $options.submit && $options.submit(...args)),
    e: common_vendor.o(() => {
    }),
    f: common_vendor.o((...args) => $options.close && $options.close(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7610cfd4"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/CommentInputPopup.js.map
