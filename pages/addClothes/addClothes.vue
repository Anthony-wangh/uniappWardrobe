<template>
	<view class="container">
		<!-- 图片选择区域 -->
		<view class="image-picker" @click="chooseImage">
			<image v-if="form.image" :src="form.image" class="selected-image" />
			<text v-else class="upload-text">点击选择图片</text>
		</view>

		<!-- 表单内容 -->
		<view class="form">
			<!-- 衣服名称 -->
			<view class="input-container">
				<text class="label">名称：</text>
				<input class="input-field" v-model="form.name" placeholder="请输入衣服名称（必填）" />
			</view>

			<!-- 一级类目 -->
			<view class="input-container">
				<text class="label">一级类目：</text>
				<picker mode="selector" :range="primaryCategories" @change="selectPrimaryCategory">
					<view class="picker">{{ form.primaryCategory || "请选择一级类目（必选）" }}</view>
				</picker>
			</view>

			<!-- 二级类目 -->
			<view class="input-container">
				<text class="label">二级类目：</text>
				<picker mode="selector" :range="secondaryCategories" @change="selectSecondaryCategory">
					<view class="picker">{{ form.secondaryCategory || "请选择二级类目（必选）" }}</view>
				</picker>
			</view>

			<!-- 价值 -->
			<view class="input-container">
				<text class="label">价值：</text>
				<input class="input-field" v-model="form.value" type="number" placeholder="请输入价值（可选）" />
			</view>

			<!-- 备注 -->
			<view class="input-container">
				<text class="label">备注：</text>
				<textarea class="textarea-field" v-model="form.notes" placeholder="请输入备注（可选）"></textarea>
			</view>

			<!-- 购买时间 -->
			<view class="input-container">
				<text class="label">购买时间：</text>
				<picker mode="date" @change="selectPurchaseDate">
					<view class="picker">{{ form.purchaseDate || "请选择购买时间" }}</view>
				</picker>
			</view>

			<!-- 品牌 -->
			<view class="input-container">
				<text class="label">品牌：</text>
				<input class="input-field" v-model="form.brand" placeholder="请输入品牌（可选）" />
			</view>

			<!-- 上传按钮 -->
			<button class="upload-btn" @click="submitForm">上传</button>

			<!-- 错误提示 -->
			<text class="error-msg" v-if="errorMsg">{{ errorMsg }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					id: "",//唯一id
					image: "", // 选中的图片
					name: "", // 衣服名称
					primaryCategory: "", // 一级类目
					secondaryCategory: "", // 二级类目
					value: "", // 价值
					notes: "", // 备注
					purchaseDate: "", // 购买时间
					brand: "" // 品牌
				},
				primaryCategories: ["春", "夏", "秋", "冬"], // 一级类目
				secondaryCategories: ["上衣", "裤子", "裙子", "鞋", "配饰"], // 二级类目
				errorMsg: "" // 错误提示
			};
		},
		methods: {
			// 选择图片
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sourceType: ["album", "camera"],
					success: (res) => {
						this.form.image = res.tempFilePaths[0];
					}
				});
			},

			// 选择一级类目
			selectPrimaryCategory(e) {
				this.form.primaryCategory = this.primaryCategories[e.detail.value];
			},

			// 选择二级类目
			selectSecondaryCategory(e) {
				this.form.secondaryCategory = this.secondaryCategories[e.detail.value];
			},

			// 选择购买时间
			selectPurchaseDate(e) {
				this.form.purchaseDate = e.detail.value;
			},
			generateUniqueId() {
				return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
			},
			// 提交表单
			submitForm() {
				// 校验必填项
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


				// 获取本地存储中的衣橱数据
				let clothes = uni.getStorageSync('clothes') || [];
				this.form.id=this.generateUniqueId();
				clothes.push(this.form);
				// 更新本地存储
				uni.setStorageSync('clothes', clothes);

				// 提交成功提示
				uni.showToast({
					title: "上传成功！",
					icon: "success"
				});

				// 清空表单
				this.resetForm();
				
				uni.navigateBack();
			},

			// 清空表单
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

<style scoped>
	/* 整体容器 */
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		background-color: #f9f9f9;
		height: 100vh;
	}

	/* 图片选择区域 */
	.image-picker {
		width: 90%;
		height: 180px;
		background-color: #eaeaea;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		margin-bottom: 15px;
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

	/* 表单 */
	.form {
		width: 90%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* 表单项容器 */
	.input-container {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	/* 属性名称左对齐 */
	.label {
		width: 100px;
		text-align: left;
		font-size: 16px;
		color: #333;
		margin-right: 10px;
	}

	/* 输入框和选择框右对齐 */
	.input-field,
	.picker,
	.textarea-field {
		flex: 1;
		padding: 12px;
		border: 1px solid #ddd;
		border-radius: 5px;
		font-size: 16px;
		text-align: left;
	}

	/* 备注输入框 */
	.textarea-field {
		height: 100px;
		resize: none;
	}

	/* 上传按钮 */
	.upload-btn {
		width: 95%;
		padding: 0 12px;
		background-color: #4CAF50;
		color: white;
		border: none;
		border-radius: 5px;
		font-size: 18px;
		cursor: pointer;
		margin-top: 10px;
	}

	/* 错误提示 */
	.error-msg {
		color: red;
		font-size: 14px;
		margin-top: 10px;
		text-align: center;
	}
</style>