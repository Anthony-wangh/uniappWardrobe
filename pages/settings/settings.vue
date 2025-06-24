<template>
	<view class="container">
		<!-- 用户信息 -->
		<view class="user-profile">
			<view class="user-info">
				<button v-if="userInfo.avatarUrl" open-type="chooseAvatar" class="avatar-btn"
					@chooseavatar="onChooseAvatar">
					<image v-if="userInfo.avatarUrl" :src="userInfo.avatarUrl" class="avatar"></image>
				</button>
				<image v-if="!userInfo.avatarUrl" src='/static/avatorDefault.png' class="avator-default"
					mode="aspectFit"></image>
				<view class="user-meta">
					<view class="nickName">
						<input v-if="userInfo.nickName" type="nickname" class="nickname-input"
							:value="userInfo.nickName" @blur="userNameInput" placeholder="请输入昵称" />
						<text v-if="!userInfo.nickName" class="login-btn">点击登录</text>
					</view>

					<view class="achievement" v-if="userInfo.nickName">
						<image class="achievement-icon" src='/static/achivement/achivementIcon.png'></image>
						<text class="user-desc">{{ achievement.name}}</text>
					</view>
				</view>
			</view>

			<view class="quota-section">
				<view class="quota-box">
					<text class="quota-title">衣橱额度</text>
					<text class="quota-count pink">{{quota.clothesCount + '/' + quota.clothesQuota}}</text>
					<view class="quota-bar">
						<view class="quota-bar-fill pink-bar" :style="{ width: quota.clothesRate.toString() }"></view>
					</view>
					<!-- <text class="expand-text">+扩容</text> -->
				</view>
				<view class="quota-box">
					<text class="quota-title">搭配额度</text>
					<text class="quota-count blue">{{quota.outfitsCount + '/' + quota.outfitsQuota}}</text>
					<view class="quota-bar">
						<view class="quota-bar-fill blue-bar" :style="{ width:  quota.outfitsRate.toString() }"></view>
					</view>
					<!-- <text class="expand-text">+扩容</text> -->
				</view>
			</view>
		</view>

		<!-- 设置项 -->
		<view class="settings-list">

			<navigator url="/pages/settings/categorySetting" class="setting-item">
				<image src="/static/settingIcons/category.png" class="icon" />
				<text class="label">类目设置</text>
				<text class="arrow">›</text>
			</navigator>


			<navigator url="/pages/settings/faqSetting" class="setting-item">
				<image src="/static/settingIcons/faq.png" class="icon" />
				<text class="label">常见问题</text>
				<text class="arrow">›</text>
			</navigator>

			<navigator url="/pages/settings/privacyPolicy" class="setting-item">
				<image src="/static/settingIcons/privacy.png" class="icon" />
				<text class="label">用户隐私协议</text>
				<text class="arrow">›</text>
			</navigator>


			<navigator url="/pages/settings/about" class="setting-item">
				<image src="/static/settingIcons/about.png" class="icon" />
				<text class="label">关于</text>
				<text class="arrow">›</text>
			</navigator>

		</view>

		<!-- 版本信息 -->
		<view class="version-text">版本 1.1.0</view>
	</view>
</template>

<script>
	import PrivacyCheck from '@/components/PrivacyCheck.vue';
	export default {
		components: {
			PrivacyCheck
		},
		data() {
			return {
				quota: {
					clothesCount: 0,
					outfitsCount: 0,
					clothesQuota: 30,
					outfitsQuota: 8,
					clothesRate: '0%',
					outfitsRate: '0%'
				},
				userInfo: {
					avatarUrl: '/static/tabBarIcons/setting.png',
					nickName: '小明'
				},
				token: '',
				usageTime: 22,
				messages: ["qweqwe", "fffff"],
				pushCount: 10,
				outfits: [],
				clothes: [],
				achievement: {},
				achievements: [{
						level: 0,
						name: '搭配实习生'
					},
					{
						level: 6,
						name: '风格萌芽者'
					},
					{
						level: 13,
						name: '潮流探索者'
					},
					{
						level: 22,
						name: '时尚达人'
					},
					{
						level: 35,
						name: '风格掌控者'
					},
					{
						level: 50,
						name: '穿搭设计师'
					},
					{
						level: 68,
						name: '潮流引领者'
					},
					{
						level: 100,
						name: '穿搭艺术家'
					}
				]
			};
		},
		onShow() {
			this.token = uni.getStorageSync('wardrobeToken') || '';
			this.userInfo = uni.getStorageSync('wardrobeUserInfo') || {};
			this.outfits = uni.getStorageSync("outfits") || [];
			this.clothes = uni.getStorageSync("clothes") || [];
			this.updateQuota();
			this.getAchievement();
		},
		onShareAppMessage() {
			return {
				title: "每天穿什么不再纠结！这个衣橱管理神器推荐给你",
				path: "pages/main/main",
				imageUrl: "https://mp-5df80302-4973-4391-bd75-89493f11fa67.cdn.bspapp.com/cloudstorage/MainIcon.png"
			};
		},
		onShareTimeline() {
			return {
				title: '衣服再也不怕乱堆！这个电子衣橱帮你轻松整理～👗👕', // 自定义朋友圈分享标题		
			};
		},
		methods: {

			updateQuota() {
				let quo = uni.getStorageSync("wardrobeQuota");

				if (!quo) {
					quo = this.quota;
					quo.clothesQuota = this.quota.clothesQuota;
					quo.outfitsQuota = this.quota.outfitsQuota;
				}
				quo.clothesCount = this.clothes ? this.clothes.length : 0;
				quo.outfitsCount = this.outfits ? this.outfits.length : 0;
				quo.clothesRate = (100.0 * quo.clothesCount / this.quota.clothesQuota).toString() + '%';
				quo.outfitsRate = (100.0 * quo.outfitsCount / this.quota.outfitsQuota).toString() + '%';
				this.quota = quo;
				uni.setStorageSync("wardrobeQuota", quo);
			},
			getAchievement() {

				let index = this.achievements.findLastIndex(c => this.outfits.length >= c.level);
				index = index < 0 ? 7 : index;
				this.achievement = this.achievements[index];
			},
			userNameInput(e) {
				if (e.detail.value !== this.userInfo.nickName) {
					console.log("修改昵称：" + e.detail.value);
					this.userInfo.nickName = e.detail.value;
					uni.setStorageSync("wardrobeUserInfo", this.userInfo);
					this.updateUserInfo();
				}
			},
			// 处理用户选择头像事件
			onChooseAvatar(e) {
				if (this.token === '') {
					return;
				}
				this.uploadImage(e.detail.avatarUrl);
			},
			uploadImage(filePath) {
				uniCloud.uploadFile({
					filePath: filePath,
					cloudPath: 'userIcon/' + this.userInfo._id + '.png' // 指定上传到云存储的路径和文件名					
				}).then(res => {
					this.userInfo.avatarUrl = res.fileID;
					uni.setStorageSync("wardrobeUserInfo", this.userInfo);
					this.updateUserInfo();
					uni.showToast({
						title: '图片上传成功',
						icon: 'success'
					});
					// 在此处理上传成功后的逻辑，例如将文件ID保存到数据库
				}).catch(err => {
					console.error('上传失败：', err);
					uni.showToast({
						title: '图片上传失败',
						icon: 'error'
					});
				});
			},

			updateUserInfo() {
				uniCloud.callFunction({
					name: 'updateUserInfo',
					data: {
						openid: this.userInfo.openid,
						userInfo: this.userInfo
					}
				}).then((result) => {
					if (result.result.code === 200) {
						uni.showToast({
							title: '修改成功',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: result.result.msg,
							icon: 'none'
						});
					}
				}).catch((err) => {
					uni.hideLoading();
					uni.showToast({
						title: '调用云函数失败',
						icon: 'none'
					});
					console.error('云函数错误：', err);
				});
			},
			clickLogin() {
				uni.navigateTo({
					url: "/pages/login/login"
				});
			},
			onClickDefaultAvator() {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				});
			}
		}

	};
