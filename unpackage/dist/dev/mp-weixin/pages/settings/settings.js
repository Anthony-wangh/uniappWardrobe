"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const PrivacyCheck = () => "../../components/PrivacyCheck.js";
const _sfc_main = {
  components: {
    PrivacyCheck
  },
  data() {
    return {
      quota: {
        clothesCount: 0,
        outfitsCount: 0,
        clothesQuota: 20,
        outfitsQuota: 5,
        clothesRate: "0%",
        outfitsRate: "0%"
      },
      userInfo: {
        avatarUrl: "/static/tabBarIcons/setting.png",
        nickName: "小明"
      },
      token: "",
      usageTime: 22,
      messages: ["qweqwe", "fffff"],
      pushCount: 10,
      outfits: [],
      clothes: [],
      achievement: {},
      achievements: [
        {
          level: 0,
          name: "搭配实习生"
        },
        {
          level: 6,
          name: "风格萌芽者"
        },
        {
          level: 13,
          name: "潮流探索者"
        },
        {
          level: 22,
          name: "时尚达人"
        },
        {
          level: 35,
          name: "风格掌控者"
        },
        {
          level: 50,
          name: "穿搭设计师"
        },
        {
          level: 68,
          name: "潮流引领者"
        },
        {
          level: 100,
          name: "穿搭艺术家"
        }
      ]
    };
  },
  onShow() {
    this.token = common_vendor.index.getStorageSync("wardrobeToken") || "";
    this.userInfo = common_vendor.index.getStorageSync("wardrobeUserInfo") || {};
    this.outfits = common_vendor.index.getStorageSync("outfits") || [];
    this.clothes = common_vendor.index.getStorageSync("clothes") || [];
    this.updateQuota();
    this.getAchievement();
  },
  methods: {
    updateQuota() {
      let quo = common_vendor.index.getStorageSync("wardrobeQuota");
      if (!quo) {
        quo = this.quota;
        quo.clothesQuota = this.quota.clothesQuota;
        quo.outfitsQuota = this.quota.outfitsQuota;
      }
      quo.clothesCount = this.clothes.length;
      quo.outfitsCount = this.outfits.length;
      quo.clothesRate = (100 * this.clothes.length / this.quota.clothesQuota).toString() + "%";
      quo.outfitsRate = (100 * this.outfits.length / this.quota.outfitsQuota).toString() + "%";
      this.quota = quo;
      common_vendor.index.setStorageSync("wardrobeQuota", quo);
    },
    getAchievement() {
      let index = this.achievements.findLastIndex((c) => this.outfits.length >= c.level);
      index = index < 0 ? 7 : index;
      this.achievement = this.achievements[index];
    },
    userNameInput(e) {
      if (e.detail.value !== this.userInfo.nickName) {
        common_vendor.index.__f__("log", "at pages/settings/settings.vue:188", "修改昵称：" + e.detail.value);
        this.userInfo.nickName = e.detail.value;
        common_vendor.index.setStorageSync("wardrobeUserInfo", this.userInfo);
        this.updateUserInfo();
      }
    },
    // 处理用户选择头像事件
    onChooseAvatar(e) {
      if (this.token === "") {
        return;
      }
      this.uploadImage(e.detail.avatarUrl);
    },
    uploadImage(filePath) {
      common_vendor.er.uploadFile({
        filePath,
        cloudPath: "userIcon/" + this.userInfo._id + ".png"
        // 指定上传到云存储的路径和文件名					
      }).then((res) => {
        this.userInfo.avatarUrl = res.fileID;
        common_vendor.index.setStorageSync("wardrobeUserInfo", this.userInfo);
        this.updateUserInfo();
        common_vendor.index.showToast({
          title: "图片上传成功",
          icon: "success"
        });
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/settings/settings.vue:215", "上传失败：", err);
        common_vendor.index.showToast({
          title: "图片上传失败",
          icon: "error"
        });
      });
    },
    updateUserInfo() {
      common_vendor.er.callFunction({
        name: "updateUserInfo",
        data: {
          openid: this.userInfo.openid,
          userInfo: this.userInfo
        }
      }).then((result) => {
        if (result.result.code === 200) {
          common_vendor.index.showToast({
            title: "修改成功",
            icon: "success"
          });
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
        common_vendor.index.__f__("error", "at pages/settings/settings.vue:248", "云函数错误：", err);
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatarUrl
  }, $data.userInfo.avatarUrl ? {
    b: $data.userInfo.avatarUrl
  } : {}, {
    c: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args)),
    d: $data.userInfo.nickName,
    e: common_vendor.o((...args) => $options.userNameInput && $options.userNameInput(...args)),
    f: common_assets._imports_0$4,
    g: common_vendor.t($data.achievement.name),
    h: common_vendor.t($data.quota.clothesCount + "/" + $data.quota.clothesQuota),
    i: $data.quota.clothesRate.toString(),
    j: common_vendor.t($data.quota.outfitsCount + "/" + $data.quota.outfitsQuota),
    k: $data.quota.outfitsRate.toString(),
    l: common_assets._imports_1$5,
    m: common_assets._imports_2$3,
    n: common_assets._imports_3$1,
    o: common_assets._imports_4$2,
    p: common_assets._imports_5
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7fad0a1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
