"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      posts: [],
      theme: components_theme.themes[0],
      themes: components_theme.themes
    };
  },
  onShow() {
    this.theme = common_vendor.index.getStorageSync("theme") || this.themes[0];
    this.posts = (common_vendor.index.getStorageSync("posts") || []).map((post, i) => ({
      id: post.id || i,
      title: post.title || "无标题",
      user: post.user,
      avatar: post.avatar || "/static/tabBarIcons/personal.png",
      images: post.images || [],
      likeCount: post.likeCount || 0
    }));
  },
  methods: {
    goToPublish() {
      common_vendor.index.navigateTo({
        url: "/pages/publishPost/publishPost"
      });
    },
    goToDetail(post) {
      common_vendor.index.navigateTo({
        url: `/pages/community/PostDetail?id=${post.id}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.theme.textColor,
    b: `linear-gradient(135deg, ${$data.theme.primaryColor}, ${$data.theme.secondaryColor})`,
    c: common_vendor.f($data.posts, (post, index, i0) => {
      return {
        a: post.images[0],
        b: common_vendor.t(post.title),
        c: post.avatar,
        d: common_vendor.t(post.user),
        e: common_vendor.t(post.likeCount),
        f: post.id || index,
        g: common_vendor.o(($event) => $options.goToDetail(post), post.id || index)
      };
    }),
    d: common_assets._imports_4$1,
    e: common_vendor.o((...args) => $options.goToPublish && $options.goToPublish(...args)),
    f: $data.theme.primaryColor
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
