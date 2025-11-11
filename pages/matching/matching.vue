<template>
	<view class="container">

		<!-- 顶部标题栏 -->
		<view class="header-container">
			<view class="header">
				<text class="title-text">我的搭配</text>
				<text class="quota">({{quota.outfitsCount}}/{{quota.outfitsQuota}})</text>
			</view>
			<view class="edit-container">
				<view class="search-container">
					<view class="search-area">
						<image class="search-btn" src="/static/search.png" mode="aspectFit"></image>
						<input v-model="searchKeyword" class="search-input" placeholder="搜索衣物名称" />
					</view>				
					
					
					<view class="input-row">
						<picker class="picker-category" mode="selector" :range="categories" @change="onCategoryChange">
							<view class="edit-btn-inline">
								<image class="edit-btn-image" src="/static/filter1.png" mode="aspectFit"></image>
								<text class="edit-btn-text">{{ category }}</text>								
							</view>
						</picker>
						
						<view :class="['edit-btn-inline', isEditMode ? 'finish' : 'edit']" @click="toggleEditMode">
							<image class="edit-btn-image" :src="isEditMode ? '/static/UnEdit.png':'/static/guanli.png'"
								mode="aspectFit"></image>
							<text
								:class="['edit-btn-text',isEditMode ? 'finish' : 'edit']">{{ isEditMode ? '取消' : '管理' }}</text>
							
						</view>
					</view>	
				</view>
				
			</view>
		</view>

		<!-- 套装列表 -->
		<scroll-view scroll-y class="scroll-container">
			<view v-if="filteredOutfits.length > 0" class="outfits-grid">
				<view v-for="(item, index) in filteredOutfits" :key="index" class="outfit-card"
					@click.stop="toggleSelectOutfit(item)" @longpress="longPressOutfit(item)">
					<view class="checkbox" v-if="isEditMode">
						<image :src="selectedOutfits.includes(item) ? '/static/checked.png' : '/static/unChecked.png'"
							class="clothes-checkbox-icon" mode="aspectFit" />
					</view>
					<view class="thumbnail">
						<image :src="item.thumbnail" class="outfit-icon" mode="widthFix" />
					</view>
					<view class="outfit-info">
						<text class="name">{{ item.name }}</text>
						<text class="category-label">{{ item.category }}</text>
						<text class="time">{{ getTime(item.time) }}</text>
						<!-- <text class="msg-Btn" @click="onMsgClick(item)">提醒</text> -->
						<image v-if="!isEditMode" class="msg-Btn" :src="outfitReminderStateIcon(item)" mode="aspectFit"
							@click="onMsgClick(item)"></image>

					</view>

				</view>
			</view>
			<view v-else class="empty">
				<image src="/static/empty.png" class="emptyIcon"></image>
				<text class="empty-state-text">暂无搭配...</text>
			</view>
		</scroll-view>



		<!-- 右下角浮动按钮 -->
		<view v-if="!isEditMode" class="floating-btn" @click="chooseImage" :style="{ background: '#8A6FDF' }">
			<image class="floating-btn-image" src="/static/camera.png" mode="aspectFit"></image>
			<text class="floating-btn-text">上传套装</text>
		</view>

		<view class="bottom-action-bar" v-if="isEditMode">
			<view class="action-btn" @click="deleteSelected">
				<image class="action-icon" src="/static/shanchu.png" mode="aspectFit" />
				<text class="action-text">删除</text>
			</view>
		</view>
	</view>


	<view class="cropper-container" v-if="cropperSrc !==''">
		<view class="cropper-wrap">
			<ksp-cropper mode="free" :width="450" :height="600" :maxWidth="450" :maxHeight="600" :url="cropperSrc"
				@cancel="oncancel" @ok="onok"></ksp-cropper>
		</view>
	</view>

	<!-- 弹窗组件 -->
	<RemindTimePopup :show.sync="showReminderPopup" :existing-time="existingReminderTime"
		:outfit-name="reminderOutfit?.name" @confirm="handleSetReminder" @delete="clickDeleteReminder"
		@close="handleClose" />
</template>

