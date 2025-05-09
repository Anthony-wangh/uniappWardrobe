<template>
	<view class="container">
		<!-- 顶部标题栏和一级类目 -->
		<view class="header-container" :style="{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }">
			<text class="title-text" :style="{ color: theme.textColor }">我的衣橱</text>
			<text class="edit-btn" @click="toggleEditMode" :style="{ color: theme.highlightTextColor }">{{ isEditMode ? '完成' : '选择'  }}</text>
			<view class="category-level-1">
				<view v-for="(category, index) in categories" :key="index" class="category-tab"
					:class="{ active: currentMainCategoryIndex === index }" @click="selectMainCategory(index)" :style="getTabStyle(index)">
					{{ category }}({{ getClothesForMain(category).length }})
				</view>
			</view>
		</view>

		<!-- 主体区域 -->
		<view class="main-content">
			<scroll-view scroll-y class="list-area">
				<view v-for="subCat in currentSubCategories" :key="subCat" class="subcategory-section">
					<!-- 小节头 -->
					<view class="subcategory-header" @click="toggleSubCollapse(subCat)">
						<text class="subcategory-title">
							{{ subCat }} ({{ getClothesForSub(subCat).length }})
						</text>
						<text class="toggle-btn" :style="{ color: theme.highlightTextColor }">
							{{ isSubCollapsed[subCat] ? '展开' : '收起' }}
						</text>
					</view>

					<view v-if="!isSubCollapsed[subCat]">
						<!-- 空态：显示空状态＋添加按钮 -->
						<view v-if="getClothesForSub(subCat).length === 0" class="empty-state-wrapper">
							<view class="clothes-section">
								<view class="clothes-row">
									<view class="clothes-item add-item"
										@click="onAddItemClick({ primaryCategory: categories[currentMainCategoryIndex], secondaryCategory: subCat })">
										<image src="/static/add.png" mode="aspectFit" class="add-icon" />
									</view>
								</view>
							</view>
						</view>

						<!-- 正常态：数据＋添加按钮，统一分行 -->
						<view v-else class="clothes-section">
							<view class="clothes-row" v-for="(row, rowIndex) in getRows(getAllItemsWithAdd(subCat))"
								:key="rowIndex">
								<view v-for="(item, itemIndex) in row" :key="itemIndex" class="clothes-item"
									:class="{ 'add-item': item.isAdd }"
									@click="item.isAdd ? onAddItemClick(item) : null">
									<template v-if="item.isAdd">
										<image src="/static/add.png" mode="aspectFit" class="add-icon" />
										<!-- <text class="clothes-name">添加</text> -->
									</template>
									<template v-else>
										<view class="checkbox" v-if="isEditMode" @click.stop="toggleSelectClothes(item)">
										  <image
										    :src="selectedClothes.includes(item) ? '/static/checked.png' : '/static/unChecked.png'"
										    class="checkbox-icon"
										    mode="aspectFit"
										  />
										</view>

										<image class="clothes-image" :src="item.image" mode="aspectFit" />
										<text class="clothes-name">{{ item.name }}</text>
									</template>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<!-- 编辑模式底部按钮 -->
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


			<!-- 右下角浮动按钮 -->
			<!-- <view v-if="!this.isEditMode" class="floating-btn" @click="onFloatingButtonClick">
				<image class="floating-btn-image" src="/static/plus-l.png" mode="aspectFit"></image>
			</view> -->
		</view>
	</view>
</template>


