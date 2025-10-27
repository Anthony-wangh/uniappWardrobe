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
						<image src="/static/upLevel.png" mode="aspectFit" class="zindex-btn" @click.stop="bringToFront(index)"></image>
						<image src="/static/resize.png" mode="aspectFit"  class="resize-btn" @touchstart.stop="startTransform($event)"
							@touchmove.stop="handleTransform($event)"></image>
						<!-- <view class="remove-btn" @click.stop="removeClothes(index)">×</view> -->
					</view>
				</view>

				<canvas
				  :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }"
				  canvas-id="outfitCanvas"
				  class="hidden-canvas"
				/>
				
			</view>
			
			<view class="matching-tip">提示：可选中衣物卡片，通过拖动衣物卡片和拖动卡片左下角“上一层"以及右下角“缩放旋转"按钮来调整搭配的布局。
			<view class="tutorial" @click="toTutorial">"点击此处可跳转教程"</view>
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
				activeIndex: null,
				startX: 0,
				startY: 0,
				startDistance: null,
				startRotateX: 0,
				startRotateY: 0,
				category: '日常通勤',
				categories: ['日常通勤', '春日出游', '周末约会', '正式场合'],
				containerWidth:0,
				containerHeight:0,
				quota:{
					clothesCount :0,
					outfitsCount : 0,
					clothesQuota : 30,
					outfitsQuota : 8,
					clothesRate : '0%',
					outfitsRate : '0%'
				},

			};
		},
		onLoad(options) {
			// 获取屏幕宽高
			const {
				windowWidth,
				windowHeight
			} = uni.getSystemInfoSync();
			
			let clothesItems = [];
			const cardWidth = 80;
			const cardHeight = 107;
			const padding = 10;
			this.containerWidth = windowWidth - 20; // outfit-preview 宽度是 100vw - 20px
			this.containerHeight = this.containerWidth*4/3;
			
			if (options.clothes) {
				let selectItems = JSON.parse(decodeURIComponent(options.clothes));
				if (selectItems.length === 0) {
					console.log("未选中任何衣物！！");
					return;
				}				
				
				let x = -this.containerWidth*0.5 + cardWidth*0.5 + padding, y = -this.containerHeight*0.5 + cardHeight*0.5 +padding;
				
				selectItems.forEach((item, index) => {
					// 换行判断
					if ((x + cardWidth) > this.containerWidth * 0.5) {
						x = -this.containerWidth*0.5 + cardWidth*0.5 + padding;
						y += cardHeight + padding;
					}
				
					const clothesItem = {
						handle:true,
						image: item.image,
						x: x,
						y: y,
						scale: 1,
						rotation: 0
					};
					clothesItems.push(clothesItem);
				
					x += cardWidth + padding;
				});
				
				this.selectedClothes = clothesItems;
			}
			else if(options.outfit){
				const clothesItem = {
					handle:false,
					image: options.outfit,
					x: 0,
					y: 0,
					scale: this.containerWidth/cardWidth,
					rotation: 0
				};
				let clothesItems = [clothesItem];
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
			toTutorial(){
				uni.navigateTo({
				    url: `/pages/webview/webview?url=${encodeURIComponent('https://mp.weixin.qq.com/s/NOF4mH_Dj7uZ9W9mlsZvRw')}`
				  });
			},
			updateQuota(outfits){
				let quo = uni.getStorageSync("wardrobeQuota");				
				if(quo){
					this.quota = quo;
				}
				this.quota.outfitsCount = outfits?outfits.length:0;
				this.quota.outfitsRate = (100.0*quo.outfitsCount / this.quota.outfitsQuota).toString() + '%';
				uni.setStorageSync("wardrobeQuota",quo);	
			},
			getStyle(item) {
				const rotation = isNaN(item.rotation) ? 0 : item.rotation;
				const scale = isNaN(item.scale) ? 1 : item.scale;
			
				return {
					transform: `translate(${item.x}px, ${item.y}px) rotate(${rotation}deg) scale(${scale})`,
					transformOrigin: 'center center',
					zIndex: item.z || 0
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
				if(!this.selectedClothes[index].handle)
					return;
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
					this.startRotation = typeof item.rotation === 'number' ? item.rotation : 0;

					this.startDistance = Math.hypot(touchX - this.centerX, touchY - this.centerY);
					this.startScale = typeof item.scale === 'number' ? item.scale : 1;

				}).exec();
			},

			handleTransform(event) {
				if (this.activeIndex === null) return;
			
				const item = this.selectedClothes[this.activeIndex];
			
				const touchX = event.touches[0].clientX;
				const touchY = event.touches[0].clientY;
			
				// 防护：中心点是否准备好
				if (typeof this.centerX !== 'number' || typeof this.centerY !== 'number') return;
			
				// 当前角度计算
				const currentAngle = Math.atan2(touchY - this.centerY, touchX - this.centerX) * (180 / Math.PI);
				const angleDelta = currentAngle - this.startAngle;
			
				let newRotation = this.startRotation + angleDelta;
				if (!isNaN(newRotation)) {
					item.rotation = newRotation;
				}
			
				// 当前距离计算
				const currentDistance = Math.hypot(touchX - this.centerX, touchY - this.centerY);
				if (!isNaN(currentDistance) && this.startDistance > 0) {
					let scaleRatio = currentDistance / this.startDistance;
					scaleRatio = Math.max(0.5, Math.min(scaleRatio, 2));
					item.scale = this.startScale * scaleRatio;
				}
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
			async downloadImages(clothes) {
				return Promise.all(clothes.map(item => {
					return new Promise((resolve, reject) => {
						if (item.image.startsWith('http')) {
							uni.downloadFile({
								url: item.image,
								success: (res) => {
									if (res.statusCode === 200) {
										resolve({...item, image: res.tempFilePath });
									} else {
										reject('下载失败');
									}
								},
								fail: reject
							});
						} else {
							// 本地图片直接使用
							resolve(item);
						}
					});
				}));
			},
			async generateThumbnail() {
				const clothesWithLocalImages = await this.downloadImages(this.selectedClothes);
			
			
				return new Promise((resolve, reject) => {
					const ctx = uni.createCanvasContext("outfitCanvas", this);
					ctx.setFillStyle("#ffffff");
					ctx.fillRect(0, 0, this.containerWidth, this.containerHeight); // 背景绘制区域
			
					const sortedItems = [...clothesWithLocalImages].sort((a, b) => (a.z || 1) - (b.z || 1));
			
					sortedItems.forEach((item) => {
						ctx.save();
						ctx.translate(this.containerWidth / 2 + item.x , this.containerHeight / 2 + item.y); // 注意偏移中心点
						ctx.rotate((item.rotation * Math.PI) / 180);
						ctx.scale(item.scale, item.scale);
						ctx.drawImage(item.image, -40, -53.5, 80, 107);
						ctx.restore();
					});
			
					ctx.draw(false, () => {
						uni.canvasToTempFilePath({
							canvasId: "outfitCanvas",
							destWidth: this.containerWidth,
							destHeight: this.containerHeight,
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
					const id = this.generateUniqueId();
					this.uploadImage(id,path);
				} catch (err) {
					console.log('缩略图生成失败',err);
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
			uploadImage(id,filePath) {
				uni.showLoading({
					title:'上传中..',
					mask: true
				});
				uniCloud.uploadFile({
					filePath: filePath,
					cloudPath: 'outfitsImage/' + id + '.png' // 指定上传到云存储的路径和文件名					
				}).then(res => {
					uni.hideLoading();
					this.saveToStorage(id,res.fileID);
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({						
						title: '图片上传失败',						
						icon: 'error'
					});
				});
			},
			saveToStorage(id,imagePath) {
				const outfit = {
					id: id,
					name: this.outfitName,
					thumbnail: imagePath,
					category: this.category,
					time: this.getTime()
				};

				let outfits = uni.getStorageSync("outfits") || [];
				outfits.push(outfit);				
				uni.setStorageSync("outfits", outfits);
				this.updateQuota(outfits);
				//保存更新记录
				const addData={type:"add",data:outfit};
				this.saveLocalData(addData);
				uni.showToast({
					title: "套装已保存",
					icon: "success"
				});
				setTimeout(() => {
					uni.switchTab({
						url: "/pages/matching/matching"
					})
				}, 100);
			},
			saveLocalData(data){
				let localData = uni.getStorageSync('localOutfits') || [];
				localData.push(data);
				uni.setStorageSync('localOutfits', localData);
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
		padding-top: calc(var(--status-bar-height) + 25px);
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
		height: calc((100vw - 20px)*4/3);
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
		height: 107px;
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
		width: 24px;
		height: 24px;
		background-color: #707070;
		color: white;
		border-radius: 50%;
		border: 2px solid #fff;
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
		margin: 5px 10px;
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
		margin: 5px 10px;
	}

	.picker-category{
		width: 70%;
		align-items: center;
		justify-content: center;
	}
	.input-box-category {
		width: 100%;
		padding: 6px 0;
		border: 1px solid #8A6FDF;
		border-radius: 5px;
		font-size: 14px;
		font-weight: bold;
		color: #8A6FDF;
		background-color: #ffffff;
		text-align: center;
	}
	


	/* 输入框/选择框名称 */
	.label {
		font-size: 14px;
		color: #333;
		width: 30%;
		text-align: left;
	}

	/* 输入框/选择框 */
	.input-box {
		width: 75%;
		padding: 5px 0px;
		border-bottom: 1px solid #cbcbcb;
		font-size: 14px;
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
		font-size: 14px;
		text-align: center;
		border-radius: 10px;
		cursor: pointer;
		font-weight: bold;
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
		padding: 5px 10px;
		margin-top: 10px;
	}

	.hidden-canvas {
		position: absolute;
		top: -9999px;
		left: -9999px;
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
		background-color: #707070;
		color: white;
		border-radius: 50%;
		font-size: 14px;
		text-align: center;
		line-height: 24px;
		cursor: pointer;
		font-weight: bold;
		border: 2px solid #fff;
	}
	
	.matching-tip{
		margin: 5px 10px;
		color: #cbcbcb;
		font-size: 14px;
		display: flex;
		flex-direction: column;
	}
	.tutorial{
		margin-top: 5px;
		color: blue;
		font-size: 16px;
	}
</style>