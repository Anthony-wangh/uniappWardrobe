<template>
	<view class="container">

		<!-- 顶部标题栏 -->
		<view class="header-container">
			<view class="header">
				<text class="title-text">我的搭配</text>
				<text class="quota">【{{quota.outfitsCount}}/{{quota.outfitsQuota}}】</text>
			</view>
			<view class="edit-container">
				<view class="search-container">
					<view class="search-area">
						<image class="search-btn" src="/static/search.png" mode="aspectFit"></image>
						<input v-model="searchKeyword" class="search-input" placeholder="搜索搭配名称" />
					</view>				
					
					<view class="input-row">
						<!-- 切换视图按钮 -->
						<view class="edit-btn-inline" @click="toggleListMode">
							<image 
								class="edit-btn-image" 
								:src="listMode === 'grouped' ? '/static/single-list.png' : '/static/grouped-list.png'"
								mode="aspectFit"
							></image>
							<text class="edit-btn-text">
								{{ listMode === 'grouped' ? '纯净视图' : '详情视图' }}
							</text>
						</view>

					</view>	
				</view>
			</view>
			<!-- 单类模式才显示分类筛选器 -->
			<picker 
				v-if="listMode === 'single'" 
				class="picker-category" 
				mode="selector" 
				:range="categories" 
				@change="onCategoryChange"
			>
				<view class="category-edit">
					<image class="edit-btn-image" src="/static/scene.png" mode="aspectFit"></image>
					<text class="category-edit-btn-text">穿搭场景></text>
					<text class="category-value">{{ category }}</text>
				</view>
			</picker>
		</view>

		<!-- 套装列表 -->
		<scroll-view scroll-y class="scroll-container">
			<!-- 分类列表模式（分组展示） -->
			<view v-if="listMode === 'grouped'">
				<view v-for="(items, cat) in groupedOutfits" :key="cat" class="category-section">
					<view class="category-header">
						<text class="category-title">{{ cat }} · {{ items.length }}件</text>
					</view>
					<view class="outfits-grid">
						<view v-for="(row, rowIndex) in getRows(items)" :key="rowIndex" class="clothes-row">
							<view v-for="(outfit, idx) in row" :key="idx" class="outfit-card"
								@click.stop="toggleSelectOutfit(outfit)">
								
								<view class="thumbnail">
									<image :src="outfit.thumbnail" class="outfit-icon" mode="widthFix" />
								</view>
								<view class="outfit-info">
									<text class="name">{{ outfit.name }}</text>
									<!-- <text class="category-label">{{ outfit.category }}</text> -->
									<text class="time">{{ getTime(outfit.time) }}</text>
									<image 										
										class="msg-Btn" 
										:src="outfitReminderStateIcon(outfit)" 
										mode="aspectFit"
										@click.stop="onMsgClick(outfit)"
									></image>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view v-if="Object.keys(groupedOutfits).length === 0" class="empty">
					<image src="/static/empty.png" class="emptyIcon"></image>
					<text class="empty-state-text">暂无搭配...</text>
				</view>
			</view>

			<!-- 单类列表模式（扁平展示） -->
			<view v-else class="outfits-grid">
				<view v-if="flatOutfits.length > 0">
					<view v-for="(row, rowIndex) in getRows(flatOutfits)" :key="rowIndex" class="clothes-row">
						<view v-for="(item, itemIndex) in row" :key="itemIndex" class="outfit-card"
							@click.stop="toggleSelectOutfit(item)">
							<view class="thumbnail">
								<image :src="item.thumbnail" class="outfit-icon" mode="widthFix" />
							</view>
						</view>
					</view>
				</view>
				<view v-else class="empty">
					<image src="/static/empty.png" class="emptyIcon"></image>
					<text class="empty-state-text">暂无搭配...</text>
				</view>
			</view>
		</scroll-view>

		<!-- 右下角浮动按钮 -->
		<view class="floating-btn" @click="chooseImage" :style="{ background: '#8A6FDF' }">
			<image class="floating-btn-image" src="/static/camera.png" mode="aspectFit"></image>
			<text class="floating-btn-text">上传套装</text>
		</view>

	</view>

	<view class="cropper-container" v-if="cropperSrc !==''">
		<view class="cropper-wrap">
			<ksp-cropper mode="free" :width="450" :height="600" :maxWidth="450" :maxHeight="600" :url="cropperSrc"
				@cancel="oncancel" @ok="onok"></ksp-cropper>
		</view>
	</view>

	<!-- 弹窗组件 -->
	<RemindTimePopup 
		:show.sync="showReminderPopup" 
		:existing-time="existingReminderTime"
		:outfit-name="reminderOutfit?.name" 
		@confirm="handleSetReminder" 
		@delete="clickDeleteReminder"
		@close="handleClose" 
	/>
</template>

