"use strict";
const common_vendor = require("../../common/vendor.js");
const CategoryPicker = () => "../../components/CategoryPickerModal.js";
const ImageCropper = () => "../../components/nice-cropper/cropper.js";
const _sfc_main = {
  components: {
    CategoryPicker,
    ImageCropper
  },
  data() {
    return {
      statusBarHeight: 0,
      form: {
        id: "",
        image: "",
        name: "",
        primaryCategory: "",
        secondaryCategory: "",
        value: "",
        notes: "",
        purchaseDate: "",
        brand: ""
      },
      categories: {
        "上衣": ["T恤", "衬衫", "外套", "羽绒服"],
        "裤子": ["牛仔裤", "运动裤", "休闲裤", "裙子"],
        "鞋": ["运动鞋", "高跟鞋", "靴子", "皮鞋", "休闲鞋", "拖鞋"],
        "配饰": ["帽子", "眼镜", "丝巾"],
        "包": ["单肩包", "双肩包"]
      },
      errorMsg: "",
      isEdit: false,
      showSubFromgroup: false,
      //显示详细表单项
      cropperSrc: "",
      //裁剪图片路径，底图
      tempCropperSrc: ""
      //缓存裁剪图片，当前裁剪图
    };
  },
  onLoad() {
    this.statusBarHeight = common_vendor.index.getSystemInfoSync().statusBarHeight;
  },
  methods: {
    openCategoryPicker() {
      var _a;
      (_a = this.$refs.categoryPicker) == null ? void 0 : _a.open();
    },
    onCategoryConfirm(e) {
      this.form.primaryCategory = e.main;
      this.form.secondaryCategory = e.sub;
      common_vendor.index.__f__("log", "at pages/addClothes/addClothes.vue:129", "用户选择了：", e);
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
    quitCropper() {
      this.cropperSrc = "";
      this.tempCropperSrc = "";
    },
    comfireCropper() {
      this.cropperSrc = "";
      this.form.image = this.tempCropperSrc;
      this.tempCropperSrc = "";
    },
    beforeDraw(context, transform) {
      context.setFillStyle("yellow");
      transform.zoom = 2;
    },
    afterDraw(ctx, info) {
      common_vendor.index.__f__("log", "at pages/addClothes/addClothes.vue:156", `当前画布大小：${info.width}*${info.height}`);
    },
    cropped(imagePath, imageInfo) {
      common_vendor.index.__f__("log", "at pages/addClothes/addClothes.vue:159", imagePath, imageInfo);
      this.tempCropperSrc = imagePath;
    },
    selectPurchaseDate(e) {
      this.form.purchaseDate = e.detail.value;
    },
    generateUniqueId() {
      return "id_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
      setTimeout(() => common_vendor.index.navigateBack(), 100);
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
    }
  }
};
if (!Array) {
  const _component_category_picker = common_vendor.resolveComponent("category-picker");
  const _component_image_cropper = common_vendor.resolveComponent("image-cropper");
  (_component_category_picker + _component_image_cropper)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.statusBarHeight + "px",
    b: $data.form.image
  }, $data.form.image ? {
    c: $data.form.image
  } : {}, {
    d: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    e: $data.form.name,
    f: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    g: common_vendor.t($data.form.primaryCategory && $data.form.secondaryCategory ? $data.form.primaryCategory + " / " + $data.form.secondaryCategory : "请选择类目（必选）"),
    h: common_vendor.o((...args) => $options.openCategoryPicker && $options.openCategoryPicker(...args)),
    i: $data.form.notes,
    j: common_vendor.o(($event) => $data.form.notes = $event.detail.value),
    k: common_vendor.t($data.showSubFromgroup ? "收起" : "更多"),
    l: common_vendor.o(($event) => $data.showSubFromgroup = !$data.showSubFromgroup),
    m: $data.showSubFromgroup
  }, $data.showSubFromgroup ? {
    n: common_vendor.t($data.form.purchaseDate || "请选择购买时间"),
    o: common_vendor.o((...args) => $options.selectPurchaseDate && $options.selectPurchaseDate(...args)),
    p: $data.form.value,
    q: common_vendor.o(($event) => $data.form.value = $event.detail.value),
    r: $data.form.brand,
    s: common_vendor.o(($event) => $data.form.brand = $event.detail.value)
  } : {}, {
    t: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    v: $data.errorMsg
  }, $data.errorMsg ? {
    w: common_vendor.t($data.errorMsg)
  } : {}, {
    x: common_vendor.sr("categoryPicker", "f0dbcc2f-0"),
    y: common_vendor.o($options.onCategoryConfirm),
    z: common_vendor.p({
      data: $data.categories,
      defaultValue: ["上衣", "T恤"],
      cancelText: "关闭",
      confirmText: "选择"
    }),
    A: $data.cropperSrc !== ""
  }, $data.cropperSrc !== "" ? {
    B: common_vendor.o($options.cropped),
    C: common_vendor.o($options.afterDraw),
    D: common_vendor.o($options.beforeDraw),
    E: common_vendor.p({
      id: "image-cropper",
      zoom: 1,
      angle: 0,
      src: $data.cropperSrc,
      canvasBackground: "red"
    }),
    F: common_vendor.o((...args) => $options.quitCropper && $options.quitCropper(...args)),
    G: common_vendor.o((...args) => $options.comfireCropper && $options.comfireCropper(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f0dbcc2f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/addClothes/addClothes.js.map
