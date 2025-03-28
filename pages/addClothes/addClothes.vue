<template>
	<view class="add-clothes-container">
		<!-- 图片选择区域 -->
		<view class="image-picker" @click="chooseImage">
			<image v-if="form.image" :src="form.image" class="selected-image" />
			<text v-else class="upload-text">点击选择图片</text>
		</view>

		<!-- 表单内容 -->
		<view class="form-group">
			<label>名称</label>
			<input class="input-field" v-model="form.name" placeholder="请输入衣服名称（必填）" />
		</view>

		<view class="form-group">
			<label>一级类目</label>
			<picker mode="selector" :range="primaryCategories" @change="selectPrimaryCategory" class="picker">
				<view class="picker-text">{{ form.primaryCategory || "请选择一级类目（必选）" }}</view>
			</picker>
		</view>

		<view class="form-group">
			<label>二级类目</label>
			<picker mode="selector" :range="secondaryCategories" @change="selectSecondaryCategory" class="picker">
				<view class="picker-text">{{ form.secondaryCategory || "请选择二级类目（必选）" }}</view>
			</picker>
		</view>
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
		<view class="form-group">
			<label>备注</label>
			<textarea class="textarea-field" v-model="form.notes" placeholder="请输入备注（可选）"></textarea>
		</view>
		<!-- 提交按钮 -->
		<button class="submit-btn" @click="submitForm">保存</button>

		<!-- 错误提示 -->
		<text class="error-msg" v-if="errorMsg">{{ errorMsg }}</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					id: "",
					image: "",
					name: "",
					primaryCategory: "",
					secondaryCategory: "",
					value: "",
					notes: "",
					purchaseDate: "",
					brand: ""
				},
				primaryCategories: ["春", "夏", "秋", "冬"],
				secondaryCategories: ["上衣", "裤子", "裙子", "鞋", "配饰"],
				errorMsg: "",
				isEdit: false
			};
		},
		onLoad(options) {
			if (options.data) {
				this.form = JSON.parse(decodeURIComponent(options.data));
				this.isEdit = true;
			}
		},
		methods: {
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sourceType: ["album", "camera"],
					success: (res) => {
						this.form.image = res.tempFilePaths[0];
					}
				});
			},
			selectPrimaryCategory(e) {
				this.form.primaryCategory = this.primaryCategories[e.detail.value];
			},
			selectSecondaryCategory(e) {
				this.form.secondaryCategory = this.secondaryCategories[e.detail.value];
			},
			selectPurchaseDate(e) {
				this.form.purchaseDate = e.detail.value;
			},
			generateUniqueId() {
				return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
			},
			submitForm() {
				if (!this.form.image) {
					this.errorMsg = "请上传衣服图片";
					return;
				}
				if (!this.form.name) {
					this.errorMsg = "请输入衣服名称";
					return;
				}
				if (!this.form.primaryCategory) {
					this.errorMsg = "请选择一级类目";
					return;
				}
				if (!this.form.secondaryCategory) {
					this.errorMsg = "请选择二级类目";
					return;
				}

				let clothes = uni.getStorageSync('clothes') || [];

				if (this.isEdit) {
					let index = clothes.findIndex(item => item.id === this.form.id);
					if (index !== -1) {
						clothes[index] = this.form;
					} else {
						this.form.id = this.generateUniqueId();
						clothes.push(this.form);
					}
				} else {
					this.form.id = this.generateUniqueId();
					clothes.push(this.form);
				}
				uni.setStorageSync('clothes', clothes);
				uni.showToast({
					title: this.isEdit ? "修改成功" : "上传成功",
					icon: "success"
				});

				this.resetForm();
				setTimeout(() => {
				  uni.navigateBack();
				}, 100);
			},
			resetForm() {
				this.form = {
					image: "",
					name: "",
					primaryCategory: "",
					secondaryCategory: "",
					value: "",
					notes: "",
					purchaseDate: "",
					brand: ""
				};
				this.errorMsg = "";
			}
		}
	};
</script>

<style lang="scss">
	.add-clothes-container {
		width: 100%;
		padding: 20px 30px;
		background-color: #f5f5f5;
		box-sizing: border-box;
	}

	.image-picker {
		width: 100%;
		height: 180px;
		background-color: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		margin-bottom: 20px;
		cursor: pointer;
	}

	.selected-image {
		width: 100%;
		height: 100%;
		border-radius: 10px;
		object-fit: cover;
	}

	.upload-text {
		color: #666;
		font-size: 16px;
	}

	.form-group {
		margin-bottom: 20px;

		label {
			display: block;
			font-size: 15px;
			font-weight: bold;
			color: #666;
			margin-bottom: 5px;
		}

		.input-field,
		.picker {
			width: 100%;
			height: 45px;
			padding: 0 15px;
			border: 1px solid #e0e0e0;
			border-radius: 8px;
			background-color: #ffffff;
			font-size: 14px;
			color: #333;
			display: flex;
			align-items: center;
			justify-content: space-between;
			box-sizing: border-box;
		}

		.picker {
			display: block;
		}

		.picker-text {
			flex: 1;
			text-align: left;
			line-height: 45px;
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
	}

	.submit-btn {
		width: 100%;
		background-color: #d0e183;
		color: #fff;
		font-size: 16px;
		text-align: center;
		border: none;
		border-radius: 5px;
		cursor: pointer;

		&:active {
			background-color: #bac875;
		}
	}

	.error-msg {
		color: red;
		font-size: 14px;
		text-align: center;
		margin-top: 10px;
	}
</style>