<script>
import RemindTimePopup from './RemindTimePopup.vue';

const TEMPLATE_ID = 'MZhDJGPUMhEWedtgprs9eAB4jgBPLlz1VZm62ZIJbHE';

export default {
	components: {
		RemindTimePopup
	},
	data() {
		return {
			outfits: [],
			searchKeyword: '',
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
			listMode: 'grouped', // 'grouped' | 'single'

			cropperSrc: '',
			showReminderPopup: false,
			existingReminderTime: null,
			reminderOutfit: null,
			reminders: []
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
			title: '衣服再也不怕乱堆！这个电子衣橱帮你轻松整理～👗👕',
		};
	},
	computed: {
		// 分组数据（仅用于 grouped 模式）
		groupedOutfits() {
			const groups = {};
			this.outfits.forEach(item => {
				if (!item.category || item.category === '全部') return;
				if (!groups[item.category]) {
					groups[item.category] = [];
				}
				groups[item.category].push(item);
			});
			// 每组内按时间倒序
			Object.keys(groups).forEach(cat => {
				groups[cat].sort((a, b) => (b.time || 0) - (a.time || 0));
			});
			return groups;
		},

		// 单类模式下的扁平列表
		flatOutfits() {
			let list = [...this.outfits];
			
			// 应用搜索关键词
			if (this.searchKeyword.trim()) {
				const kw = this.searchKeyword.toLowerCase();
				list = list.filter(item => item.name.toLowerCase().includes(kw));
			}

			// 应用分类筛选
			if (this.category !== '全部') {
				list = list.filter(item => item.category === this.category);
			}

			// 按时间倒序
			return list.sort((a, b) => (b.time || 0) - (a.time || 0));
		}
	},
	onShow() {
		this.outfits = uni.getStorageSync("outfits") || [];
		const quo = uni.getStorageSync("wardrobeQuota");
		if (quo) {
			this.quota = quo;
		}
		this.quota.outfitsCount = this.outfits.length;

		const match = uni.getStorageSync('matchCategories');
		if (match && Array.isArray(match)) {
			match.unshift("全部");
			this.categories = match;
		}

		this.syncLocalData();
		this.getReminders();
	},
	methods: {
		openDetail(outfitId){
			uni.navigateTo({
				url:`/pages/matching/outfitDetail?outfitId=${outfitId}`
			})
			
			// uni.navigateTo({
			// 	url:`/pages/ootdDetail/ootdDetail?outfitId=${outfitId}`
			// })
		},
		getRows(list) {
			const rows = [];
			for (let i = 0; i < list.length; i += 3) {
				rows.push(list.slice(i, i + 3));
			}
			return rows;
		},
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
					data: { openid }
				});
				if (sendRes.result?.code === 200) {
					this.reminders = sendRes.result.data?.data || [];
				} else {
					this.reminders = [];
				}
			} catch (err) {
				console.error('获取提醒失败', err);
				this.reminders = [];
			}
		},
		onMsgClick(item) {
			this.reminderOutfit = item;
			this.existingReminderTime = null;
			const remin = this.reminders.find(c => c.outfitId === item.id);
			if (remin) this.existingReminderTime = remin.trigger_time;
			this.showReminderPopup = true;
		},
		syncLocalData() {
			const userInfo = uni.getStorageSync('wardrobeUserInfo');
			if (!userInfo) return;
			const localData = uni.getStorageSync('localOutfits');
			if (localData && localData.length >= 10) {
				uniCloud.callFunction({
					name: 'syncOutfitsData',
					data: { userId: userInfo._id, outfits: localData }
				}).then(res => {
					if (res.result.code === 200) {
						uni.setStorageSync('localOutfits', null);
					}
				}).catch(err => console.error('云函数错误：', err));
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
		toggleListMode() {
			this.listMode = this.listMode === 'grouped' ? 'single' : 'grouped';
			if (this.listMode === 'grouped') {
				this.category = '全部';
			}
		},
		toggleSelectOutfit(item) {
			
			this.openDetail(item.id);
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
				uni.navigateTo({ url: `/pages/addMatching/addMatching?outfit=${ev.path}` });
			}, 100);
		},
		oncancel() {
			this.cropperSrc = "";
			uni.showTabBar();
		},
		chooseImage() {
			if (!this.checkLogin()) return;
			uni.showActionSheet({
				itemList: ['在线搭配', '拍照上传'],
				success: res => {
					if (res.tapIndex === 0) {
						setTimeout(() => {
							uni.setStorageSync('isMatchingMode', true);
							uni.switchTab({ url: `/pages/wardrobe/wardrobe` });
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
			if (userInfo) return true;
			uni.navigateTo({ url: "/pages/login/login" });
			return false;
		},
		async handleSetReminder(t) {
			const openid = uni.getStorageSync("wardrobeOpenid");
			const authRes = await uni.requestSubscribeMessage({ tmplIds: [TEMPLATE_ID] });
			if (authRes[TEMPLATE_ID] !== 'accept') {
				uni.showToast({ title: '需要授权才能接收提醒', icon: 'none' });
				this.showReminderPopup = false;
				return;
			}
			uni.showLoading({ mask: true, title: '请稍等···' });

			const d = new Date(t);
			const timeStr = `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

			const data = {
				thing2: { value: '今日穿搭提醒' },
				time30: { value: timeStr },
				thing11: { value: `点击查看今日穿搭【${this.reminderOutfit.name}】` }
			};

			const sendRes = await uniCloud.callFunction({
				name: 'add-reminder',
				data: {
					openid,
					outfitId: this.reminderOutfit.id,
					trigger_time: t,
					content: data,
				}
			});
			uni.hideLoading();
			if (sendRes.result?.code === 200) {
				uni.showToast({ title: sendRes.result.msg, icon: 'success' });
				this.reminders = sendRes.result.data;
				this.showReminderPopup = false;
			} else {
				uni.showToast({ title: '提醒订阅失败，请重试', icon: 'error' });
				this.showReminderPopup = false;
			}
		},
		clickDeleteReminder() {
			uni.showModal({
				title: '确定取消提醒？',
				success: res => {
					if (res.confirm) {
						this.handleDeleteReminder();
					}
				}
			});
		},
		async handleDeleteReminder() {
			try {
				uni.showLoading({ mask: true, title: '请稍等···' });
				const openid = uni.getStorageSync("wardrobeOpenid");
				const sendRes = await uniCloud.callFunction({
					name: 'delete-reminder',
					data: { openid, outfitId: this.reminderOutfit.id }
				});
				uni.hideLoading();
				if (sendRes.result?.code === 200) {
					uni.showToast({ title: '已取消提醒！', icon: 'success' });
					this.reminders = sendRes.result.data;
					this.showReminderPopup = false;
				} else {
					uni.showToast({ title: '提醒取消失败，请重试', icon: 'error' });
					this.showReminderPopup = false;
				}
			} catch (err) {
				console.error('删除失败', err);
				uni.hideLoading();
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
	margin: 5px 20px 0;
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
	align-items: center;
}

.search-input {
	width: 100%;
	margin-left: 10px;
	padding: 8px 0;
	font-size: 14px;
}

.search-btn {
	width: 18px;
	height: 18px;
	margin-left: 10px;
}

.edit-btn-inline {
	/* width: 50px; */
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
}

.edit-btn-text {
	width: 40px;
	text-align: center;
	margin-top: 5px;
	font-size: 8px;
	text-wrap: nowrap;
	color: #515151;
}

.edit-btn-text.finish {
	color: #515151;
}

.edit-btn-text.edit {
	color: #8A6FDF;
}

.edit-btn-image {
	width: 18px;
	height: 18px;
}

.category-edit{
	margin: 5px  0 0 20px;
	display: flex;
	align-items: center;
	justify-content: start;
}
.category-edit-btn-text{
	text-align: center;
	margin-left: 5px;
	font-size: 10px;
	text-wrap: nowrap;
	color: #515151;
}

.category-value{
	text-align: center;
	margin-left: 10px;
	font-size: 12px;
	font-weight: bold;
	color: #6f5bdc;
}


.input-row {
	display: flex;
	align-items: center;
	justify-content: end;
	margin: 5px 0;
}

.scroll-container {
	flex: 1;
	height: calc(100vh - 220px);
	/* margin: 10px; */
	overflow-y: auto;
}

/* 分类区块 */
.category-section {
	margin-bottom: 20rpx;
}

.category-header {
	display: flex;
	align-items: center;
	padding: 3px;
	background-color: #f8f8f8;
	border-left: 2px solid #8A6FDF;
	margin: 5px 10px;
}

.category-title {
	font-size: 12px;
	color: #666;
	font-weight: bold;
}

/* 卡片网格 */
.outfits-grid {
	margin: 5px;
}

.clothes-row {
	display: flex;
	flex-wrap: wrap;
	justify-content: start;
	width: 100%;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.outfit-card {
	position: relative;
	width: calc((100% - 32rpx) / 3);
	background-color: #ffffff;
	border-radius: 10px;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	flex-shrink: 0;
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
	display: block;
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
	right: 0px;
	bottom: 0px;
	width: 18px;
	height: 18px;
}

.name {
	color: #333;
	font-size: 10px;
	margin-bottom: 6rpx;
	max-width: 100px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
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
	margin: 3px 0;
	max-width: 100px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.time {
	font-size: 6px;
	color: #666;
	padding: 2px 0;
}

.floating-btn {
	position: fixed;
	right: 20px;
	bottom: 40px;
	padding: 10px;
	background-color: #8A6FDF;
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

.picker-category {
	width: auto;
}
</style>