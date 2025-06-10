"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentMainCategoryIndex: 0,
      categories: [
        {
          name: "上衣",
          subCategories: ["T恤", "衬衫", "外套", "羽绒服"]
        },
        {
          name: "裤子",
          subCategories: ["牛仔裤", "运动裤", "休闲裤", "裙子"]
        },
        {
          name: "鞋",
          subCategories: ["运动鞋", "板鞋", "高跟鞋", "靴子"]
        },
        {
          name: "配饰",
          subCategories: ["帽子", "眼镜", "丝巾"]
        },
        {
          name: "包",
          subCategories: ["单肩包", "双肩包"]
        }
      ],
      clothes: [],
      isSubCollapsed: {},
      isEditMode: false,
      selectedClothes: [],
      theme: components_theme.themes[0],
      themes: components_theme.themes,
      searchKeyword: "",
      //确定搜索关键词
      selectedSeasons: [],
      allSeasons: ["春", "夏", "秋", "冬"],
      seasonDropdownVisible: false,
      selectSeasonText: "",
      isExpand: false
    };
  },
  computed: {
    currentSubCategories() {
      return this.categories[this.currentMainCategoryIndex].subCategories || [];
    }
  },
  onShow() {
    common_vendor.index.setNavigationBarColor({
      frontColor: "#000000",
      backgroundColor: "#ffffff"
    });
    const saved = common_vendor.index.getStorageSync("theme") || this.themes[0];
    this.theme = saved;
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
    getTabStyle(id) {
      const base = {
        padding: "5px",
        fontSize: "16px",
        color: "#1b1b1b"
      };
      if (id === this.currentMainCategoryIndex) {
        base.color = "#8A6FDF";
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
    a: $data.theme.textColor,
    b: common_assets._imports_0$2,
    c: $data.searchKeyword,
    d: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    e: common_vendor.t($data.isEditMode ? "完成" : "管理"),
    f: common_vendor.n($data.isEditMode ? "finish" : "edit"),
    g: $data.isEditMode ? "/static/Fnish.png" : "/static/Edit.png",
    h: common_vendor.n($data.isEditMode ? "finish" : "edit"),
    i: common_vendor.o((...args) => $options.toggleEditMode && $options.toggleEditMode(...args)),
    j: common_vendor.o((...args) => $options.toggleSeasonDropdown && $options.toggleSeasonDropdown(...args)),
    k: common_assets._imports_1$2,
    l: common_vendor.o((...args) => $options.toggleSeasonDropdown && $options.toggleSeasonDropdown(...args)),
    m: $data.selectSeasonText !== ""
  }, $data.selectSeasonText !== "" ? {
    n: common_vendor.t($data.selectSeasonText),
    o: common_vendor.o((...args) => $options.clearSelectSeason && $options.clearSelectSeason(...args))
  } : {}, {
    p: common_vendor.t($data.isExpand ? "全部收起" : "全部展开"),
    q: common_vendor.n($data.isExpand ? "" : "open"),
    r: common_assets._imports_2$1,
    s: common_vendor.o((...args) => $options.clickFoldall && $options.clickFoldall(...args)),
    t: $data.seasonDropdownVisible
  }, $data.seasonDropdownVisible ? {
    v: common_vendor.f($data.allSeasons, (season, k0, i0) => {
      return {
        a: $data.selectedSeasons.includes(season) ? "/static/checked.png" : "/static/unChecked.png",
        b: common_vendor.t(season),
        c: season,
        d: common_vendor.o(($event) => $options.toggleSeason(season), season)
      };
    })
  } : {}, {
    w: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: common_vendor.t($options.getClothesForMain(category.name).length),
        c: index,
        d: $data.currentMainCategoryIndex === index ? 1 : "",
        e: common_vendor.o(($event) => $options.selectMainCategory(index), index)
      };
    }),
    x: common_vendor.f($options.currentSubCategories, (subCat, k0, i0) => {
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
                e: common_vendor.o(($event) => $options.toggleSelectClothes(item), itemIndex)
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
    y: $data.isEditMode
  }, $data.isEditMode ? {
    z: common_assets._imports_3,
    A: common_vendor.o((...args) => $options.deleteSelected && $options.deleteSelected(...args)),
    B: common_assets._imports_4,
    C: common_vendor.o((...args) => $options.matchSelected && $options.matchSelected(...args))
  } : {}, {
    D: common_vendor.o(($event) => $data.seasonDropdownVisible = false)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9e425260"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wardrobe/wardrobe.js.map
