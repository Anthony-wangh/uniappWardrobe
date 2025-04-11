"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentMainCategoryIndex: 0,
      currentSubCategoryIndex: 0,
      categories: ["上衣", "裤子", "鞋", "配饰", "包"],
      subCategories: {
        上衣: ["全部", "T恤", "衬衫", "外套", "羽绒服"],
        裤子: ["全部", "牛仔裤", "运动裤", "休闲裤", "裙子"],
        鞋: ["全部", "运动鞋", "高跟鞋", "靴子", "皮鞋", "休闲鞋", "拖鞋"],
        配饰: ["全部", "帽子", "眼镜", "丝巾"],
        包: ["全部"]
      },
      clothes: [],
      showModal: false,
      newCategoryName: "",
      errorMsg: "",
      filteredClothes: [],
      filteredClothesRows: [],
      showDeleteModal: false,
      deleteCategoryIndex: null,
      editModel: false,
      selectedClothes: []
    };
  },
  computed: {
    currentSubCategories() {
      return this.subCategories[this.categories[this.currentMainCategoryIndex]] || [];
    }
  },
  onShow() {
    const app = getApp();
    const wardrobeData = app.globalData.wardrobeData || {};
    if (wardrobeData.editMode) {
      this.editModel = true;
      common_vendor.index.hideTabBar();
    }
    this.clothes = common_vendor.index.getStorageSync("clothes") || [];
    const storedCategories = common_vendor.index.getStorageSync("clothesCategories");
    if (storedCategories)
      this.categories = storedCategories;
    this.filteredClothesByCategory();
  },
  methods: {
    filteredClothesByCategory() {
      const main = this.categories[this.currentMainCategoryIndex];
      const sub = this.currentSubCategories[this.currentSubCategoryIndex];
      this.filteredClothes = this.clothes.filter((cloth) => {
        const matchMain = cloth.primaryCategory === main;
        const matchSub = sub === "全部" || cloth.secondaryCategory === sub;
        return matchMain && matchSub;
      });
      this.filteredClothesWithRows();
    },
    filteredClothesWithRows() {
      const rows = [];
      let tempRow = [];
      this.filteredClothes.forEach((item, index) => {
        if (!item)
          return;
        tempRow.push(item);
        if (tempRow.length === 2 || index === this.filteredClothes.length - 1) {
          rows.push([...tempRow]);
          tempRow = [];
        }
      });
      this.filteredClothesRows = rows.filter((row) => row.length > 0);
    },
    selectMainCategory(index) {
      this.currentMainCategoryIndex = index;
      this.currentSubCategoryIndex = 0;
      this.filteredClothesByCategory();
    },
    selectSubCategory(index) {
      this.currentSubCategoryIndex = index;
      this.filteredClothesByCategory();
    },
    showAddCategoryModal() {
      this.showModal = true;
      this.newCategoryName = "";
      this.errorMsg = "";
    },
    closeModal() {
      this.showModal = false;
    },
    addCategory() {
      const newName = this.newCategoryName.trim();
      if (!newName) {
        this.errorMsg = "类目名称不能为空";
        return;
      }
      if (newName.length > 5) {
        this.errorMsg = "不得超过5个字符";
        return;
      }
      if (this.categories.includes(newName)) {
        this.errorMsg = "该类目已存在，请输入其他名称";
        return;
      }
      this.categories.push(newName);
      this.subCategories[newName] = ["全部"];
      common_vendor.index.setStorageSync("clothesCategories", this.categories);
      this.closeModal();
      common_vendor.index.showToast({
        title: "添加类目成功！",
        icon: "success"
      });
    },
    confirmDeleteCategory(index) {
      if (index === 0) {
        common_vendor.index.showToast({
          title: "默认类目不可删除",
          icon: "none"
        });
        return;
      }
      this.deleteCategoryIndex = index;
      this.showDeleteModal = true;
    },
    deleteCategory() {
      if (this.deleteCategoryIndex !== null) {
        const removed = this.categories.splice(this.deleteCategoryIndex, 1)[0];
        delete this.subCategories[removed];
        this.currentMainCategoryIndex = 0;
        this.currentSubCategoryIndex = 0;
        this.filteredClothesByCategory();
        common_vendor.index.setStorageSync("clothesCategories", this.categories);
      }
      this.showDeleteModal = false;
      this.deleteCategoryIndex = null;
      common_vendor.index.showToast({
        title: "删除成功",
        icon: "success"
      });
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteCategoryIndex = null;
    },
    onFloatingButtonClick() {
      common_vendor.index.navigateTo({
        url: "/pages/addClothes/addClothes"
      });
    },
    editClothes(item) {
      common_vendor.index.navigateTo({
        url: `/pages/addClothes/addClothes?data=${encodeURIComponent(JSON.stringify(item))}`
      });
    },
    longpressClothes(item) {
      setTimeout(() => {
        this.editModel = true;
      }, 100);
    },
    cancleEditMode() {
      this.editModel = false;
    },
    beginEdit() {
      if (this.selectedClothes.length === 0) {
        common_vendor.index.showToast({
          title: "请选择衣物",
          icon: "none"
        });
        return;
      }
      this.cancleEditMode();
      const selectedItems = this.clothes.filter((item) => this.selectedClothes.includes(item.id));
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: `/pages/addMatching/addMatching?data=${encodeURIComponent(JSON.stringify(selectedItems))}`
        });
      }, 100);
    },
    deleteClothes() {
      if (this.selectedClothes.length === 0) {
        common_vendor.index.showToast({
          title: "请选择衣物",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确定要删除？",
        content: "确定彻底删除后将无法恢复！",
        success: (res) => {
          if (res.confirm) {
            this.clothes = this.clothes.filter((item) => !this.selectedClothes.includes(item.id));
            this.filteredClothesByCategory();
            this.cancleEditMode();
            common_vendor.index.setStorageSync("clothes", this.clothes);
            common_vendor.index.showToast({
              title: "已删除！",
              icon: "success"
            });
          }
        }
      });
    },
    toggleSelect(item) {
      const index = this.selectedClothes.indexOf(item.id);
      if (index === -1) {
        this.selectedClothes.push(item.id);
      } else {
        this.selectedClothes.splice(index, 1);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category),
        b: index,
        c: $data.currentMainCategoryIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.selectMainCategory(index), index)
      };
    }),
    b: common_vendor.f($options.currentSubCategories, (subCat, index, i0) => {
      return {
        a: common_vendor.t(subCat),
        b: index,
        c: $data.currentSubCategoryIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.selectSubCategory(index), index)
      };
    }),
    c: !$data.editModel
  }, !$data.editModel ? {} : {}, {
    d: $data.filteredClothesRows.length === 0
  }, $data.filteredClothesRows.length === 0 ? {
    e: common_assets._imports_1$2
  } : {
    f: common_vendor.f($data.filteredClothesRows, (row, rowIndex, i0) => {
      return {
        a: common_vendor.f(row, (item, itemIndex, i1) => {
          return common_vendor.e($data.editModel ? {
            a: item.id,
            b: $data.selectedClothes.includes(item.id),
            c: common_vendor.o(($event) => $options.toggleSelect(item), itemIndex)
          } : {}, {
            d: item.image,
            e: common_vendor.t(item.name),
            f: itemIndex,
            g: common_vendor.o(($event) => $data.editModel ? $options.toggleSelect(item) : $options.editClothes(item), itemIndex),
            h: common_vendor.o(($event) => $options.longpressClothes(item), itemIndex)
          });
        }),
        b: common_vendor.f(2 - ((row == null ? void 0 : row.length) || 0), (n, index, i1) => {
          return {
            a: "placeholder" + index
          };
        }),
        c: rowIndex
      };
    }),
    g: $data.editModel
  }, {
    h: $data.showModal
  }, $data.showModal ? common_vendor.e({
    i: $data.newCategoryName,
    j: common_vendor.o(($event) => $data.newCategoryName = $event.detail.value),
    k: $data.errorMsg
  }, $data.errorMsg ? {
    l: common_vendor.t($data.errorMsg)
  } : {}, {
    m: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args)),
    n: common_vendor.o((...args) => $options.addCategory && $options.addCategory(...args))
  }) : {}, {
    o: !$data.editModel
  }, !$data.editModel ? {
    p: common_assets._imports_1$1,
    q: common_vendor.o((...args) => $options.onFloatingButtonClick && $options.onFloatingButtonClick(...args))
  } : {}, {
    r: $data.editModel
  }, $data.editModel ? {
    s: common_assets._imports_2,
    t: common_vendor.o((...args) => $options.cancleEditMode && $options.cancleEditMode(...args)),
    v: common_assets._imports_3,
    w: common_vendor.o((...args) => $options.deleteClothes && $options.deleteClothes(...args)),
    x: common_assets._imports_4,
    y: common_vendor.o((...args) => $options.beginEdit && $options.beginEdit(...args))
  } : {}, {
    z: $data.showDeleteModal
  }, $data.showDeleteModal ? {
    A: common_vendor.o((...args) => $options.closeDeleteModal && $options.closeDeleteModal(...args)),
    B: common_vendor.o((...args) => $options.deleteCategory && $options.deleteCategory(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9e425260"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wardrobe/wardrobe.js.map
