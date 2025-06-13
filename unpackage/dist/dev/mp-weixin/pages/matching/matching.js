"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      outfits: [
        {
          icon: "https://cdn.example.com/outfit1.jpg",
          name: "夏日通勤",
          scene: "上班",
          remark: "轻便舒适，适合夏天穿搭"
        },
        {
          icon: "https://cdn.example.com/outfit2.jpg",
          name: "运动套装",
          scene: "健身房",
          remark: "透气速干衣搭配运动鞋"
        }
      ],
      searchKeyword: "",
      isEditMode: false,
      selectedOutfits: [],
      quota: {
        clothesCount: 0,
        outfitsCount: 0,
        clothesQuota: 20,
        outfitsQuota: 5,
        clothesRate: "0%",
        outfitsRate: "0%"
      },
      category: "日常通勤",
      categories: ["日常通勤", "春日出游", "周末约会", "正式场合"]
    };
  },
  computed: {
    filteredOutfits() {
      if (!this.searchKeyword.trim()) {
        return this.outfits.filter(
          (item) => item.category === this.category
        );
      }
      const keyword = this.searchKeyword.toLowerCase();
      return this.outfits.filter(
        (item) => item.name.toLowerCase().includes(keyword) && item.category === this.category
      );
    }
  },
  onShow() {
    this.outfits = common_vendor.index.getStorageSync("outfits") || [];
    const quo = common_vendor.index.getStorageSync("wardrobeQuota");
    if (quo) {
      this.quota = quo;
    }
    const match = common_vendor.index.getStorageSync("matchCategories");
    if (match && Array.isArray(match)) {
      this.categories = match;
      this.category = this.categories[0];
    }
  },
  methods: {
    getTime(time) {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      return `${year}年${month}月${day}日 ${hour}:${minute}`;
    },
    onCategoryChange(e) {
      this.category = this.categories[e.detail.value];
    },
    goAddOutfit() {
      common_vendor.index.navigateTo({
        url: "/pages/addMatching/addMatching"
        // 替换为你的添加页面路径
      });
    },
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      if (this.isEditMode) {
        common_vendor.index.hideTabBar();
      } else {
        common_vendor.index.showTabBar();
        this.selectedOutfits = [];
      }
    },
    toggleSelectOutfit(item) {
      if (!this.isEditMode)
        return;
      const index = this.selectedOutfits.indexOf(item);
      if (index > -1) {
        this.selectedOutfits.splice(index, 1);
      } else {
        this.selectedOutfits.push(item);
      }
    },
    longPressOutfit(item) {
      if (this.isEditMode)
        return;
      this.toggleEditMode();
      this.selectedOutfits.push(item);
    },
    deleteSelected() {
      if (this.selectedOutfits.length === 0)
        return;
      common_vendor.index.showModal({
        title: "确定删除选中的穿搭？",
        content: `删除后将无法找回！`,
        success: (res) => {
          if (res.confirm) {
            this.outfits = this.outfits.filter((c) => !this.selectedOutfits.includes(c));
            this.selectedOutfits = [];
            common_vendor.index.setStorageSync("outfits", this.outfits);
            this.quota.outfitsCount = this.outfits.length;
            common_vendor.index.setStorageSync("wardrobeQuota", this.quota);
          }
        }
      });
    }
  }
};
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
    i: common_vendor.t($data.category),
    j: common_assets._imports_1$3,
    k: $data.categories,
    l: common_vendor.o((...args) => $options.onCategoryChange && $options.onCategoryChange(...args)),
    m: $options.filteredOutfits.length > 0
  }, $options.filteredOutfits.length > 0 ? {
    n: common_vendor.f($options.filteredOutfits, (item, index, i0) => {
      return common_vendor.e($data.isEditMode ? {
        a: $data.selectedOutfits.includes(item) ? "/static/checked.png" : "/static/unChecked.png"
      } : {}, {
        b: item.thumbnail,
        c: common_vendor.t(item.name),
        d: common_vendor.t($options.getTime(item.time)),
        e: index,
        f: common_vendor.o(($event) => $options.toggleSelectOutfit(item), index),
        g: common_vendor.o(($event) => $options.longPressOutfit(item), index)
      });
    }),
    o: $data.isEditMode
  } : {
    p: common_assets._imports_2$2
  }, {
    q: $data.isEditMode
  }, $data.isEditMode ? {
    r: common_assets._imports_3,
    s: common_vendor.o((...args) => $options.deleteSelected && $options.deleteSelected(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5d3d730d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/matching/matching.js.map
