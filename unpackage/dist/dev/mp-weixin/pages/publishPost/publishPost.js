"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
const _sfc_main = {
  data() {
    return {
      newPost: {
        user: "我",
        content: "",
        images: [],
        likeCount: 0,
        commentCount: 0,
        liked: false,
        favorited: false
      },
      theme: components_theme.themes[0],
      themes: components_theme.themes
    };
  },
  onLoad() {
    const saved = common_vendor.index.getStorageSync("theme") || this.themes[0];
    this.theme = saved;
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 9 - this.newPost.images.length,
        success: (res) => {
          this.newPost.images.push(...res.tempFilePaths);
        }
      });
    },
    publishPost() {
      if (!this.newPost.content && this.newPost.images.length === 0) {
        common_vendor.index.showToast({
          title: "请输入内容或选择图片",
          icon: "none"
        });
        return;
      }
      const posts = common_vendor.index.getStorageSync("posts") || [];
      posts.unshift(JSON.parse(JSON.stringify(this.newPost)));
      common_vendor.index.setStorageSync("posts", posts);
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.newPost.content,
    c: common_vendor.o(($event) => $data.newPost.content = $event.detail.value),
    d: common_vendor.f($data.newPost.images, (img, idx, i0) => {
      return {
        a: idx,
        b: img
      };
    }),
    e: $data.newPost.images.length < 9
  }, $data.newPost.images.length < 9 ? {
    f: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    g: common_vendor.o((...args) => $options.publishPost && $options.publishPost(...args)),
    h: $data.theme.primaryColor
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7b9e5360"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/publishPost/publishPost.js.map
