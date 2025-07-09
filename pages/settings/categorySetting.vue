<template>
	<view class="category-container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">类目设置</text>
		</view>

		<!-- 主类目列表 -->
		<scroll-view scroll-y class="category-list" @click="dropdownIndex=null">	
						
			<view class="section-title">衣物类目</view>
			<view v-for="(subList, category, index) in categoriesMap" :key="category" class="category-item">
				<!-- 主类目行 -->
				<view class="category-header" @click="toggleCollapse(category)">
					<view class="left" >
						<text :class="['arrow', collapsed[category] ? '' : 'open']">▶</text>
						<text class="category-name">{{ category }}</text>
					</view>

					<!-- 更多操作 -->
					<view class="menu-button" :id="'menu-' + index" @click.stop="toggleDropdown(index)">⋯</view>
					<view v-if="dropdownIndex === index" class="dropdown"
						:style="{ top: dropdownPosition.top + 'px', left: dropdownPosition.left + 'px' }">
						<view class="dropdown-item" @click.stop="editCategory(category)">
							<image class="dropdown-icon" src="/static/handleIcons/edit.png"></image>
							<text class="dropdown-name">修改</text>
						</view>
						<view class="dropdown-item" @click.stop="addSubCategory(category)">
							<image class="dropdown-icon" src="/static/handleIcons/add.png"></image>
							<text class="dropdown-name">添加</text>
						</view>
						<view class="dropdown-item delete" @click.stop="deleteCategory(category)">
							<image class="dropdown-icon" src="/static/shanchu.png"></image>
							<text class="dropdown-name">删除</text>
						</view>
					</view>
				</view>

				<!-- 子类目列表 -->
				<view v-show="!collapsed[category]" class="sub-list">
					<view v-for="(sub, index) in subList" :key="index" class="sub-item">
						<text class="sub-item-text" @click="editSubCategory(category,sub,index)">• {{ sub }}</text>
						<image class="sub-item-edit" src="/static/handleIcons/edit.png"
							@click="editSubCategory(category,sub,index)"></image>
						<image class="sub-item-delete" src="/static/handleIcons/delete.png"
							@click="deleteSubCategory(category,sub,index)"></image>
					</view>
				</view>
			</view>
		
			<view class="section-title">搭配类目</view>
		<!-- 搭配类目区域 -->
			<view class="match-section">			
			<view class="match-item" v-for="(item, index) in matchCategories" :key="index">
				<text class="match-name">{{ item }}</text>
				<image class="sub-item-edit" src="/static/handleIcons/edit.png" @click="editMatchCategory(index)" />
				<image class="sub-item-delete" src="/static/handleIcons/delete.png" @click="deleteMatchCategory(index)" />
			</view>
		</view>
		
		</scroll-view>

		<!-- 右下角浮动按钮 -->
		<view class="floating-btn" @click="openAddCategory">
			<image class="floating-btn-image" src="/static/plus-l.png" mode="aspectFit"></image>
		</view>

		<!-- 输入弹窗 -->
		<view v-if="modalVisible" class="modal-mask" @click="modalVisible = false">
			<view class="modal" @click.stop>
				<view class="modal-title">{{ modalTitle }}</view>
				<view class="modal-context">
					<input v-model="inputValue" class="modal-input" placeholder="请输入类目名称" />
				</view>
				<view class="modal-actions">
					<button size="mini" type="default" @click="modalVisible = false">取消</button>
					<button size="mini" type="primary" @click="confirmModal">确定</button>
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
					鞋: ['运动鞋', '板鞋', '高跟鞋', '靴子'],
					配饰: ['帽子', '眼镜', '丝巾'],
					包: ['单肩包', '双肩包']
				},
				collapsed: {},
				dropdownIndex: null,
				dropdownPosition: {
					top: 0,
					left: 0
				},
				modalVisible: false,
				modalTitle: '',
				inputValue: '',
				actionType: '',
				targetCategory: '',
				sourceSubCategoryIndex: null,
				//搭配类目
				matchCategories: ['日常通勤', '春日出游', '周末约会', '正式场合'],

			};
		},		
		onShow() {
			const category=uni.getStorageSync('wartrobeCategory');
			if(category){
				this.categoriesMap = category;
			}
			for (const key in this.categoriesMap) {
				this.$set(this.collapsed, key, true);
			}
			
			
			const match = uni.getStorageSync('matchCategories');
			if (match && Array.isArray(match)) {
				this.matchCategories = match;
			}
		},
		methods: {
			toggleCollapse(category) {
				this.collapsed[category] = !this.collapsed[category];
			},
			toggleDropdown(index) {
				if (this.dropdownIndex === index) {
					this.dropdownIndex = null;
				} else {

					this.$nextTick(() => {
						const query = uni.createSelectorQuery().in(this);
						query.select(`#menu-${index}`).boundingClientRect(rect => {
							if (rect) {
								this.dropdownPosition = {
									top: rect.top + rect.height,
									left: rect.left - 60
								};
								this.dropdownIndex = index;
							}
						}).exec();
					});
				}
			},
			editCategory(category) {
				this.modalTitle = '修改主类目';
				this.inputValue = category;
				this.actionType = 'editMain';
				this.targetCategory = category;
				this.modalVisible = true;
				this.dropdownIndex = null;
			},
			addSubCategory(category) {
				this.modalTitle = `新增“${category}”的子类目`;
				this.inputValue = '';
				this.actionType = 'addSub';
				this.targetCategory = category;
				this.modalVisible = true;
				this.dropdownIndex = null;
			},
			deleteCategory(category) {
				uni.showModal({
					title: '提示',
					content: `确定删除“${category}”及其子类目？`,
					success: res => {
						if (res.confirm) {
							// 删除主类目
							delete this.categoriesMap[category];
							this.save();
						}
					}
				});
				this.dropdownIndex = null;
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
				this.targetCategory=mainCategory;
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
				this.dropdownIndex = null;
			},
			confirmModal() {
				const value = this.inputValue.trim();
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
					this.$set(this.collapsed, value, false);
				} else if (this.actionType === 'editMain') {
					if (value === this.targetCategory) {
						this.modalVisible = false;
						return;
					}
					if (this.categoriesMap[value]) {
						return uni.showToast({
							title: '该类目已存在',
							icon: 'none'
						});
					}
					this.$set(this.categoriesMap, value, this.categoriesMap[this.targetCategory]);
					this.$delete(this.categoriesMap, this.targetCategory);
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
				}
				else if (this.actionType === 'editMatch') {
					if (this.matchCategories.includes(value)) {
						return uni.showToast({
							title: '搭配类目已存在',
							icon: 'none'
						});
					}
					this.matchCategories[this.sourceSubCategoryIndex] = value;
					this.sourceSubCategoryIndex = null;
				}
				else if (this.actionType === 'addMatch') {
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
			save(){
				uni.setStorageSync('wartrobeCategory',this.categoriesMap);
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
							this.save(); // 可拓展同步保存逻辑
						}
					}
				});
			}

			
		}
	};
