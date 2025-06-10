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
        avatar: "/static/tabBarIcons/setting.png",
        nickname: "小明"
      },
      usageTime: 22,
      theme: components_theme.themes[0],
      themes: components_theme.themes,
      messages: ["qweqwe", "fffff"],
      pushCount: 10
    };
  },
  onShow() {
    common_vendor.index.setNavigationBarColor({
      frontColor: "#000000",
      backgroundColor: "#ffffff"
    });
    const saved = common_vendor.index.getStorageSync("theme") || this.themes[0];
    this.theme = saved;
  },
  methods: {
    openMessage() {
      common_vendor.index.navigateTo({
        url: "/pages/settings/messageList"
      });
    },
    userNameInput(e) {
      common_vendor.index.__f__("log", "at pages/settings/settings.vue:111", "修改昵称：" + e.detail.value);
      this.user.nickname = e.detail.value;
    },
    onChooseAvatar(e) {
      this.user.avatar = e.detail.avatarUrl;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.user.avatar
  }, $data.user.avatar ? {
    b: $data.user.avatar
  } : {}, {
    c: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args)),
    d: $data.user.nickname,
    e: common_vendor.o((...args) => $options.userNameInput && $options.userNameInput(...args)),
    f: common_assets._imports_0$4,
    g: common_assets._imports_1$5,
    h: common_assets._imports_2$2,
    i: common_assets._imports_3$1,
    j: common_assets._imports_4$2
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7fad0a1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
