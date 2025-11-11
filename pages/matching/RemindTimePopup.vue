<!-- components/RemindTimePopup.vue -->
<template>
	<view v-show="show" class="popup-mask" :class="{ 'popup-mask-show': show }" @click="onCancel">
		<view class="popup-content" @click.stop>
			<!-- 按钮组 -->
			<view class="popup-footer">
				<text class="btn cancel" @click="onCancel">取消</text>
				<text class="btn confirm" @click="onConfirm">确定</text>
			</view>

			<!-- 标题 -->
			<view class="popup-header">
				<text class="popup-title">穿搭提醒</text>
				<text class="tip">我们将在【{{displayTime}}】通过微信服务通知提醒您</text>
			</view>

			<view class="picker-item">
				<text class="picker-label">搭配</text>
				<view class="proName">"{{ outfitName }}"</view>
			</view>

			<!-- 日期选择器：限制日期范围 -->
			<view class="picker-item">
				<text class="picker-label">日期(支持7天以内)</text>
				<uni-calendar ref="calendar" :insert="false" :date="dateValue" :start-date="minSelectableDate" 
				:end-date="maxSelectableDate" @confirm="onDateChange"></uni-calendar>				
				<view class="picker-value" @click="openCalender">{{ dateValue }}</view>
			</view>

			<!-- 时间选择器：无原生范围限制，靠逻辑校验 -->
			<view class="picker-item">
				<text class="picker-label">时间</text>
				<picker mode="time" :value="timeValue" @change="onTimeChange">
					<view class="picker-value">{{ timeValue }}</view>
				</picker>
			</view>

			<view v-if="hasExistingReminder" class="btn delete" @click="onDelete">
				取消提醒
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'RemindTimePopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		existingTime: {
			type: Number,
			default: null
		},
		outfitName: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			selectedDateTime: null,
			minSelectableDate: '', // YYYY-MM-DD
			maxSelectableDate: ''  // YYYY-MM-DD
		};
	},
	computed: {
		hasExistingReminder() {
			return this.existingTime !== null;
		},
		displayTime() {
			if (!this.selectedDateTime) return '请选择时间';
			const d = new Date(this.selectedDateTime);
			return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
		},
		dateValue() {
			const d = new Date(this.selectedDateTime || Date.now());
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		},
		timeValue() {
			const d = new Date(this.selectedDateTime || Date.now());
			return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
		},
		minDate() {
			return this.minSelectableDate;
		},
		maxDate() {
			return this.maxSelectableDate;
		}
		
	},
	watch: {
		show(newVal) {
			if (newVal) {
				this.initSelectedTime();
				this.initDateTimeRange(); // 先初始化范围				
			}
		},
		existingTime(newVal) {
			if (newVal) {
				this.selectedDateTime = newVal;
			}
		}
	},
	methods: {
		openCalender(){
			this.$refs.calendar.open();
		},
		initDateTimeRange() {
			const now = new Date();
			const minDateObj = now;
			const maxDateObj = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7天

			const formatDate = (date) => {
				const y = date.getFullYear();
				const m = String(date.getMonth() + 1).padStart(2, '0');
				const d = String(date.getDate()).padStart(2, '0');
				return `${y}-${m}-${d}`;
			};

			this.minSelectableDate = formatDate(minDateObj);
			this.maxSelectableDate = formatDate(maxDateObj);
		},

		initSelectedTime() {
			if (this.existingTime) {
				this.selectedDateTime = this.existingTime;
			} else {
				const now = new Date();
				now.setMinutes(now.getMinutes() + 6); // 默认选6分钟后（确保在范围内）
				this.selectedDateTime = now.getTime();
			}
		},

		onDateChange(e) {
			const timeStr = this.timeValue; // "HH:mm"
			const combinedStr = `${e.fulldate}T${timeStr}`;
			const newDateTime = new Date(combinedStr);
			this.updateSelectedTime(newDateTime);
		},

		onTimeChange(e) {
			const { value: selectedTimeStr } = e.detail; // "HH:mm"
			const dateStr = this.dateValue; // "YYYY-MM-DD"
			const combinedStr = `${dateStr}T${selectedTimeStr}`;
			const newDateTime = new Date(combinedStr);
			this.updateSelectedTime(newDateTime);
		},

		updateSelectedTime(newDateTime) {
			const now = new Date();
			const minAllowed = new Date(now.getTime() + 5 * 60 * 1000); // +5分钟
			const maxAllowed = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7天

			let finalTime = newDateTime;

			if (newDateTime < minAllowed) {
				finalTime = minAllowed;
				uni.showToast({
					title: '时间不能早于5分钟后',
					icon: 'none',
					duration: 1000
				});
			} else if (newDateTime > maxAllowed) {
				finalTime = maxAllowed;
				uni.showToast({
					title: '时间不能晚于7天后',
					icon: 'none',
					duration: 1000
				});
			}

			this.selectedDateTime = finalTime.getTime();
		},

		onCancel() {
			this.close();
		},

		onConfirm() {
			if (!this.selectedDateTime) {
				uni.showToast({ title: '请选择时间', icon: 'none' });
				return;
			}

			const now = new Date();
			const minAllowed = new Date(now.getTime() + 5 * 60 * 1000);
			const maxAllowed = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

			if (this.selectedDateTime < minAllowed.getTime()) {
				uni.showToast({ title: '时间不能早于5分钟后', icon: 'none' });
				return;
			}
			if (this.selectedDateTime > maxAllowed.getTime()) {
				uni.showToast({ title: '时间不能晚于7天后', icon: 'none' });
				return;
			}

			this.$emit('confirm', this.selectedDateTime);
			this.close();
		},

		onDelete() {
			this.$emit('delete');
			this.close();
		},

		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped>
/* 样式保持不变 */
.popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4);
	z-index: 999;
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.3s ease;
}

.popup-mask.popup-mask-show {
	opacity: 1;
	pointer-events: auto;
}

.popup-content {
	width: 100%;
	background-color: #fff;
	border-top-left-radius: 16rpx;
	border-top-right-radius: 16rpx;
	padding: 40rpx 30rpx;
	box-sizing: border-box;
	transform: translateY(100%);
	transition: transform 0.3s ease;
	position: relative;
}

.popup-mask-show .popup-content {
	transform: translateY(0);
}

.popup-header {
	text-align: center;
	margin-bottom: 30rpx;
	display: flex;
	flex-direction: column;
}

.popup-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
}

.tip {
	font-size: 24rpx;
	color: #969696;
	margin-top: 5px;
}

.picker-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.picker-label {
	font-size: 26rpx;
	color: #333;
}

.picker-value {
	font-size: 28rpx;
	color: #ffffff;
	background-color: #8A6FDF;
	border-radius: 20px;
	padding: 5px 10px;
}

.popup-footer {
	width: 100%;
	display: flex;
	justify-content: space-between;
	position: fixed;
	top: 5px;
	left: 0;
}

.btn {
	margin: 0 10rpx;
	font-size: 30rpx;
	padding: 8rpx 10rpx;
	border-radius: 12rpx;
	border: none;
	text-align: center;
}

.cancel {
	color: #919191;
	font-weight: bold;
}

.delete {
	margin-top: 10px;
	font-size: 32rpx;
	color: #ebbb28;
}

.confirm {
	color: #8A6FDF;
	font-weight: bold;
}

.proName {
	font-size: 30rpx;
	color: #343434;
}
</style>