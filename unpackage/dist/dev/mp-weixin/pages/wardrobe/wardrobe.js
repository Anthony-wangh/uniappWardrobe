"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentMainCategoryIndex: 0,
      categoriesMap: {
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
      searchKeyword: "",
      //确定搜索关键词
      selectedSeasons: [],
      allSeasons: ["春", "夏", "秋", "冬"],
      seasonDropdownVisible: false,
      selectSeasonText: "",
      isExpand: false,
      quota: {
        clothesCount: 0,
        outfitsCount: 0,
        clothesQuota: 20,
        outfitsQuota: 5,
        clothesRate: "0%",
        outfitsRate: "0%"
      },
      canAddClothes: true,
      canAddOutfits: true
    };
  },
  computed: {
    categories() {
      return Object.entries(this.categoriesMap).map(([name, subCategories]) => ({
        name,
        subCategories
      }));
    },
    currentSubCategories() {
      const currentMain = this.categories[this.currentMainCategoryIndex];
      return currentMain ? currentMain.subCategories : [];
    }
  },
  onShow() {
    const quo = common_vendor.index.getStorageSync("wardrobeQuota");
    if (quo) {
      this.quota = quo;
    }
    const category = common_vendor.index.getStorageSync("wartrobeCategory");
    if (category) {
      this.categoriesMap = category;
    }
    this.canAddClothes = this.quota.clothesCount < this.quota.clothesQuota;
    this.canAddOutfits = this.quota.outfitsCount < this.quota.outfitsQuota;
    this.clothes = common_vendor.index.getStorageSync("clothes") || [];
    this.categories[this.currentMainCategoryIndex].subCategories.forEach((sub) => {
      this.$set(this.isSubCollapsed, sub, false);
    });
  },
  methods: {
    toggleSeasonDropdown() {
      this.seasonDropdownVisible = !this.seasonDropdownVisible;
    },
    toggleSeason(season) {
      const index = this.selectedSeasons.indexOf(season);
      if (index === -1) {
        this.selectedSeasons.push(season);
      } else {
        this.selectedSeasons.splice(index, 1);
      }
      this.selectSeasonText = this.selectedSeasons.join("，");
    },
    clearSelectSeason() {
      this.selectedSeasons = [];
      this.selectSeasonText = "";
    },
    clickFoldall() {
      this.isExpand = !this.isExpand;
      this.categories.forEach((main) => {
        main.subCategories.forEach((sub) => {
          this.$set(this.isSubCollapsed, sub, this.isExpand);
        });
      });
    },
    selectMainCategory(index) {
      this.currentMainCategoryIndex = index;
    },
    toggleSubCollapse(subCat) {
      this.$set(this.isSubCollapsed, subCat, !this.isSubCollapsed[subCat]);
    },
    getClothesForSub(subCat) {
      const main = this.categories[this.currentMainCategoryIndex].name;
      return this.clothes.filter(
        (item) => item.primaryCategory === main && item.secondaryCategory === subCat && (this.searchKeyword.trim() === "" || item.name.includes(this.searchKeyword.trim())) && (this.selectedSeasons.length === 0 || this.selectedSeasons.some((season) => {
          var _a;
          return (_a = item.seasons) == null ? void 0 : _a.includes(
            season
          );
        }))
      );
    },
    getClothesForMain(mainCat) {
      return this.clothes.filter(
        (item) => item.primaryCategory === mainCat && (this.searchKeyword.trim() === "" || item.name.includes(this.searchKeyword.trim())) && (this.selectedSeasons.length === 0 || this.selectedSeasons.some((season) => {
          var _a;
          return (_a = item.seasons) == null ? void 0 : _a.includes(
            season
          );
        }))
      );
    },
    getRows(clothesList) {
      const rows = [];
      for (let i = 0; i < clothesList.length; i += 2) {
        rows.push(clothesList.slice(i, i + 2));
      }
      return rows;
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
      if (!this.isEditMode)
        return;
      const index = this.selectedClothes.indexOf(item);
      if (index > -1) {
        this.selectedClothes.splice(index, 1);
      } else {
        this.selectedClothes.push(item);
      }
    },
    longPressClothes(item) {
      if (this.isEditMode)
        return;
      this.toggleEditMode();
      this.selectedClothes.push(item);
    },
    deleteSelected() {
      if (this.selectedClothes.length === 0)
        return;
      common_vendor.index.showModal({
        title: "确定删除选中的衣物？",
        content: `删除后将无法找回！`,
        success: (res) => {
          if (res.confirm) {
            this.clothes = this.clothes.filter((c) => !this.selectedClothes.includes(c));
            this.selectedClothes = [];
            this.saveClothes();
            this.quota.clothesCount = this.clothes.length;
            common_vendor.index.setStorageSync("wardrobeQuota", this.quota);
          }
        }
      });
    },
    matchSelected() {
      if (!this.canAddOutfits) {
        common_vendor.index.showToast({
          title: "配额不足",
          icon: "error"
        });
        return;
      }
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
      const mainCat = this.categories[this.currentMainCategoryIndex].name;
      const clothesList = this.clothes.filter((item) => item.primaryCategory === mainCat && item.secondaryCategory === subCat && (this.searchKeyword.trim() === "" || item.name.includes(this.searchKeyword.trim())) && (this.selectedSeasons.length === 0 || this.selectedSeasons.some((season) => {
        var _a;
        return (_a = item.seasons) == null ? void 0 : _a.includes(
          season
        );
      })));
      return [...clothesList];
    },
    onAddItemClick(subCat) {
      if (!this.canAddClothes) {
        common_vendor.index.showToast({
          title: "配额不足",
          icon: "error"
        });
        return;
      }
      if (this.isEditMode)
        this.toggleEditMode();
      const mainCat = this.categories[this.currentMainCategoryIndex].name;
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: `/pages/addClothes/addClothes?primaryCategory=${encodeURIComponent(mainCat)}&secondaryCategory=${encodeURIComponent(subCat)}`
        });
      }, 100);
    }
  }
};
if (!Array) {
  const _component_template = common_vendor.resolveComponent("template");
  _component_template();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$2,
    b: $data.searchKeyword,
    c: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    d: common_vendor.t($data.isEditMode ? "完成" : "管理"),
    e: common_vendor.n($data.isEditMode ? "finish" : "edit"),
    f: $data.isEditMode ? "/static/Fnish.png" : "/static/Edit.png",
    g: common_vendor.n($data.isEditMode ? "finish" : "edit"),
    h: common_vendor.o((...args) => $options.toggleEditMode && $options.toggleEditMode(...args)),
    i: common_vendor.o((...args) => $options.toggleSeasonDropdown && $options.toggleSeasonDropdown(...args)),
    j: common_assets._imports_1$2,
    k: common_vendor.o((...args) => $options.toggleSeasonDropdown && $options.toggleSeasonDropdown(...args)),
    l: $data.selectSeasonText !== ""
  }, $data.selectSeasonText !== "" ? {
    m: common_vendor.t($data.selectSeasonText),
    n: common_vendor.o((...args) => $options.clearSelectSeason && $options.clearSelectSeason(...args))
  } : {}, {
    o: common_vendor.t($data.isExpand ? "全部收起" : "全部展开"),
    p: common_vendor.n($data.isExpand ? "" : "open"),
    q: common_assets._imports_2$1,
    r: common_vendor.o((...args) => $options.clickFoldall && $options.clickFoldall(...args)),
    s: $data.seasonDropdownVisible
  }, $data.seasonDropdownVisible ? {
    t: common_vendor.f($data.allSeasons, (season, k0, i0) => {
      return {
        a: $data.selectedSeasons.includes(season) ? "/static/checked.png" : "/static/unChecked.png",
        b: common_vendor.t(season),
        c: season,
        d: common_vendor.o(($event) => $options.toggleSeason(season), season)
      };
    })
  } : {}, {
    v: common_vendor.f($options.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: common_vendor.t($options.getClothesForMain(category.name).length),
        c: index,
        d: $data.currentMainCategoryIndex === index ? 1 : "",
        e: common_vendor.o(($event) => $options.selectMainCategory(index), index)
      };
    }),
    w: common_vendor.f($options.currentSubCategories, (subCat, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(subCat),
        b: common_vendor.t($options.getClothesForSub(subCat).length),
        c: common_vendor.o(($event) => $options.onAddItemClick(subCat), subCat),
        d: common_vendor.t($data.isSubCollapsed[subCat] ? "收起" : "展开"),
        e: common_vendor.o(($event) => $options.toggleSubCollapse(subCat), subCat),
        f: $data.isSubCollapsed[subCat]
      }, $data.isSubCollapsed[subCat] ? {
        g: common_vendor.f($options.getRows($options.getAllItemsWithAdd(subCat)), (row, rowIndex, i1) => {
          return {
            a: common_vendor.f(row, (item, itemIndex, i2) => {
              return common_vendor.e($data.isEditMode ? {
                a: $data.selectedClothes.includes(item) ? "/static/checked.png" : "/static/unChecked.png"
              } : {}, {
                b: item.image,
                c: common_vendor.t(item.name),
                d: itemIndex,
                e: common_vendor.o(($event) => $options.toggleSelectClothes(item), itemIndex),
                f: common_vendor.o(($event) => $options.longPressClothes(item), itemIndex)
              });
            }),
            b: rowIndex
          };
        }),
        h: $data.isEditMode
      } : {}, {
        i: subCat
      });
    }),
    x: $data.isEditMode
  }, $data.isEditMode ? {
    y: common_assets._imports_3,
    z: common_vendor.o((...args) => $options.deleteSelected && $options.deleteSelected(...args)),
    A: common_assets._imports_4,
    B: common_vendor.o((...args) => $options.matchSelected && $options.matchSelected(...args))
  } : {}, {
    C: common_vendor.o(($event) => $data.seasonDropdownVisible = false)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9e425260"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wardrobe/wardrobe.js.map
