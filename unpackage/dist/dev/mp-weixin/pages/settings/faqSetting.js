"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      openIndex: null,
      faqList: [
        {
          question: "如何更换主题颜色？",
          answer: "请前往“设置”页中的“主题选择”进行切换，切换后将自动保存。"
        },
        {
          question: "如何联系客服？",
          answer: "请在“我的”页面底部点击“联系客服”按钮，我们会在工作时间尽快回复。"
        },
        {
          question: "使用数据会同步吗？",
          answer: "是的，登录账户后，您的搭配和设置将自动同步至云端。"
        }
      ]
    };
  },
  methods: {
    toggleItem(index) {
      this.openIndex = this.openIndex === index ? null : index;
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$3,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.f($data.faqList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.question),
        b: $data.openIndex === index ? 1 : "",
        c: $data.openIndex === index
      }, $data.openIndex === index ? {
        d: common_vendor.t(item.answer)
      } : {}, {
        e: index,
        f: common_vendor.o(($event) => $options.toggleItem(index), index)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-efd317e1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/faqSetting.js.map
