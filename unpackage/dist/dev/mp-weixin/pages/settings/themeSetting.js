"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    var _a;
    return {
      themes: components_theme.themes,
      currentTheme: ((_a = common_vendor.index.getStorageSync("theme")) == null ? void 0 : _a.id) || components_theme.themes[0].id
    };
  },
  methods: {
    selectTheme(item) {
      this.currentTheme = item.id;
      common_vendor.index.setStorageSync("theme", item);
      common_vendor.index.showToast({
        title: `已切换到 ${item.name}`,
        icon: "none"
      });
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
    c: common_vendor.f($data.themes, (item, k0, i0) => {
      return {
        a: `linear-gradient(135deg, ${item.primaryColor}, ${item.secondaryColor})`,
        b: common_vendor.t(item.name),
        c: item.id,
        d: $data.currentTheme === item.id ? 1 : "",
        e: common_vendor.o(($event) => $options.selectTheme(item), item.id)
      };
    }),
    d: common_assets._imports_1$6
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-018933b4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/themeSetting.js.map
