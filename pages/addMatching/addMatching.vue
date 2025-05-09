<template>

	<view class="container">

		<view class="header-container">
			<!-- 状态栏占位 -->
			<view class="status-bar"></view>
			<!-- 页面标题 -->
			<view class="header">
				<text class="header-title">搭配</text>
			</view>

		</view>

		<view class="main-container">

			<!-- 搭配模块 -->
			<view class="outfit-preview" @click="clearSelection">
				<view class="clothes-item" v-for="(item, index) in selectedClothes" :key="index" 
				:id="'clothesItem' + index" 
				:ref="'clothesItem' + index" 
				:style="getStyle(item)">
					<image class="clothes-image" :src="item.image" @touchstart.stop="startDrag(index,$event)" @touchmove.stop="handleMove($event)"></image>

					<!-- 只有选中的衣服才显示操作按钮 -->
					<view v-if="activeIndex === index">
						<!-- 旋转按钮 -->
						<image src="/static/rotateBtn.png" class="rotate-btn" @touchstart.stop="startRotate($event)"
							@touchmove.stop="rotateDrag($event)"></image>

						<!-- 缩放按钮 -->
						<image src="/static/scaleBtn.png" class="resize-btn" @touchstart.stop="startResize( $event)"
							@touchmove.stop="resizeDrag($event)"></image>

						<!-- 删除按钮 -->
						<view class="remove-btn" @click.stop="removeClothes(index)">×</view>
					</view>


				</view>

				<view v-if="selectedClothes.length === 0" class="empty-text">请选择衣物</view>
				<view class="floating-btn" @click="navigateToSelectClothes">
					<image class="floating-btn-image" src="/static/plus-l.png" mode="aspectFit"></image>
				</view>
				<canvas canvas-id="outfitCanvas" class="hidden-canvas"></canvas>
			</view>

			<!-- 添加衣物按钮 -->
			<!-- <button class="add-clothes-btn" @click="navigateToSelectClothes">+ 添加衣物</button> -->

			<!-- 套装详情模块 -->
			<view class="details-section">
				<view class="input-row">
					<text class="label">套装名称</text>
					<input class="input-box" v-model="outfitName" placeholder="请输入套装名称" />
				</view>


				<view class="input-row">
					<text class="label">备注</text>
					<input class="input-box" v-model="note" placeholder="请输入备注（可选）" />
				</view>

				<button class="save-btn" @click="saveOutfit">保存套装</button>
			</view>

		</view>
	</view>
</template>

<script>
	export default {
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
				note: "",
				activeIndex: null,
				startX: 0,
				startY: 0,
				startDistance: null,
				startRotateX: 0,
				startRotateY: 0
			};
		},
		onLoad(options) {
			if (options.clothes) {
				let selectItems = JSON.parse(decodeURIComponent(options.clothes));
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
			getStyle(item) {
				return {
					transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`
				};
			},

			selectClothes(index) {
				this.activeIndex = index;
			},

			clearSelection() {
				this.activeIndex = null;
			},

			startDrag(index, event) {
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
				query.select(`#clothesItem${this.activeIndex}`).boundingClientRect((rect) => {
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
				
				// console.log('/*****/'+this.startRotation+'**'+angleDelta);

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
				uni.showModal({
				  title: '确认删除？', // 标题文字，支持字符串或空值
				  showCancel: true, // 是否显示取消按钮（默认true）
				  cancelText: '取消', // 取消按钮文字（默认"取消"）
				  cancelColor: '#999', // 取消按钮文字颜色（默认#000）
				  confirmText: '确定', // 确认按钮文字（默认"确定"）
				  confirmColor: '#212121', // 确认按钮颜色（默认#3CC51F）
				  success: res => {
				    if (res.confirm) {
						this.selectedClothes.splice(index, 1);
				    } 
				  }
				});				
			},

			navigateToSelectClothes() {
				// uni.navigateTo({
				// 	url: "/pages/selectClothes/selectClothes"
				// });
			},
			
			generateUniqueId() {
				return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
			},

			async generateThumbnail() {
				return new Promise((resolve, reject) => {
					const ctx = uni.createCanvasContext("outfitCanvas", this);
					ctx.setFillStyle("#ffffff");
					ctx.fillRect(0, 0, 300, 300);

					this.selectedClothes.forEach((item) => {
						console.log('********'+item.rotation);
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
					note: this.note,
					thumbnail: imagePath
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
		width: 100%;
	}

	.header-container {
		width: 100%;
		background-color: #ffffff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding-top: calc(var(--status-bar-height) + 30px);
		padding-bottom: 10px;
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
	}

	.header-title {
		font-size: 18px;
		font-weight: bold;
		text-align: center;
		margin-left: 20px;
	}

	.main-container {
		width: 100%;
		margin-top: 10px;
		/* box-sizing: border-box; */
		background-color: #f5f5f5;
		justify-items: center;
		justify-content: center;
	}



	/* 套装搭配模块 */
	.outfit-preview {
		margin: 0 10px;
		width: calc(100vw - 20px);
		height: calc(100vw - 20px);
		background-color: #fff;
		border: 1px dashed #ccc;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		position: relative;
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
		background-color: #3e4faf;
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
		margin: 0 10px;
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
		border-bottom: 1px solid #cbcbcb;
		font-size: 14px;
		text-align: center;
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
		background-color: #1e1e1e;
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

	.floating-btn {
		position: absolute;
		right: 5px;
		bottom: 5px;
		width: 30px;
		height: 30px;
		background-color: #1e1e1e;
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
</style>