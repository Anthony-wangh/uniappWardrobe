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
      themes: components_theme.themes
    };
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
    b: `linear-gradient(135deg, ${$data.theme.primaryColor}, ${$data.theme.secondaryColor})`,
    c: $data.outfits.length > 0
  }, $data.outfits.length > 0 ? {
    d: common_vendor.f($data.outfits, (item, index, i0) => {
      return {
        a: item.thumbnail,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.note),
        d: index
      };
    })
  } : {
    e: common_assets._imports_0$1
  }, {
    f: common_assets._imports_1$1,
    g: common_vendor.o((...args) => $options.goAddOutfit && $options.goAddOutfit(...args)),
    h: $data.theme.secondaryColor
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5d3d730d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/matching/matching.js.map
