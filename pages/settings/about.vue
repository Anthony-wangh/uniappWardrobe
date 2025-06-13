<template>
	<view class="container">

		<!-- 自定义标题栏 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">关于</text>
		</view>

		<!-- 当前版本信息 -->
		<view class="version-info">
			<text class="version-title">版本 {{ version }}</text>
			<text class="update-date">更新于{{ updateDate }}</text>
		</view>

		<!-- 更新内容区 -->
		<view class="card">

			<!-- 新功能 -->
			<view class="section" v-if="features.length>0">
				<view class="section-title green">新功能</view>
				<view class="item" v-for="(item, i) in features" :key="'f' + i">
					<text class="dot green-dot"></text>{{ item }}
				</view>
			</view>

			<!-- 修复 -->
			<view class="section" v-if="fixes.length>0">
				<view class="section-title orange">修复</view>
				<view class="item" v-for="(item, i) in fixes" :key="'x' + i">
					<text class="dot orange-dot"></text>{{ item }}
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				version: '1.0.0',
				updateDate: '2025年6月12日',
				features: [
					'我的衣橱助手全新上线，首个版本尝鲜！',
					'风格可爱的界面，让你爱不释手',
					'上传衣物模块，可以上传本地衣物信息，并进行分类展示',
					'搭配模块，可以使用已经上传的衣物来进行搭配，给你的OOTD提供灵感，并进行分类展示'
				],
				fixes: []
			};
		},
		methods: {
			goBack() {
				uni.navigateBack();
			}
		}
	};
</script>

<style scoped>
	.container {
		background-color: #ffffff;
		color: #333;
		min-height: 100vh;
		padding: 20rpx;
		box-sizing: border-box;
	}

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

	.version-info {
		margin-top: 40rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
	}

	.version-title {
		font-size: 36rpx;
		color: #007aff;
		font-weight: bold;
	}

	.update-date {
		margin-top: 10rpx;
		color: #999;
		font-size: 26rpx;
	}

	.card {
		margin-top: 40rpx;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.card-title {
		font-size: 30rpx;
		color: #333;
		margin-bottom: 30rpx;
	}

	.section {
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.green {
		color: #00aa66;
	}

	.orange {
		color: #ff9900;
	}

	.item {
		display: flex;
		align-items: flex-start;
		margin-bottom: 18rpx;
		font-size: 26rpx;
		color: #444;
	}

	.dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		margin-right: 16rpx;
		margin-top: 10rpx;
	}

	.green-dot {
		background-color: #00aa66;
	}

	.orange-dot {
		background-color: #ff9900;
	}
</style>