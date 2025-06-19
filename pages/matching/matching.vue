<template>
	<view class="container">

		<!-- 顶部标题栏 -->
		<view class="header-container">
			<view class="header">
				<text class="title-text">我的搭配</text>
			</view>
			<view class="edit-container">
				<view class="search-container">
					<view class="search-area">
						<image class="search-btn" src="/static/search.png" mode="aspectFit"></image>
						<input v-model="searchKeyword" class="search-input" placeholder="搜索衣物名称" />
					</view>

					<view :class="['edit-btn-inline', isEditMode ? 'finish' : 'edit']" @click="toggleEditMode">
						<text
							:class="['edit-btn-text',isEditMode ? 'finish' : 'edit']">{{ isEditMode ? '完成' : '管理' }}</text>
						<image class="edit-btn-image" :src="isEditMode ? '/static/Fnish.png':'/static/Edit.png'"
							mode="aspectFit"></image>
					</view>
				</view>
				<view class="input-row">
					<picker class="picker-category" mode="selector" :range="categories" @change="onCategoryChange">
						<view class="input-box-category">
							<text class="category-text">{{ category }}</text>
							<image class="filter-icon" src="/static/filter1.png" mode="aspectFit"></image>
						</view>
					</picker>
				</view>
			</view>
		</view>

		<!-- 套装列表 -->
		<scroll-view scroll-y class="scroll-container">
			<view v-if="filteredOutfits.length > 0" class="outfits-grid">
				<view v-for="(item, index) in filteredOutfits" :key="index" class="outfit-card"
					@click.stop="toggleSelectOutfit(item)" @longpress="longPressOutfit(item)">
					<view class="checkbox" v-if="isEditMode">
						<image :src="selectedOutfits.includes(item) ? '/static/checked.png' : '/static/unChecked.png'"
							class="clothes-checkbox-icon" mode="aspectFit" />
					</view>
					<view class="thumbnail">
						<image :src="item.thumbnail" class="outfit-icon" mode="aspectFit" />
					</view>
					<view class="outfit-info">
						<text class="name">{{ item.name }}</text>
						<text class="category-label">{{ item.category }}</text>
						<text class="time">{{ getTime(item.time) }}</text>
					</view>

				</view>
			</view>
			<view v-else class="empty">
				<image src="/static/empty.png" class="emptyIcon"></image>
				<text class="empty-state-text">暂无搭配...</text>
			</view>
		</scroll-view>



		<!-- 右下角浮动按钮 -->
		<!-- <view class="floating-btn" @click="goAddOutfit" :style="{ background: '#8A6FDF' }">
			<image class="floating-btn-image" src="/static/plus-l.png" mode="aspectFit"></image>
		</view> -->

		<view class="bottom-action-bar" v-if="isEditMode">
			<view class="action-btn" @click="deleteSelected">
				<image class="action-icon" src="/static/shanchu.png" mode="aspectFit" />
				<text class="action-text">删除</text>
			</view>
		</view>
	</view>
</template>

