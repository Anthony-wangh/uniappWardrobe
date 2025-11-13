<template>
	<view class="category-container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">类目设置</text>
		</view>

		<!-- 单选标签 -->
		<view class="tab-container">
			<view class="tab-item" :class="{ 'active': activeTab === 'clothes' }" @click="activeTab = 'clothes'">
				衣服类目
			</view>
			<view class="tab-item" :class="{ 'active': activeTab === 'match' }" @click="activeTab = 'match'">
				穿搭场景
			</view>
		</view>

		<!-- 主类目列表 -->
		<scroll-view scroll-y class="category-list" @click="dropdownIndex=null">

			<!-- 衣服类目 -->
			<block v-if="activeTab === 'clothes'">
				<view v-for="(subList, category, index) in categoriesMap" :key="category" class="category-item">
					<!-- 主类目头部 -->
					<view class="category-header">
						<view class="header-content">
							<image class="category-icon" :src="categoryIcon(category)" />
							<text class="category-name">{{ category }}</text>
						</view>
					</view>

					<!-- 子类目网格 -->
					<view class="sub-grid">
						<view v-for="(sub, subIndex) in subList" :key="subIndex" class="sub-item-wrapper">
							<view class="sub-item" @click="editSubCategory(category,sub,subIndex)">
								<text class="sub-item-text">{{ sub }}</text>
								<text class="sub-item-delete" src="/static/handleIcons/delete.png"
									@click.stop="deleteSubCategory(category,sub,subIndex)">x</text>
							</view>
						</view>
						<view class="sub-item-wrapper">
							<view class="sub-item add-match-item" @click="addSubCategory(category)">
								<image class="add-icon" src="/static/plus-l.png" />
							</view>
						</view>
					</view>
				</view>
			</block>

			<!-- 搭配类目 -->
			<block v-if="activeTab === 'match'">
				<!-- 搭配类目区域 -->
				<view class="match-section">
					<view class="sub-grid">
						<view v-for="(item, index) in matchCategories" :key="index" class="sub-item-wrapper">
							<view class="sub-item" @click="editMatchCategory(index)">
								<text class="sub-item-text">{{ item }}</text>
								<text class="sub-item-delete" src="/static/handleIcons/delete.png"
									@click.stop="deleteMatchCategory(index)">x</text>
							</view>
						</view>
						<view class="sub-item-wrapper">
							<view class="add-match-item" @click="addMatchCategory">
								<image class="add-icon" src="/static/plus-l.png" />
							</view>
						</view>
					</view>
				</view>
			</block>

		</scroll-view>

		<!-- 右下角浮动按钮 - 仅用于添加衣物类目 -->
		<!-- <view v-if="activeTab === 'clothes'" class="floating-btn" @click="openAddCategory">
			<image class="floating-btn-image" src="/static/plus-l.png" mode="aspectFit"></image>
		</view> -->

		<!-- 输入弹窗 -->
		<view v-if="modalVisible" class="modal-mask" @click="modalVisible = false">
			<view class="modal" @click.stop>
				<view class="modal-title">{{ modalTitle }}</view>
				<view class="modal-context">
					<input v-model="inputValue" class="modal-input" placeholder="请输入类目名称" />
				</view>
				<view class="modal-tip">输入最多10个字</view>
				<view class="modal-actions">
					<view class="modal-actions-cancle" @click="modalVisible = false">取消</view>
					<view class="modal-actions-confirm" @click="confirmModal">确定</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				categoriesMap: {
					上衣: ['T恤', '衬衫', '外套', '羽绒服'],
					裤子: ['牛仔裤', '运动裤', '休闲裤', '裙子'],
					裙装: ['连衣裙','短裙'],
					鞋: ['运动鞋', '板鞋', '高跟鞋', '靴子'],
					配饰: ['帽子', '眼镜', '丝巾'],
					包: ['单肩包', '双肩包']
				},
				categoriesIcons: {
					上衣: 'upClothes',
					裤子: 'pants',
					裙装: 'dress',
					鞋: 'shoots',
					包: 'packege',
					配饰: 'accessories'
				},
				modalVisible: false,
				modalTitle: '',
				inputValue: '',
				actionType: '',
				targetCategory: '',
				sourceSubCategoryIndex: null,
				//搭配类目
				matchCategories: ['日常通勤', '春日出游', '周末约会', '正式场合'],
				// 当前选中的标签
				activeTab: 'clothes',

				
			};
		},
		onShow() {
			const category = uni.getStorageSync('wartrobeCategories');
			if (category) {
				this.categoriesMap = category;
			}

			const match = uni.getStorageSync('matchCategories');
			if (match && Array.isArray(match)) {
				this.matchCategories = match;
			}
		},
		methods: {
			categoryIcon(item) {
				const iconName = this.categoriesIcons[item];
				return `/static/category/${iconName}-select.png`;
			},
			addSubCategory(category) {
				this.modalTitle = `新增“${category}”的子类目`;
				this.inputValue = '';
				this.actionType = 'addSub';
				this.targetCategory = category;
				this.modalVisible = true;
			},
			openAddCategory() {
				uni.showActionSheet({
					itemList: ['新增衣物类目', '新增搭配类目'],
					success: res => {
						if (res.tapIndex === 0) {
							this.modalTitle = '新增主类目';
							this.actionType = 'addMain';
						} else {
							this.modalTitle = '新增搭配类目';
							this.actionType = 'addMatch';
						}
						this.inputValue = '';
						this.modalVisible = true;
					}
				});
			},

			editSubCategory(mainCategory, subCategory, index) {
				this.modalTitle = '修改类目';
				this.targetCategory = mainCategory;
				this.inputValue = subCategory;
				this.sourceSubCategoryIndex = index;
				this.actionType = 'editSub';
				this.modalVisible = true;
			},
			deleteSubCategory(mainCategory, subCategory, index) {
				uni.showModal({
					title: '提示',
					content: `确定删除“${mainCategory}/${subCategory}”类目？`,
					success: res => {
						if (res.confirm) {
							const list = this.categoriesMap[mainCategory];
							list.splice(index, 1);
							this.save();
						}
					}
				});
			},
			confirmModal() {
				const value = this.inputValue.trim();
				if (value.length > 10) {
					uni.showToast({
						title: '最多10个文字',
						icon: 'none',
					});
					return;
				}
				if (!value) return uni.showToast({
					title: '名称不能为空',
					icon: 'none'
				});

				if (this.actionType === 'addMain') {
					if (this.categoriesMap[value]) {
						return uni.showToast({
							title: '主类目已存在',
							icon: 'none'
						});
					}
					this.$set(this.categoriesMap, value, []);
				} else if (this.actionType === 'editMain') {
					// 衣物一级类目不可修改名称
					uni.showToast({
						title: '衣物一级类目不可修改',
						icon: 'none'
					});
					this.modalVisible = false;
					return;
				} else if (this.actionType === 'addSub') {
					const list = this.categoriesMap[this.targetCategory];
					if (list.includes(value)) {
						return uni.showToast({
							title: '子类目已存在',
							icon: 'none'
						});
					}
					list.push(value);
				} else if (this.actionType === 'editSub') {
					const sublist = this.categoriesMap[this.targetCategory];
					if (sublist.includes(value) && sublist[this.sourceSubCategoryIndex] !== value) {
						return uni.showToast({
							title: '子类目已存在',
							icon: 'none'
						});
					}
					sublist[this.sourceSubCategoryIndex] = value;
					this.categoriesMap[this.targetCategory] = sublist;
					this.sourceSubCategoryIndex = null;
				} else if (this.actionType === 'editMatch') {
					if (this.matchCategories.includes(value)) {
						return uni.showToast({
							title: '搭配类目已存在',
							icon: 'none'
						});
					}
					this.matchCategories[this.sourceSubCategoryIndex] = value;
					this.sourceSubCategoryIndex = null;
				} else if (this.actionType === 'addMatch') {
					if (this.matchCategories.includes(value)) {
						return uni.showToast({
							title: '搭配类目已存在',
							icon: 'none'
						});
					}
					this.matchCategories.push(value);
				}
				this.modalVisible = false;
				this.inputValue = '';
				this.save();
			},
			save() {
				uni.setStorageSync('wartrobeCategories', this.categoriesMap);
				uni.setStorageSync('matchCategories', this.matchCategories);
			},
			goBack() {
				uni.navigateBack();
			},

			editMatchCategory(index) {
				this.modalTitle = '修改搭配类目';
				this.inputValue = this.matchCategories[index];
				this.actionType = 'editMatch';
				this.sourceSubCategoryIndex = index;
				this.modalVisible = true;
			},

			deleteMatchCategory(index) {
				uni.showModal({
					title: '提示',
					content: `确定删除“${this.matchCategories[index]}”搭配类目？`,
					success: res => {
						if (res.confirm) {
							this.matchCategories.splice(index, 1);
							this.save();
						}
					}
				});
			},

			addMatchCategory() {
				this.modalTitle = '新增搭配类目';
				this.inputValue = '';
				this.actionType = 'addMatch';
				this.modalVisible = true;
			}
		}
	};