<script>
	import RemindTimePopup from './RemindTimePopup.vue';
	// 🔑 替换为你自己的模板ID（从微信公众平台复制）
	const TEMPLATE_ID = 'MZhDJGPUMhEWedtgprs9eAB4jgBPLlz1VZm62ZIJbHE'; // ← 必须替换！
	export default {
		components: {
			RemindTimePopup
		},
		data() {
			return {
				outfits: [{
						icon: 'https://cdn.example.com/outfit1.jpg',
						name: '夏日通勤',
						scene: '上班',
						remark: '轻便舒适，适合夏天穿搭'
					},
					{
						icon: 'https://cdn.example.com/outfit2.jpg',
						name: '运动套装',
						scene: '健身房',
						remark: '透气速干衣搭配运动鞋'
					}
				],
				searchKeyword: '',
				isEditMode: false,
				selectedOutfits: [],
				quota: {
					clothesCount: 0,
					outfitsCount: 0,
					clothesQuota: 30,
					outfitsQuota: 8,
					clothesRate: '0%',
					outfitsRate: '0%'
				},
				category: '全部',
				categories: ['全部', '日常通勤', '春日出游', '周末约会', '正式场合'],

				shareInfo: {
					imageUrl: "https://mp-5df80302-4973-4391-bd75-89493f11fa67.cdn.bspapp.com/cloudstorage/MainIcon.png",
				},
				cropperSrc: '', //裁剪图片路径，底图
				showReminderPopup: false,
				existingReminderTime: null,
				reminderOutfit: null, //提醒套装
				reminders: [] //提醒列表
			};
		},
		onShareAppMessage() {
			return {
				title: "每天穿什么不再纠结！这个衣橱管理神器推荐给你",
				path: "pages/main/main",
				imageUrl: "https://mp-5df80302-4973-4391-bd75-89493f11fa67.cdn.bspapp.com/cloudstorage/ShareIcon.jpg"
			};
		},
		onShareTimeline() {
			return {
				title: '衣服再也不怕乱堆！这个电子衣橱帮你轻松整理～👗👕', // 自定义朋友圈分享标题		
			};
		},
		computed: {
			filteredOutfits() {
				const keyword = this.searchKeyword.toLowerCase();
				return this.outfits.filter(item => {
					const matchKeyword = item.name.toLowerCase().includes(keyword);
					const matchCategory = this.category === '全部' || item.category === this.category;
					return matchKeyword && matchCategory;
				});
			},
			reminderContent() {
				if (this.reminderOutfit === null)
					return '';
				return `点击查看今日穿搭【${this.reminderOutfit.name}】`;
			}



		},
		onShow() {
			// 模拟数据加载
			this.outfits = uni.getStorageSync("outfits") || [];
			this.outfits?.sort((a, b) => {
				const timeA = a.time ? a.time : 0;
				const timeB = b.time ? b.time : 0;
				return timeB - timeA; // 时间越近越靠前
			});
			const quo = uni.getStorageSync("wardrobeQuota");
			if (quo) {
				this.quota = quo;
			}
			this.quota.outfitsCount = this.outfits.length;

			const match = uni.getStorageSync('matchCategories');
			if (match && Array.isArray(match)) {
				match.unshift("全部");
				this.categories = match;
				this.category = this.categories[0];
			}

			this.syncLocalData();
			this.getReminders();
		},
		methods: {
			outfitReminderStateIcon(item) {
				let iconPath = "/static/reminder-normal.png";
				if (this.reminders && this.reminders.findIndex(c => c.outfitId === item.id) >= 0) {
					iconPath = "/static/remindered.png";
				}
				return iconPath;
			},
			async getReminders() {
				try {
					const openid = uni.getStorageSync("wardrobeOpenid");
					const sendRes = await uniCloud.callFunction({
						name: 'getReminders',
						data: {
							openid: openid
						}
					});

					if (sendRes.result && sendRes.result.code === 200) {
						if(sendRes.result.data){
							console.log('获取提醒成功：', sendRes.result.data.data);
							this.reminders = sendRes.result.data.data;
						}
						else{
							this.reminders = [];
						}
						
					} else {
						console.error('获取提醒失败:', sendRes.result);
					}
				} catch (err) {
					console.error('获取提醒失败', err);
				}
			},
			onMsgClick(item) {
				this.reminderOutfit = item;
				this.existingReminderTime = null;
				if (this.reminders) {
					const remin = this.reminders.find(c => c.outfitId === item.id);
					if(remin)
						this.existingReminderTime = remin.trigger_time;
				}
				this.showReminderPopup = true;
			},
			syncLocalData() {
				const userInfo = uni.getStorageSync('wardrobeUserInfo');
				if (!userInfo) {
					console.log("未登录！");
					return;
				}
				const localData = uni.getStorageSync('localOutfits');
				if (localData) {
					//本地数据大于10条时上传一次
					if (localData.length >= 10) {
						uniCloud.callFunction({
							name: 'syncOutfitsData',
							data: {
								userId: userInfo._id,
								outfits: localData
							}
						}).then((result) => {
							if (result.result.code !== 200) {
								console.log("数据上传失败！" + result.result.msg);
							} else {
								// 清空本地存储
								uni.setStorageSync('localOutfits', null);
								console.log("数据上传成功！");
							}
						}).catch((err) => {
							console.error('云函数错误：', err);
						});
					}
				}
			},
			getTime(time) {
				const date = new Date(time);

				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const hour = date.getHours().toString().padStart(2, '0');
				const minute = date.getMinutes().toString().padStart(2, '0');

				return `${year}年${month}月${day}日 ${hour}:${minute}`;
			},
			onCategoryChange(e) {
				this.category = this.categories[e.detail.value];
			},
			goAddOutfit() {
				uni.navigateTo({
					url: '/pages/addMatching/addMatching' // 替换为你的添加页面路径
				});
			},
			toggleEditMode() {
				this.isEditMode = !this.isEditMode;

				if (this.isEditMode) {
					uni.hideTabBar();
				} else {
					uni.showTabBar();
					this.selectedOutfits = [];
				}
			},
			toggleSelectOutfit(item) {
				if (!this.isEditMode)
					return;
				const index = this.selectedOutfits.indexOf(item);
				if (index > -1) {
					this.selectedOutfits.splice(index, 1);
				} else {
					this.selectedOutfits.push(item);
				}
			},
			longPressOutfit(item) {
				if (this.isEditMode)
					return;
				this.toggleEditMode();
				this.selectedOutfits.push(item);
			},
			deleteSelected() {
				if (this.selectedOutfits.length === 0) 
				{
					uni.showToast({
						title:'请选择要删除的搭配',
						icon:'none'
					})
					return;
				}				

				uni.showModal({
					title: '确定删除选中的穿搭？',
					content: `删除后将无法找回！`,
					success: res => {
						if (res.confirm) {
							//保存更新记录
							this.selectedOutfits.forEach(item => {
								const deleteData = {
									type: "delete",
									data: item
								};
								this.saveLocalData(deleteData);
							});


							this.outfits = this.outfits.filter(c => !this.selectedOutfits.includes(c));
							this.selectedOutfits = [];
							uni.setStorageSync("outfits", this.outfits);
							this.quota.outfitsCount = this.outfits.length;
							uni.setStorageSync("wardrobeQuota", this.quota);
						}
					}
				});
			},
			saveLocalData(data) {
				let localData = uni.getStorageSync('localOutfits') || [];
				localData.push(data);
				uni.setStorageSync('localOutfits', localData);
			},
			onok(ev) {
				this.cropperSrc = "";
				uni.showTabBar();
				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/addMatching/addMatching?outfit=${ev.path}`
					});
				}, 100);
			},
			oncancel() {
				// url设置为空，隐藏控件
				this.cropperSrc = "";
				uni.showTabBar();
			},
			chooseImage() {
				if (!this.checkLogin())
					return;
				uni.showActionSheet({
					itemList: ['在线搭配', '拍照上传'],
					success: res => {
						if (res.tapIndex === 0) {
							setTimeout(() => {
								uni.setStorageSync('isMatchingMode', true);
								uni.switchTab({
									url: `/pages/wardrobe/wardrobe`
								});
							}, 100);
						} else {
							uni.chooseImage({
								count: 1,
								sourceType: ['album', 'camera'],
								success: res => {
									uni.hideTabBar();
									this.cropperSrc = res.tempFilePaths[0];
								}
							});
						}
					}
				});
			},
			checkLogin() {
				const userInfo = uni.getStorageSync('wardrobeUserInfo');
				if (userInfo) {
					return true;
				}
				uni.navigateTo({
					url: "/pages/login/login"
				});
				return false;
			},
			async handleSetReminder(t) {
				const openid = uni.getStorageSync("wardrobeOpenid");
				const authRes = await uni.requestSubscribeMessage({
					tmplIds: [TEMPLATE_ID]
				});

				if (authRes[TEMPLATE_ID] !== 'accept') {
					uni.showToast({
						title: '需要授权才能接收提醒',
						icon: 'none'
					});
					this.showReminderPopup = false;
					return;
				}
				uni.showLoading({
					mask: true,
					title: '请稍等···'
				})

				// 格式化时间
				const d = new Date(t);
				const timeStr =
					`${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

				const data = {
					thing2: {
						value: '今日穿搭提醒'
					},
					time30: {
						value: timeStr
					},
					thing11: {
						value: this.reminderContent
					}
				};



				// 2. 订阅消息
				const sendRes = await uniCloud.callFunction({
					name: 'add-reminder',
					data: {
						openid: openid,
						outfitId: this.reminderOutfit.id,
						trigger_time: t,
						content: data,
					}
				});
				uni.hideLoading();
				if (sendRes.result && sendRes.result.code === 200) {
					uni.showToast({
						title: sendRes.result.msg,
						icon: 'success'
					});
					this.reminders = sendRes.result.data;
					this.showReminderPopup = false;
				} else {
					console.error('提醒订阅失败:', sendRes.result);
					uni.showToast({
						title: '提醒订阅失败，请重试',
						icon: 'error'
					});
					this.showReminderPopup = false;
				}
			},
			clickDeleteReminder(t) {
				uni.showModal({
					title: '确定取消提醒？',
					success: res => {
						if (res.confirm) {
							this.handleDeleteReminder(t);
						}
					}
				});
			},
			async handleDeleteReminder(t) {

				try {
					uni.showLoading({
						mask: true,
						title: '请稍等···'
					});
					const openid = uni.getStorageSync("wardrobeOpenid");
					// 2. 取消订阅消息
					const sendRes = await uniCloud.callFunction({
						name: 'delete-reminder',
						data: {
							openid,
							outfitId: this.reminderOutfit.id
						}
					});
					uni.hideLoading();

					if (sendRes.result && sendRes.result.code === 200) {
						uni.showToast({
							title: '已取消提醒！',
							icon: 'success'
						});
						this.reminders = sendRes.result.data;
						this.showReminderPopup = false;
					} else {
						console.error('提醒取消失败:', sendRes.result);
						uni.showToast({
							title: '提醒取消失败，请重试',
							icon: 'error'
						});
						this.showReminderPopup = false;
					}
				} catch (err) {
					console.error('删除失败', err);
				}


			},
			handleClose() {
				this.showReminderPopup = false;
			}

		}
	};
</script>

<style scoped>
	.container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f7f7f7;
	}

	/* 顶部栏 */
	.header-container {
		width: 100%;
		padding: 12px 0px;
		background-color: #fff;
		box-shadow: 0px 4px 12rpx rgba(0, 0, 0, 0.05);
		padding-top: calc(var(--status-bar-height) + 30px);
	}

	.header {
		display: flex;
		align-items: center;
		/* border-bottom: 1px solid #b0b0b0; */
		padding-bottom: 10px;
	}

	.quota {
		font-size: 14px;
		color: #6f5bdc;
	}

	.title-text {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-left: 20px;
	}

	.edit-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin: 10px 20px 0;
	}

	.search-container {
		width: 100%;
		align-items: center;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.search-area {
		width: calc(100% - 30px);
		display: flex;
		flex-direction: row;
		border-radius: 8px;
		border: 1px solid #e3e3e3;
		box-shadow: 4px 4px 12rpx rgba(0, 0, 0, 0.05);
		background-color: #f8f8f8;
		/* margin-right: 20px; */
		align-items: center;
	}



	.search-input {
		width: 100%;
		margin-left: 10px;
		padding: 8px 0;
		font-size: 14px;
	}

	.search-btn {
		width: 20px;
		height: 20px;
		margin-left: 10px;
		/* flex-wrap: wrap; */
	}

	
	
	.edit-btn-inline {
		width: 60px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-items: center;
		justify-content: space-between;
		padding: 0 5px;
	}
	


	.edit-btn-text {
		margin-top: 5px;
		font-size: 10px;
		padding: 0 6px;
		text-wrap: nowrap;
	}


	.edit-btn-text.finish {
		color: #666;
	}

	.edit-btn-text.edit {
		color: #8A6FDF;
	}


	.edit-btn-image {
		width: 25px;
		height: 25px;
		/* margin-left: 5px; */
	}


	.scroll-container {
		flex: 1;
		/* padding: 16rpx; */
		height: calc(100vh - 220px);
		margin: 10px;
	}

	.outfits-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 4%;
	}

	.outfit-card {
		width: calc(46%);
		/* 一排2个，留空隙 */
		background-color: #ffffff;
		border-radius: 15px;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		margin-bottom: 16rpx;
		position: relative;
		overflow: hidden;
	}

	.checkbox {
		position: absolute;
		top: 2px;
		right: 2px;
		z-index: 10;
		width: 24px;
		height: 24px;
	}

	.checkbox-icon {
		width: 100%;
		height: 100%;
	}

	.clothes-checkbox-icon {
		width: 25px;
		height: 25px;
		background-color: #fff;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
		border-radius: 5px;
	}

	.thumbnail {
		width: 100%;
	}

	.outfit-icon {
		width: 100%;
		justify-items: center;
		align-items: center;
	}

	.outfit-info {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin: 10px;

		position: relative;
	}

	.msg-Btn {
		position: absolute;
		right: 3px;
		bottom: 5px;
		width: 20px;
		height: 20px;
	}

	.name {
		font-size: 16px;
		margin-bottom: 6rpx;

		max-width: 100px;
		/* 限制最大宽度，可根据需要调整 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.time {
		font-size: 10px;
		color: #666;
		padding: 3px 0px;
	}

	.floating-btn {
		position: fixed;
		right: 20px;
		bottom: 40px;

		padding: 10px;
		background-color: #ccd3ff;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15);
	}

	.floating-btn-image {
		width: 30px;
		height: 30px;
	}

	.floating-btn-text {
		font-size: 12px;
		color: #fff;
		font-weight: bold;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30px 0;
	}

	.emptyIcon {
		width: 150px;
		height: 150px;
		margin-bottom: 10px;
	}

	.empty-state-text {
		color: #b1a5df;
		font-size: 14px;
	}

	.bottom-action-bar {
		position: fixed;
		z-index: 20;
		bottom: 20px;
		width: calc(100% - 100px);
		height: 100rpx;
		margin: 0 50px;
		border-radius: 10px;
		background-color: #fff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 4px 4px 12rpx rgba(0, 0, 0, 0.1);

		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}

		to {
			transform: translateY(0);
		}
	}

	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 24rpx;
	}

	.action-icon {
		width: 20px;
		height: 20px;
		margin-bottom: 4px;
	}

	.action-text {
		font-size: 10px;
		color: #666666;
	}

	.picker-category {
		width: 50%;
		align-items: center;
		justify-content: center;
	}

	.filter-icon {
		width: 20px;
		height: 20px;
	}

	.input-box-category {
		width: 100%;
		padding: 6px 0;
		align-items: center;
		justify-content: center;
		justify-content: space-around;
		display: flex;
		border-radius: 5px;
		border: 1px solid #f1f1f1;
		background-color: #f8f8f8;
	}

	.category-text {
		font-size: 14px;
		color: #333;
		text-align: center;
	}

	.input-row {
		width: 100px;
		display: flex;
		align-items: center;
		margin: 10px 0;
	}

	.name-category {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* align-items: center; */
		padding-bottom: 5px;
	}

	.category-label {
		align-self: flex-start;
		display: inline-block;
		font-size: 10px;
		color: #8A6FDF;
		background-color: #ebecf1;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 10px;
		padding: 3px 6px;
		text-align: center;
		margin: 3px 0;

		max-width: 100px;
		/* 限制最大宽度，可根据需要调整 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>