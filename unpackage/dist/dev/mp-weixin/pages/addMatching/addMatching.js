"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
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
      note: "",
      activeIndex: null,
      startX: 0,
      startY: 0,
      startDistance: null,
      startRotateX: 0,
      startRotateY: 0
    };
  },
  onLoad(options) {
    if (options.clothes) {
      let selectItems = JSON.parse(decodeURIComponent(options.clothes));
      if (selectItems.length === 0) {
        common_vendor.index.__f__("log", "at pages/addMatching/addMatching.vue:79", "未选中任何衣物！！");
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
    getStyle(item) {
      return {
        transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`
      };
    },
    selectClothes(index) {
      this.activeIndex = index;
    },
    clearSelection() {
      this.activeIndex = null;
    },
    startDrag(index, event) {
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
    startTransform(event) {
      if (this.activeIndex === null)
        return;
      const item = this.selectedClothes[this.activeIndex];
      const query = common_vendor.index.createSelectorQuery().in(this);
      query.select(`#clothesItem${this.activeIndex}`).boundingClientRect((rect) => {
        if (!rect)
          return;
        this.centerX = rect.left + rect.width / 2;
        this.centerY = rect.top + rect.height / 2;
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        this.startAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);
        this.startRotation = item.rotation;
        this.startDistance = Math.hypot(touchX - this.centerX, touchY - this.centerY);
        this.startScale = item.scale;
      }).exec();
    },
    handleTransform(event) {
      if (this.activeIndex === null)
        return;
      const item = this.selectedClothes[this.activeIndex];
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      const currentAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);
      const angleDelta = currentAngle - this.startAngle;
      item.rotation = this.startRotation + angleDelta;
      const currentDistance = Math.hypot(touchX - this.centerX, touchY - this.centerY);
      let scaleRatio = currentDistance / this.startDistance;
      scaleRatio = Math.max(0.5, Math.min(scaleRatio, 2));
      item.scale = this.startScale * scaleRatio;
    },
    removeClothes(index) {
      common_vendor.index.showModal({
        title: "确认删除？",
        // 标题文字，支持字符串或空值
        showCancel: true,
        // 是否显示取消按钮（默认true）
        cancelText: "取消",
        // 取消按钮文字（默认"取消"）
        cancelColor: "#999",
        // 取消按钮文字颜色（默认#000）
        confirmText: "确定",
        // 确认按钮文字（默认"确定"）
        confirmColor: "#212121",
        // 确认按钮颜色（默认#3CC51F）
        success: (res) => {
          if (res.confirm) {
            this.selectedClothes.splice(index, 1);
          }
        }
      });
    },
    generateUniqueId() {
      return "id_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
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
      try {
        const path = await this.generateThumbnail();
        this.saveToStorage(path);
      } catch (err) {
        common_vendor.index.showToast({
          title: "缩略图生成失败",
          icon: "none"
        });
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    getTime() {
      const date = /* @__PURE__ */ new Date();
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    saveToStorage(imagePath) {
      const outfit = {
        id: this.generateUniqueId(),
        name: this.outfitName,
        note: this.note,
        thumbnail: imagePath,
        time: this.getTime()
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$3,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.f($data.selectedClothes, (item, index, i0) => {
      return common_vendor.e({
        a: item.image,
        b: common_vendor.o(($event) => $options.startDrag(index, $event), index),
        c: common_vendor.o(($event) => $options.handleMove($event), index),
        d: $data.activeIndex === index
      }, $data.activeIndex === index ? {
        e: common_assets._imports_1$4,
        f: common_vendor.o(($event) => $options.startTransform($event), index),
        g: common_vendor.o(($event) => $options.handleTransform($event), index),
        h: common_vendor.o(($event) => $options.removeClothes(index), index)
      } : {}, {
        i: index,
        j: "clothesItem" + index,
        k: "clothesItem" + index,
        l: common_vendor.s($options.getStyle(item))
      });
    }),
    d: common_vendor.o((...args) => $options.clearSelection && $options.clearSelection(...args)),
    e: $data.outfitName,
    f: common_vendor.o(($event) => $data.outfitName = $event.detail.value),
    g: $data.note,
    h: common_vendor.o(($event) => $data.note = $event.detail.value),
    i: common_vendor.o((...args) => $options.saveOutfit && $options.saveOutfit(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cfe86fb7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/addMatching/addMatching.js.map
