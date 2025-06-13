"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      types: ["功能建议", "缺陷", "操作问题", "体验问题", "其他问题"],
      selectedType: "功能建议",
      description: "",
      contact: ""
    };
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    submitForm() {
      if (!this.description.trim()) {
        return common_vendor.index.showToast({
          title: "请填写问题描述",
          icon: "none"
        });
      }
      const userInfo = common_vendor.index.getStorageSync("wardrobeUserInfo");
      if (!userInfo)
        return;
      common_vendor.index.__f__("log", "at pages/settings/feedback.vue:66", {
        userId: userInfo.openid,
        type: this.selectedType,
        description: this.description,
        contact: this.contact
      });
      const feed = {
        userId: userInfo.openid,
        type: this.selectedType,
        description: this.description,
        contact: this.contact
      };
      this.upload(feed);
    },
    upload(feedBack) {
      common_vendor.er.callFunction({
        name: "feedBack",
        data: {
          feedBack
        }
      }).then((result) => {
        if (result.result.code === 200) {
          common_vendor.index.showToast({
            title: "提交成功",
            icon: "success"
          });
          this.description = "";
          this.contact = "";
          this.selectedType = "功能建议";
        } else {
          common_vendor.index.showToast({
            title: result.result.msg,
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "调用云函数失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/settings/feedback.vue:111", "云函数错误：", err);
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$3,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.f($data.types, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index,
        c: common_vendor.n($data.selectedType === item ? "active" : ""),
        d: common_vendor.o(($event) => $data.selectedType = item, index)
      };
    }),
    d: $data.description,
    e: common_vendor.o(($event) => $data.description = $event.detail.value),
    f: $data.contact,
    g: common_vendor.o(($event) => $data.contact = $event.detail.value),
    h: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d9359076"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/feedback.js.map
