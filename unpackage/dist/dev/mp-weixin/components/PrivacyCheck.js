"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      isRead: false,
      showPrivacy: false,
      privacyContractName: "",
      resolvePrivacyAuthorization: null
    };
  },
  props: {
    position: {
      type: String,
      default: "center"
    }
  },
  computed: {
    privacyClass() {
      return this.position === "bottom" ? "privacy privacy-bottom" : "privacy";
    },
    contentClass() {
      return this.position === "bottom" ? "content content-bottom" : "content";
    }
  },
  mounted() {
    this.checkPrivacy();
  },
  methods: {
    checkPrivacy() {
      if (common_vendor.wx$1.onNeedPrivacyAuthorization) {
        common_vendor.wx$1.onNeedPrivacyAuthorization((resolve) => {
          this.resolvePrivacyAuthorization = resolve;
        });
      }
      if (common_vendor.wx$1.getPrivacySetting) {
        common_vendor.wx$1.getPrivacySetting({
          success: (res) => {
            if (res.needAuthorization) {
              this.privacyContractName = res.privacyContractName;
              this.showPrivacy = true;
            }
          }
        });
      }
    },
    openPrivacyContract() {
      common_vendor.wx$1.openPrivacyContract({
        success: () => {
          this.isRead = true;
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "遇到错误",
            icon: "error"
          });
        }
      });
    },
    exitMiniProgram() {
      common_vendor.wx$1.exitMiniProgram();
    },
    handleAgreePrivacyAuthorization() {
      this.showPrivacy = false;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showPrivacy
  }, $data.showPrivacy ? {
    b: common_vendor.t($data.privacyContractName),
    c: common_vendor.o((...args) => $options.openPrivacyContract && $options.openPrivacyContract(...args)),
    d: common_vendor.o((...args) => $options.handleAgreePrivacyAuthorization && $options.handleAgreePrivacyAuthorization(...args)),
    e: common_vendor.o((...args) => $options.exitMiniProgram && $options.exitMiniProgram(...args)),
    f: common_vendor.n($options.contentClass),
    g: common_vendor.n($options.privacyClass)
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b77862fd"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/PrivacyCheck.js.map
