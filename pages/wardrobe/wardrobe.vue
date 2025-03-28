<template>
	<view class="container">

		<!-- 一级类目 -->
		<view class="category-level-1">
			<view v-for="(season, index) in seasons" :key="index" class="season-item"
				:class="{ 'active': currentSeasonIndex === index }" @click="selectSeason(index)"
				@longpress="confirmDeleteCategory(index)">
				{{ season }}
			</view>
		</view>

		<view class="main-container">
		<!-- 二级类目（横向滑动） -->
		<view class="category-container">
			<scroll-view class="category-level-2" scroll-y>
				<view class="category-wrapper">
					<view v-for="(category, index) in categories" :key="index" class="category-item"
						:class="{ 'active': currentCategoryIndex === index }" @click="selectCategory(index)"
						@longpress="confirmDeleteCategory(index)">
						{{ category.name }}
					</view>
				</view>
			</scroll-view>
			<!-- 添加类目按钮 -->
			<image v-if="!editModel" src="/static/tianjia1.png" mode="aspectFit" class="add-category-btn"
				@click="showAddCategoryModal"></image>
		</view>


		<!-- 衣物列表 -->
		<scroll-view class="clothes-list" scroll-y>
			<!-- 如果没有过滤到衣物，显示空态页 -->
			<view v-if="filteredClothesRows.length === 0" class="empty-state">
				<image src="/static/empty.png" class="emptyIcon"></image>
				<text class="empty-state-text">当前没有衣物\n请点击右下角按钮添加衣服</text>
			</view>
			<view v-else class="clothes-list-content">
				<view class="clothes-row" v-for="(row, rowIndex) in filteredClothesRows" :key="rowIndex">
					<view class="clothes-item" v-for="(item, itemIndex) in row" :key="itemIndex"
						@click="editModel ? toggleSelect(item) : editClothes(item)" @longpress="longpressClothes(item)">
						<!-- 复选框（仅在编辑模式下显示） -->
						<checkbox v-if="editModel" class="select-checkbox" :value="item.id"
							:checked="selectedClothes.includes(item.id)" @click.stop="toggleSelect(item)">
						</checkbox>
						<image class="clothes-image" :src="item.image" mode="aspectFill" />
						<text class="clothes-time">{{ item.purchaseDate }}</text>
						<text class="clothes-name">{{ item.name }}</text>
					</view>
					<!-- 用占位符填充，使每行始终保持 3 列 -->
					<view class="clothes-item placeholder" v-for="(n, index) in (2 - (row?.length || 0))"
						:key="'placeholder' + index">
					</view>
				</view>
			</view>
		</scroll-view>
		</view>
		<!-- 添加类目弹窗 -->
		<view class="modal-mask" v-if="showModal">
			<view class="modal">
				<text class="modal-title">添加类目</text>
				<input class="modal-input" v-model="newCategoryName" placeholder="请输入类目名称" />
				<text class="error-msg" v-if="errorMsg">{{ errorMsg }}</text>
				<view class="modal-buttons">
					<button class="cancel-btn" @click="closeModal">取消</button>
					<button class="confirm-btn" @click="addCategory">确定</button>
				</view>
			</view>
		</view>

		<!-- 右下角浮动按钮 -->
		<view  class="floating-btn" v-if="!editModel" @click="onFloatingButtonClick">
			<image class="floating-btn-image" src="/static/tianjia1.png"></image>
			<text class="floating-btn-text">添加衣服</text>			
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
				currentSeasonIndex: 0,
				seasons: ['全部', '春', '夏', '秋', '冬'],
				currentCategoryIndex: 0,
				categories: [{
						name: '全部'
					},
					{
						name: '上衣'
					},
					{
						name: '裤子'
					},
					{
						name: '裙子'
					},
					{
						name: '鞋'
					},
					{
						name: '配饰'
					}
				],
				clothes: [],
				showModal: false, // 控制弹窗显示
				newCategoryName: "", // 输入的类目名称
				errorMsg: "", // 错误提示
				filteredClothes: [],
				filteredClothesRows: [],
				showDeleteModal: false, // 控制删除弹窗
				deleteCategoryIndex: null, // 记录要删除的类目索引
				editModel: false,
				wardrobeData: {
					editMode: false
				},
				selectedClothes: [], // 记录选中的衣物ID
			};
		},
		onShow() {
			const app = getApp();
			this.wardrobeData = app.globalData.wardrobeData;
			if (this.wardrobeData) {
				this.editModel = this.wardrobeData.editMode;
				this.wardrobeData = null;
				if (this.editModel)
					uni.hideTabBar();
			}

			this.clothes = uni.getStorageSync('clothes') || [];

			const categories = uni.getStorageSync('clothesCategories');
			if (categories)
				this.categories = categories;

			this.filteredClothesBycategory();
		},
		methods: {
			filteredClothesBycategory() {

				const selectedSeason = this.seasons[this.currentSeasonIndex];
				const selectedCategory = this.categories[this.currentCategoryIndex].name;

				if (this.clothes.length === 0)
					return;

				if (selectedSeason === '全部' && selectedCategory === '全部') {
					this.filteredClothes = this.clothes;
				} else if (selectedSeason === '全部') {
					this.filteredClothes = this.clothes.filter(cloth => cloth.secondaryCategory === selectedCategory);
				} else if (selectedCategory === '全部') {
					this.filteredClothes = this.clothes.filter(cloth => cloth.primaryCategory === selectedSeason);
				} else {
					this.filteredClothes = this.clothes.filter(cloth => cloth.primaryCategory === selectedSeason && cloth
						.secondaryCategory ===
						selectedCategory);
				}

				this.filteredClothesWithRows();
			},
			filteredClothesWithRows() {
				const rows = [];
				let tempRow = [];

				this.filteredClothes.forEach((item, index) => {
					if (!item) return; // 避免 null 被添加
					tempRow.push(item);
					if (tempRow.length === 2 || index === this.filteredClothes.length - 1) {
						rows.push([...tempRow]);
						tempRow = [];
					}
				});

				this.filteredClothesRows = rows.filter(row => row.length > 0); // 确保不存入空行
			},
			selectSeason(index) {
				this.currentSeasonIndex = index;
				this.filteredClothesBycategory();
			},
			selectCategory(index) {
				this.currentCategoryIndex = index;
				this.filteredClothesBycategory();
			},
			// 显示添加类目的弹窗
			showAddCategoryModal() {
				this.showModal = true;
				this.newCategoryName = "";
				this.errorMsg = "";
				uni.hideTabBar();
			},
			// 关闭弹窗
			closeModal() {
				this.showModal = false;
				uni.showTabBar();
			},
			// 添加类目
			addCategory() {
				const newName = this.newCategoryName.trim();
				if (!newName) {
					this.errorMsg = "类目名称不能为空";
					return;
				}
				// 检查是否重复
				if (this.categories.some(cat => cat.name === newName)) {
					this.errorMsg = "该类目已存在，请输入其他名称";
					return;
				}
				// 添加新类目
				this.categories.push({
					name: newName
				});

				uni.setStorageSync('clothesCategories', this.categories);
				this.showModal = false; // 关闭弹窗
				uni.showToast({
					title: '添加类目成功！',
					icon: 'success'
				});
			},
			onFloatingButtonClick() {
				uni.navigateTo({
					url: '/pages/addClothes/addClothes'
				});

			},
			// 询问是否删除类目
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

			// 执行删除操作
			deleteCategory() {
				if (this.deleteCategoryIndex !== null) {
					this.categories.splice(this.deleteCategoryIndex, 1);
					this.currentCategoryIndex = 0; // 选回 "全部"
					this.filteredClothesBycategory(); // 重新筛选衣物
					uni.setStorageSync('clothesCategories', this.categories); //保存
				}
				this.showDeleteModal = false;
				this.deleteCategoryIndex = null;
				uni.showToast({
					title: "删除成功",
					icon: "success"
				});
			},

			// 关闭删除弹窗
			closeDeleteModal() {
				this.showDeleteModal = false;
				this.deleteCategoryIndex = null;
			},

			// 进入编辑界面
			editClothes(item) {
				uni.navigateTo({
					url: `/pages/addClothes/addClothes?data=${encodeURIComponent(JSON.stringify(item))}`
				});
			},
			longpressClothes(item) {				
				uni.hideTabBar();
				setTimeout(()=>{
					this.editModel = true;
				},100);
			},
			cancleEditMode() {
				this.editModel = false;
				uni.showTabBar();
			},
			beginEdit() {
				if (this.selectedClothes.length === 0) {
					uni.showToast({
						title: '请选择衣物',
						icon: 'none'
					});
					return;
				}

				this.cancleEditMode();

				// 传递选中的衣物数据
				const selectedItems = this.clothes.filter(item => this.selectedClothes.includes(item.id));

				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/addMatching/addMatching?data=${encodeURIComponent(JSON.stringify(selectedItems))}`
					});
				}, 100);

			},
			deleteClothes(){
				if (this.selectedClothes.length === 0) {
					uni.showToast({
						title: '请选择衣物',
						icon: 'none'
					});
					return;
				}
				//删除选中的衣物
				
			},
			toggleSelect(item) {
				const index = this.selectedClothes.indexOf(item.id);
				if (index === -1) {
					this.selectedClothes.push(item.id); // 选中
				} else {
					this.selectedClothes.splice(index, 1); // 取消选中
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
		background-color: #f9f9f9;
		 
	}
	
	.main-container{
		display: flex;	
		flex-direction: row;
	}

	.editBtn-container {
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
		
		width: auto;
		height: auto;
		right: 20px;
		bottom: 40px;
		background: #fcfcfc;
		color: white;
		border-radius: 10%;
		box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
		border: none;
		cursor: pointer;
		padding: 5px 10px;
		align-items: center;
	}
	
	.floating-btn-text{
		color: #d0e183;
		font-size: 16px;
	}
	.floating-btn-image{
		width: 30px;
		height: 30px;
		
	}

	/* 一级分类（季节） */
	.category-level-1 {
		display: flex;
		justify-content: space-around;
		padding: 12px 0;
		background-color: #fff;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.season-item {
		padding: 10px 15px;
		color: #666;
		cursor: pointer;
		border-radius: 10px;
		transition: all 0.2s;
	}

	.season-item.active {
		color: #fff;
		font-weight: bold;
		background-color: #d0e183;
	}

	/* 二级分类（纵向滑动） */
	.category-container {
		display: block;
		align-items: center;
		background-color: #eaeaea;
		border-bottom: 1px solid #eee;
		height: calc(100vh - 100px);
	}

	.category-level-2 {
		flex-grow: 1;
		white-space: nowrap;
		overflow-y: auto;
		height: 100%;
	}


	.category-wrapper {
		display: flex;
		flex-direction: column;
		
	}

	.category-item {
		padding: 15px 20px;
		cursor: pointer;
		background-color: #f5f5f5;
		color: #333;
		transition: all 0.2s;
		font-size: 16px;
	}

	.category-item.active {
		background-color: #d0e183;
		color: white;
		font-weight: bold;
	}

	/* 添加分类按钮 */
	.add-category-btn {
		width: 100%;
		height: 20px;
		justify-content: center;
		box-shadow: 0px -1px 2px rgba(0, 0, 0, 0.1);
		background: #f7f7f7;
		padding: 8px 0;
	}

	/* 空态页样式 */
	.empty-state {
		flex: 1;
		flex-direction: column;
		margin: 30px;
		margin-top: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	.emptyIcon {
		width: 100px;
		height: 90px;
		padding: 5px;
	}

	.empty-state-text {
		font-size: 15px;
		color: #c7c7c7;
	}

	/* 衣物列表 */
	.clothes-list {
		flex: 1;
	}

	/* 每一行 */
	.clothes-row {
		display: flex;
		justify-content: flex-start;
		margin-bottom: 10px;
	}

	/* 衣物卡片 */
	.clothes-item {
		width: 48%;
		margin: 2%;
		background-color: white;
		padding: 10px;
		border-radius: 10px;
		box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
		text-align: center;
		position: relative;
		transition: transform 0.2s ease-in-out;
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
		width: 80%;
		height: 80px;
		border-radius: 10px;
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
		font-size: 14px;
		color: #333;
		margin-bottom: 5px;
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
		background: #ccd3ff;
		color: white;
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