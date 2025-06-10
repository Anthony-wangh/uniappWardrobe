"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      newPost: {
        id: "",
        user: "我",
        avatar: "",
        title: "",
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
    this.theme = common_vendor.index.getStorageSync("theme") || this.themes[0];
    const profile = common_vendor.index.getStorageSync("userProfile") || {};
    this.newPost.avatar = profile.avatar || "/static/tabBarIcons/personal.png";
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
    removeImage(index) {
      this.newPost.images.splice(index, 1);
    },
    publishPost() {
      if (!this.newPost.content.trim() && this.newPost.images.length === 0) {
        common_vendor.index.showToast({
          title: "请输入内容或选择图片",
          icon: "none"
        });
        return;
      }
      this.newPost.id = Date.now().toString();
      const posts = common_vendor.index.getStorageSync("posts") || [];
      if (!this.newPost.title) {
        this.newPost.title = this.newPost.content.trim().slice(0, 20);
      }
      posts.unshift({
        ...this.newPost
      });
      common_vendor.index.setStorageSync("posts", posts);
      common_vendor.index.showToast({
        title: "发布成功",
        icon: "success"
      });
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$3,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.f($data.newPost.images, (img, idx, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.removeImage(idx), idx),
        c: idx
      };
    }),
    d: $data.newPost.images.length < 9
  }, $data.newPost.images.length < 9 ? {
    e: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    f: $data.newPost.title,
    g: common_vendor.o(($event) => $data.newPost.title = $event.detail.value),
    h: $data.newPost.content,
    i: common_vendor.o(($event) => $data.newPost.content = $event.detail.value),
    j: common_vendor.o((...args) => $options.publishPost && $options.publishPost(...args)),
    k: $data.theme.primaryColor
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7b9e5360"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/publishPost/publishPost.js.map
