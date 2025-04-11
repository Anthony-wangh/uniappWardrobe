<template>
	<view class="overlay" v-if="showPicker">
		<view class="mask" @click="cancel"></view>

		<view class="picker-wrapper" :class="{ 'picker-wrapper-show': showPicker, 'picker-wrapper-hide': !showPicker }">
			<view class="picker-header">
				<text class="cancel" @click="cancel">{{ cancelText }}</text>
				<text class="confirm" @click="confirm">{{ confirmText }}</text>
			</view>

			<picker-view :value="pickerValue" @change="onPickerChange" indicator-style="height: 50px;"
				class="picker-view">
				<picker-view-column>
					<view v-for="(item, index) in mainList" :key="index" class="picker-item">{{ item }}</view>
				</picker-view-column>

				<picker-view-column>
					<view v-for="(item, index) in subList" :key="index" class="picker-item">{{ item }}</view>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'CategoryPicker',
		props: {
			data: {
				type: Object,
				required: true
			},
			defaultValue: {
				type: Array,
				default: () => []
			},
			title: {
				type: String,
				default: '选择分类'
			},
			cancelText: {
				type: String,
				default: '取消'
			},
			confirmText: {
				type: String,
				default: '确定'
			}
		},
		data() {
			return {
				mainList: [],
				subList: [],
				pickerValue: [0, 0],
				showPicker: false
			};
		},
		mounted() {
			this.mainList = Object.keys(this.data);

			const mainIndex = this.defaultValue.length ? 
				this.mainList.indexOf(this.defaultValue[0]) : 
				0;

			const subOptions = this.data[this.mainList[mainIndex]] || [];

			const subIndex = this.defaultValue.length > 1 ?
				subOptions.indexOf(this.defaultValue[1]) : 
				0;

			this.subList = subOptions;
			this.pickerValue = [mainIndex, subIndex];
		},
		methods: {
			open() {
				this.showPicker = true;
			},
			onPickerChange(e) {
				const [mainIndex, subIndex] = e.detail.value;

				if (mainIndex !== this.pickerValue[0]) {
					const newMain = this.mainList[mainIndex];
					const newSubList = this.data[newMain] || [];
					this.subList = newSubList;
					this.pickerValue = [mainIndex, 0];
				} else {
					this.pickerValue = e.detail.value;
				}
			},
			cancel() {
				this.$emit('cancel');
				this.showPicker = false; // 关闭 picker
			},
			confirm() {
				const [mainIndex, subIndex] = this.pickerValue;
				const main = this.mainList[mainIndex];
				const sub = this.subList[subIndex];
				this.$emit('confirm', { main, sub });
				this.showPicker = false; // 关闭 picker
			}
		}
	}
</script>

<style scoped>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		background-color: rgba(0, 0, 0, 0.5);
		/* 背景遮罩 */
	}

	.mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 998;
	}

	.picker-wrapper {
		width: 100%;
		background-color: #fff;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		z-index: 999;
		position: relative;
		transition: transform 0.3s ease-out;
		transform: translateY(100%); /* 初始位置在屏幕外 */
	}

	.picker-wrapper-show {
		transform: translateY(0); /* 显示时从下方滑入 */
	}

	.picker-wrapper-hide {
		transform: translateY(100%); /* 隐藏时滑出屏幕 */
	}

	.picker-header {
		display: flex;
		justify-content: space-between;
		padding: 15px 20px;
		font-size: 18px;
		background-color: #f8f8f8;
		border-bottom: 1px solid #ddd;
	}

	.cancel{
		font-size: 18px;
		color: #434343;
	}
	.confirm {
		font-size: 18px;
		color: #9ca1d3;
	}

	.picker-view {
		width: 100%;
		height: 200px;
	}

	.picker-item {
		height: 50px;
		line-height: 50px;
		text-align: center;
		font-size: 16px;
	}
</style>
