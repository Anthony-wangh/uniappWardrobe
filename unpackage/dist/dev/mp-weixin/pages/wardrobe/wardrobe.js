"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentSeasonIndex: 0,
      seasons: ["全部", "春", "夏", "秋", "冬"],
      currentCategoryIndex: 0,
      categories: [
        {
          name: "全部"
        },
        {
          name: "上衣"
        },
        {
          name: "裤子"
        },
        {
          name: "裙子"
        },
        {
          name: "鞋"
        },
        {
          name: "配饰"
        }
      ],
      clothes: [],
      showModal: false,
      // 控制弹窗显示
      newCategoryName: "",
      // 输入的类目名称
      errorMsg: "",
      // 错误提示
      filteredClothes: [],
      filteredClothesRows: [],
      showDeleteModal: false,
      // 控制删除弹窗
      deleteCategoryIndex: null,
      // 记录要删除的类目索引
      editModel: false,
      wardrobeData: {
        editMode: false
      },
      selectedClothes: []
      // 记录选中的衣物ID
    };
  },
  onShow() {
    const app = getApp();
    this.wardrobeData = app.globalData.wardrobeData;
    if (this.wardrobeData) {
      this.editModel = this.wardrobeData.editMode;
      this.wardrobeData = null;
      if (this.editModel)
        common_vendor.index.hideTabBar();
    }
    this.clothes = common_vendor.index.getStorageSync("clothes") || [];
    const categories = common_vendor.index.getStorageSync("clothesCategories");
    if (categories)
      this.categories = categories;
    this.filteredClothesBycategory();
  },
  methods: {
    filteredClothesBycategory() {
      const selectedSeason = this.seasons[this.currentSeasonIndex];
      const selectedCategory = this.categories[this.currentCategoryIndex].name;
      if (this.clothes.length === 0)
        return;
      if (selectedSeason === "全部" && selectedCategory === "全部") {
        this.filteredClothes = this.clothes;
      } else if (selectedSeason === "全部") {
        this.filteredClothes = this.clothes.filter((cloth) => cloth.secondaryCategory === selectedCategory);
      } else if (selectedCategory === "全部") {
        this.filteredClothes = this.clothes.filter((cloth) => cloth.primaryCategory === selectedSeason);
      } else {
        this.filteredClothes = this.clothes.filter((cloth) => cloth.primaryCategory === selectedSeason && cloth.secondaryCategory === selectedCategory);
      }
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
    selectSeason(index) {
      this.currentSeasonIndex = index;
      this.filteredClothesBycategory();
    },
    selectCategory(index) {
      this.currentCategoryIndex = index;
      this.filteredClothesBycategory();
    },
    // 显示添加类目的弹窗
    showAddCategoryModal() {
      this.showModal = true;
      this.newCategoryName = "";
      this.errorMsg = "";
      common_vendor.index.hideTabBar();
    },
    // 关闭弹窗
    closeModal() {
      this.showModal = false;
      common_vendor.index.showTabBar();
    },
    // 添加类目
    addCategory() {
      const newName = this.newCategoryName.trim();
      if (!newName) {
        this.errorMsg = "类目名称不能为空";
        return;
      }
      if (this.categories.some((cat) => cat.name === newName)) {
        this.errorMsg = "该类目已存在，请输入其他名称";
        return;
      }
      this.categories.push({
        name: newName
      });
      common_vendor.index.setStorageSync("clothesCategories", this.categories);
      this.showModal = false;
      common_vendor.index.showToast({
        title: "添加类目成功！",
        icon: "success"
      });
    },
    onFloatingButtonClick() {
      common_vendor.index.navigateTo({
        url: "/pages/addClothes/addClothes"
      });
    },
    // 询问是否删除类目
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
    // 执行删除操作
    deleteCategory() {
      if (this.deleteCategoryIndex !== null) {
        this.categories.splice(this.deleteCategoryIndex, 1);
        this.currentCategoryIndex = 0;
        this.filteredClothesBycategory();
        common_vendor.index.setStorageSync("clothesCategories", this.categories);
      }
      this.showDeleteModal = false;
      this.deleteCategoryIndex = null;
      common_vendor.index.showToast({
        title: "删除成功",
        icon: "success"
      });
    },
    // 关闭删除弹窗
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteCategoryIndex = null;
    },
    // 进入编辑界面
    editClothes(item) {
      common_vendor.index.navigateTo({
        url: `/pages/addClothes/addClothes?data=${encodeURIComponent(JSON.stringify(item))}`
      });
    },
    longpressClothes(item) {
      common_vendor.index.hideTabBar();
      setTimeout(() => {
        this.editModel = true;
      }, 100);
    },
    cancleEditMode() {
      this.editModel = false;
      common_vendor.index.showTabBar();
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
    a: common_vendor.f($data.seasons, (season, index, i0) => {
      return {
        a: common_vendor.t(season),
        b: index,
        c: $data.currentSeasonIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.selectSeason(index), index),
        e: common_vendor.o(($event) => $options.confirmDeleteCategory(index), index)
      };
    }),
    b: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: index,
        c: $data.currentCategoryIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.selectCategory(index), index),
        e: common_vendor.o(($event) => $options.confirmDeleteCategory(index), index)
      };
    }),
    c: !$data.editModel
  }, !$data.editModel ? {
    d: common_assets._imports_0,
    e: common_vendor.o((...args) => $options.showAddCategoryModal && $options.showAddCategoryModal(...args))
  } : {}, {
    f: $data.filteredClothesRows.length === 0
  }, $data.filteredClothesRows.length === 0 ? {
    g: common_assets._imports_1
  } : {
    h: common_vendor.f($data.filteredClothesRows, (row, rowIndex, i0) => {
      return {
        a: common_vendor.f(row, (item, itemIndex, i1) => {
          return common_vendor.e($data.editModel ? {
            a: item.id,
            b: $data.selectedClothes.includes(item.id),
            c: common_vendor.o(($event) => $options.toggleSelect(item), itemIndex)
          } : {}, {
            d: item.image,
            e: common_vendor.t(item.purchaseDate),
            f: common_vendor.t(item.name),
            g: itemIndex,
            h: common_vendor.o(($event) => $data.editModel ? $options.toggleSelect(item) : $options.editClothes(item), itemIndex),
            i: common_vendor.o(($event) => $options.longpressClothes(item), itemIndex)
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
    i: $data.editModel
  }, {
    j: $data.showModal
  }, $data.showModal ? common_vendor.e({
    k: $data.newCategoryName,
    l: common_vendor.o(($event) => $data.newCategoryName = $event.detail.value),
    m: $data.errorMsg
  }, $data.errorMsg ? {
    n: common_vendor.t($data.errorMsg)
  } : {}, {
    o: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args)),
    p: common_vendor.o((...args) => $options.addCategory && $options.addCategory(...args))
  }) : {}, {
    q: !$data.editModel
  }, !$data.editModel ? {
    r: common_assets._imports_0,
    s: common_vendor.o((...args) => $options.onFloatingButtonClick && $options.onFloatingButtonClick(...args))
  } : {}, {
    t: $data.editModel
  }, $data.editModel ? {
    v: common_assets._imports_2,
    w: common_vendor.o((...args) => $options.cancleEditMode && $options.cancleEditMode(...args)),
    x: common_assets._imports_3,
    y: common_vendor.o((...args) => $options.deleteClothes && $options.deleteClothes(...args)),
    z: common_assets._imports_4,
    A: common_vendor.o((...args) => $options.beginEdit && $options.beginEdit(...args))
  } : {}, {
    B: $data.showDeleteModal
  }, $data.showDeleteModal ? {
    C: common_vendor.o((...args) => $options.closeDeleteModal && $options.closeDeleteModal(...args)),
    D: common_vendor.o((...args) => $options.deleteCategory && $options.deleteCategory(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9e425260"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wardrobe/wardrobe.js.map
