<template>
	<view class="container">
		<view class="header-container">
			<view class="status-bar"></view>
			<view class="header">
				<image class="back-icon" src="/static/back.png" @click="goBack" />
				<text class="header-title">搭配</text>
			</view>
		</view>

		<view class="main-container">
			<!-- 搭配模块 -->
			<view class="outfit-preview" :style="{backgroundSize: 'cover' }" @click="clearSelection">
				<view class="clothes-item" v-for="(item, index) in selectedClothes" :key="index"
					:id="'clothesItem' + index" :ref="'clothesItem' + index" :style="getStyle(item)">
					<image class="clothes-image" :src="item.image" @touchstart.stop="startDrag(index, $event)"
						@touchmove.stop="handleMove($event)" />
					<view v-if="activeIndex === index">
						<view class="zindex-btn" @click.stop="bringToFront(index)">↑</view>
						<image src="/static/scaleBtn.png" class="resize-btn" @touchstart.stop="startTransform($event)"
							@touchmove.stop="handleTransform($event)"></image>
						<view class="remove-btn" @click.stop="removeClothes(index)">×</view>
					</view>
				</view>

				<canvas canvas-id="outfitCanvas" class="hidden-canvas"></canvas>
			</view>


			<!-- 套装详情模块 -->
			<view class="details-section">
				<view class="input-row">
					<text class="label">套装名称</text>
					<input class="input-box" v-model="outfitName" placeholder="请输入套装名称" />
				</view>
				<view class="input-row">
					<text class="label">类目</text>
					<picker class="picker-category" mode="selector" :range="categories" @change="onCategoryChange">
						<view class="input-box-category">{{ category }}</view>
					</picker>
				</view>

				<view class="note-input-row">
					<label class="label">备注</label>
					<textarea class="textarea-field" v-model="note" placeholder="请输入备注（可选）"></textarea>
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
				startRotateY: 0,
				category: '日常通勤',
				categories: ['日常通勤', '春日出游', '周末约会', '正式场合'],

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
		onShow() {
			const match = uni.getStorageSync('matchCategories');
			if (match && Array.isArray(match)) {
				this.categories = match;
				this.category = this.categories[0];
			}
		},
		methods: {
			getStyle(item) {
				return {
					transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`,
					transformOrigin: 'center center',
					zIndex: item.z || 1
				};
			},
			bringToFront(index) {
				const maxZ = Math.max(...this.selectedClothes.map(item => item.z || 0));
				this.$set(this.selectedClothes[index], 'z', maxZ + 1);
			},
			onCategoryChange(e) {
				this.category = this.categories[e.detail.value];
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
			startTransform(event) {
				if (this.activeIndex === null) return;

				const item = this.selectedClothes[this.activeIndex];

				// 记录中心点
				const query = uni.createSelectorQuery().in(this);
				query.select(`#clothesItem${this.activeIndex}`).boundingClientRect((rect) => {
					if (!rect) return;

					this.centerX = rect.left + rect.width / 2;
					this.centerY = rect.top + rect.height / 2;

					const touchX = event.touches[0].clientX;
					const touchY = event.touches[0].clientY;

					this.startAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);
					this.startRotation = item.rotation;

					this.startDistance = Math.hypot(touchX - this.centerX, touchY - this.centerY);
					this.startScale = item.scale;
				}).exec();
			},

			handleTransform(event) {
				if (this.activeIndex === null) return;

				const item = this.selectedClothes[this.activeIndex];

				const touchX = event.touches[0].clientX;
				const touchY = event.touches[0].clientY;

				// 当前角度
				const currentAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);
				const angleDelta = currentAngle - this.startAngle;
				item.rotation = this.startRotation + angleDelta;

				// 当前距离
				const currentDistance = Math.hypot(touchX - this.centerX, touchY - this.centerY);
				let scaleRatio = currentDistance / this.startDistance;
				scaleRatio = Math.max(0.5, Math.min(scaleRatio, 2));
				item.scale = this.startScale * scaleRatio;
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

			generateUniqueId() {
				return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
			},
			async generateThumbnail() {
				return new Promise((resolve, reject) => {
					const ctx = uni.createCanvasContext("outfitCanvas", this);
					ctx.setFillStyle("#ffffff");
					ctx.fillRect(0, 0, 300, 300);
					// 先按 zIndex 排序再绘制
					const sortedItems = [...this.selectedClothes].sort((a, b) => (a.z || 1) - (b.z || 1));


					sortedItems.forEach((item) => {
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
					const path = await this.generateThumbnail();
					this.saveToStorage(path);
				} catch (err) {
					uni.showToast({
						title: "缩略图生成失败",
						icon: "none"
					});
				}
			},

			goBack() {
				uni.navigateBack();
			},
			getTime() {
				const date = new Date()
				return date.getTime()
			},
			saveToStorage(imagePath) {
				const outfit = {
					id: this.generateUniqueId(),
					name: this.outfitName,
					note: this.note,
					thumbnail: imagePath,
					category: this.category,
					time: this.getTime()
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


	/* 顶部栏 */
	.header {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 12px 0px;
		background-color: #fff;
	}

	.back-icon {
		width: 24px;
		height: 24px;
		margin-right: 12px;
		margin-left: 20px;
	}

	.header-title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
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
		border-radius: 2px;
		box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
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
		left: -12px;
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


	/* 套装详情 */
	.details-section {
		width: calc(100vw - 20px);
		margin: 0 10px;
		background: white;
		padding: 15px 0;
		border-radius: 10px;
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
		
		display: flex;
		flex-direction: column;
	}

	/* 输入行 */
	.input-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 10px;
	}

	.note-input-row {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin: 10px;
	}
	
	.picker-category{
		width: 70%;
		align-items: center;
		justify-content: center;
	}
	.input-box-category {
		width: 100%;
		padding: 10px 0;
		border: 1px solid #8A6FDF;
		border-radius: 5px;
		font-size: 16px;
		font-weight: bold;
		color: #8A6FDF;
		background-color: #ffffff;
		text-align: center;
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
		width: 75%;
		padding: 10px;
		border-bottom: 1px solid #cbcbcb;
		font-size: 16px;
		font-weight: bold;
		color: #333;
		text-align: start;
	}
	
	
	
	

	/* 选择框样式 */
	.input-box {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 保存按钮 */
	.save-btn {
		width: 90%;
		height: 45px;
		background-color: #8A6FDF;
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
		margin-top: 10px;
	}

	.zindex-btn {
		position: absolute;
		bottom: -12px;
		left: -12px;
		width: 24px;
		height: 24px;
		background-color: #2196f3;
		color: white;
		border-radius: 50%;
		font-size: 14px;
		text-align: center;
		line-height: 24px;
		cursor: pointer;
		font-weight: bold;
		border: 2px solid #fff;
	}
</style>