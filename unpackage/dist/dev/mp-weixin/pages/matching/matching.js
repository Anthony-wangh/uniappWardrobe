"use strict";
const common_vendor = require("../../common/vendor.js");
const components_theme = require("../../components/theme.js");
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
      theme: components_theme.themes[0],
      themes: components_theme.themes,
      searchKeyword: ""
    };
  },
  computed: {
    filteredOutfits() {
      if (!this.searchKeyword.trim())
        return this.outfits;
      const keyword = this.searchKeyword.toLowerCase();
      return this.outfits.filter(
        (item) => item.name.toLowerCase().includes(keyword)
      );
    },
    getTime() {
      const date = /* @__PURE__ */ new Date();
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
  },
  onShow() {
    const saved = common_vendor.index.getStorageSync("theme") || this.themes[0];
    this.theme = saved;
    this.outfits = common_vendor.index.getStorageSync("outfits") || [];
  },
  methods: {
    goAddOutfit() {
      common_vendor.index.navigateTo({
        url: "/pages/addMatching/addMatching"
        // 替换为你的添加页面路径
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.theme.textColor,
    b: common_assets._imports_0$2,
    c: $data.searchKeyword,
    d: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    e: $options.filteredOutfits.length > 0
  }, $options.filteredOutfits.length > 0 ? {
    f: common_vendor.f($options.filteredOutfits, (item, index, i0) => {
      return {
        a: item.thumbnail,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.time ? item.time : $options.getTime),
        d: index
      };
    })
  } : {
    g: common_assets._imports_1$3
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5d3d730d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/matching/matching.js.map
