"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isLoggedin: false
    };
  },
  onShow() {
    const token = common_vendor.index.getStorageSync("wardrobeToken") || "";
    this.isLoggedin = token !== "";
  },
  methods: {
    loginClick() {
      if (this.isLoggedin) {
        common_vendor.index.switchTab({
          url: "/pages/main/main"
        });
      } else {
        this.handleLogin();
      }
    },
    handleLogin() {
      common_vendor.index.showLoading({
        title: "登录中...",
        mask: true
        // 防止触摸穿透
      });
      common_vendor.index.getUserProfile({
        desc: "获取您的昵称和头像用于展示",
        // 此描述必填
        success: (userProfileRes) => {
          common_vendor.index.login({
            provider: "weixin",
            success: (loginRes) => {
              if (!loginRes.code) {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "获取 code 失败",
                  icon: "none"
                });
                return;
              }
              common_vendor.er.callFunction({
                name: "login",
                data: {
                  code: loginRes.code,
                  userInfo: userProfileRes.userInfo
                }
              }).then((result) => {
                common_vendor.index.hideLoading();
                if (result.result.code === 200) {
                  common_vendor.index.setStorageSync("wardrobeToken", result.result.data.token);
                  common_vendor.index.setStorageSync("wardrobeOpenid", result.result.data.openid);
                  common_vendor.index.setStorageSync("wardrobeUserInfo", result.result.data.newUserInfo);
                  common_vendor.index.__f__("log", "at pages/login/login.vue:82", result.result.data);
                  const usingDates = this.userInfo ? Math.floor((Date.now() - this.userInfo.createTime) / (1e3 * 60 * 60 * 24)) : 0;
                  common_vendor.index.setStorageSync("wardrobeUsingDates", usingDates);
                  common_vendor.index.showToast({
                    title: "登录成功",
                    icon: "success"
                  });
                  setTimeout(() => {
                    common_vendor.index.switchTab({
                      url: "/pages/main/main"
                    });
                  }, 100);
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
                common_vendor.index.__f__("error", "at pages/login/login.vue:111", "云函数错误：", err);
              });
            },
            fail: (err) => {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "登录失败",
                icon: "none"
              });
              common_vendor.index.__f__("error", "at pages/login/login.vue:120", "uni.login 错误：", err);
            }
          });
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "获取用户信息失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/login/login.vue:130", "getUserProfile 错误：", err);
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_assets._imports_1,
    c: common_vendor.t($data.isLoggedin ? "开启精致生活" : "一键登录"),
    d: common_vendor.o((...args) => $options.loginClick && $options.loginClick(...args)),
    e: common_assets._imports_2
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
