"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
const common_assets = require("../../common/assets.js");
const PrivacyCheck = () => "../../components/PrivacyCheck.js";
const _sfc_main = {
  components: {
    PrivacyCheck
  },
  data() {
    return {
      user: {
        avatar: "/static/tabBarIcons/personal.png",
        nickname: "小明"
      },
      usageTime: 22,
      currentTheme: "theme-pure",
      collapsed: true,
      theme: components_theme.themes[0],
      themes: components_theme.themes,
      //天气信息
      weatherInfo: {},
      clothingAdvice: {},
      weatherDetail: "",
      weatherTips: ""
    };
  },
  onShow() {
    const saved = common_vendor.index.getStorageSync("theme") || this.themes[0];
    this.currentTheme = saved.id;
    this.theme = saved;
  },
  methods: {
    toggleList() {
      this.collapsed = !this.collapsed;
    },
    selectTheme(item) {
      this.currentTheme = item.id;
      this.theme = item;
      common_vendor.index.setStorageSync("theme", item);
      common_vendor.index.showToast({
        title: `已切换到 ${item.name}`,
        icon: "none"
      });
    }
  }
};
if (!Array) {
  const _component_transition = common_vendor.resolveComponent("transition");
  const _component_PrivacyCheck = common_vendor.resolveComponent("PrivacyCheck");
  (_component_transition + _component_PrivacyCheck)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.user.avatar,
    b: common_vendor.t($data.user.nickname),
    c: $data.theme.textColor,
    d: common_vendor.t($data.usageTime),
    e: $data.theme.textColor,
    f: `linear-gradient(100deg, ${$data.theme.primaryColor}, ${$data.theme.secondaryColor})`,
    g: !$data.collapsed ? 1 : "",
    h: common_vendor.o((...args) => $options.toggleList && $options.toggleList(...args)),
    i: !$data.collapsed
  }, !$data.collapsed ? {
    j: common_vendor.f($data.themes, (item, k0, i0) => {
      return {
        a: `linear-gradient(135deg, ${item.primaryColor}, ${item.secondaryColor})`,
        b: common_vendor.t(item.name),
        c: item.id,
        d: $data.currentTheme === item.id ? 1 : "",
        e: common_vendor.o(($event) => $options.selectTheme(item), item.id)
      };
    }),
    k: common_assets._imports_0$4
  } : {}, {
    l: common_vendor.p({
      name: "collapse"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7fad0a1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
