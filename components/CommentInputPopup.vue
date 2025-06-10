<!-- CommentInputPopup.vue -->
<template>
  <view v-if="visible" class="popup-overlay" @click.self="close">
    <view class="popup-container" @click.stop>
      <textarea
        v-model="text"
        class="popup-textarea"
        placeholder="请输入内容..."
        :focus="true"
      ></textarea>
      <button class="popup-button" @click="submit">发送</button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    visible: Boolean,
  },
  data() {
    return {
      text: "",
    };
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    submit() {
      if (this.text.trim()) {
        this.$emit("submit", this.text.trim());
        this.text = "";
        this.close();
      } else {
        uni.showToast({ title: "内容不能为空", icon: "none" });
      }
    },
  },
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.popup-container {
  background-color: #fff;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.popup-textarea {
  width: 100%;
  height: 80px;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  box-sizing: border-box;
  font-size: 14px;
}

.popup-button {
  margin-top: 10px;
  width: 100%;
  height: 36px;
  background-color: #4b5bb4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
}
</style>
