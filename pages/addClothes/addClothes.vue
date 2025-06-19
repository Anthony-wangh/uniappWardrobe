<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<!-- 页面标题 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack">‹</image>
			<text class="title-text">添加衣物</text>
		</view>

		<view class="add-clothes-container">
			<!-- 图片选择区域 -->
			<view class="image-picker" @click="chooseImage">
				<image v-if="form.image" :src="form.image" mode="aspectFit" class="selected-image" />
				<text v-else class="upload-text">点击选择图片</text>
			</view>

			<!-- 季节选择（支持多选） -->
			<view class="season-selector">
				<view v-for="season in seasons" :key="season"
					:class="['season-card', form.seasons?.includes(season) ? 'selected' : '']"
					@click="toggleSeason(season)">
					{{ season }}
				</view>
			</view>


			<view class="main-form-group">
				<label>类目</label>
				<view class="picker categoryPicker" @click="openCategoryPicker">
					<text class="picker-text category-picker-text">
						{{ form.primaryCategory && form.secondaryCategory ? form.primaryCategory + ' / ' + form.secondaryCategory : '请选择类目' }}
					</text>
				</view>
			</view>

			<!-- 名称输入 -->
			<view class="main-form-group">
				<label>名称</label>
				<input class="input-field" v-model="form.name" placeholder="请输入衣服名称（必填）" />
			</view>


			<view class="main-form-group">
				<label>备注</label>
				<textarea class="textarea-field" v-model="form.notes" placeholder="请输入备注（可选）"></textarea>
			</view>

			<text class="more-form-group"
				@click="showSubFromgroup = !showSubFromgroup">{{showSubFromgroup? "收起" : "更多"}}</text>
			<!-- 其他表单项,可选 -->
			<view class="sub-form-group-container" v-if="showSubFromgroup">
				<view class="form-group">
					<label>购买时间</label>
					<picker mode="date" @change="selectPurchaseDate" class="picker">
						<view class="picker-text">{{ form.purchaseDate || "请选择购买时间" }}</view>
					</picker>
				</view>

				<view class="form-group">
					<label>价值</label>
					<input class="input-field" v-model="form.value" type="digit" placeholder="请输入价值（可选）" />
				</view>

				<view class="form-group">
					<label>品牌</label>
					<input class="input-field" v-model="form.brand" placeholder="请输入品牌（可选）" />
				</view>
			</view>
			<button class="submit-btn" @click="submitForm">保存</button>
			<text class="error-msg" v-if="errorMsg">{{ errorMsg }}</text>
		</view>
	</view>

	<category-picker ref="categoryPicker" :data="categories"
		:defaultValue="[form.primaryCategory, form.secondaryCategory]" :cancelText="'关闭'" :confirmText="'选择'"
		@confirm="onCategoryConfirm" />


	<view class="cropper-container" v-if="cropperSrc !==''">
		<view class="cropper-wrap">
			<ksp-cropper mode="free" :width="512" :height="512" :maxWidth="1024" :maxHeight="1024" :url="cropperSrc"
				@cancel="oncancel" @ok="onok"></ksp-cropper>
		</view>
	</view>


</template>

