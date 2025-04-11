"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "CategoryPicker",
  props: {
    data: {
      type: Object,
      required: true
    },
    defaultValue: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: "选择分类"
    },
    cancelText: {
      type: String,
      default: "取消"
    },
    confirmText: {
      type: String,
      default: "确定"
    }
  },
  data() {
    return {
      mainList: [],
      subList: [],
      pickerValue: [0, 0],
      showPicker: false
    };
  },
  mounted() {
    this.mainList = Object.keys(this.data);
    const mainIndex = this.defaultValue.length ? this.mainList.indexOf(this.defaultValue[0]) : 0;
    const subOptions = this.data[this.mainList[mainIndex]] || [];
    const subIndex = this.defaultValue.length > 1 ? subOptions.indexOf(this.defaultValue[1]) : 0;
    this.subList = subOptions;
    this.pickerValue = [mainIndex, subIndex];
  },
  methods: {
    open() {
      this.showPicker = true;
    },
    onPickerChange(e) {
      const [mainIndex, subIndex] = e.detail.value;
      if (mainIndex !== this.pickerValue[0]) {
        const newMain = this.mainList[mainIndex];
        const newSubList = this.data[newMain] || [];
        this.subList = newSubList;
        this.pickerValue = [mainIndex, 0];
      } else {
        this.pickerValue = e.detail.value;
      }
    },
    cancel() {
      this.$emit("cancel");
      this.showPicker = false;
    },
    confirm() {
      const [mainIndex, subIndex] = this.pickerValue;
      const main = this.mainList[mainIndex];
      const sub = this.subList[subIndex];
      this.$emit("confirm", { main, sub });
      this.showPicker = false;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showPicker
  }, $data.showPicker ? {
    b: common_vendor.o((...args) => $options.cancel && $options.cancel(...args)),
    c: common_vendor.t($props.cancelText),
    d: common_vendor.o((...args) => $options.cancel && $options.cancel(...args)),
    e: common_vendor.t($props.confirmText),
    f: common_vendor.o((...args) => $options.confirm && $options.confirm(...args)),
    g: common_vendor.f($data.mainList, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index
      };
    }),
    h: common_vendor.f($data.subList, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index
      };
    }),
    i: $data.pickerValue,
    j: common_vendor.o((...args) => $options.onPickerChange && $options.onPickerChange(...args)),
    k: $data.showPicker ? 1 : "",
    l: !$data.showPicker ? 1 : ""
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5c61d442"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/CategoryPickerModal.js.map
