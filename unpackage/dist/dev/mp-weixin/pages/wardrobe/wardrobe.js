"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentMainCategoryIndex: 0,
      categories: ["上衣", "裤子", "鞋", "配饰", "包"],
      subCategories: {
        上衣: ["T恤", "衬衫", "外套", "羽绒服"],
        裤子: ["牛仔裤", "运动裤", "休闲裤", "裙子"],
        鞋: ["运动鞋", "板鞋", "高跟鞋", "靴子"],
        配饰: ["帽子", "眼镜", "丝巾"],
        包: ["单肩包", "双肩包"]
      },
      clothes: [],
      isSubCollapsed: {},
      isEditMode: false,
      selectedClothes: [],
      theme: components_theme.themes[0],
      themes: components_theme.themes
    };
  },
  computed: {
    currentSubCategories() {
      const mainCat = this.categories[this.currentMainCategoryIndex];
      return this.subCategories[mainCat] || [];
    }
  },
  onShow() {
    const saved = common_vendor.index.getStorageSync("theme") || this.themes[0];
    this.theme = saved;
    this.clothes = common_vendor.index.getStorageSync("clothes") || [];
    this.currentSubCategories.forEach((sub) => {
      this.$set(this.isSubCollapsed, sub, false);
    });
  },
  watch: {
    currentMainCategoryIndex() {
      const subCats = this.currentSubCategories;
      this.isSubCollapsed = {};
      subCats.forEach((sub) => {
        this.$set(this.isSubCollapsed, sub, false);
      });
    }
  },
  methods: {
    getTabStyle(id) {
      const base = {
        padding: "10px",
        fontSize: "14px",
        color: this.theme.textColor
      };
      if (id === this.currentMainCategoryIndex) {
        base.color = this.theme.highlightTextColor;
        base.fontWeight = "bold";
      }
      return base;
    },
    selectMainCategory(index) {
      this.currentMainCategoryIndex = index;
    },
    toggleSubCollapse(subCat) {
      this.$set(this.isSubCollapsed, subCat, !this.isSubCollapsed[subCat]);
    },
    getClothesForSub(subCat) {
      const main = this.categories[this.currentMainCategoryIndex];
      return this.clothes.filter((item) => item.primaryCategory === main && item.secondaryCategory === subCat);
    },
    getClothesForMain(mainCat) {
      return this.clothes.filter((item) => item.primaryCategory === mainCat);
    },
    getRows(clothesList) {
      const rows = [];
      for (let i = 0; i < clothesList.length; i += 3) {
        rows.push(clothesList.slice(i, i + 3));
      }
      return rows;
    },
    onFloatingButtonClick() {
      common_vendor.index.navigateTo({
        url: "/pages/addClothes/addClothes"
      });
    },
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      if (this.isEditMode) {
        common_vendor.index.hideTabBar();
      } else {
        common_vendor.index.showTabBar();
        this.selectedClothes = [];
      }
    },
    toggleSelectClothes(item) {
      const index = this.selectedClothes.indexOf(item);
      if (index > -1) {
        this.selectedClothes.splice(index, 1);
      } else {
        this.selectedClothes.push(item);
      }
    },
    deleteSelected() {
      if (this.selectedClothes.length === 0)
        return;
      this.clothes = this.clothes.filter((c) => !this.selectedClothes.includes(c));
      this.selectedClothes = [];
      this.saveClothes();
    },
    matchSelected() {
      if (this.selectedClothes.length <= 0) {
        common_vendor.index.showToast({
          title: "至少选择一件衣物进行搭配",
          icon: "none"
        });
        return;
      }
      const clothesParam = encodeURIComponent(JSON.stringify(this.selectedClothes));
      if (this.isEditMode)
        this.toggleEditMode();
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: `/pages/addMatching/addMatching?clothes=${clothesParam}`
        });
      }, 100);
    },
    saveClothes() {
      common_vendor.index.setStorageSync("clothes", this.clothes);
    },
    getAllItemsWithAdd(subCat) {
      const mainCat = this.categories[this.currentMainCategoryIndex];
      const clothesList = this.clothes.filter((item) => item.primaryCategory === mainCat && item.secondaryCategory === subCat);
      return [{
        isAdd: true,
        primaryCategory: mainCat,
        secondaryCategory: subCat
      }, ...clothesList];
    },
    // 统一添加跳转
    onAddItemClick(item) {
      if (this.isEditMode)
        this.toggleEditMode();
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: `/pages/addClothes/addClothes?primaryCategory=${encodeURIComponent(item.primaryCategory)}&secondaryCategory=${encodeURIComponent(item.secondaryCategory)}`
        });
      }, 100);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.theme.textColor,
    b: common_vendor.t($data.isEditMode ? "完成" : "选择"),
    c: common_vendor.o((...args) => $options.toggleEditMode && $options.toggleEditMode(...args)),
    d: $data.theme.highlightTextColor,
    e: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category),
        b: common_vendor.t($options.getClothesForMain(category).length),
        c: index,
        d: $data.currentMainCategoryIndex === index ? 1 : "",
        e: common_vendor.o(($event) => $options.selectMainCategory(index), index),
        f: common_vendor.s($options.getTabStyle(index))
      };
    }),
    f: `linear-gradient(135deg, ${$data.theme.primaryColor}, ${$data.theme.secondaryColor})`,
    g: common_vendor.f($options.currentSubCategories, (subCat, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(subCat),
        b: common_vendor.t($options.getClothesForSub(subCat).length),
        c: common_vendor.t($data.isSubCollapsed[subCat] ? "展开" : "收起"),
        d: common_vendor.o(($event) => $options.toggleSubCollapse(subCat), subCat),
        e: !$data.isSubCollapsed[subCat]
      }, !$data.isSubCollapsed[subCat] ? common_vendor.e({
        f: $options.getClothesForSub(subCat).length === 0
      }, $options.getClothesForSub(subCat).length === 0 ? {
        g: common_assets._imports_0,
        h: common_vendor.o(($event) => $options.onAddItemClick({
          primaryCategory: $data.categories[$data.currentMainCategoryIndex],
          secondaryCategory: subCat
        }), subCat)
      } : {
        i: common_vendor.f($options.getRows($options.getAllItemsWithAdd(subCat)), (row, rowIndex, i1) => {
          return {
            a: common_vendor.f(row, (item, itemIndex, i2) => {
              return common_vendor.e({
                a: item.isAdd
              }, item.isAdd ? {
                b: common_assets._imports_0
              } : common_vendor.e({
                c: $data.isEditMode
              }, $data.isEditMode ? {
                d: $data.selectedClothes.includes(item) ? "/static/checked.png" : "/static/unChecked.png",
                e: common_vendor.o(($event) => $options.toggleSelectClothes(item), itemIndex)
              } : {}, {
                f: item.image,
                g: common_vendor.t(item.name)
              }), {
                h: itemIndex,
                i: item.isAdd ? 1 : "",
                j: common_vendor.o(($event) => item.isAdd ? $options.onAddItemClick(item) : null, itemIndex)
              });
            }),
            b: rowIndex
          };
        })
      }) : {}, {
        j: subCat
      });
    }),
    h: $data.theme.highlightTextColor,
    i: $data.isEditMode
  }, $data.isEditMode ? {
    j: common_assets._imports_1,
    k: common_vendor.o((...args) => $options.deleteSelected && $options.deleteSelected(...args)),
    l: common_assets._imports_2,
    m: common_vendor.o((...args) => $options.matchSelected && $options.matchSelected(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9e425260"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wardrobe/wardrobe.js.map
