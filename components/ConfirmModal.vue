<template>
  <view class="modal-mask" v-if="visible">
    <view class="modal">
      <text class="modal-title">{{ title }}</text>
      <text class="modal-text">{{ message }}</text>
      <view class="modal-buttons">
        <button class="cancel-btn" @click="onCancel">{{ cancelText }}</button>
        <button class="confirm-btn" @click="onConfirm">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "ConfirmModal",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '确认删除？'
    },
    message: {
      type: String,
      default: '删除后，该类目下的衣物不会被删除。'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '删除'
    }
  },
  methods: {
    onCancel() {
      this.$emit('cancel');
    },
    onConfirm() {
      this.$emit('confirm');
    }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  width: 80%;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  display: flex;
  flex-direction: column;
}
.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}
.modal-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}
.modal-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}
.cancel-btn,
.confirm-btn {
  padding: 0px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.cancel-btn {
  background: #d4d4d4;
  color: #333;
}
.confirm-btn {
  background: #ccd3ff;
  color: white;
}
</style>
