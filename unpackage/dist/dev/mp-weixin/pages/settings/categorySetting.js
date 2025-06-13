"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      categoriesMap: {
        上衣: ["T恤", "衬衫", "外套", "羽绒服"],
        裤子: ["牛仔裤", "运动裤", "休闲裤", "裙子"],
        鞋: ["运动鞋", "板鞋", "高跟鞋", "靴子"],
        配饰: ["帽子", "眼镜", "丝巾"],
        包: ["单肩包", "双肩包"]
      },
      collapsed: {},
      dropdownIndex: null,
      dropdownPosition: {
        top: 0,
        left: 0
      },
      modalVisible: false,
      modalTitle: "",
      inputValue: "",
      actionType: "",
      targetCategory: "",
      sourceSubCategoryIndex: null,
      //搭配类目
      matchCategories: ["日常通勤", "春日出游", "周末约会", "正式场合"]
    };
  },
  onShow() {
    const category = common_vendor.index.getStorageSync("wartrobeCategory");
    if (category) {
      this.categoriesMap = category;
    }
    for (const key in this.categoriesMap) {
      this.$set(this.collapsed, key, true);
    }
    const match = common_vendor.index.getStorageSync("matchCategories");
    if (match && Array.isArray(match)) {
      this.matchCategories = match;
    }
  },
  methods: {
    toggleCollapse(category) {
      this.collapsed[category] = !this.collapsed[category];
    },
    toggleDropdown(index) {
      if (this.dropdownIndex === index) {
        this.dropdownIndex = null;
      } else {
        this.$nextTick(() => {
          const query = common_vendor.index.createSelectorQuery().in(this);
          query.select(`#menu-${index}`).boundingClientRect((rect) => {
            if (rect) {
              this.dropdownPosition = {
                top: rect.top + rect.height,
                left: rect.left - 60
              };
              this.dropdownIndex = index;
            }
          }).exec();
        });
      }
    },
    editCategory(category) {
      this.modalTitle = "修改主类目";
      this.inputValue = category;
      this.actionType = "editMain";
      this.targetCategory = category;
      this.modalVisible = true;
      this.dropdownIndex = null;
    },
    addSubCategory(category) {
      this.modalTitle = `新增“${category}”的子类目`;
      this.inputValue = "";
      this.actionType = "addSub";
      this.targetCategory = category;
      this.modalVisible = true;
      this.dropdownIndex = null;
    },
    deleteCategory(category) {
      common_vendor.index.showModal({
        title: "提示",
        content: `确定删除“${category}”及其子类目？`,
        success: (res) => {
          if (res.confirm) {
            delete this.categoriesMap[category];
            this.save();
          }
        }
      });
      this.dropdownIndex = null;
    },
    openAddCategory() {
      common_vendor.index.showActionSheet({
        itemList: ["新增衣物类目", "新增搭配类目"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.modalTitle = "新增主类目";
            this.actionType = "addMain";
          } else {
            this.modalTitle = "新增搭配类目";
            this.actionType = "addMatch";
          }
          this.inputValue = "";
          this.modalVisible = true;
        }
      });
    },
    editSubCategory(mainCategory, subCategory, index) {
      this.modalTitle = "修改类目";
      this.targetCategory = mainCategory;
      this.inputValue = subCategory;
      this.sourceSubCategoryIndex = index;
      this.actionType = "editSub";
      this.modalVisible = true;
    },
    deleteSubCategory(mainCategory, subCategory, index) {
      common_vendor.index.showModal({
        title: "提示",
        content: `确定删除“${mainCategory}/${subCategory}”类目？`,
        success: (res) => {
          if (res.confirm) {
            const list = this.categoriesMap[mainCategory];
            list.splice(index, 1);
            this.save();
          }
        }
      });
      this.dropdownIndex = null;
    },
    confirmModal() {
      const value = this.inputValue.trim();
      if (!value)
        return common_vendor.index.showToast({
          title: "名称不能为空",
          icon: "none"
        });
      if (this.actionType === "addMain") {
        if (this.categoriesMap[value]) {
          return common_vendor.index.showToast({
            title: "主类目已存在",
            icon: "none"
          });
        }
        this.$set(this.categoriesMap, value, []);
        this.$set(this.collapsed, value, false);
      } else if (this.actionType === "editMain") {
        if (value === this.targetCategory) {
          this.modalVisible = false;
          return;
        }
        if (this.categoriesMap[value]) {
          return common_vendor.index.showToast({
            title: "该类目已存在",
            icon: "none"
          });
        }
        this.$set(this.categoriesMap, value, this.categoriesMap[this.targetCategory]);
        this.$delete(this.categoriesMap, this.targetCategory);
      } else if (this.actionType === "addSub") {
        const list = this.categoriesMap[this.targetCategory];
        if (list.includes(value)) {
          return common_vendor.index.showToast({
            title: "子类目已存在",
            icon: "none"
          });
        }
        list.push(value);
      } else if (this.actionType === "editSub") {
        const sublist = this.categoriesMap[this.targetCategory];
        if (sublist.includes(value) && sublist[this.sourceSubCategoryIndex] !== value) {
          return common_vendor.index.showToast({
            title: "子类目已存在",
            icon: "none"
          });
        }
        sublist[this.sourceSubCategoryIndex] = value;
        this.categoriesMap[this.targetCategory] = sublist;
        this.sourceSubCategoryIndex = null;
      } else if (this.actionType === "editMatch") {
        if (this.matchCategories.includes(value)) {
          return common_vendor.index.showToast({
            title: "搭配类目已存在",
            icon: "none"
          });
        }
        this.matchCategories[this.sourceSubCategoryIndex] = value;
        this.sourceSubCategoryIndex = null;
      } else if (this.actionType === "addMatch") {
        if (this.matchCategories.includes(value)) {
          return common_vendor.index.showToast({
            title: "搭配类目已存在",
            icon: "none"
          });
        }
        this.matchCategories.push(value);
      }
      this.modalVisible = false;
      this.inputValue = "";
      this.save();
    },
    save() {
      common_vendor.index.setStorageSync("wartrobeCategory", this.categoriesMap);
      common_vendor.index.setStorageSync("matchCategories", this.matchCategories);
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    editMatchCategory(index) {
      this.modalTitle = "修改搭配类目";
      this.inputValue = this.matchCategories[index];
      this.actionType = "editMatch";
      this.sourceSubCategoryIndex = index;
      this.modalVisible = true;
    },
    deleteMatchCategory(index) {
      common_vendor.index.showModal({
        title: "提示",
        content: `确定删除“${this.matchCategories[index]}”搭配类目？`,
        success: (res) => {
          if (res.confirm) {
            this.matchCategories.splice(index, 1);
            this.save();
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$3,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.f($data.categoriesMap, (subList, category, index) => {
      return common_vendor.e({
        a: common_vendor.n($data.collapsed[category] ? "" : "open"),
        b: common_vendor.t(category),
        c: "menu-" + index,
        d: common_vendor.o(($event) => $options.toggleDropdown(index), category),
        e: $data.dropdownIndex === index
      }, $data.dropdownIndex === index ? {
        f: common_assets._imports_1$7,
        g: common_vendor.o(($event) => $options.editCategory(category), category),
        h: common_assets._imports_2$4,
        i: common_vendor.o(($event) => $options.addSubCategory(category), category),
        j: common_assets._imports_3$2,
        k: common_vendor.o(($event) => $options.deleteCategory(category), category),
        l: $data.dropdownPosition.top + "px",
        m: $data.dropdownPosition.left + "px"
      } : {}, {
        n: common_vendor.o(($event) => $options.toggleCollapse(category), category),
        o: common_vendor.f(subList, (sub, index2, i1) => {
          return {
            a: common_vendor.t(sub),
            b: common_vendor.o(($event) => $options.editSubCategory(category, sub, index2), index2),
            c: common_vendor.o(($event) => $options.editSubCategory(category, sub, index2), index2),
            d: common_vendor.o(($event) => $options.deleteSubCategory(category, sub, index2), index2),
            e: index2
          };
        }),
        p: !$data.collapsed[category],
        q: category
      });
    }),
    d: common_assets._imports_1$7,
    e: common_assets._imports_3$2,
    f: common_vendor.f($data.matchCategories, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: common_vendor.o(($event) => $options.editMatchCategory(index), index),
        c: common_vendor.o(($event) => $options.deleteMatchCategory(index), index),
        d: index
      };
    }),
    g: common_assets._imports_1$7,
    h: common_assets._imports_3$2,
    i: common_vendor.o(($event) => $data.dropdownIndex = null),
    j: common_assets._imports_4$1,
    k: common_vendor.o((...args) => $options.openAddCategory && $options.openAddCategory(...args)),
    l: $data.modalVisible
  }, $data.modalVisible ? {
    m: common_vendor.t($data.modalTitle),
    n: $data.inputValue,
    o: common_vendor.o(($event) => $data.inputValue = $event.detail.value),
    p: common_vendor.o(($event) => $data.modalVisible = false),
    q: common_vendor.o((...args) => $options.confirmModal && $options.confirmModal(...args)),
    r: common_vendor.o(() => {
    }),
    s: common_vendor.o(($event) => $data.modalVisible = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-353de722"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/categorySetting.js.map
