<template>
	<view class="container">
		<!-- 顶部标题栏 -->
		<view class="header-container" :style="{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }">
			<text class="title-text" :style="{ color: theme.textColor }">我的搭配</text>
		</view>

		<!-- 套装列表 -->
		<scroll-view scroll-y class="scroll-container">
			<view v-if="outfits.length > 0">
				<view v-for="(item, index) in outfits" :key="index" class="outfit-card">
					<image :src="item.thumbnail" class="outfit-icon" mode="aspectFill" />
					<view class="outfit-info">
						<view class="name">{{ item.name }}</view>
						<view class="remark">备注：{{ item.note }}</view>
					</view>
				</view>
			</view>
			<view v-else class="empty">
				<image src="/static/empty.png" class="emptyIcon"></image>
				<text class="empty-state-text">暂无搭配</text>
			</view>
		</scroll-view>


		<!-- 右下角浮动按钮 -->
		<view class="floating-btn" @click="goAddOutfit" :style="{ background: theme.secondaryColor }">
			<image class="floating-btn-image" src="/static/plus-l.png" mode="aspectFit"></image>
		</view>
	</view>
</template>

<script>
	import {themes} from '@/components/theme.js'
	export default {
		data() {
			return {
				outfits: [{
						icon: 'https://cdn.example.com/outfit1.jpg',
						name: '夏日通勤',
						scene: '上班',
						remark: '轻便舒适，适合夏天穿搭'
					},
					{
						icon: 'https://cdn.example.com/outfit2.jpg',
						name: '运动套装',
						scene: '健身房',
						remark: '透气速干衣搭配运动鞋'
					}
				],
				theme: themes[0],
				themes
			};
		},
		onShow() {
			const saved = uni.getStorageSync('theme') || this.themes[0];
			this.theme=saved;
			// 模拟数据加载
			this.outfits = uni.getStorageSync("outfits") || [];
		},
		methods: {
			goAddOutfit() {
				uni.navigateTo({
					url: '/pages/addMatching/addMatching' // 替换为你的添加页面路径
				});
			}
		}
	};
</script>

<style scoped>
	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f7f7f7;
	}

	.header-container {
		padding: 20px;
		background-color: #ffffff;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
		padding-top: calc(var(--status-bar-height) + 30px);
		position: relative;
		height: 40px;
	}

	.title-text {
		font-size: 18px;
		font-weight: bold;
		text-align: center;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.scroll-container {
		flex: 1;
		padding: 16rpx;
		height: calc(100vh - 160px);
	}

	.outfit-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 24rpx;
		display: flex;
		flex-direction: row;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.outfit-icon {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		margin-right: 24rpx;
		background-color: #f0f0f0;
	}

	.outfit-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}

	.name {
		font-size: 32rpx;
		font-weight: 600;
		margin-bottom: 12rpx;
	}

	.scene,
	.remark {
		font-size: 26rpx;
		color: #666;
	}

	.floating-btn {
		position: fixed;
		right: 20px;
		bottom: 40px;
		width: 50px;
		height: 50px;
		background-color: #ccd3ff;
		border-radius: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.floating-btn-image {
		width: 30px;
		height: 30px;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30px 0;
	}

	.emptyIcon {
		width: 150px;
		height: 150px;
		margin-bottom: 10px;
	}

	.empty-state-text {
		color: #bbb;
		font-size: 16px;
	}
</style>