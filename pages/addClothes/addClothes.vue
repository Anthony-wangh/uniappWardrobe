<template>
	<view class="container">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<!-- 页面标题 -->
		<view class="header">
			<text class="header-title">添加衣物</text>
		</view>

		<view class="add-clothes-container">
			<!-- 图片选择区域 -->
			<view class="image-picker" @click="chooseImage">
				<image v-if="form.image" :src="form.image" mode="aspectFit" class="selected-image" />
				<text v-else class="upload-text">点击选择图片</text>
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
				<input class="input-field" v-model="form.name" placeholder="请输入衣服名称（选填）" />
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

	<category-picker ref="categoryPicker" :data="categories" :defaultValue="[form.primaryCategory, form.secondaryCategory]" :cancelText="'关闭'"
		:confirmText="'选择'" @confirm="onCategoryConfirm" />


	<view class="cropper-container" v-if="cropperSrc !==''">
		<view class="cropper-wrap">
			<image-cropper id="image-cropper" :zoom="1" :angle="0" :src="cropperSrc" canvasBackground="red"
				@cropped="cropped" @afterDraw="afterDraw" @beforeDraw="beforeDraw" />
		</view>
		<view class="cropper-handle">
			<text class="cropper-handle-btn" @click="quitCropper">退出</text>
			<text class="cropper-handle-btn" @click="comfireCropper">确定</text>
		</view>
	</view>


</template>

<script>
	import CategoryPicker from "../../components/CategoryPickerModal.vue";
	import ImageCropper from '../../components/nice-cropper/cropper.vue';

	export default {
		components: {
			CategoryPicker,
			ImageCropper
		},
		data() {
			return {
				statusBarHeight: 0,
				form: {
					id: '',
					image: '',
					name: '',
					primaryCategory: '上衣',
					secondaryCategory: 'T恤',
					value: '',
					notes: '',
					purchaseDate: '',
					brand: ''
				},
				categories:{
					上衣: ["T恤", "衬衫", "外套", "羽绒服"],
					裤子: ["牛仔裤", "运动裤", "休闲裤", "裙子"],
					鞋: ["运动鞋","板鞋", "高跟鞋", "靴子"],
					配饰: ["帽子", "眼镜", "丝巾"],
					包: ["单肩包", "双肩包"]
				},
				errorMsg: '',
				isEdit: false,
				showSubFromgroup: false, //显示详细表单项
				cropperSrc: '' ,//裁剪图片路径，底图
				tempCropperSrc:''//缓存裁剪图片，当前裁剪图
			};
		},
		onLoad(options) {
			if (options.primaryCategory&&options.secondaryCategory) {
				this.form.primaryCategory= decodeURIComponent(options.primaryCategory);
				this.form.secondaryCategory=decodeURIComponent(options.secondaryCategory);				
			}			
			this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
		},
		methods: {
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
			quitCropper() {
				this.cropperSrc = '';
				this.tempCropperSrc = '';
			},
			comfireCropper() {
				this.cropperSrc = '';
				this.form.image = this.tempCropperSrc;
				this.tempCropperSrc = '';
			},
			beforeDraw(context, transform) {
				context.setFillStyle('white')
				// transform.zoom = 2
			},
			afterDraw(ctx, info) {
				// ctx.fillText('我是一行文字水印', 20, 20)
				// console.log(`当前画布大小：${info.width}*${info.height}`)
			},
			cropped(imagePath, imageInfo) {
				// console.log(imagePath, imageInfo)
				this.tempCropperSrc = imagePath;
			},
			selectPurchaseDate(e) {
				this.form.purchaseDate = e.detail.value;
			},
			generateUniqueId() {
				return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
			},
			submitForm() {
				if (!this.form.image) return (this.errorMsg = '请上传衣服图片');
				// if (!this.form.name) return (this.errorMsg = '请输入衣服名称');
				if (!this.form.primaryCategory) return (this.errorMsg = '请选择一级类目');
				if (!this.form.secondaryCategory) return (this.errorMsg = '请选择二级类目');

				let clothes = uni.getStorageSync('clothes') || [];

				if (this.isEdit) {
					let index = clothes.findIndex(item => item.id === this.form.id);
					if (index !== -1) clothes[index] = this.form;
					else {
						this.form.id = this.generateUniqueId();
						clothes.push(this.form);
					}
				} else {
					this.form.id = this.generateUniqueId();
					clothes.push(this.form);
				}

				uni.setStorageSync('clothes', clothes);
				uni.showToast({
					title: this.isEdit ? '修改成功' : '上传成功',
					icon: 'success'
				});

				this.resetForm();
				setTimeout(() => uni.navigateBack(), 100);
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

	.header {
		width: 100%;
		height: 44px;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid #eee;
	}

	.header-title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	.add-clothes-container {
		width: 100%;
		padding: 20px 30px;
		box-sizing: border-box;
		background-color: #f5f5f5;
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
		color: #6668ff;
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
	
	.categoryPicker{
		border:1px solid #868686;
		background-color: #fff;
		border-radius: 5px;
	}
	

	.picker-text {
		color: #747474;
	}
	.category-picker-text{
		color: #6668ff;
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
		width: 50%;
		background-color: #1a1a1a;
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
</style>