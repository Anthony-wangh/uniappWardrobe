<template>
	<view class="container" @click="seasonDropdownVisible=false">
		<!-- 顶部标题栏 -->
		<view class="header-container">
			<view class="header">
				<text class="title-text">我的衣橱</text>
				<text class="quota">({{quota.clothesCount}}/{{quota.clothesQuota}})</text>
			</view>

			<view class="search-filter-area">
				<view class="search-container">
					<view class="search-area">
						<image class="search-btn" src="/static/search.png" mode="aspectFit"></image>
						<input v-model="searchKeyword" class="search-input" placeholder="搜索衣物名称" />
					</view>

					<view :class="['edit-btn-inline', isEditMode ? 'finish' : 'edit']" @click="toggleEditMode">
						<text
							:class="['edit-btn-text',isEditMode ? 'finish' : 'edit']">{{ isEditMode ? '取消' : '管理' }}</text>
						<image class="edit-btn-image" :src="isEditMode ? '/static/UnEdit.png':'/static/Edit.png'"
							mode="aspectFill"></image>
					</view>
				</view>

				<!-- 季节选择下拉 -->
				<view class="search-options-container">
					<view class="season-dropdown">
						<text class="edit-btn-text" @click.stop="toggleSeasonDropdown">季节</text>
						<image src="/static/Filter.png" class="arrow-icon" mode="aspectFit"
							@click.stop="toggleSeasonDropdown" />
						<view v-if="selectSeasonText!==''" class="season-selection">
							<text class="season-selection-text">{{selectSeasonText}}</text>
							<text class="clear-select-season" @click="clearSelectSeason">×</text>
						</view>
					</view>

					<view class="fold-all" @click="clickFoldall">
						<text class="edit-btn-text">{{ isExpand ? '全部收起' : '全部展开' }}</text>
						<image :class="['arrow', isExpand ? '' : 'open']" src='/static/Expend.png' mode="aspectFit">
						</image>
					</view>

					<view class="dropdown-panel" v-if="seasonDropdownVisible">
						<view class="dropdown-option" v-for="season in allSeasons" :key="season"
							@click.stop="toggleSeason(season)">
							<image
								:src="selectedSeasons.includes(season) ? '/static/checked.png' : '/static/unChecked.png'"
								class="checkbox-icon" />
							<text>{{ season }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 主体区域：左侧类目+右侧内容 -->
		<view class="main-body">
			<!-- 左侧主类目 -->
			<view class="main-category-vertical">
				<view v-for="(category, index) in categories" :key="index" class="category-tab-vertical"
					:class="{ active: currentMainCategoryIndex === index }" @click="selectMainCategory(index)">
					{{ category.name }}({{ getClothesForMain(category.name).length }})
				</view>
			</view>

			<!-- 主体内容 -->
			<view class="main-content">
				<scroll-view scroll-y class="list-area">
					<view v-for="subCat in currentSubCategories" :key="subCat" class="subcategory-section">
						<view class="subcategory-header" @click="toggleSubCollapse(subCat)">
							<view class="subcategory-left">
								<text class="subcategory-title">
									{{ subCat }} ({{ getClothesForSub(subCat).length }})
								</text>
								<view class="add-btn" @click.stop="onAddItemClick(subCat)">
									<text class="add-text">上传 +</text>
									<!-- <image src="/static/add.png" mode="aspectFit" class="add-icon" /> -->
								</view>

							</view>
							<text class="toggle-btn" :style="{ color: '#8A6FDF' }">
								{{ isSubCollapsed[subCat] ? '收起' : '展开' }}
							</text>
						</view>

						<view v-if="isSubCollapsed[subCat]">
							<view class="clothes-section">
								<view class="clothes-row" v-for="(row, rowIndex) in getRows(getAllItemsWithAdd(subCat))"
									:key="rowIndex">
									<view v-for="(item, itemIndex) in row" :key="itemIndex" class="clothes-item"
										@click.stop="toggleSelectClothes(item)" @longpress="longPressClothes(item)">
										<template>
											<view class="checkbox" v-if="isEditMode">
												<image
													:src="selectedClothes.includes(item) ? '/static/checked.png' : '/static/unChecked.png'"
													class="clothes-checkbox-icon" mode="aspectFit" />
											</view>
											<image class="clothes-image" :src="item.image" mode="widthFix" />
											<text class="clothes-name">{{ item.name }}</text>
											<text class="clothes-time">{{ formatTime(item.createTime) }}</text>
										</template>
									</view>
								</view>
							</view>

						</view>

					</view>
				</scroll-view>

			</view>
		</view>
		<view class="bottom-action-bar" v-if="isEditMode">
			<view class="action-btn" @click="deleteSelected">
				<image class="action-icon" src="/static/shanchu.png" mode="aspectFit" />
				<text class="action-text">删除</text>
			</view>
			<view class="action-btn" @click="matchSelected">
				<image class="action-icon" src="/static/dapei.png" mode="aspectFit" />
				<text class="action-text">搭配</text>
			</view>
		</view>

	</view>
</template>


<script>
	export default {
		data() {
			return {
				currentMainCategoryIndex: 0,
				categoriesMap: {
					上衣: ['T恤', '衬衫', '外套', '羽绒服'],
					裤子: ['牛仔裤', '运动裤', '休闲裤', '裙子'],
					鞋: ['运动鞋', '板鞋', '高跟鞋', '靴子'],
					配饰: ['帽子', '眼镜', '丝巾'],
					包: ['单肩包', '双肩包']
				},
				clothes: [],
				isSubCollapsed: {},
				isEditMode: false,
				selectedClothes: [],
				searchKeyword: '', //确定搜索关键词
				selectedSeasons: [],
				allSeasons: ['春', '夏', '秋', '冬'],
				seasonDropdownVisible: false,
				selectSeasonText: '',
				isExpand: false,
				quota: {
					clothesCount: 0,
					outfitsCount: 0,
					clothesQuota: 30,
					outfitsQuota: 8,
					clothesRate: '0%',
					outfitsRate: '0%'
				},
				canAddClothes: true,
				canAddOutfits: true

			};
		},
		computed: {
			categories() {
				return Object.entries(this.categoriesMap).map(([name, subCategories]) => ({
					name,
					subCategories
				}));
			},
			currentSubCategories() {
				const currentMain = this.categories[this.currentMainCategoryIndex];
				return currentMain ? currentMain.subCategories : [];
			}
		},
		onShow() {
			const quo = uni.getStorageSync("wardrobeQuota");
			if (quo) {
				this.quota = quo;
			}
			const category = uni.getStorageSync('wartrobeCategory');
			if (category) {
				this.categoriesMap = category;
			}

			this.canAddClothes = this.quota.clothesCount < this.quota.clothesQuota;
			this.canAddOutfits = this.quota.outfitsCount < this.quota.outfitsQuota;

			this.clothes = uni.getStorageSync("clothes") || [];
			this.clothes.sort((a, b) => {
				const timeA = a.createTime ? a.createTime : 0;
				const timeB = b.createTime ? b.createTime : 0;
				return timeB - timeA; // 时间越近越靠前
			});
			this.categories[this.currentMainCategoryIndex].subCategories.forEach(sub => {
				this.$set(this.isSubCollapsed, sub, false);
			});

			this.syncLocalData();
		},
		onShareAppMessage() {
			return {
				title: "每天穿什么不再纠结！这个衣橱管理神器推荐给你",
				path: "pages/main/main",
				imageUrl: "https://mp-5df80302-4973-4391-bd75-89493f11fa67.cdn.bspapp.com/cloudstorage/ShareIcon.jpg"
			};
		},
		onShareTimeline() {
			return {
				title: '衣服再也不怕乱堆！这个电子衣橱帮你轻松整理～👗👕', // 自定义朋友圈分享标题		
			};
		},
		methods: {
			formatTime(time) {
				const date = new Date(time);

				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const hour = date.getHours().toString().padStart(2, '0');
				const minute = date.getMinutes().toString().padStart(2, '0');

				return `${year}年${month}月${day}日 ${hour}:${minute}`;
			},
			syncLocalData() {
				const userInfo = uni.getStorageSync('wardrobeUserInfo');
				if (!userInfo) {
					console.log("未登录！");
					return;
				}
				const localData = uni.getStorageSync('localClothes');
				if (localData) {
					//本地数据大于10条时上传一次
					if (localData.length >= 10) {
						uniCloud.callFunction({
							name: 'syncClothesData',
							data: {
								userId: userInfo._id,
								clothes: localData
							}
						}).then((result) => {
							if (result.result.code !== 200) {
								console.log("数据上传失败！" + result.result.msg);
							} else {
								// 清空本地存储
								uni.setStorageSync('localClothes', null);
								console.log("数据上传成功！");
							}
						}).catch((err) => {
							console.error('云函数错误：', err);
						});
					}
				}
			},
			toggleSeasonDropdown() {
				this.seasonDropdownVisible = !this.seasonDropdownVisible;
			},

			toggleSeason(season) {
				const index = this.selectedSeasons.indexOf(season);
				if (index === -1) {
					this.selectedSeasons.push(season);
				} else {
					this.selectedSeasons.splice(index, 1);
				}
				this.selectSeasonText = this.selectedSeasons.join('，');
			},
			clearSelectSeason() {
				this.selectedSeasons = [];
				this.selectSeasonText = '';
			},

			clickFoldall() {
				this.isExpand = !this.isExpand;
				this.categories.forEach(main => {
					main.subCategories.forEach(sub => {
						this.$set(this.isSubCollapsed, sub, this.isExpand);
					});
				});
			},

			selectMainCategory(index) {
				this.currentMainCategoryIndex = index;
			},
			toggleSubCollapse(subCat) {
				this.$set(this.isSubCollapsed, subCat, !this.isSubCollapsed[subCat]);
			},
			getClothesForSub(subCat) {
				const main = this.categories[this.currentMainCategoryIndex].name;
				return this.clothes.filter(item =>
					item.primaryCategory === main &&
					item.secondaryCategory === subCat &&
					(this.searchKeyword.trim() === '' || item.name.includes(this.searchKeyword.trim())) &&
					(this.selectedSeasons.length === 0 || this.selectedSeasons.some(season => item.seasons?.includes(
						season)))
				);
			},
			getClothesForMain(mainCat) {
				if (!this.clothes)
					return [];
				return this.clothes.filter(item =>
					item.primaryCategory === mainCat &&
					(this.searchKeyword.trim() === '' || item.name.includes(this.searchKeyword.trim())) &&
					(this.selectedSeasons.length === 0 || this.selectedSeasons.some(season => item.seasons?.includes(
						season)))
				);
			},
			getRows(clothesList) {
				const rows = [];
				for (let i = 0; i < clothesList.length; i += 2) {
					rows.push(clothesList.slice(i, i + 2));
				}
				return rows;
			},
			toggleEditMode() {
				this.isEditMode = !this.isEditMode;

				if (this.isEditMode) {
					uni.hideTabBar();
				} else {
					uni.showTabBar();
					this.selectedClothes = [];
				}
			},
			toggleSelectClothes(item) {
				if (!this.isEditMode)
					return;
				const index = this.selectedClothes.indexOf(item);
				if (index > -1) {
					this.selectedClothes.splice(index, 1);
				} else {
					this.selectedClothes.push(item);
				}
			},
			longPressClothes(item) {
				if (this.isEditMode)
					return;
				this.toggleEditMode();
				this.selectedClothes.push(item);
			},
			deleteSelected() {
				if (this.selectedClothes.length === 0) return;

				uni.showModal({
					title: '确定删除选中的衣物？',
					content: `删除后将无法找回！`,
					success: res => {
						if (res.confirm) {
							//保存更新记录
							this.selectedClothes.forEach(item => {
								const deleteData = {
									type: "delete",
									data: item
								};
								this.saveLocalData(deleteData);
							});
							//保存衣物数据
							this.clothes = this.clothes.filter(c => !this.selectedClothes.includes(c));
							this.selectedClothes = [];
							this.saveClothes();

							//更新配额
							this.quota.clothesCount = this.clothes.length;
							uni.setStorageSync("wardrobeQuota", this.quota);
						}
					}
				});

			},
			checkLogin() {
				const userInfo = uni.getStorageSync('wardrobeUserInfo');
				if (userInfo) {
					return true;
				}
				uni.navigateTo({
					url: "/pages/login/login"
				});
				return false;
			},
			matchSelected() {
				if (!this.canAddOutfits) {
					uni.showToast({
						title: '配额不足',
						icon: 'error'
					});
					return;
				}

				if (this.selectedClothes.length < 2 || this.selectedClothes.length > 6) {
					uni.showToast({
						title: '请选择最低2件衣物，最多6件衣物进行搭配',
						icon: 'none'
					});
					return;
				}

				const clothesParam = encodeURIComponent(JSON.stringify(this.selectedClothes));
				if (this.isEditMode) this.toggleEditMode();

				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/addMatching/addMatching?clothes=${clothesParam}`
					});
				}, 100);
			},
			saveClothes() {
				uni.setStorageSync("clothes", this.clothes);
			},
			getAllItemsWithAdd(subCat) {
				const mainCat = this.categories[this.currentMainCategoryIndex].name;
				const clothesList = this.clothes
					.filter(item => item.primaryCategory === mainCat && item.secondaryCategory === subCat &&
						(this.searchKeyword.trim() === '' || item.name.includes(this.searchKeyword.trim())) &&
						(this.selectedSeasons.length === 0 || this.selectedSeasons.some(season => item.seasons?.includes(
							season))));


				return [...clothesList];
			},
			onAddItemClick(subCat) {
				if (!this.checkLogin())
					return;

				if (!this.canAddClothes) {
					uni.showToast({
						title: '配额不足',
						icon: 'error'
					});
					return;
				}

				if (this.isEditMode)
					this.toggleEditMode();

				const mainCat = this.categories[this.currentMainCategoryIndex].name;
				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/addClothes/addClothes?primaryCategory=${encodeURIComponent(mainCat)}&secondaryCategory=${encodeURIComponent(subCat)}`
					});
				}, 100);
			},
			saveLocalData(data) {
				let localData = uni.getStorageSync('localClothes') || [];
				localData.push(data);
				uni.setStorageSync('localClothes', localData);
			}
		}
	};