<script>
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
				searchKeyword: '',
				isEditMode: false,
				selectedOutfits: [],
				quota: {
					clothesCount: 0,
					outfitsCount: 0,
					clothesQuota: 30,
					outfitsQuota: 8,
					clothesRate: '0%',
					outfitsRate: '0%'
				},
				category: '全部',
				categories: ['全部', '日常通勤', '春日出游', '周末约会', '正式场合'],
			};
		},
		computed: {
			filteredOutfits() {
				const keyword = this.searchKeyword.toLowerCase();
				return this.outfits.filter(item => {
					const matchKeyword = item.name.toLowerCase().includes(keyword);
					const matchCategory = this.category === '全部' || item.category === this.category;
					return matchKeyword && matchCategory;
				});
			}
		},
		onShow() {
			// 模拟数据加载
			this.outfits = uni.getStorageSync("outfits") || [];

			const quo = uni.getStorageSync("wardrobeQuota");
			if (quo) {
				this.quota = quo;
			}

			const match = uni.getStorageSync('matchCategories');
			if (match && Array.isArray(match)) {
				match.unshift("全部");
				this.categories = match;
				this.category = this.categories[0];
			}

			this.syncLocalData();
		},
		methods: {
			syncLocalData() {
				const userInfo = uni.getStorageSync('wardrobeUserInfo');
				if (!userInfo) {
					console.log("未登录！");
					return;
				}
				const localData = uni.getStorageSync('localOutfits');
				if (localData) {
					//本地数据大于10条时上传一次
					if (localData.length >= 10) {
						uniCloud.callFunction({
							name: 'syncOutfitsData',
							data: {
								userId: userInfo._id,
								outfits: localData
							}
						}).then((result) => {
							if (result.result.code !== 200) {
								console.log("数据上传失败！" + result.result.msg);
							} else {
								// 清空本地存储
								uni.setStorageSync('localOutfits', null);
								console.log("数据上传成功！");
							}
						}).catch((err) => {
							console.error('云函数错误：', err);
						});
					}
				}
			},
			getTime(time) {
				const date = new Date(time);

				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const hour = date.getHours().toString().padStart(2, '0');
				const minute = date.getMinutes().toString().padStart(2, '0');

				return `${year}年${month}月${day}日 ${hour}:${minute}`;
			},
			onCategoryChange(e) {
				this.category = this.categories[e.detail.value];
			},
			goAddOutfit() {
				uni.navigateTo({
					url: '/pages/addMatching/addMatching' // 替换为你的添加页面路径
				});
			},
			toggleEditMode() {
				this.isEditMode = !this.isEditMode;

				if (this.isEditMode) {
					uni.hideTabBar();
				} else {
					uni.showTabBar();
					this.selectedOutfits = [];
				}
			},
			toggleSelectOutfit(item) {
				if (!this.isEditMode)
					return;
				const index = this.selectedOutfits.indexOf(item);
				if (index > -1) {
					this.selectedOutfits.splice(index, 1);
				} else {
					this.selectedOutfits.push(item);
				}
			},
			longPressOutfit(item) {
				if (this.isEditMode)
					return;
				this.toggleEditMode();
				this.selectedOutfits.push(item);
			},
			deleteSelected() {
				if (this.selectedOutfits.length === 0) return;

				uni.showModal({
					title: '确定删除选中的穿搭？',
					content: `删除后将无法找回！`,
					success: res => {
						if (res.confirm) {
							//保存更新记录
							this.selectedOutfits.forEach(item => {
								const deleteData = {
									type: "delete",
									data: item
								};
								this.saveLocalData(deleteData);
							});


							this.outfits = this.outfits.filter(c => !this.selectedOutfits.includes(c));
							this.selectedOutfits = [];
							uni.setStorageSync("outfits", this.outfits);
							this.quota.outfitsCount = this.outfits.length;
							uni.setStorageSync("wardrobeQuota", this.quota);
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
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f7f7f7;
	}

	/* 顶部栏 */
	.header-container {
		width: 100%;
		padding: 12px 0px;
		background-color: #fff;
		box-shadow: 0px 4px 12rpx rgba(0, 0, 0, 0.05);
		padding-top: calc(var(--status-bar-height) + 30px);
	}

	.header {
		display: flex;
		align-items: center;
		/* border-bottom: 1px solid #b0b0b0; */
		padding-bottom: 10px;
	}


	.title-text {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-left: 20px;
	}

	.edit-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin: 10px 20px 0;
	}

	.search-container {
		width: 100%;
		align-items: center;
		display: flex;
		flex-direction: row;
	}

	.search-area {
		width: calc(100% - 70px);
		display: flex;
		flex-direction: row;
		border-radius: 8px;
		border: 1px solid #e3e3e3;
		box-shadow: 4px 4px 12rpx rgba(0, 0, 0, 0.05);
		background-color: #f8f8f8;
		margin-right: 20px;
		align-items: center;
	}



	.search-input {
		width: 100%;
		margin-left: 10px;
		padding: 8px 0;
		font-size: 14px;
	}

	.search-btn {
		width: 20px;
		height: 20px;
		margin-left: 10px;
		/* flex-wrap: wrap; */
	}

	.edit-btn-inline {
		width: 70px;
		height: 25px;
		display: flex;
		align-items: center;
		font-size: 14px;
		color: #333;
		/* background-color: #f8f8f8; */
		padding: 6px;
		border-radius: 8px;
		justify-content: space-around;
	}

	.edit-btn-inline.finish {
		border: 1px solid #8A6FDF;
		background-color: #fff;
	}

	.edit-btn-inline.edit {
		border: 1px solid #f1f1f1;
		background-color: #f8f8f8;
	}

	.edit-btn-text {
		font-size: 14px;
		padding: 0 3px;
	}


	.edit-btn-text.finish {

		color: #8A6FDF;
	}

	.edit-btn-text.edit {
		color: #707070;
	}


	.edit-btn-image {
		width: 18px;
		height: 18px;
		margin-left: 5px;
	}


	.scroll-container {
		flex: 1;
		/* padding: 16rpx; */
		height: calc(100vh - 150px);
		margin: 10px;
	}

	.outfits-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 4%;
	}

	.outfit-card {
		width: calc(46% - 20px);
		/* 一排2个，留空隙 */
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 0px 10px;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		margin-bottom: 16rpx;
		position: relative;
	}

	.checkbox {
		position: absolute;
		top: 2px;
		right: 2px;
		z-index: 10;
		width: 24px;
		height: 24px;
	}

	.checkbox-icon {
		width: 100%;
		height: 100%;
	}

	.clothes-checkbox-icon {
		width: 25px;
		height: 25px;
	}

	.thumbnail {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
	}

	.outfit-icon {
		width: 100%;
		height: 100%;
		justify-items: center;
		align-items: center;
	}

	.outfit-info {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-top: 12rpx;
	}

	.name {
		font-size: 16px;
		margin-bottom: 6rpx;
		
		max-width: 100px;
		/* 限制最大宽度，可根据需要调整 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.time {
		font-size: 12px;
		color: #666;
		padding: 3px 0px;
		margin-bottom: 10px;
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
		color: #b1a5df;
		font-size: 14px;
	}

	.bottom-action-bar {
		position: fixed;
		bottom: 20px;
		width: calc(100% - 40px);
		height: 100rpx;
		margin: 0 20px;
		border-radius: 10px;
		background-color: #fff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 4px 4px 12rpx rgba(0, 0, 0, 0.05);

		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}

		to {
			transform: translateY(0);
		}
	}

	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 24rpx;
	}

	.action-icon {
		width: 16px;
		height: 16px;
		margin-bottom: 4px;
	}

	.action-text {
		font-size: 10px;
		color: #707070;
	}

	.picker-category {
		width: 70%;
		align-items: center;
		justify-content: center;
	}

	.filter-icon {
		width: 20px;
		height: 20px;
	}

	.input-box-category {
		width: 100%;
		padding: 6px 0;
		align-items: center;
		justify-content: center;
		justify-content: space-around;
		display: flex;
		border-radius: 5px;
		border: 1px solid #f1f1f1;
		background-color: #f8f8f8;
	}

	.category-text {
		font-size: 14px;
		color: #333;
		text-align: center;
	}

	.input-row {
		width: 150px;
		display: flex;
		align-items: center;
		margin: 10px 0;
	}

	.name-category {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* align-items: center; */
		padding-bottom: 5px;
	}

	.category-label {
		align-self: flex-start;
		display: inline-block;
		font-size: 10px;
		color: #8A6FDF;
		background-color: #ebecf1;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 10px;
		padding: 3px 6px;
		text-align: center;
		margin: 3px 0;

		max-width: 100px;
		/* 限制最大宽度，可根据需要调整 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>