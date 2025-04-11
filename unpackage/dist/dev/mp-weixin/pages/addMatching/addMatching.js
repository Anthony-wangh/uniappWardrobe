"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const ConfirmModal = () => "../../components/ConfirmModal.js";
const _sfc_main = {
  components: {
    ConfirmModal
  },
  data() {
    return {
      selectedClothes: [
        // 	{
        // 	image: "/static/logo.png",
        // 	x: 50,
        // 	y: 50,
        // 	scale: 1,
        // 	rotation: 0
        // }
      ],
      outfitName: "",
      seasons: ["春", "夏", "秋", "冬"],
      selectedSeason: "请选择季节",
      outfitCategories: ["工作通勤", "正式场合", "运动休闲", "精致约会", "出游"],
      selectedCategory: "请选择类目",
      note: "",
      activeIndex: null,
      startX: 0,
      startY: 0,
      startDistance: null,
      startRotateX: 0,
      startRotateY: 0,
      showDeleteModal: false,
      deleteClothesIndex: null
    };
  },
  onLoad(options) {
    if (options.data) {
      let selectItems = JSON.parse(decodeURIComponent(options.data));
      if (selectItems.length === 0) {
        common_vendor.index.__f__("log", "at pages/addMatching/addMatching.vue:104", "未选中任何衣物！！");
        return;
      }
      const {
        windowWidth,
        windowHeight
      } = common_vendor.index.getSystemInfoSync();
      const cardWidth = 80;
      const cardHeight = 80;
      const safeX = windowWidth - cardWidth;
      const safeY = 320 - cardHeight;
      let clothesItems = [];
      selectItems.forEach((item) => {
        const clothesItem = {
          image: item.image,
          x: (Math.random() - 0.5) * safeX,
          y: (Math.random() - 0.5) * safeY,
          scale: 1,
          rotation: 0
        };
        clothesItems.push(clothesItem);
      });
      this.selectedClothes = clothesItems;
    }
  },
  methods: {
    selectCategory(e) {
      this.selectedCategory = this.outfitCategories[e.detail.value];
    },
    selectSeason(e) {
      this.selectedSeason = this.seasons[e.detail.value];
    },
    getStyle(item) {
      return {
        transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`
      };
    },
    selectClothes(index) {
      this.activeIndex = index;
      common_vendor.index.__f__("log", "at pages/addMatching/addMatching.vue:154", "selectClothes" + index);
    },
    clearSelection() {
      this.activeIndex = null;
    },
    startDrag(index, event) {
      if (this.activeIndex !== index)
        this.activeIndex = index;
      this.startX = event.touches[0].clientX - this.selectedClothes[this.activeIndex].x;
      this.startY = event.touches[0].clientY - this.selectedClothes[this.activeIndex].y;
    },
    handleMove(event) {
      if (this.activeIndex !== null) {
        let x = event.touches[0].clientX - this.startX;
        let y = event.touches[0].clientY - this.startY;
        this.selectedClothes[this.activeIndex].x = x;
        this.selectedClothes[this.activeIndex].y = y;
      }
    },
    startRotate(event) {
      if (this.activeIndex === null)
        return;
      const item = this.selectedClothes[this.activeIndex];
      const query = common_vendor.index.createSelectorQuery().in(this);
      query.select(".clothes-item").boundingClientRect((rect) => {
        if (!rect)
          return;
        this.centerX = rect.left + rect.width / 2;
        this.centerY = rect.top + rect.height / 2;
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        this.startAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);
        this.startRotation = item.rotation;
      }).exec();
    },
    rotateDrag(event) {
      if (this.activeIndex === null)
        return;
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      const currentAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);
      const angleDelta = currentAngle - this.startAngle;
      this.selectedClothes[this.activeIndex].rotation = this.startRotation + angleDelta;
    },
    startResize(event) {
      if (this.activeIndex === null)
        return;
      this.startDistance = Math.hypot(
        event.touches[0].clientX - this.selectedClothes[this.activeIndex].x,
        event.touches[0].clientY - this.selectedClothes[this.activeIndex].y
      );
    },
    resizeDrag(event) {
      if (this.activeIndex === null)
        return;
      const newDistance = Math.hypot(
        event.touches[0].clientX - this.selectedClothes[this.activeIndex].x,
        event.touches[0].clientY - this.selectedClothes[this.activeIndex].y
      );
      let scale = newDistance / this.startDistance;
      scale = Math.max(0.5, Math.min(scale, 2));
      this.selectedClothes[this.activeIndex].scale = scale;
    },
    removeClothes(index) {
      this.deleteClothesIndex = index;
      this.showDeleteModal = true;
    },
    navigateToSelectClothes() {
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteClothesIndex = null;
    },
    deleteConfirm() {
      if (this.deleteClothesIndex === null)
        return;
      this.selectedClothes.splice(this.deleteClothesIndex, 1);
      this.deleteClothesIndex = null;
      this.showDeleteModal = false;
    },
    generateUniqueId() {
      return "id_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    // 	saveOutfit() {
    // 		this.activeIndex = null;
    // 		if (!this.outfitName.trim()) {
    // 			uni.showToast({
    // 				title: "请输入套装名称",
    // 				icon: "none"
    // 			});
    // 			return;
    // 		}
    // 		if (this.selectedSeason === "请选择季节") {
    // 			uni.showToast({
    // 				title: "请选择季节",
    // 				icon: "none"
    // 			});
    // 			return;
    // 		}
    // 		if (this.selectedCategory === "请选择类目") {
    // 			uni.showToast({
    // 				title: "请选择类目",
    // 				icon: "none"
    // 			});
    // 			return;
    // 		}
    // 		//生成缩略图后保存数据
    // 	}
    // },
    async generateThumbnail() {
      return new Promise((resolve, reject) => {
        const ctx = common_vendor.index.createCanvasContext("outfitCanvas", this);
        ctx.setFillStyle("#ffffff");
        ctx.fillRect(0, 0, 300, 300);
        this.selectedClothes.forEach((item) => {
          ctx.save();
          ctx.translate(150 + item.x, 150 + item.y);
          ctx.rotate(item.rotation * Math.PI / 180);
          ctx.scale(item.scale, item.scale);
          ctx.drawImage(item.image, -40, -40, 80, 80);
          ctx.restore();
        });
        ctx.draw(false, () => {
          common_vendor.index.canvasToTempFilePath({
            canvasId: "outfitCanvas",
            success: (res) => resolve(res.tempFilePath),
            fail: (err) => reject(err)
          }, this);
        });
      });
    },
    async saveOutfit() {
      if (!this.outfitName.trim()) {
        common_vendor.index.showToast({
          title: "请输入套装名称",
          icon: "none"
        });
        return;
      }
      if (this.selectedSeason === "请选择季节") {
        common_vendor.index.showToast({
          title: "请选择季节",
          icon: "none"
        });
        return;
      }
      if (this.selectedCategory === "请选择类目") {
        common_vendor.index.showToast({
          title: "请选择类目",
          icon: "none"
        });
        return;
      }
      try {
        const thumbnail = await this.generateThumbnail();
        this.saveToStorage(thumbnail);
      } catch (err) {
        common_vendor.index.showToast({
          title: "缩略图生成失败",
          icon: "none"
        });
      }
    },
    saveToStorage(imagePath) {
      const outfit = {
        id: this.generateUniqueId(),
        name: this.outfitName,
        clothes: this.selectedClothes,
        primaryCategory: this.selectedSeason,
        secondaryCategory: this.selectedCategory,
        note: this.note,
        image: imagePath
      };
      let outfits = common_vendor.index.getStorageSync("outfits") || [];
      outfits.push(outfit);
      common_vendor.index.setStorageSync("outfits", outfits);
      common_vendor.index.showToast({
        title: "套装已保存",
        icon: "success"
      });
      setTimeout(() => {
        common_vendor.index.switchTab({
          url: "/pages/matching/matching"
        });
      }, 100);
    }
  }
};
if (!Array) {
  const _component_confirm_modal = common_vendor.resolveComponent("confirm-modal");
  _component_confirm_modal();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.selectedClothes, (item, index, i0) => {
      return common_vendor.e({
        a: item.image,
        b: $data.activeIndex === index
      }, $data.activeIndex === index ? {
        c: common_assets._imports_0$2,
        d: common_vendor.o(($event) => $options.startRotate($event), index),
        e: common_vendor.o(($event) => $options.rotateDrag($event), index),
        f: common_assets._imports_1$3,
        g: common_vendor.o(($event) => $options.startResize($event), index),
        h: common_vendor.o(($event) => $options.resizeDrag($event), index),
        i: common_vendor.o(($event) => $options.removeClothes(index), index)
      } : {}, {
        j: index,
        k: common_vendor.s($options.getStyle(item)),
        l: common_vendor.o(($event) => $options.startDrag(index, $event), index),
        m: common_vendor.o(($event) => $options.handleMove($event), index)
      });
    }),
    b: $data.selectedClothes.length === 0
  }, $data.selectedClothes.length === 0 ? {} : {}, {
    c: common_vendor.o((...args) => $options.clearSelection && $options.clearSelection(...args)),
    d: common_vendor.o((...args) => $options.navigateToSelectClothes && $options.navigateToSelectClothes(...args)),
    e: $data.outfitName,
    f: common_vendor.o(($event) => $data.outfitName = $event.detail.value),
    g: common_vendor.t($data.selectedSeason),
    h: $data.seasons,
    i: common_vendor.o((...args) => $options.selectSeason && $options.selectSeason(...args)),
    j: common_vendor.t($data.selectedCategory),
    k: $data.outfitCategories,
    l: common_vendor.o((...args) => $options.selectCategory && $options.selectCategory(...args)),
    m: $data.note,
    n: common_vendor.o(($event) => $data.note = $event.detail.value),
    o: common_vendor.o((...args) => $options.saveOutfit && $options.saveOutfit(...args)),
    p: common_vendor.o($options.closeDeleteModal),
    q: common_vendor.o($options.deleteConfirm),
    r: common_vendor.p({
      visible: $data.showDeleteModal,
      title: "确认删除？",
      message: "",
      cancelText: "取消",
      confirmText: "删除"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cfe86fb7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/addMatching/addMatching.js.map
