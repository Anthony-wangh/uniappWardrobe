"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      openIndex: null,
      faqList: [
        {
          question: "如何修改头像和名称？",
          answer: "请前往“设置”页中，点击顶部头像或者名称进行修改，可以使用微信头像昵称或者自定义。"
        },
        {
          question: "怎么删除已经上传的衣物和搭配？",
          answer: "在“我的衣橱”或者“我的搭配”页面右上角点击“编辑”按钮，可以进行批量删除或其他操作。"
        },
        {
          question: "使用数据会同步吗？",
          answer: "是的，登录账户后，您的衣服数据和搭配将自动同步至云端。"
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
