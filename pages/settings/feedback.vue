<template>
	<view class="container">

		<!-- 导航栏 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">意见反馈</text>
		</view>

		<!-- 反馈类型 -->
		<view class="section">
			<view class="section-title">反馈类型</view>
			<view class="type-grid">
				<view v-for="(item, index) in types" :key="index"
					:class="['type-btn', selectedType === item ? 'active' : '']" @click="selectedType = item">
					{{ item }}
				</view>
			</view>
		</view>

		<!-- 问题描述 -->
		<view class="section">
			<view class="section-title required">问题描述</view>
			<textarea v-model="description" placeholder="请详细描述您遇到的问题或建议（最多500字）" maxlength="500"
				class="textarea"></textarea>
		</view>


		<!-- 联系方式 -->
		<view class="section">
			<view class="section-title">联系方式(选填)</view>
			<input v-model="contact" placeholder="请留下您的微信号或邮箱" class="input" />
		</view>

		<!-- 提交按钮 -->
		<button class="submit-btn" @click="submitForm">提交反馈</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				types: ['功能建议','缺陷', '操作问题', '体验问题', '其他问题'],
				selectedType: '功能建议',
				description: '',
				contact: '',
			};
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			submitForm() {
				if (!this.description.trim()) {
					return uni.showToast({
						title: '请填写问题描述',
						icon: 'none'
					});
				}
				const userInfo = uni.getStorageSync('wardrobeUserInfo');
				if(!userInfo)
					return;

				// 模拟提交逻辑，可改为云函数或后台接口
				console.log({
					userId: userInfo.openid,
					type: this.selectedType,
					description: this.description,
					contact: this.contact,
				});
				const feed = {
					userId: userInfo.openid,
					type: this.selectedType,
					description: this.description,
					contact: this.contact,
				};
				
				this.upload(feed);

				
			},
			upload(feedBack) {
				uniCloud.callFunction({
					name: 'feedBack',
					data: {
						feedBack: feedBack,
					}
				}).then((result) => {
					if (result.result.code === 200) {
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						});
						// 重置表单
						this.description = '';
						this.contact = '';
						this.selectedType = '功能建议';
					} else {
						uni.showToast({
							title: result.result.msg,
							icon: 'none'
						});
					}
				}).catch((err) => {
					uni.hideLoading();
					uni.showToast({
						title: '调用云函数失败',
						icon: 'none'
					});
					console.error('云函数错误：', err);
				});
			}
		},
	};
</script>

<style scoped>
	.container {
		width: 100vw;
		height: 100vh;
		justify-items: center;
		display: flex;
		flex-direction: column;
	}

	/* 顶部栏 */
	.navbar {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 12px 0px;
		background-color: #fff;
		border-bottom: 1px solid #e5e5e5;

		padding-top: calc(var(--status-bar-height) + 40px);
	}

	.back-icon {
		width: 24px;
		height: 24px;
		margin-right: 12px;
		margin-left: 20px;
	}

	.title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	.section {
		margin-top: 40rpx;
		margin: 40rpx 10px 0 10px;
	}

	.section-title {
		font-size: 30rpx;
		margin-bottom: 12rpx;
		color: #333;
	}

	.section-title.required::after {
		content: '*';
		color: red;
		margin-left: 8rpx;
	}

	.type-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.type-btn {
		padding: 16rpx 32rpx;
		border: 1px solid #ccc;
		border-radius: 12rpx;
		color: #333;
	}

	.type-btn.active {
		border-color: #8A6FDF;
		color: #8A6FDF;
		background-color: #ffffff;
	}

	.textarea {
		width: calc(100% - 20px);
		min-height: 160rpx;
		border: 1px solid #ddd;
		border-radius: 12rpx;
		font-size: 28rpx;
		padding: 10px;
	}

	.input {
		width: calc(100% - 20px);
		border: 1px solid #ddd;
		border-radius: 12rpx;
		font-size: 28rpx;
		padding: 10px;
	}

	.upload-btn {
		width: 180rpx;
		height: 180rpx;
		border: 1px dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-btn {
		margin-top: 60rpx;
		background-color: #8A6FDF;
		color: #fff;
		border-radius: 12rpx;
		font-size: 32rpx;
		margin: 60rpx 10px 0 10px;
	}
</style>