</script>

<style scoped>
	.category-container {
		background: #fdfdfd;
		position: relative;
		justify-items: center;
		align-items: center;
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

	/* 标签页样式 */
	.tab-container {
		width: 100%;
		display: flex;
		background-color: #fff;
		border-bottom: 1px solid #e5e5e5;
		padding: 0 10px;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 12px 0;
		font-size: 16px;
		color: #666;
		border-bottom: 2px solid transparent;
	}

	.tab-item.active {
		color: #8A6FDF;
		border-bottom: 2px solid #8A6FDF;
		font-weight: bold;
	}

	.category-list {
		height: calc(100vh - 150px);
		width: 100%;
		/* margin: 0 10px; */
	}

	.category-item {
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
		margin-bottom: 15px;
		overflow: hidden;
	}

	.category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
	}

	.header-content {
		display: flex;
		align-items: center;
	}

	.category-icon {
		width: 25px;
		height: 25px;
		margin-right: 10px;
	}

	.category-name {
		color: #7f6edf;
		font-size: 14px;
		font-weight: bold;
	}

	.add-sub-btn {
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #8A6FDF;
		border-radius: 50%;
	}

	.add-icon {
		width: 18px;
		height: 18px;
	}

	.sub-grid {
		display: flex;
		flex-wrap: wrap;
		margin: 10px;
		gap: 20px;
	}

	.sub-item-wrapper {
		flex: 0 0 calc((100% - 80px)/5);
		/* 5个子项一行 */

	}

	.sub-item {
		position: relative;
		/* width: 100px; */
		height: 40px;
		border-radius: 8rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
	}

	.sub-item-text {
		font-size: 12px;
		color: #666;
		text-align: center;
		padding: 0 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}


	.sub-item-delete {
		color: #6d62c3;
		font-size: 18px;
		position: absolute;
		right: -5px;
		top: -12px;
	}



	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}

	.modal {
		background: white;
		padding-top: 20px;
		width: 80%;
		border-radius: 10px;
		justify-items: center;
		display: flex;
		flex-direction: column;
	}

	.modal-title {
		font-weight: bold;
		font-size: 16px;
		margin-bottom: 20px;
		text-align: center;
	}

	.modal-context {
		width: 100%;
		margin-bottom: 10px;
	}

	.modal-input {
		border: 1px solid #b5b5b5;
		border-radius: 6px;
		margin: 5px 10px;

		padding: 8px;
		text-align: center;

	}
	
	.modal-tip{
		font-size: 12px;
		color: #919191;
		margin: 5px 10px;
		text-align: center;
	}

	.modal-actions {
		width: 100%;
		display: flex;
		justify-content: space-around;
		border-top: #ddd solid 1px;
		flex: 1;
		margin-top: 5px;
		
	}
	
	.modal-actions-cancle{
		font-size: 14px;
		color: #333;
		text-align: center;
		width: 50%;
		padding: 10px 0;
	}
	.modal-actions-confirm{
		width: 50%;
		font-size: 14px;
		color: #6d62c3;
		text-align: center;
		border-left: #ddd solid 1px;
		padding: 10px 0;
	}

	.section-title {
		padding: 12px 0 6px;
		font-size: 16px;
		font-weight: bold;
		color: #333;
	}

	.match-section {
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
		padding: 10px;
		margin-bottom: 15px;
	}

	.add-match-item {
		background-color: #d8d8ff;
		border: 1px dashed #a3a8ef;
		display: flex;
		justify-content: center;
		align-items: center;
		
		height: 40px;
		border-radius: 8rpx;
	}
</style>