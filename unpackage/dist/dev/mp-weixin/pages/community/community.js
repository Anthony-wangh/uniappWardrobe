"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
const common_assets = require("../../common/assets.js");
const CommentInputPopup = () => "../../components/CommentInputPopup.js";
const _sfc_main = {
  components: {
    CommentInputPopup
  },
  data() {
    return {
      posts: [],
      isPopupVisible: false,
      currentPost: null,
      currentComment: null,
      theme: components_theme.themes[0],
      themes: components_theme.themes
    };
  },
  onShow() {
    const saved = common_vendor.index.getStorageSync("theme") || this.themes[0];
    this.theme = saved;
    this.posts = common_vendor.index.getStorageSync("posts") || [];
    this.posts.forEach((post) => {
      if (!post.comments)
        post.comments = [];
      post.comments.forEach((comment) => {
        if (!comment.replies)
          comment.replies = [];
      });
    });
  },
  methods: {
    goToPublish() {
      common_vendor.index.navigateTo({
        url: "/pages/publishPost/publishPost"
      });
    },
    toggleLike(post) {
      post.liked = !post.liked;
      post.likeCount += post.liked ? 1 : -1;
      common_vendor.index.setStorageSync("posts", this.posts);
    },
    openComment(post) {
      this.currentPost = post;
      this.currentComment = null;
      this.isPopupVisible = true;
    },
    openReply(post, comment) {
      this.currentPost = post;
      this.currentComment = comment;
      this.isPopupVisible = true;
    },
    handlePopupSubmit(content) {
      if (!content)
        return;
      if (!this.currentPost.comments) {
        this.$set(this.currentPost, "comments", []);
      }
      if (this.currentComment) {
        if (!this.currentComment.replies) {
          this.$set(this.currentComment, "replies", []);
        }
        this.currentComment.replies.push({
          user: "我",
          content
        });
      } else {
        this.currentPost.comments.push({
          user: "我",
          content,
          replies: []
        });
      }
      common_vendor.index.setStorageSync("posts", this.posts);
      this.isPopupVisible = false;
      this.currentPost = null;
      this.currentComment = null;
    },
    previewImages(images, index) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[index]
      });
    }
  }
};
if (!Array) {
  const _component_comment_input_popup = common_vendor.resolveComponent("comment-input-popup");
  _component_comment_input_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.theme.textColor,
    b: `linear-gradient(135deg, ${$data.theme.primaryColor}, ${$data.theme.secondaryColor})`,
    c: common_vendor.f($data.posts, (post, pIndex, i0) => {
      return {
        a: common_vendor.t(post.user),
        b: common_vendor.t(post.content),
        c: common_vendor.f(post.images.slice(0, 9), (img, idx, i1) => {
          return {
            a: img,
            b: idx,
            c: common_vendor.o(($event) => $options.previewImages(post.images, idx), idx)
          };
        }),
        d: common_vendor.f(post.comments, (comment, cIndex, i1) => {
          return {
            a: common_vendor.t(comment.user),
            b: common_vendor.t(comment.content),
            c: common_vendor.o(($event) => $options.openReply(post, comment), cIndex),
            d: common_vendor.f(comment.replies, (reply, rIndex, i2) => {
              return {
                a: common_vendor.t(reply.user),
                b: common_vendor.t(reply.content),
                c: rIndex
              };
            }),
            e: common_vendor.t(comment.user),
            f: cIndex
          };
        }),
        e: common_vendor.t(post.liked ? "❤️" : "🤍"),
        f: common_vendor.t(post.likeCount),
        g: common_vendor.o(($event) => $options.toggleLike(post), pIndex),
        h: common_vendor.o(($event) => $options.openComment(post), pIndex),
        i: pIndex
      };
    }),
    d: common_assets._imports_0$3,
    e: common_vendor.o($options.handlePopupSubmit),
    f: common_vendor.o(($event) => $data.isPopupVisible = false),
    g: common_vendor.p({
      visible: $data.isPopupVisible
    }),
    h: common_assets._imports_1$1,
    i: common_vendor.o((...args) => $options.goToPublish && $options.goToPublish(...args)),
    j: $data.theme.secondaryColor
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
