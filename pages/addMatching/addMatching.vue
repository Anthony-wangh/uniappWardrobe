<template>
	<view class="container">
		<!-- 搭配模块 -->
		<view class="outfit-preview" @click="clearSelection">
			<view class="clothes-item" v-for="(item, index) in selectedClothes" :key="index" :style="getStyle(item)"
				@touchstart.stop="startDrag(index,$event)" @touchmove.stop="handleMove($event)">
				<image class="clothes-image" :src="item.image"></image>

				<!-- 只有选中的衣服才显示操作按钮 -->
				<view v-if="activeIndex === index">
					<!-- 旋转按钮 -->
					<image src="/static/rotateBtn.png" class="rotate-btn" @touchstart.stop="startRotate($event)"
						@touchmove.stop="rotateDrag($event)"></image>

					<!-- 缩放按钮 -->
					<image src="/static/scaleBtn.png" class="resize-btn" @touchstart.stop="startResize( $event)"
						@touchmove.stop="resizeDrag($event)"></image>

					<!-- 删除按钮 -->
					<view class="remove-btn" @touchstart.stop="removeClothes(index)">×</view>
				</view>
			</view>

			<view v-if="selectedClothes.length === 0" class="empty-text">请选择衣物</view>

			<canvas canvas-id="outfitCanvas" class="hidden-canvas" />
		</view>

		<!-- 添加衣物按钮 -->
		<button class="add-clothes-btn" @click="navigateToSelectClothes">+ 添加衣物</button>

		<!-- 套装详情模块 -->
		<view class="details-section">
			<view class="input-row">
				<text class="label">套装名称</text>
				<input class="input-box" v-model="outfitName" placeholder="请输入套装名称" />
			</view>

			<view class="input-row">
				<text class="label">季节</text>
				<picker class="input-box" mode="selector" :range="seasons" @change="selectSeason">
					<text>{{ selectedSeason }}</text>
				</picker>
			</view>

			<view class="input-row">
				<text class="label">套装类目</text>
				<picker class="input-box" mode="selector" :range="outfitCategories" @change="selectCategory">
					<text>{{ selectedCategory }}</text>
				</picker>
			</view>

			<view class="input-row">
				<text class="label">备注</text>
				<input class="input-box" v-model="note" placeholder="请输入备注（可选）" />
			</view>

			<button class="save-btn" @click="saveOutfit">保存套装</button>
		</view>

		<!-- 使用通用删除确认弹窗 -->
		<confirm-modal :visible="showDeleteModal" title="确认删除？" message="" cancelText="取消" confirmText="删除"
			@cancel="closeDeleteModal" @confirm="deleteConfirm" />
	</view>
</template>