</script>

<style scoped>
	.container {
		background-color: #fcfcfc;
		min-height: 100vh;
	}

	.user-profile {
		display: flex;
		flex-direction: column;
		padding: 10px 0 15px 0;
		padding-top: calc(var(--status-bar-height) + 40px);
	}

	.user-info {
		display: flex;
		align-items: center;
		padding: 20px 16px 10px 16px;
		position: relative;
	}

	.avatar-btn {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 12px;
		background: linear-gradient(30deg, #FDE047, #F59E0B);
	}

	.avator-default {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 12px;
	}

	.avatar {
		position: absolute;
		left: 3px;
		top: 3px;
		width: 54px;
		height: 54px;
		border-radius: 50%;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.03);
	}

	.user-meta {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.nickName {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.nickname-input {
		font-size: 16px;
		font-weight: bold;
		color: #111;
	}

	.editNickName {
		font-size: 14px;
		color: #646464;
		margin-left: -20px;
	}

	.user-desc {
		font-size: 14px;
		color: #8A6FDF;
		border-radius: 10px;
		margin-left: 5px;
	}

	.achievement {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 2px;
		padding: 3px 0px;
	}

	.achievement-icon {
		width: 18px;
		height: 18px;
	}

	.edit-btn {
		font-size: 14px;
		color: #5e80ff;
		background: #edf0ff;
		padding: 4px 10px;
		border-radius: 12px;
	}

	.quota-section {
		display: flex;
		justify-content: space-around;
		padding: 16px 16px 8px 16px;
	}

	.quota-box {
		background: #fff;
		border-radius: 12px;
		padding: 12px;
		flex: 1;
		margin: 0 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
		display: flex;
		flex-direction: column;
	}

	.quota-title {
		font-size: 14px;
		color: #333;
		margin-bottom: 4px;
	}

	.quota-count {
		font-size: 16px;
		font-weight: bold;
	}

	.pink {
		color: #ff6783;
	}

	.blue {
		color: #3c82ff;
	}

	.quota-bar {
		width: 100%;
		height: 6px;
		background: #eee;
		border-radius: 3px;
		margin: 6px 0;
		overflow: hidden;
	}

	.quota-bar-fill {
		height: 100%;
		border-radius: 3px;
	}

	.pink-bar {
		background-color: #ff9ca7;
	}

	.blue-bar {
		background-color: #93b8ff;
	}

	.expand-text {
		font-size: 12px;
		color: #505cff;
		text-align: left;
	}



	.settings-list {
		margin: 0 16px;
		border-radius: 10px;
		border: 1px solid #ebebeb;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
		overflow: hidden;
	}

	.setting-item {
		background-color: #fff;
		display: flex;
		align-items: center;
		padding: 12px;
		border-bottom: 1px solid #ebebeb;
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.icon {
		width: 22px;
		height: 22px;
		margin-right: 16px;
	}

	.label {
		flex: 1;
		font-size: 14px;
		color: #333;
	}

	.arrow {
		color: #999;
		font-size: 20px;
	}

	.version-text {
		color: #999;
		font-size: 12px;
		text-align: center;
		margin-top: 20px;
	}

	.login-btn {
		font-size: 16px;
		font-weight: bold;
		color: #8A6FDF;
		margin-left: 10px;
	}
</style>