<script>
	import CategoryPicker from "../../components/CategoryPickerModal.vue";

	export default {
		components: {
			CategoryPicker
		},
		data() {
			return {
				statusBarHeight: 0,
				seasons: ['春', '夏', '秋', '冬'],
				form: {
					id: '',
					image: '',
					name: '',
					primaryCategory: '上衣',
					secondaryCategory: 'T恤',
					value: '',
					notes: '',
					purchaseDate: '',
					brand: '',
					seasons: [],
					createTime:new Date().getTime()
				},
				categories: {
					上衣: ["T恤", "衬衫", "外套", "羽绒服"],
					裤子: ["牛仔裤", "运动裤", "休闲裤", "裙子"],
					鞋: ["运动鞋", "板鞋", "高跟鞋", "靴子"],
					配饰: ["帽子", "眼镜", "丝巾"],
					包: ["单肩包", "双肩包"]
				},
				errorMsg: '',
				isEdit: false,
				showSubFromgroup: false, //显示详细表单项
				cropperSrc: '', //裁剪图片路径，底图
			};
		},
		onLoad(options) {
			if (options.primaryCategory && options.secondaryCategory) {
				this.form.primaryCategory = decodeURIComponent(options.primaryCategory);
				this.form.secondaryCategory = decodeURIComponent(options.secondaryCategory);
			}
			this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
		},
		methods: {
			onok(ev) {
				this.cropperSrc = "";
				this.form.image = ev.path;
			},
			oncancel() {
				// url设置为空，隐藏控件
				this.cropperSrc = "";
			},
			openCategoryPicker() {
				this.$refs.categoryPicker?.open();
			},
			onCategoryConfirm(e) {
				this.form.primaryCategory = e.main;
				this.form.secondaryCategory = e.sub;
				// console.log('用户选择了：', e);
			},
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sourceType: ['album', 'camera'],
					success: res => {
						// this.form.image = res.tempFilePaths[0];
						this.cropperSrc = res.tempFilePaths[0];
					}
				});
			},
			selectPurchaseDate(e) {
				this.form.purchaseDate = e.detail.value;
			},
			generateUniqueId() {
				return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
			},
			toggleSeason(season) {
				const index = this.form.seasons.indexOf(season);
				if (index === -1) {
					this.form.seasons.push(season);
				} else {
					this.form.seasons.splice(index, 1);
				}
			},
			uploadImage(id,filePath) {
				uni.showLoading({
					title:'上传中..',
					mask: true
				});
				uniCloud.uploadFile({
					filePath: filePath,
					cloudPath: 'clothesImage/' + id + '.png' // 指定上传到云存储的路径和文件名					
				}).then(res => {
					uni.hideLoading();
					this.comfirmSubmit(id,res.fileID);
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: '图片上传失败',						
						icon: 'error'
					});
				});
			},
			submitForm() {
				if (!this.form.image) return (this.errorMsg = '请上传衣服图片');
				if (!this.form.name) return (this.errorMsg = '请输入衣服名称');
				if (!this.form.primaryCategory) return (this.errorMsg = '请选择一级类目');
				if (!this.form.secondaryCategory) return (this.errorMsg = '请选择二级类目');
				const id = this.generateUniqueId();
				this.uploadImage(id,this.form.image);
			},
			comfirmSubmit(id,imagePath){			
				this.form.image = imagePath;
				let clothes = uni.getStorageSync('clothes') || [];
				
				if (this.isEdit) {
					let index = clothes.findIndex(item => item.id === this.form.id);
					if (index !== -1) clothes[index] = this.form;
					else {
						this.form.id = id;
						clothes.push(this.form);
					}
				} else {
					this.form.id = id;
					clothes.push(this.form);
				}
				const addData={type:"add",data:this.form};
				this.saveLocalData(addData);
				
				uni.setStorageSync('clothes', clothes);
				uni.showToast({
					title: this.isEdit ? '修改成功' : '上传成功',
					icon: 'success'
				});
				setTimeout(() => uni.switchTab({
					url: "/pages/wardrobe/wardrobe"
				}), 100);
			},
			resetForm() {
				this.form = {
					image: '',
					name: '',
					primaryCategory: '',
					secondaryCategory: '',
					value: '',
					notes: '',
					purchaseDate: '',
					brand: ''
				};
				this.errorMsg = '';
			},
			goBack() {
				uni.navigateBack();
			},
			saveLocalData(data){
				let localData = uni.getStorageSync('localClothes') || [];
				localData.push(data);
				uni.setStorageSync('localClothes', localData);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		height: 100vh;
		background-color: #ffffff;
	}

	.status-bar {
		width: 100%;
		background-color: #ffffff;
	}

	/* 顶部栏 */
	.navbar {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 12px 0px;
		background-color: #fff;
		border-bottom: 1px solid #e5e5e5;

		padding-top: calc(var(--status-bar-height));
	}

	.back-icon {
		width: 24px;
		height: 24px;
		margin-right: 12px;
		margin-left: 20px;
	}

	.title-text {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	.add-clothes-container {
		width: 100%;
		padding: 20px 30px;
		box-sizing: border-box;
		background-color: #f5f5f5;
		overflow-y: auto;
		height: calc(100vh - 120px);
	}

	.image-picker {
		width: calc(100vw - 60px);
		height: calc(100vw - 60px);
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		margin-bottom: 20px;
		cursor: pointer;
	}

	.cropper-container {
		width: 100vw;
		height: 100vh;
		position: fixed;
		z-index: 998;
		top: 0;
		left: 0;
	}

	.cropper-wrap {
		width: 100%;
		height: 100%; //calc(100vh - 100px);
	}

	.cropper-handle {
		width: 100%;
		position: fixed;
		bottom: 0;
		display: flex;
		justify-content: space-between;
		// margin: 15px;
	}

	.cropper-handle-btn {
		color: #ffffff;
		font-size: 20px;
		margin: 15px;
	}

	.selected-image {
		width: 100%;
		height: 100%;
		border-radius: 10px;
		object-fit: cover;
	}

	.upload-text {
		color: #8A6FDF;
		font-size: 16px;
	}

	.form-group {
		margin-bottom: 20px;

		label {
			display: block;
			font-size: 15px;
			color: #4c4c4c;
			margin-bottom: 5px;
		}
	}


	.main-form-group {
		margin-bottom: 20px;

		label {
			display: block;
			font-size: 15px;
			font-weight: bold;
			color: #4c4c4c;
			margin-bottom: 5px;
		}


	}

	.input-field,
	.picker {
		width: 100%;
		height: 45px;
		padding: 0 15px;
		border-bottom: 1px solid #474747;
		// border-radius: 8px;
		// background-color: #ffffff;
		font-size: 14px;
		color: #333;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	.categoryPicker {
		border: 1px solid #868686;
		background-color: #fff;
		border-radius: 5px;
	}	


	.picker-text {
		color: #747474;
	}

	.category-picker-text {
		color: #8A6FDF;
		font-weight: bold;
	}

	.textarea-field {
		width: 100%;
		height: 80px;
		padding: 10px;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background-color: #ffffff;
		font-size: 14px;
		color: #333;
		resize: none;
		box-sizing: border-box;
	}

	.more-form-group {
		right: 0;
		display: flex;
		text-align: end;
		color: #6668ff;
		font-size: 18px;
		padding-bottom: 30px;
	}

	.submit-btn {
		width: 80%;
		background-color: #8A6FDF;
		// border: 3px solid #ccd3ff;
		color: #ffffff;
		font-size: 16px;
		text-align: center;
		border-radius: 10px;
		cursor: pointer;
		padding: 5px 0;
	}

	.error-msg {
		color: red;
		font-size: 14px;
		text-align: center;
		margin-top: 10px;
	}

	.season-selector {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 20px;
	}

	.season-card {
		width: 60px;
		height: 35px;
		line-height: 35px;
		text-align: center;
		background-color: #f9f9f9;
		border-radius: 8px;
		font-size: 14px;
		color: #333;
		border: 1px solid #414141;
		cursor: pointer;
		transition: all 0.2s;
	}

	.season-card.selected {
		background-color: #8A6FDF;
		color: #fff;
		border-color: #8A6FDF;
	}
</style>