<script>
	import {themes} from '@/components/theme.js'
	export default {
		data() {
			return {
				currentMainCategoryIndex: 0,
				categories: ["上衣", "裤子", "鞋", "配饰", "包"],
				subCategories: {
					上衣: ["T恤", "衬衫", "外套", "羽绒服"],
					裤子: ["牛仔裤", "运动裤", "休闲裤", "裙子"],
					鞋: ["运动鞋", "板鞋", "高跟鞋", "靴子"],
					配饰: ["帽子", "眼镜", "丝巾"],
					包: ["单肩包", "双肩包"]
				},
				clothes: [],
				isSubCollapsed: {},
				isEditMode: false,
				selectedClothes: [],
				theme: themes[0],
				themes
			};
		},
		computed: {
			currentSubCategories() {
				const mainCat = this.categories[this.currentMainCategoryIndex];
				return this.subCategories[mainCat] || [];
			},
		},
		onShow() {
			const saved = uni.getStorageSync('theme') || this.themes[0];
			this.theme=saved;
			
			this.clothes = uni.getStorageSync("clothes") || [];
			this.currentSubCategories.forEach(sub => {
				this.$set(this.isSubCollapsed, sub, false);
			});
		},
		watch: {
			currentMainCategoryIndex() {
				const subCats = this.currentSubCategories;
				this.isSubCollapsed = {};
				subCats.forEach(sub => {
					this.$set(this.isSubCollapsed, sub, false);
				});
			},
		},
		methods: {
			getTabStyle(id) {
			      const base = {
			        padding: '10px',
			        fontSize: '14px',
			        color: this.theme.textColor,
			      };
			      if (id === this.currentMainCategoryIndex) {
			        base.color = this.theme.highlightTextColor;
			        base.fontWeight = 'bold';
			      }
			      return base;
			    },
			selectMainCategory(index) {
				this.currentMainCategoryIndex = index;
			},
			toggleSubCollapse(subCat) {
				this.$set(this.isSubCollapsed, subCat, !this.isSubCollapsed[subCat]);
			},
			getClothesForSub(subCat) {
				const main = this.categories[this.currentMainCategoryIndex];
				return this.clothes.filter(item => item.primaryCategory === main && item.secondaryCategory === subCat);
			},
			getClothesForMain(mainCat){
				return this.clothes.filter(item => item.primaryCategory === mainCat);
			},
			getRows(clothesList) {
				const rows = [];
				for (let i = 0; i < clothesList.length; i += 3) {
					rows.push(clothesList.slice(i, i + 3));
				}
				return rows;
			},
			onFloatingButtonClick() {
				uni.navigateTo({
					url: "/pages/addClothes/addClothes"
				});
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
				const index = this.selectedClothes.indexOf(item);
				if (index > -1) {
					this.selectedClothes.splice(index, 1);
				} else {
					this.selectedClothes.push(item);
				}
			},
			deleteSelected() {
				if (this.selectedClothes.length === 0) return;
				this.clothes = this.clothes.filter(c => !this.selectedClothes.includes(c));
				this.selectedClothes = [];
				this.saveClothes();
			},
			matchSelected() {
				if (this.selectedClothes.length <= 0) {
					uni.showToast({
						title: '至少选择一件衣物进行搭配',
						icon: 'none'
					});
					return;
				}

				const clothesParam = encodeURIComponent(JSON.stringify(this.selectedClothes));
				if (this.isEditMode)
					this.toggleEditMode();

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
				const mainCat = this.categories[this.currentMainCategoryIndex];
				const clothesList = this.clothes
					.filter(item => item.primaryCategory === mainCat && item.secondaryCategory === subCat);
				return [{
					isAdd: true,
					primaryCategory: mainCat,
					secondaryCategory: subCat
				}, ...clothesList];
			},
			// 统一添加跳转
			onAddItemClick(item) {
				if (this.isEditMode)
					this.toggleEditMode();
				setTimeout(()=>{
					uni.navigateTo({
						url: `/pages/addClothes/addClothes?primaryCategory=${encodeURIComponent(item.primaryCategory)}&secondaryCategory=${encodeURIComponent(item.secondaryCategory)}`
					});
				},100);
				
			},
		}
	};
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f8f8f8;
	}

	.header-container {
		background-color: #ffffff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding-top: calc(var(--status-bar-height) + 30px);
		padding-bottom: 10px;
		align-items: center;
		justify-content: space-between;
		position: relative;
	}

	.title-text {
		position: absolute;
		  left: 50%;
		  transform: translateX(-50%);
		font-size: 18px;
		font-weight: bold;
		text-align: center;		
	}

	.category-level-1 {
		display: flex;
		justify-content: space-around;
		margin-top: 50px;
		/* border-bottom: 0.5px solid #939393; */
	}

	.category-tab {
		padding: 10px;
		font-size: 14px;
		color: #666;
	}

	.category-tab.active {
		color: #4b5bb4;
		font-weight: bold;
	}

	.main-content {
		margin-top: 5px;
		height: calc(100vh - 160px);
		flex: 1;
		position: relative;
	}

	.list-area {
		height: 100%;
		overflow-y: auto;
	}

	.subcategory-section {
		background: #fcfcfc;
		margin-bottom: 10px;
		padding: 10px;
	}

	.subcategory-header {
		display: flex;
		justify-content: space-between;
		font-size: 16px;
		margin-bottom: 8px;
	}

	.subcategory-title {
		margin-left: 15px;
		color: #666;
	}

	.toggle-btn {
		color: #4b5bb4;
		font-size: 14px;
		margin-right: 10px;
	}


	.clothes-section {
		display: flex;
		flex-direction: column;
	}

	.clothes-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		width: 100%;
		gap: 2%;
		padding: 5px 10px;
	}




	.clothes-item {
		position: relative;
		width: 30%;
		padding: 10px;
		box-sizing: border-box;
		background: #fff;
		border-radius: 5px;
		border: 1px solid #dddddd;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}


	/* 每行第3个不要 margin-right */
	.clothes-row .clothes-item:nth-child(3n) {
		margin-right: 0;
	}

	.clothes-image {
		width: 100%;
		height: 100px;
		object-fit: cover;
		border-radius: 6px;
	}

	.clothes-name {
		margin-top: 5px;
		font-size: 14px;
		color: #333;
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30px 0;
	}

	.emptyIcon {
		width: 120px;
		height: 120px;
		margin-bottom: 10px;
	}

	.empty-state-text {
		color: #bbb;
		font-size: 14px;
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

	.edit-btn {
		position: absolute;
		left: 20px;
		/* top: calc(var(--status-bar-height) + 40px); */
		font-size: 14px;
		color: #4b5bb4;
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



	.bottom-action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		display: flex;
		justify-content: space-around;
		padding: 8px 0;
		background-color: #ffffff;
		box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
		z-index: 99;
	}

	.action-btn {
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.action-icon {
		width: 28px;
		height: 28px;
		margin-bottom: 4px;
	}

	.action-text {
		font-size: 14px;
		color: #707070;
	}


	.clothes-item.add-item {
		background: #fff;
		border: 1px dashed #ccc;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.add-icon {
		width: 40px !important;
		height: 40px !important;
		object-fit: contain;
		padding: 30px 0;
	}


	/* 你可以额外给空态的 wrapper 加点距离 */
	.empty-state-wrapper {
		padding-bottom: 10px;
	}
</style>