</script>

<style scoped>
	.category-container {
		min-height: 100vh;
		background: #fdfdfd;
		position: relative;
		justify-items: center;
	}

	/* 顶部栏 */
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
	

	.category-list {
		height: calc(100vh - 120px);
	}

	.category-item {
		border-top: 1px solid #eee;
		margin: 10px 10px 0 10px;
		background-color: #fff;
		border-radius: 5px;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.left {
		display: flex;
		align-items: center;
	}

	.category-name {
		color: #212121;
		font-size: 16px;
		font-weight: bold;
	}

	.arrow {
		margin-right: 6px;
		transition: transform 0.2s ease;
		margin-left: 10px;
		font-size: 14px;
	}

	.arrow.open {
		transform: rotate(90deg);
	}

	.menu-button {
		padding: 6px;
		font-size: 20px;
		margin-right: 10px;
	}

	.dropdown {
		position: fixed;
		z-index: 999;
		background: white;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		width: 80px;
	}

	.dropdown-item {
		padding: 10px;
		border-bottom: 1px solid #eee;
		display: flex;
		justify-content: space-around;
	}

	.dropdown-item:last-child {
		border-bottom: none;
	}

	.dropdown-item.delete {
		color: red;
	}

	.dropdown-icon {
		width: 20px;
		height: 20px;
	}

	.dropdown-name {
		color: #707070;
		font-size: 14px;
	}

	.sub-list {
		padding-left: 24px;
		padding-bottom: 10px;
	}

	.sub-item {
		align-items: center;
		justify-items: center;
		padding: 4px 0;
		position: relative;
	}

	.sub-item-text {
		font-size: 12px;
		color: #707070;
	}

	.sub-item-edit {
		width: 20px;
		height: 20px;
		margin-left: 5px;
	}

	.sub-item-delete {
		width: 20px;
		height: 20px;
		position: absolute;
		right: 10px;
		align-items: center;
	}

	.floating-btn {
		position: fixed;
		right: 20px;
		bottom: 40px;
		width: 50px;
		height: 50px;
		background-color: #8A6FDF;
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
		padding: 20px 0;
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
		border: 1px solid #ddd;
		border-radius: 6px;
		margin: 5px 10px;

		padding: 8px;

	}

	.modal-actions {
		display: flex;
		justify-content: space-between;
	}
	
	.section-title {
		padding: 12px 16px 6px;
		font-size: 16px;
		font-weight: bold;
		color: #333;
	}
	
	.match-section {
		margin: 10px 10px 0;
		background-color: #fff;
		border-radius: 6px;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
		padding: 10px;
	}
	
	.match-item {
		display: flex;
		align-items: center;
		padding: 8px 0;
		border-bottom: 1px solid #eee;
		position: relative;
	}
	
	.match-item:last-child {
		border-bottom: none;
	}
	
	.match-name {
		font-size: 16px;
		color: #212121;
		margin-left: 10px;
	}

</style>