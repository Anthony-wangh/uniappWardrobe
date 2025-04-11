<template>
	<view class="container">
		<!-- 顶部类目 -->
		<view class="header-container">
			<view class="title-container">			
				
				
			</view>
			<text class="title-text">我的衣橱</text>
			<view class="category-level-1">
				<view v-for="(category, index) in categories" :key="index" class="category-tab"
					:class="{ active: currentMainCategoryIndex === index }" @click="selectMainCategory(index)">
					{{ category }}
				</view>
			</view>
		</view>
		<view class="main-container">
			<!-- 左侧副类目 -->
			<view class="category-container">
				<scroll-view class="category-level-2" scroll-y>
					<view class="category-wrapper">
						<view v-for="(subCat, index) in currentSubCategories" :key="index" class="category-item"
							:class="{ active: currentSubCategoryIndex === index }" @click="selectSubCategory(index)">
							{{ subCat }}
						</view>
					</view>
				</scroll-view>
				<view class="add-category">
					<text v-if="!editModel" class="add-category-btn">自定义</text>
				</view>
			</view>


			<!-- 衣物列表 -->
			<view class="clothes-list">
				<!-- 如果没有过滤到衣物，显示空态页 -->
				<view v-if="filteredClothesRows.length === 0" class="empty-state">
					<image src="/static/empty.png" class="emptyIcon"></image>
					<text class="empty-state-text">暂无数据</text>
				</view>
				<scroll-view v-else class="clothes-list-content" scroll-y>
					<view class="clothes-row" v-for="(row, rowIndex) in filteredClothesRows" :key="rowIndex">
						<view class="clothes-item" v-for="(item, itemIndex) in row" :key="itemIndex"
							@click="editModel ? toggleSelect(item) : editClothes(item)"
							@longpress="longpressClothes(item)">
							<!-- 复选框（仅在编辑模式下显示） -->
							<checkbox v-if="editModel" class="select-checkbox" :value="item.id"
								:checked="selectedClothes.includes(item.id)" @click.stop="toggleSelect(item)">
							</checkbox>
							<image class="clothes-image" :src="item.image" mode="aspectFit" />
							<!-- <text class="clothes-time">{{ item.purchaseDate }}</text> -->
							<text class="clothes-name">{{ item.name }}</text>
						</view>
						<!-- 用占位符填充，使每行始终保持 3 列 -->
						<view class="clothes-item placeholder" v-for="(n, index) in (2 - (row?.length || 0))"
							:key="'placeholder' + index">
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
		<!-- 添加类目弹窗 -->
		<view class="modal-mask" v-if="showModal">
			<view class="modal">
				<text class="modal-title">添加类目</text>
				<input class="modal-input" v-model="newCategoryName" placeholder="请输入类目名称(不超过5个字符)" />
				<text class="error-msg" v-if="errorMsg">{{ errorMsg }}</text>
				<view class="modal-buttons">
					<button class="cancel-btn" @click="closeModal">取消</button>
					<button class="confirm-btn" @click="addCategory">确定</button>
				</view>
			</view>
		</view>

		<!-- 右下角浮动按钮 -->
		<view class="floating-btn" v-if="!editModel" @click="onFloatingButtonClick">
			<image class="floating-btn-image" src="/static/plus-l.png" mode="aspectFit"></image>
			<!-- <text class="floating-btn-text">添加衣服</text> -->
		</view>


		<!-- 编辑模式 -->
		<view v-if="editModel" class="editBtn-container">
			<view @click="cancleEditMode">
				<image class="editBtn" src="/static/tuichu.png">
				</image>
				<text class="editBtnName">退出</text>
			</view>

			<view @click="deleteClothes">
				<image class="editBtn" src="/static/shanchu.png">
				</image>
				<text class="editBtnName">删除</text>
			</view>

			<view @click="beginEdit">
				<image class="editBtn" src="/static/dapeixinxi.png">
				</image>
				<text class="editBtnName">搭配</text>
			</view>

		</view>
		<!-- 删除确认弹窗 -->
		<view class="modal-mask" v-if="showDeleteModal">
			<view class="modal">
				<text class="modal-title">确认删除？</text>
				<text class="modal-text">删除后，该类目下的衣物不会被删除。</text>
				<view class="modal-buttons">
					<button class="cancel-btn" @click="closeDeleteModal">取消</button>
					<button class="confirm-btn" @click="deleteCategory">删除</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentMainCategoryIndex: 0,
				currentSubCategoryIndex: 0,
				categories: ["上衣", "裤子", "鞋", "配饰", "包"],
				subCategories: {
					上衣: ["全部", "T恤", "衬衫", "外套", "羽绒服"],
					裤子: ["全部", "牛仔裤", "运动裤", "休闲裤", "裙子"],
					鞋: ["全部", "运动鞋", "高跟鞋", "靴子", "皮鞋", "休闲鞋", "拖鞋"],
					配饰: ["全部", "帽子", "眼镜", "丝巾"],
					包: ["全部"]
				},
				clothes: [],
				showModal: false,
				newCategoryName: "",
				errorMsg: "",
				filteredClothes: [],
				filteredClothesRows: [],
				showDeleteModal: false,
				deleteCategoryIndex: null,
				editModel: false,
				selectedClothes: []
			};
		},
		computed: {
			currentSubCategories() {
				return this.subCategories[this.categories[this.currentMainCategoryIndex]] || [];
			}
		},
		onShow() {
			const app = getApp();
			const wardrobeData = app.globalData.wardrobeData || {};
			if (wardrobeData.editMode) {
				this.editModel = true;
				uni.hideTabBar();
			}

			this.clothes = uni.getStorageSync("clothes") || [];
			const storedCategories = uni.getStorageSync("clothesCategories");
			if (storedCategories) this.categories = storedCategories;
			this.filteredClothesByCategory();
		},
		methods: {
			filteredClothesByCategory() {
				const main = this.categories[this.currentMainCategoryIndex];
				const sub = this.currentSubCategories[this.currentSubCategoryIndex];

				this.filteredClothes = this.clothes.filter(cloth => {
					const matchMain = cloth.primaryCategory === main;
					const matchSub = sub === "全部" || cloth.secondaryCategory === sub;
					return matchMain && matchSub;
				});

				this.filteredClothesWithRows();
			},
			filteredClothesWithRows() {
				const rows = [];
				let tempRow = [];

				this.filteredClothes.forEach((item, index) => {
					if (!item) return;
					tempRow.push(item);
					if (tempRow.length === 2 || index === this.filteredClothes.length - 1) {
						rows.push([...tempRow]);
						tempRow = [];
					}
				});

				this.filteredClothesRows = rows.filter(row => row.length > 0);
			},
			selectMainCategory(index) {
				this.currentMainCategoryIndex = index;
				this.currentSubCategoryIndex = 0;
				this.filteredClothesByCategory();
			},
			selectSubCategory(index) {
				this.currentSubCategoryIndex = index;
				this.filteredClothesByCategory();
			},
			showAddCategoryModal() {
				this.showModal = true;
				this.newCategoryName = "";
				this.errorMsg = "";
			},
			closeModal() {
				this.showModal = false;
			},
			addCategory() {
				const newName = this.newCategoryName.trim();
				if (!newName) {
					this.errorMsg = "类目名称不能为空";
					return;
				}
				if (newName.length > 5) {
					this.errorMsg = "不得超过5个字符";
					return;
				}
				if (this.categories.includes(newName)) {
					this.errorMsg = "该类目已存在，请输入其他名称";
					return;
				}

				this.categories.push(newName);
				this.subCategories[newName] = ["全部"];
				uni.setStorageSync("clothesCategories", this.categories);
				this.closeModal();
				uni.showToast({
					title: "添加类目成功！",
					icon: "success"
				});
			},
			confirmDeleteCategory(index) {
				if (index === 0) {
					uni.showToast({
						title: "默认类目不可删除",
						icon: "none"
					});
					return;
				}
				this.deleteCategoryIndex = index;
				this.showDeleteModal = true;
			},
			deleteCategory() {
				if (this.deleteCategoryIndex !== null) {
					const removed = this.categories.splice(this.deleteCategoryIndex, 1)[0];
					delete this.subCategories[removed];
					this.currentMainCategoryIndex = 0;
					this.currentSubCategoryIndex = 0;
					this.filteredClothesByCategory();
					uni.setStorageSync("clothesCategories", this.categories);
				}
				this.showDeleteModal = false;
				this.deleteCategoryIndex = null;
				uni.showToast({
					title: "删除成功",
					icon: "success"
				});
			},
			closeDeleteModal() {
				this.showDeleteModal = false;
				this.deleteCategoryIndex = null;
			},
			onFloatingButtonClick() {
				uni.navigateTo({
					url: "/pages/addClothes/addClothes"
				});
			},
			editClothes(item) {
				uni.navigateTo({
					url: `/pages/addClothes/addClothes?data=${encodeURIComponent(JSON.stringify(item))}`
				});
			},
			longpressClothes(item) {
				setTimeout(() => {
					this.editModel = true;
				}, 100);
			},
			cancleEditMode() {
				this.editModel = false;
			},
			beginEdit() {
				if (this.selectedClothes.length === 0) {
					uni.showToast({
						title: "请选择衣物",
						icon: "none"
					});
					return;
				}

				this.cancleEditMode();
				const selectedItems = this.clothes.filter(item => this.selectedClothes.includes(item.id));
				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/addMatching/addMatching?data=${encodeURIComponent(JSON.stringify(selectedItems))}`
					});
				}, 100);
			},
			deleteClothes() {
				if (this.selectedClothes.length === 0) {
					uni.showToast({
						title: "请选择衣物",
						icon: "none"
					});
					return;
				}

				uni.showModal({
					title: "确定要删除？",
					content: "确定彻底删除后将无法恢复！",
					success: res => {
						if (res.confirm) {
							this.clothes = this.clothes.filter(item => !this.selectedClothes.includes(item
								.id));
							this.filteredClothesByCategory();
							this.cancleEditMode();
							uni.setStorageSync("clothes", this.clothes);
							uni.showToast({
								title: "已删除！",
								icon: "success"
							});
						}
					}
				});
			},
			toggleSelect(item) {
				const index = this.selectedClothes.indexOf(item.id);
				if (index === -1) {
					this.selectedClothes.push(item.id);
				} else {
					this.selectedClothes.splice(index, 1);
				}
			}
		}
	};
</script>

<style scoped>
	/* 全局容器 */
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f8f8f8;

	}

	.header-container {
		padding-top: calc(var(--status-bar-height) + 30px);
		/* padding-bottom: 10px; */
		justify-items: center;
		width: 100%;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.title-text {
		font-size: 16px;
		font-weight: bold;
		color: #333;
		text-align: center;
	}

	.main-container {
		display: flex;
		flex-direction: row;
		height: 100%;
	}

	.editBtn-container {
		position: absolute;
		width: 100%;
		height: 50px;
		bottom: 0;
		justify-content: space-around;
		display: flex;
		padding: 10px 0;
		background-color: #f8f8f8;
		box-shadow: 0px -1px 2px rgba(0, 0, 0, 0.2);
	}


	.editBtnName {
		font-size: 12px;
		color: #707070;
	}

	.editBtn {
		width: 20px;
		height: 20px;
		display: block;
	}

	/* 右下角浮动按钮 */
	.floating-btn {
		display: flex;
		flex-direction: column;
		position: fixed;

		width: 50px;
		height: 50px;
		right: 20px;
		bottom: 40px;
		background-color: #ccd3ff;
		border-radius: 25px;
		box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
		align-items: center;
		justify-content: center;

	}

	.floating-btn-image {
		width: 35px;
		height: 35px;
		align-self: center;
	}


	/* 一级分类（季节） */
	.category-level-1 {
		align-self: center;
		display: flex;
		justify-content: space-between;
		/* 保持间距 */
		width: 100%;

		padding: 10px 0;

	}

	/* 一级类目按钮 */
	.category-tab {
		flex: 1;
		text-align: center;
		/* 文字居中 */
		padding: 10px 0;
		color: #383838;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 16px;
	}

	/* 选中状态 */
	.category-tab.active {
		color: #909cd1;
		font-weight: bold;
		position: relative;
	}

	/* 底部横线 */
	.category-tab.active::after {
		content: "";
		position: absolute;
		bottom: -3px;
		left: 35%;
		width: 30%;
		height: 3px;
		background-color: #9399b8;
		border-radius: 2px;
	}


	/* 二级分类 */
	.category-container {
		width: 80px;
		min-width: 80px;
		display: block;
		align-items: center;
		background-color: #f4f4f4;
		overflow: hidden;
		height: 100%;
		margin-top: 2px;
		box-shadow: 1px 0px 2px rgba(0, 0, 0, 0.1);
	}

	.category-level-2 {
		flex-grow: 1;
		white-space: nowrap;
		overflow-y: auto;
		max-height: calc(100vh - 110px);
		/* 适当调整 */
	}

	.category-wrapper {
		display: flex;
		flex-direction: column;
	}

	.category-item {
		width: 100%;
		padding: 10px 0px;
		text-align: center;
		cursor: pointer;
		background-color: #f8f8f8;
		color: #666;
		transition: all 0.2s;
		font-size: 14px;
	}

	/* 二级类目选中时左侧竖线 */
	.category-item.active {
		position: relative;
		background-color: #ffffff;
		color: #909cd1;
		font-weight: bold;
	}

	.category-item.active::before {
		content: "";
		position: absolute;
		right: 0;
		bottom: 0;
		width: 3px;
		height: 100%;
		background-color: #9399b8;
		border-radius: 2px;
	}

	.add-category {
		width: 100%;
		height: 20px;
		justify-content: center;
		padding: 10px 0;
		display: flex;
		flex-direction: column;
	}

	/* 添加分类按钮 */
	.add-category-btn {

		color: #4b5bb4;
		font-size: 12px;
		text-align: center;
	}

	/* 空态页样式 */
	.empty-state {
		position: relative;
		top: 50px;
		width: 100%;
		height: 100%;
		flex-direction: column;
		display: flex;
		align-items: center;
	}

	.emptyIcon {
		width: 200px;
		height: 200px;
	}

	.empty-state-text {
		font-size: 15px;
		color: #d0d0d0;
	}

	/* 衣物列表 */
	.clothes-list {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: calc(100vh - 150px);
		margin-top: 6px;
	}

	.clothes-list-content {
		width: 100%;
		flex: 1;
		overflow-y: auto;
	}

	/* 每一行 */
	.clothes-row {
		display: flex;
		flex: 1;
		justify-content: space-between;
	}

	/* 衣物卡片 */
	.clothes-item {
		/* width: calc(50% - 20px); */
		margin: 10px;
		padding: 20px;
		background-color: #ffffff;
		border-radius: 5px;
		box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
		text-align: center;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 120px;
	}

	.clothes-item.placeholder {
		visibility: hidden;
	}

	/* 图片 */
	.clothes-image {
		width: 120px;
		height: 120px;
		/* border-radius: 10px; */
		margin-bottom: 5px;
	}

	/* 衣物时间 */
	.clothes-time {
		font-size: 12px;
		color: #999;
		position: absolute;
		bottom: 5px;
		width: 100%;
		text-align: center;
	}

	/* 衣物名称 */
	.clothes-name {
		margin-top: 10px;
		font-size: 16px;
		color: #000000;
	}

	/* 复选框（右上角） */
	.select-checkbox {
		position: absolute;
		top: 5px;
		right: 5px;
		width: 20px;
		height: 20px;
		background-color: white;
		border-radius: 50%;
		z-index: 10;
	}

	/* 弹窗背景 */
	.modal-mask {
		position: fixed;
		z-index: 1000;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* 弹窗内容 */
	.modal {
		width: 80%;
		background: white;
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
		text-align: center;
		display: flex;
		flex-direction: column;
	}

	/* 标题 */
	.modal-title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-bottom: 10px;
	}

	/* 输入框 */
	.modal-input {
		width: 90%;
		padding: 10px;
		margin: 10px 0;
		border: 1px solid #ddd;
		border-radius: 5px;
		font-size: 16px;
		text-align: center;
	}

	/* 错误提示 */
	.error-msg {
		color: red;
		font-size: 14px;
		margin-bottom: 10px;
	}

	/* 按钮区域 */
	.modal-buttons {
		display: flex;
		justify-content: space-around;
		margin-top: 10px;
	}

	/* 取消按钮 */
	.cancel-btn {
		padding: 0px 20px;
		background: #d4d4d4;
		color: #333;
		border: none;
		border-radius: 5px;
		font-size: 16px;
		cursor: pointer;
	}

	/* 确定按钮 */
	.confirm-btn {
		padding: 0px 20px;
		background: #fffccc;
		color: #333;
		border: none;
		border-radius: 5px;
		font-size: 16px;
		cursor: pointer;
	}

	/* 删除确认弹窗文本 */
	.modal-text {
		font-size: 14px;
		color: #666;
		margin-bottom: 10px;
	}
</style>