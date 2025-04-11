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
          name: "工作通勤"
        },
        {
          name: "运动休闲"
        },
        {
          name: "精致约会"
        },
        {
          name: "出游"
        }
      ],
      coordinates: [],
      showModal: false,
      // 控制弹窗显示
      newCategoryName: "",
      // 输入的类目名称
      errorMsg: "",
      // 错误提示
      filteredClothes: [],
      filteredClothesRows: []
    };
  },
  onShow() {
    this.coordinates = common_vendor.index.getStorageSync("outfits") || [];
    const categories = common_vendor.index.getStorageSync("coordinatesCategories");
    if (categories)
      this.categories = categories;
    this.filteredClothesBycategory();
  },
  methods: {
    filteredClothesBycategory() {
      const selectedSeason = this.seasons[this.currentSeasonIndex];
      const selectedCategory = this.categories[this.currentCategoryIndex].name;
      if (this.coordinates.length === 0)
        return;
      if (selectedSeason === "全部" && selectedCategory === "全部") {
        this.filteredClothes = this.coordinates;
      } else if (selectedSeason === "全部") {
        this.filteredClothes = this.coordinates.filter((cloth) => cloth.secondaryCategory === selectedCategory);
      } else if (selectedCategory === "全部") {
        this.filteredClothes = this.coordinates.filter((cloth) => cloth.primaryCategory === selectedSeason);
      } else {
        this.filteredClothes = this.coordinates.filter((cloth) => cloth.primaryCategory === selectedSeason && cloth.secondaryCategory === selectedCategory);
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
        if (tempRow.length === 1 || index === this.filteredClothes.length - 1) {
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
    },
    // 关闭弹窗
    closeModal() {
      this.showModal = false;
    },
    // 添加类目
    addCategory() {
      const newName = this.newCategoryName.trim();
      if (!newName) {
        this.errorMsg = "类目名称不能为空";
        return;
      }
      if (newName.length > 10) {
        this.errorMsg = "不得超过10个字符";
        return;
      }
      if (this.categories.some((cat) => cat.name === newName)) {
        this.errorMsg = "该类目已存在，请输入其他名称";
        return;
      }
      this.categories.push({
        name: newName
      });
      common_vendor.index.setStorageSync("coordinatesCategories", this.categories);
      this.showModal = false;
      common_vendor.index.showToast({
        title: "添加类目成功！",
        icon: "success"
      });
    },
    onFloatingButtonClick() {
      const app = getApp();
      app.globalData.wardrobeData = {
        editMode: true
      };
      common_vendor.index.switchTab({
        url: `/pages/wardrobe/wardrobe`
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
      common_vendor.index.showModal({
        title: "确定要删除？",
        success: (res) => {
          if (res.confirm) {
            this.deleteCategory(index);
          } else if (res.cancel) {
            common_vendor.index.__f__("log", "at pages/matching/matching.vue:226", "用户点击取消");
          }
        }
      });
    },
    // 执行删除操作
    deleteCategory(index) {
      if (index !== null) {
        this.categories.splice(index, 1);
        this.currentCategoryIndex = 0;
        this.filteredClothesBycategory();
        common_vendor.index.setStorageSync("coordinatesCategories", this.categories);
      }
      common_vendor.index.showToast({
        title: "删除成功",
        icon: "success"
      });
    },
    // 进入编辑界面
    editClothes(item) {
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
    c: common_assets._imports_0$1,
    d: common_vendor.o((...args) => $options.showAddCategoryModal && $options.showAddCategoryModal(...args)),
    e: $data.filteredClothesRows.length === 0
  }, $data.filteredClothesRows.length === 0 ? {
    f: common_assets._imports_1$2
  } : {
    g: common_vendor.f($data.filteredClothesRows, (row, rowIndex, i0) => {
      return {
        a: common_vendor.f(row, (item, itemIndex, i1) => {
          return {
            a: item.image,
            b: common_vendor.t(item.name),
            c: itemIndex,
            d: common_vendor.o(($event) => $options.editClothes(item), itemIndex)
          };
        }),
        b: common_vendor.f(1 - ((row == null ? void 0 : row.length) || 0), (n, index, i1) => {
          return {
            a: "placeholder" + index
          };
        }),
        c: rowIndex
      };
    })
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
    o: common_assets._imports_0$1,
    p: common_vendor.o((...args) => $options.onFloatingButtonClick && $options.onFloatingButtonClick(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5d3d730d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/matching/matching.js.map