<script>
	import ConfirmModal from '@/components/ConfirmModal.vue';
	export default {
		components: {
			ConfirmModal
		},
		data() {
			return {
				selectedClothes: [
					// 	{
					// 	image: "/static/logo.png",
					// 	x: 50,
					// 	y: 50,
					// 	scale: 1,
					// 	rotation: 0
					// }
				],
				outfitName: "",
				seasons: ["春", "夏", "秋", "冬"],
				selectedSeason: "请选择季节",
				outfitCategories: ["工作通勤", "正式场合", "运动休闲", "精致约会", "出游"],
				selectedCategory: "请选择类目",
				note: "",
				activeIndex: null,
				startX: 0,
				startY: 0,
				startDistance: null,
				startRotateX: 0,
				startRotateY: 0,
				showDeleteModal: false,
				deleteClothesIndex: null
			};
		},
		onLoad(options) {
			if (options.data) {
				let selectItems = JSON.parse(decodeURIComponent(options.data));
				if (selectItems.length === 0) {
					console.log("未选中任何衣物！！");
					return;
				}

				// 获取屏幕宽高
				const {
					windowWidth,
					windowHeight
				} = uni.getSystemInfoSync();

				// 计算安全范围（避免衣物出界）
				const cardWidth = 80; // 假设衣物卡片宽度为 80px
				const cardHeight = 80; // 假设衣物卡片高度为 100px
				const safeX = windowWidth - cardWidth;
				const safeY = 320 - cardHeight;

				let clothesItems = [];

				selectItems.forEach(item => {
					const clothesItem = {
						image: item.image,
						x: (Math.random() - 0.5) * safeX,
						y: (Math.random() - 0.5) * safeY,
						scale: 1,
						rotation: 0
					};
					clothesItems.push(clothesItem);

				});

				this.selectedClothes = clothesItems;
			}
		},
		methods: {
			selectCategory(e) {
				this.selectedCategory = this.outfitCategories[e.detail.value];
			},


			selectSeason(e) {
				this.selectedSeason = this.seasons[e.detail.value];
			},
			getStyle(item) {
				return {
					transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`
				};
			},

			selectClothes(index) {
				this.activeIndex = index;
				console.log("selectClothes" + index);
			},

			clearSelection() {
				this.activeIndex = null;
			},

			startDrag(index, event) {
				if (this.activeIndex !== index)
					this.activeIndex = index;
				this.startX = event.touches[0].clientX - this.selectedClothes[this.activeIndex].x;
				this.startY = event.touches[0].clientY - this.selectedClothes[this.activeIndex].y;
			},

			handleMove(event) {
				if (this.activeIndex !== null) {
					let x = event.touches[0].clientX - this.startX;
					let y = event.touches[0].clientY - this.startY;

					this.selectedClothes[this.activeIndex].x = x;
					this.selectedClothes[this.activeIndex].y = y;
				}
			},

			startRotate(event) {
				if (this.activeIndex === null) return;

				const item = this.selectedClothes[this.activeIndex];

				// 获取衣物的中心点
				const query = uni.createSelectorQuery().in(this);
				query.select('.clothes-item').boundingClientRect((rect) => {
					if (!rect) return;

					// 计算衣物的中心坐标
					this.centerX = rect.left + rect.width / 2;
					this.centerY = rect.top + rect.height / 2;

					// 记录初始触摸点位置
					const touchX = event.touches[0].clientX;
					const touchY = event.touches[0].clientY;

					// 计算初始旋转角度
					this.startAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);
					this.startRotation = item.rotation; // 记录当前旋转角度
				}).exec();
			},


			rotateDrag(event) {
				if (this.activeIndex === null) return;

				const touchX = event.touches[0].clientX;
				const touchY = event.touches[0].clientY;

				// 计算当前手指与旋转中心的角度
				const currentAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);

				// 计算旋转角度变化量
				const angleDelta = currentAngle - this.startAngle;

				// 更新衣物的旋转角度
				this.selectedClothes[this.activeIndex].rotation = this.startRotation + angleDelta;
			},


			startResize(event) {
				if (this.activeIndex === null)
					return;
				this.startDistance = Math.hypot(
					event.touches[0].clientX - this.selectedClothes[this.activeIndex].x,
					event.touches[0].clientY - this.selectedClothes[this.activeIndex].y
				);
			},

			resizeDrag(event) {
				if (this.activeIndex === null)
					return;
				const newDistance = Math.hypot(
					event.touches[0].clientX - this.selectedClothes[this.activeIndex].x,
					event.touches[0].clientY - this.selectedClothes[this.activeIndex].y
				);

				let scale = newDistance / this.startDistance;
				scale = Math.max(0.5, Math.min(scale, 2));
				this.selectedClothes[this.activeIndex].scale = scale;
			},

			removeClothes(index) {
				this.deleteClothesIndex = index;
				this.showDeleteModal = true;
			},

			navigateToSelectClothes() {
				// uni.navigateTo({
				// 	url: "/pages/selectClothes/selectClothes"
				// });
			},
			closeDeleteModal() {
				this.showDeleteModal = false;
				this.deleteClothesIndex = null;
			},
			deleteConfirm() {
				if (this.deleteClothesIndex === null)
					return;
				this.selectedClothes.splice(this.deleteClothesIndex, 1);
				this.deleteClothesIndex = null;
				this.showDeleteModal = false;
			},
			generateUniqueId() {
				return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
			},
			// 	saveOutfit() {

			// 		this.activeIndex = null;

			// 		if (!this.outfitName.trim()) {
			// 			uni.showToast({
			// 				title: "请输入套装名称",
			// 				icon: "none"
			// 			});
			// 			return;
			// 		}
			// 		if (this.selectedSeason === "请选择季节") {
			// 			uni.showToast({
			// 				title: "请选择季节",
			// 				icon: "none"
			// 			});
			// 			return;
			// 		}
			// 		if (this.selectedCategory === "请选择类目") {
			// 			uni.showToast({
			// 				title: "请选择类目",
			// 				icon: "none"
			// 			});
			// 			return;
			// 		}

			// 		//生成缩略图后保存数据
			// 	}

			// },

			async generateThumbnail() {
				return new Promise((resolve, reject) => {
					const ctx = uni.createCanvasContext("outfitCanvas", this);
					ctx.setFillStyle("#ffffff");
					ctx.fillRect(0, 0, 300, 300);

					this.selectedClothes.forEach((item) => {
						ctx.save();
						ctx.translate(150 + item.x, 150 + item.y);
						ctx.rotate((item.rotation * Math.PI) / 180);
						ctx.scale(item.scale, item.scale);
						ctx.drawImage(item.image, -40, -40, 80, 80);
						ctx.restore();
					});

					ctx.draw(false, () => {
						uni.canvasToTempFilePath({
							canvasId: "outfitCanvas",
							success: (res) => resolve(res.tempFilePath),
							fail: (err) => reject(err),
						}, this);
					});
				});
			},

			async saveOutfit() {
				if (!this.outfitName.trim()) {
					uni.showToast({
						title: "请输入套装名称",
						icon: "none"
					});
					return;
				}
				if (this.selectedSeason === "请选择季节") {
					uni.showToast({
						title: "请选择季节",
						icon: "none"
					});
					return;
				}
				if (this.selectedCategory === "请选择类目") {
					uni.showToast({
						title: "请选择类目",
						icon: "none"
					});
					return;
				}

				try {
					const thumbnail = await this.generateThumbnail();
					this.saveToStorage(thumbnail);
				} catch (err) {
					uni.showToast({
						title: "缩略图生成失败",
						icon: "none"
					});
				}
			},

			saveToStorage(imagePath) {

				const outfit = {
					id: this.generateUniqueId(),
					name: this.outfitName,
					clothes: this.selectedClothes,
					primaryCategory: this.selectedSeason,
					secondaryCategory: this.selectedCategory,
					note: this.note,
					image: imagePath
				};

				let outfits = uni.getStorageSync("outfits") || [];
				outfits.push(outfit);
				uni.setStorageSync("outfits", outfits);

				uni.showToast({
					title: "套装已保存",
					icon: "success"
				});
				setTimeout(() => {
					uni.switchTab({
						url: "/pages/matching/matching"
					})
				}, 100);
			}
		},
	}
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #f9f9f9;
		height: 100vh;
		padding: 10px;
	}

	/* 套装搭配模块 */
	.outfit-preview {
		width: 100%;
		height: 320px;
		background-color: #fff;
		position: relative;
		border: 2px dashed #ccc;
		margin-top: 10px;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: visible;
	}

	/* 空白提示文字 */
	.empty-text {
		font-size: 16px;
		color: #aaa;
	}

	/* 衣服卡片 */
	.clothes-item {
		position: absolute;
		z-index: 100;
		pointer-events: auto;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		/* transition: transform 0.2s ease-in-out; */
	}

	/* 衣物图片 */
	.clothes-image {
		width: 100%;
		height: 100%;
		border-radius: 10px;
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
	}


	/* 旋转按钮 */
	.rotate-btn {
		position: absolute;
		bottom: -12px;
		left: -12px;
		width: 24px;
		height: 24px;
		/* background-color: #ff9800; */
		border-radius: 50%;
		cursor: pointer;
		border: 1px solid #fff;
	}

	/* 缩放按钮 */
	.resize-btn {
		position: absolute;
		bottom: -12px;
		right: -12px;
		width: 20px;
		height: 20px;
		/* background-color: #2196f3; */
		border-radius: 50%;
		cursor: pointer;
		border: 1px solid #fff;
	}

	/* 删除按钮 */
	.remove-btn {
		position: absolute;
		top: -12px;
		right: -12px;
		width: 24px;
		height: 24px;
		background-color: red;
		color: white;
		border-radius: 50%;
		font-size: 14px;
		text-align: center;
		line-height: 24px;
		cursor: pointer;
		font-weight: bold;
		border: 2px solid #fff;
	}

	/* 添加衣物按钮 */
	.add-clothes-btn {
		width: 90%;
		height: 45px;
		margin: 15px 0;
		background-color: #4caf50;
		color: white;
		font-size: 16px;
		text-align: center;
		line-height: 45px;
		border-radius: 10px;
		cursor: pointer;
		font-weight: bold;
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
	}

	/* 套装详情 */
	.details-section {
		width: 90%;
		background: white;
		padding: 15px;
		border-radius: 10px;
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
	}

	/* 输入行 */
	.input-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	/* 输入框/选择框名称 */
	.label {
		font-size: 16px;
		color: #333;
		width: 30%;
		text-align: left;
	}

	/* 输入框/选择框 */
	.input-box {
		width: 65%;
		height: 40px;
		padding: 5px;
		border: 1px solid #ddd;
		border-radius: 5px;
		font-size: 14px;
		text-align: center;
		background-color: #f7f7f7;
	}

	/* 选择框样式 */
	picker.input-box {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 保存按钮 */
	.save-btn {
		width: 100%;
		height: 45px;
		background-color: #ff9800;
		color: white;
		font-size: 16px;
		text-align: center;
		line-height: 45px;
		border-radius: 10px;
		margin-top: 10px;
		cursor: pointer;
		font-weight: bold;
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
	}

	.hidden-canvas {
		position: absolute;
		top: -9999px;
		left: -9999px;
		width: 300px;
		height: 300px;
	}
</style>