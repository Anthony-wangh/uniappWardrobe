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
      sourceSubCategoryIndex: null
    };
  },
  mounted() {
    for (const key in this.categoriesMap) {
      this.$set(this.collapsed, key, true);
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
          }
        }
      });
      this.dropdownIndex = null;
    },
    openAddCategory() {
      this.modalTitle = "新增主类目";
      this.inputValue = "";
      this.actionType = "addMain";
      this.modalVisible = true;
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
      }
      this.modalVisible = false;
      this.inputValue = "";
    },
    goBack() {
      common_vendor.index.navigateBack();
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
        h: common_assets._imports_2$3,
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
    f: common_vendor.o(($event) => $data.dropdownIndex = null),
    g: common_assets._imports_4$1,
    h: common_vendor.o((...args) => $options.openAddCategory && $options.openAddCategory(...args)),
    i: $data.modalVisible
  }, $data.modalVisible ? {
    j: common_vendor.t($data.modalTitle),
    k: $data.inputValue,
    l: common_vendor.o(($event) => $data.inputValue = $event.detail.value),
    m: common_vendor.o(($event) => $data.modalVisible = false),
    n: common_vendor.o((...args) => $options.confirmModal && $options.confirmModal(...args)),
    o: common_vendor.o(() => {
    }),
    p: common_vendor.o(($event) => $data.modalVisible = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-353de722"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/categorySetting.js.map
