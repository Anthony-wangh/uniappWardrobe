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
      post: {
        images: [],
        user: "",
        avatar: "",
        title: "",
        content: "",
        comments: [],
        commentCount: 0
      },
      liked: false,
      likeCount: 0,
      followed: false,
      theme: components_theme.themes[0],
      popupVisible: false,
      popupMode: "comment",
      // 'comment' or 'reply'
      targetComment: null,
      targetIndex: null
    };
  },
  computed: {
    formattedTime() {
      return (/* @__PURE__ */ new Date()).toLocaleString();
    }
  },
  onLoad({
    id
  }) {
    this.theme = common_vendor.index.getStorageSync("theme") || components_theme.themes[0];
    const all = common_vendor.index.getStorageSync("posts") || [];
    const p = all.find((x) => x.id === id);
    if (p) {
      this.post = p;
      this.liked = p.liked;
      this.likeCount = p.likeCount;
      this.followed = p.followed;
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    onSwipeChange() {
    },
    previewImage(idx) {
      common_vendor.index.previewImage({
        urls: this.post.images,
        current: this.post.images[idx]
      });
    },
    toggleLike() {
      this.liked = !this.liked;
      this.likeCount += this.liked ? 1 : -1;
      this.syncStorage();
    },
    sharePost() {
      common_vendor.index.showToast({
        title: "分享功能待实现",
        icon: "none"
      });
    },
    toggleFollow() {
      this.followed = !this.followed;
      this.syncStorage();
    },
    formatTime(ts) {
      const d = new Date(ts);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    },
    openPopup(mode, comment = null, idx = null) {
      this.popupMode = mode;
      this.targetComment = comment;
      this.targetIndex = idx;
      this.popupVisible = true;
    },
    handlePopupSubmit(text) {
      const userProfile = common_vendor.index.getStorageSync("userProfile") || {};
      const obj = {
        user: "我",
        avatar: userProfile.avatar || "",
        content: text,
        time: Date.now()
      };
      if (this.popupMode === "reply" && this.targetIndex !== null) {
        if (!this.post.comments[this.targetIndex].replies) {
          this.$set(this.post.comments[this.targetIndex], "replies", []);
        }
        this.post.comments[this.targetIndex].replies.push(obj);
      } else {
        if (!this.post.comments)
          this.post.comments = [];
        this.post.comments.unshift(obj);
        this.post.commentCount++;
      }
      this.syncPosts();
    },
    syncStorage() {
      const posts = common_vendor.index.getStorageSync("posts") || [];
      const idx = posts.findIndex((x) => x.id === this.post.id);
      if (idx !== -1) {
        posts[idx].liked = this.liked;
        posts[idx].likeCount = this.likeCount;
        posts[idx].followed = this.followed;
        common_vendor.index.setStorageSync("posts", posts);
      }
    },
    syncPosts() {
      const posts = common_vendor.index.getStorageSync("posts") || [];
      const idx = posts.findIndex((x) => x.id === this.post.id);
      if (idx !== -1) {
        posts[idx] = this.post;
        common_vendor.index.setStorageSync("posts", posts);
      }
    }
  }
};
if (!Array) {
  const _component_comment_input_popup = common_vendor.resolveComponent("comment-input-popup");
  _component_comment_input_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$3,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.post.avatar,
    d: common_vendor.t($data.post.user),
    e: common_vendor.t($data.followed ? "已关注" : "+关注"),
    f: common_vendor.o((...args) => $options.toggleFollow && $options.toggleFollow(...args)),
    g: common_vendor.f($data.post.images, (img, idx, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.previewImage(idx), idx),
        c: idx
      };
    }),
    h: $data.theme.primaryColor,
    i: common_vendor.o((...args) => $options.onSwipeChange && $options.onSwipeChange(...args)),
    j: $data.post.title
  }, $data.post.title ? {
    k: common_vendor.t($data.post.title),
    l: common_vendor.t($data.liked ? "❤️" : "🤍"),
    m: common_vendor.t($data.likeCount),
    n: common_vendor.o((...args) => $options.toggleLike && $options.toggleLike(...args))
  } : {}, {
    o: common_vendor.t($data.post.content),
    p: common_vendor.t($options.formattedTime),
    q: common_vendor.o(($event) => $options.openPopup("comment")),
    r: common_vendor.t($data.post.commentCount),
    s: common_vendor.f($data.post.comments, (comment, idx, i0) => {
      return common_vendor.e({
        a: common_vendor.t(comment.user),
        b: common_vendor.t(comment.content),
        c: common_vendor.t($options.formatTime(comment.time)),
        d: common_vendor.o(($event) => $options.openPopup("reply", comment, idx), idx),
        e: comment.replies
      }, comment.replies ? {
        f: common_vendor.f(comment.replies, (reply, rIdx, i1) => {
          return {
            a: common_vendor.t(reply.user),
            b: common_vendor.t(reply.content),
            c: common_vendor.t($options.formatTime(reply.time)),
            d: rIdx
          };
        })
      } : {}, {
        g: idx
      });
    }),
    t: common_vendor.o((...args) => _ctx.onScroll && _ctx.onScroll(...args)),
    v: common_vendor.o(($event) => $data.popupVisible = $event),
    w: common_vendor.o($options.handlePopupSubmit),
    x: common_vendor.p({
      visible: $data.popupVisible
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-212b7d19"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/PostDetail.js.map
