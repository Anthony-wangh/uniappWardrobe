"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      version: "1.0.0",
      updateDate: "2025年6月12日",
      features: [
        "我的衣橱助手全新上线，首个版本尝鲜！",
        "风格可爱的界面，让你爱不释手",
        "上传衣物模块，可以上传本地衣物信息，并进行分类展示",
        "搭配模块，可以使用已经上传的衣物来进行搭配，给你的OOTD提供灵感，并进行分类展示"
      ],
      fixes: []
    };
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$3,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($data.version),
    d: common_vendor.t($data.updateDate),
    e: $data.features.length > 0
  }, $data.features.length > 0 ? {
    f: common_vendor.f($data.features, (item, i, i0) => {
      return {
        a: common_vendor.t(item),
        b: "f" + i
      };
    })
  } : {}, {
    g: $data.fixes.length > 0
  }, $data.fixes.length > 0 ? {
    h: common_vendor.f($data.fixes, (item, i, i0) => {
      return {
        a: common_vendor.t(item),
        b: "x" + i
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e7b2a66e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/about.js.map