</script>

<style scoped>
	.container {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #fff;
	}

	/* 顶部栏 */
	.header-container {
		width: 100%;
		padding: 12px 0px;
		padding-top: calc(var(--status-bar-height) + 30px);
		box-shadow: 0px 4px 12rpx rgba(0, 0, 0, 0.05);
		border-bottom: #ccc solid 1px;
	}

	.header {
		display: flex;
		align-items: center;
		padding-bottom: 15px;
	}
	
	.quota{
		font-size: 14px;
		color: #6f5bdc;
	}

	.edit-btn {
		font-size: 16px;
		margin-right: 15px;
		min-width: 40px;
	}

	.title-text {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-left: 20px;
	}


	.main-content {
		flex: 1;
		height: calc(100vh - 210px);
		width: calc(100% - 20px);
		margin: 5px 10px 0 10px;
		/* background-color: #f8f8f8; */
	}

	.list-area {
		height: 100%;
		overflow-y: auto;
	}

	.subcategory-section {
		background: #fcfcfc;
		margin-bottom: 5px;
		padding: 5px 0;
	}

	.subcategory-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 5px 0;
	}

	.subcategory-left {
		display: flex;
		align-items: center;
	}

	.subcategory-title {
		margin-left: 15px;
		font-size: 14px;
		color: #1b1b1b;
	}

	.toggle-btn {
		font-size: 14px;
		margin-right: 10px;
	}

	.clothes-section {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.clothes-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		width: 100%;
		gap: 2%;
		padding: 5px 0px;

	}

	.clothes-item {
		position: relative;
		width: 46%;
		/* height: 200px; */
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-shadow: 2px 4px 12rpx rgba(0, 0, 0, 0.05);
		/* border: #999 solid 1px; */
		border-radius: 10px;
		overflow: hidden;
	}

	.clothes-image {
		width: 100%;
	}

	.clothes-name {
		margin-left: 5px;
		margin-bottom: 5px;
		font-size: 14px;
		color: #1d1d1d;
		padding: 5px 0;

		max-width: 100px;
		/* 限制最大宽度，可根据需要调整 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.clothes-time {
		font-size: 10px;
		color: #666;
		padding: 3px 0px;
		margin-bottom: 5px;
		margin-left: 5px;
	}


	.add-btn {
		margin-left: 20px;
		background: #8A6FDF;
		border-radius: 15px;
		justify-content: space-around;
		align-items: center;
		justify-items: center;
		display: flex;
		padding: 3px 8px;
	}

	.add-text {
		color: #f9f9f9;
		font-size: 12px;
	}

	.add-icon {
		width: 20px;
		height: 20px;
		/* object-fit: contain; */
		margin-left: 10px;
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
		background-color: #fff;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
		border-radius: 5px;
	}

	.bottom-action-bar {
		position: fixed;
		z-index: 20;
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



	.search-container {
		width: 100%;
		align-items: center;
		display: flex;
		flex-direction: row;
		margin: 5px 10px;
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

	/* 新增：主区域左右布局 */
	.main-body {
		display: flex;
		flex: 1;
		height: calc(100vh - 290px);
	}

	/* 左侧类目栏 */
	.main-category-vertical {
		width: 80px;
		background-color: #f8f8f8;
		border-right: 1px solid #ddd;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 10px;
	}

	.category-tab-vertical {
		padding: 10px 5px;
		font-size: 14px;
		color: #333;
		text-align: center;
	}

	.category-tab-vertical.active {
		color: #8A6FDF;
		font-weight: bold;
	}

	/* 搜索+下拉+按钮区域 */
	.search-filter-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 20px;
		gap: 10px;
		position: relative;
	}

	.search-options-container {
		width: 100%;
		display: flex;
		align-items: center;
		position: relative;
		justify-content: space-between;
	}

	.edit-option {
		display: flex;
		justify-content: space-between;
		align-items: center;
		justify-items: center;
		width: 100%;
		margin: 5px 10px;
	}

	.season-selection {
		margin-left: 10px;
		text-align: center;
		align-items: center;
	}

	.season-selection-text {
		font-size: 12px;
		color: #8A6FDF;
	}

	.clear-select-season {
		font-size: 16px;
		font-weight: bold;
		color: #6f5bdc;
		margin-left: 5px;
	}

	.season-dropdown {
		height: 20px;
		display: flex;
		align-items: center;
		font-size: 14px;
		color: #333;
		background-color: #f8f8f8;
		padding: 6px 12px;
		border-radius: 8px;
		border: 1px solid #f1f1f1;
		justify-content: space-around;
	}

	.arrow-icon {
		width: 16px;
		height: 16px;
		margin-left: 5px;
	}

	.fold-all {
		height: 20px;
		display: flex;
		align-items: center;
		font-size: 14px;
		color: #333;
		background-color: #f8f8f8;
		padding: 6px 8px;
		border-radius: 8px;
		border: 1px solid #f1f1f1;
		justify-content: space-around;
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
		
		border: 1px solid #8a8a8a;
		background-color: #fff;
	}

	.edit-btn-inline.edit {
		border: 1px solid #8A6FDF;
		background-color: #fff;
	}

	.edit-btn-text {
		font-size: 14px;
		padding: 0 3px;
	}


	.edit-btn-text.finish {
		color: #8a8a8a;
	}

	.edit-btn-text.edit {
		color: #8A6FDF;
	}


	.edit-btn-image {
		width: 18px;
		height: 18px;
		margin-left: 5px;
	}

	.arrow {
		width: 14px;
		height: 14px;
		margin-left: 5px;
		transition: transform 0.2s ease;
		transform: rotate(180deg);
	}

	.arrow.open {
		transform: rotate(0deg);
	}

	.dropdown-panel {
		position: absolute;
		top: 35px;
		left: -10px;
		margin: 0 15px;
		padding: 10px;
		border: 1px solid #ccc;
		background-color: #fff;
		border-radius: 8px;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		z-index: 100;
	}

	.dropdown-option {
		display: flex;
		align-items: center;
		font-size: 14px;
		padding: 4px 8px;
		border-radius: 6px;
		background-color: #f0f0f0;
	}

	.checkbox-icon {
		width: 16px;
		height: 16px;
		margin-right: 6px;
	}
</style>