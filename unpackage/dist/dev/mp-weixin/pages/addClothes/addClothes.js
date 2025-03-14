"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      form: {
        id: "",
        //唯一id
        image: "",
        // 选中的图片
        name: "",
        // 衣服名称
        primaryCategory: "",
        // 一级类目
        secondaryCategory: "",
        // 二级类目
        value: "",
        // 价值
        notes: "",
        // 备注
        purchaseDate: "",
        // 购买时间
        brand: ""
        // 品牌
      },
      primaryCategories: ["春", "夏", "秋", "冬"],
      // 一级类目
      secondaryCategories: ["上衣", "裤子", "裙子", "鞋", "配饰"],
      // 二级类目
      errorMsg: ""
      // 错误提示
    };
  },
  methods: {
    // 选择图片
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: (res) => {
          this.form.image = res.tempFilePaths[0];
        }
      });
    },
    // 选择一级类目
    selectPrimaryCategory(e) {
      this.form.primaryCategory = this.primaryCategories[e.detail.value];
    },
    // 选择二级类目
    selectSecondaryCategory(e) {
      this.form.secondaryCategory = this.secondaryCategories[e.detail.value];
    },
    // 选择购买时间
    selectPurchaseDate(e) {
      this.form.purchaseDate = e.detail.value;
    },
    generateUniqueId() {
      return "id_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    // 提交表单
    submitForm() {
      if (!this.form.image) {
        this.errorMsg = "请上传衣服图片";
        return;
      }
      if (!this.form.name) {
        this.errorMsg = "请输入衣服名称";
        return;
      }
      if (!this.form.primaryCategory) {
        this.errorMsg = "请选择一级类目";
        return;
      }
      if (!this.form.secondaryCategory) {
        this.errorMsg = "请选择二级类目";
        return;
      }
      let clothes = common_vendor.index.getStorageSync("clothes") || [];
      this.form.id = this.generateUniqueId();
      clothes.push(this.form);
      common_vendor.index.setStorageSync("clothes", clothes);
      common_vendor.index.showToast({
        title: "上传成功！",
        icon: "success"
      });
      this.resetForm();
      common_vendor.index.navigateBack();
    },
    // 清空表单
    resetForm() {
      this.form = {
        image: "",
        name: "",
        primaryCategory: "",
        secondaryCategory: "",
        value: "",
        notes: "",
        purchaseDate: "",
        brand: ""
      };
      this.errorMsg = "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.form.image
  }, $data.form.image ? {
    b: $data.form.image
  } : {}, {
    c: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    d: $data.form.name,
    e: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    f: common_vendor.t($data.form.primaryCategory || "请选择一级类目（必选）"),
    g: $data.primaryCategories,
    h: common_vendor.o((...args) => $options.selectPrimaryCategory && $options.selectPrimaryCategory(...args)),
    i: common_vendor.t($data.form.secondaryCategory || "请选择二级类目（必选）"),
    j: $data.secondaryCategories,
    k: common_vendor.o((...args) => $options.selectSecondaryCategory && $options.selectSecondaryCategory(...args)),
    l: $data.form.value,
    m: common_vendor.o(($event) => $data.form.value = $event.detail.value),
    n: $data.form.notes,
    o: common_vendor.o(($event) => $data.form.notes = $event.detail.value),
    p: common_vendor.t($data.form.purchaseDate || "请选择购买时间"),
    q: common_vendor.o((...args) => $options.selectPurchaseDate && $options.selectPurchaseDate(...args)),
    r: $data.form.brand,
    s: common_vendor.o(($event) => $data.form.brand = $event.detail.value),
    t: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    v: $data.errorMsg
  }, $data.errorMsg ? {
    w: common_vendor.t($data.errorMsg)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f0dbcc2f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/addClothes/addClothes.js.map
