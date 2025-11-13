<!-- pages/outfitDetail/outfitDetail.vue -->
<template>
	<view class="container">

		<!-- 主标题 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="onBack" />
			<text class="title">搭配详情</text>
		</view>


		<!-- 搭配图片 -->
		<image :src="outfit.thumbnail" class="outfit-image" mode="aspectFit" />

		<!-- 搭配名称 -->
		<view class="outfit-name">{{ outfit.name }}</view>

		<!-- 适宜场景 -->
		<view class="scene">
			<text class="scene-icon">🌿</text>
			<text class="scene-text">适宜场景：{{ outfit.category }}</text>
		</view>
		<view class="time-text">上传时间：{{getTime(outfit.time)}}</view>



		<view class="handle">
			<!-- 删除按钮 -->
			<button class="delete-btn" @click="onDelete">
				删除
			</button>

			<button open-type="share" class="share-btn">
				<image src="/static/share-btn.png" mode="aspectFit" class="share-btn-icon"></image>
				<text class="share-btn-text">分享</text>
			</button>

		</view>


	</view>
</template>

<script>
	export default {
		data() {
			return {
				outfit: {
					name: '',
					category: '',
					thumbnail: ''
				},
				outfits: [],
				quota: {
					clothesCount: 0,
					outfitsCount: 0,
					clothesQuota: 30,
					outfitsQuota: 8,
					clothesRate: '0%',
					outfitsRate: '0%'
				},
			};
		},
		onLoad(options) {
			// 通常通过 outfitId 从云数据库获取详情
			const {
				outfitId
			} = options;
			if (outfitId) {
				this.loadOutfitDetail(outfitId);
			}


			const quo = uni.getStorageSync("wardrobeQuota");
			if (quo) {
				this.quota = quo;
			}
		},
		onShareAppMessage() {
			if (!this.outfit) {
				return {
					title: '我的搭配',
					path: '/pages/matching/matching'
				};
			}
			const param = encodeURIComponent(JSON.stringify(this.outfit));

			return {
				title: `看看我的穿搭：${this.outfit.name}`,
				path: `/pages/matching/outfitShareView?data=${param}`,
				imageUrl: this.outfit.thumbnail // 必须是网络图片（HTTPS）
			};
		},
		methods: {
			getTime(time) {
				const date = new Date(time);
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const hour = date.getHours().toString().padStart(2, '0');
				const minute = date.getMinutes().toString().padStart(2, '0');
				return `${year}年${month}月${day}日 ${hour}:${minute}`;
			},
			loadOutfitDetail(outfitId) {
				this.outfits = uni.getStorageSync("outfits") || [];
				const matching = this.outfits.find(c => c.id === outfitId);
				if (matching) {
					this.outfit = matching;
				} else {
					uni.showToast({
						title: '加载搭配失败！',
						icon: 'error'
					})
					setTimeout(() => {
						uni.navigateBack();
					}, 300)
				}

			},
			onBack() {
				// 返回上一页 或 退出
				uni.navigateBack({
					delta: 1,
					fail: () => {
						// 如果没有上一页（如从订阅消息直接进入），则跳转首页
						uni.reLaunch({
							url: '/pages/main/main'
						});
					}
				});
			},
			onDelete() {
				uni.showModal({
					title: '确定删除选中的穿搭？',
					content: `删除后将无法找回！`,
					success: res => {
						if (res.confirm) {
							this.saveLocalData({
								type: "delete",
								data: this.outfit
							});
							this.outfits = this.outfits.filter(c => c.id !== this.outfit.id);
							uni.setStorageSync("outfits", this.outfits);
							this.quota.outfitsCount = this.outfits.length;
							uni.setStorageSync("wardrobeQuota", this.quota);

							uni.showToast({
								title: '删除成功'
							})

							setTimeout(() => {
								this.onBack();
							}, 300)
						}
					}
				});
			},
			saveLocalData(data) {
				let localData = uni.getStorageSync('localOutfits') || [];
				localData.push(data);
				uni.setStorageSync('localOutfits', localData);
			}
		}
	};
</script>

<style scoped>
	.container {
		background-color: #fff;
		min-height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-items: center;
		align-items: center;
	}

	.delete-btn {
		padding: 0px 20px;
		border-radius: 10px;

		font-size: 16px;
		color: #ffffff;
		background-color: #1f1f1f;
		text-align: center;
	}

	.handle {
		margin-top: 20px;
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		justify-items: center;
		
	}


	/* 顶部栏 */
	.navbar {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 12px 0px;
		background-color: #fff;

		padding-top: calc(var(--status-bar-height) + 40px);
	}

	.back-icon {
		width: 20px;
		height: 20px;
		margin-right: 12px;
		margin-left: 20px;
	}

	.title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	/* 搭配图片 */
	.outfit-image {

		width: calc(100vw - 60px);
		height: calc((100vw - 60px)*4/3);
		border-radius: 24rpx;
		margin: 20rpx 0;
		border: #ececec solid 1px;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.03);
	}

	/* 搭配名称 */
	.outfit-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #414141;
		text-align: center;
		margin: 30rpx 0;
	}

	/* 适宜场景 */
	.scene {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 20rpx;
	}

	.scene-icon {
		margin-right: 10rpx;
		font-size: 28rpx;
	}

	.scene-text {
		font-size: 28rpx;
		color: #8b67ff;
	}

	.time-text {
		margin-top: 10px;
		font-size: 12px;
		color: #848484;
	}

	.share-btn {
		width: 100px;
		border: #8b67ff solid 1px;
		background-color: #fff;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		justify-items: center;
		
		border-radius: 10px;
		
	}

	.share-btn-icon {
		width: 20px;
		height: 20px;
	}

	.share-btn-text {
		font-size: 16px;
		color: #8b67ff;
		text-align: center;
	}
</style>