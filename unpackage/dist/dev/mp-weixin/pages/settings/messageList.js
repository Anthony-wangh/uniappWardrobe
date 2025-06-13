"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      messages: [
        {
          id: 1,
          title: "欢迎使用衣橱管家！",
          content: "这是您的第一条站内信，感谢您的使用，让我们一起进入精致的生活吧。",
          time: "2025-06-11 10:00",
          read: false,
          expanded: false
        },
        {
          id: 2,
          title: "容量即将用尽",
          content: "您的搭配容量已不足 10%，请及时清理或升级。",
          time: "2025-05-12 18:30",
          read: false,
          expanded: false
        },
        {
          id: 3,
          title: "功能更新通知",
          content: "新增类目编辑功能和主题设置界面，欢迎体验！",
          time: "2025-05-10 14:20",
          read: false,
          expanded: false
        }
      ],
      startX: 0,
      swipedIndex: -1
    };
  },
  methods: {
    toggleExpand(index) {
      const msg = this.messages[index];
      msg.expanded = !msg.expanded;
      if (msg.expanded) {
        msg.read = true;
      }
    },
    markAllAsRead() {
      this.messages.forEach((msg) => msg.read = true);
      common_vendor.index.showToast({
        title: "全部标记为已读",
        icon: "none"
      });
    },
    deleteMessage(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条消息吗？",
        success: (res) => {
          if (res.confirm) {
            this.messages.splice(index, 1);
            this.swipedIndex = -1;
          }
        }
      });
    },
    touchStart(e, index) {
      this.startX = e.touches[0].clientX;
      if (this.swipedIndex !== index) {
        this.swipedIndex = -1;
      }
    },
    touchMove(e, index) {
      const moveX = e.touches[0].clientX;
      const deltaX = this.startX - moveX;
      if (deltaX > 40) {
        this.swipedIndex = index;
      } else if (deltaX < -40) {
        this.swipedIndex = -1;
      }
    },
    touchEnd() {
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
    c: common_vendor.o((...args) => $options.markAllAsRead && $options.markAllAsRead(...args)),
    d: common_vendor.f($data.messages, (msg, index, i0) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => $options.deleteMessage(index), msg.id),
        b: common_vendor.t(msg.title),
        c: !msg.read
      }, !msg.read ? {} : {}, {
        d: common_vendor.t(msg.time),
        e: msg.expanded
      }, msg.expanded ? {
        f: common_vendor.t(msg.content)
      } : {}, {
        g: common_vendor.o(($event) => $options.toggleExpand(index), msg.id),
        h: msg.id,
        i: $data.swipedIndex === index ? 1 : "",
        j: common_vendor.o(($event) => $options.touchStart($event, index), msg.id),
        k: common_vendor.o(($event) => $options.touchMove($event, index), msg.id),
        l: common_vendor.o((...args) => $options.touchEnd && $options.touchEnd(...args), msg.id)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3c07d674"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/messageList.js.map
