"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const CategoryPicker = () => "../../components/CategoryPickerModal.js";
const _sfc_main = {
  components: {
    CategoryPicker
  },
  data() {
    return {
      statusBarHeight: 0,
      seasons: ["春", "夏", "秋", "冬"],
      form: {
        id: "",
        image: "",
        name: "",
        primaryCategory: "上衣",
        secondaryCategory: "T恤",
        value: "",
        notes: "",
        purchaseDate: "",
        brand: "",
        seasons: []
      },
      categories: {
        上衣: ["T恤", "衬衫", "外套", "羽绒服"],
        裤子: ["牛仔裤", "运动裤", "休闲裤", "裙子"],
        鞋: ["运动鞋", "板鞋", "高跟鞋", "靴子"],
        配饰: ["帽子", "眼镜", "丝巾"],
        包: ["单肩包", "双肩包"]
      },
      errorMsg: "",
      isEdit: false,
      showSubFromgroup: false,
      //显示详细表单项
      cropperSrc: ""
      //裁剪图片路径，底图
    };
  },
  onLoad(options) {
    if (options.primaryCategory && options.secondaryCategory) {
      this.form.primaryCategory = decodeURIComponent(options.primaryCategory);
      this.form.secondaryCategory = decodeURIComponent(options.secondaryCategory);
    }
    this.statusBarHeight = common_vendor.index.getSystemInfoSync().statusBarHeight;
  },
  methods: {
    onok(ev) {
      this.cropperSrc = "";
      this.form.image = ev.path;
    },
    oncancel() {
      this.cropperSrc = "";
    },
    openCategoryPicker() {
      var _a;
      (_a = this.$refs.categoryPicker) == null ? void 0 : _a.open();
    },
    onCategoryConfirm(e) {
      this.form.primaryCategory = e.main;
      this.form.secondaryCategory = e.sub;
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: (res) => {
          this.cropperSrc = res.tempFilePaths[0];
        }
      });
    },
    selectPurchaseDate(e) {
      this.form.purchaseDate = e.detail.value;
    },
    generateUniqueId() {
      return "id_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    toggleSeason(season) {
      const index = this.form.seasons.indexOf(season);
      if (index === -1) {
        this.form.seasons.push(season);
      } else {
        this.form.seasons.splice(index, 1);
      }
    },
    submitForm() {
      if (!this.form.image)
        return this.errorMsg = "请上传衣服图片";
      if (!this.form.name)
        return this.errorMsg = "请输入衣服名称";
      if (!this.form.primaryCategory)
        return this.errorMsg = "请选择一级类目";
      if (!this.form.secondaryCategory)
        return this.errorMsg = "请选择二级类目";
      let clothes = common_vendor.index.getStorageSync("clothes") || [];
      if (this.isEdit) {
        let index = clothes.findIndex((item) => item.id === this.form.id);
        if (index !== -1)
          clothes[index] = this.form;
        else {
          this.form.id = this.generateUniqueId();
          clothes.push(this.form);
        }
      } else {
        this.form.id = this.generateUniqueId();
        clothes.push(this.form);
      }
      common_vendor.index.setStorageSync("clothes", clothes);
      common_vendor.index.showToast({
        title: this.isEdit ? "修改成功" : "上传成功",
        icon: "success"
      });
      this.resetForm();
      setTimeout(() => common_vendor.index.switchTab({
        url: "/pages/wardrobe/wardrobe"
      }), 10);
    },
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
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
if (!Array) {
  const _component_category_picker = common_vendor.resolveComponent("category-picker");
  const _easycom_ksp_cropper2 = common_vendor.resolveComponent("ksp-cropper");
  (_component_category_picker + _easycom_ksp_cropper2)();
}
const _easycom_ksp_cropper = () => "../../uni_modules/ksp-cropper/components/ksp-cropper/ksp-cropper.js";
if (!Math) {
  _easycom_ksp_cropper();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.statusBarHeight + "px",
    b: common_assets._imports_0$3,
    c: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    d: $data.form.image
  }, $data.form.image ? {
    e: $data.form.image
  } : {}, {
    f: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    g: common_vendor.f($data.seasons, (season, k0, i0) => {
      var _a;
      return {
        a: common_vendor.t(season),
        b: season,
        c: common_vendor.n(((_a = $data.form.seasons) == null ? void 0 : _a.includes(season)) ? "selected" : ""),
        d: common_vendor.o(($event) => $options.toggleSeason(season), season)
      };
    }),
    h: common_vendor.t($data.form.primaryCategory && $data.form.secondaryCategory ? $data.form.primaryCategory + " / " + $data.form.secondaryCategory : "请选择类目"),
    i: common_vendor.o((...args) => $options.openCategoryPicker && $options.openCategoryPicker(...args)),
    j: $data.form.name,
    k: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    l: $data.form.notes,
    m: common_vendor.o(($event) => $data.form.notes = $event.detail.value),
    n: common_vendor.t($data.showSubFromgroup ? "收起" : "更多"),
    o: common_vendor.o(($event) => $data.showSubFromgroup = !$data.showSubFromgroup),
    p: $data.showSubFromgroup
  }, $data.showSubFromgroup ? {
    q: common_vendor.t($data.form.purchaseDate || "请选择购买时间"),
    r: common_vendor.o((...args) => $options.selectPurchaseDate && $options.selectPurchaseDate(...args)),
    s: $data.form.value,
    t: common_vendor.o(($event) => $data.form.value = $event.detail.value),
    v: $data.form.brand,
    w: common_vendor.o(($event) => $data.form.brand = $event.detail.value)
  } : {}, {
    x: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    y: $data.errorMsg
  }, $data.errorMsg ? {
    z: common_vendor.t($data.errorMsg)
  } : {}, {
    A: common_vendor.sr("categoryPicker", "f0dbcc2f-0"),
    B: common_vendor.o($options.onCategoryConfirm),
    C: common_vendor.p({
      data: $data.categories,
      defaultValue: [$data.form.primaryCategory, $data.form.secondaryCategory],
      cancelText: "关闭",
      confirmText: "选择"
    }),
    D: $data.cropperSrc !== ""
  }, $data.cropperSrc !== "" ? {
    E: common_vendor.o($options.oncancel),
    F: common_vendor.o($options.onok),
    G: common_vendor.p({
      mode: "free",
      width: 512,
      height: 512,
      maxWidth: 1024,
      maxHeight: 1024,
      url: $data.cropperSrc
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f0dbcc2f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/addClothes/addClothes.js.map
