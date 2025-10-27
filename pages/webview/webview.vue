<!-- pages/webview/webview.vue -->
<template>
  <view class="webview-container">
    <web-view :src="url"></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: ''
    };
  },
  onLoad(options) {
    // 接收传入的文章链接
    this.url = decodeURIComponent(options.url || '');
    if (!this.url) {
      uni.showToast({ title: '文章链接无效', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  }
};
</script>

<style scoped>
.webview-container {
  width: 100%;
  height: 100vh;
}
</style>