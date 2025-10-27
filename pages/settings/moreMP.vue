<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">实用工具</text>
		</view>

		<view class="mp-container">
			<view class="card" v-for="item in miniPrograms" :key="item.appId" @click="openMiniProgram(item)">
				<image class="avatar" :src="item.avatar" mode="aspectFill" />
				<view class="info">
					<text class="name">{{ item.name }}</text>
					<text class="desc">{{ item.description }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				miniPrograms: [{
						appId: 'wxc894f73cbc13b020', 
						path: 'pages/bills/bills',
						name: '小胖账本',
						description: '永久免费的记账小程序，日常消费收入统计，月度图表统计，每一分钱花在哪一目了然！',
						avatar: 'https://mp-c4353845-29cc-4bbc-8449-f5b4082588db.cdn.bspapp.com/BillIcon.jpg' 
					}
				]
			};
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			openMiniProgram(item) {
				uni.navigateToMiniProgram({
					appId: item.appId,
					path: item.path, 
					envVersion: 'release'
				});
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
	
	
	.mp-container {
		padding: 20rpx;
		background-color: #ffffff;
	}

	.card {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 30rpx;
		margin-bottom: 20rpx;
		background-color: #fafafa;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		border: #d5d5d5 solid 1rpx;
		transition: transform 0.2s;
	}

	.card:active {
		transform: scale(0.98);
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 16rpx;
		margin-right: 24rpx;
	}

	.info {
		flex: 1;
	}

	.name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		display: block;
		margin-bottom: 12rpx;
	}

	.desc {
		font-size: 28rpx;
		color: #888888;
		display: block;
		line-height: 1.4;
	}
</style>