<template>
	<view class="container">
		<!-- 用户信息 -->
		<view class="user-profile">
		  <view class="user-info">
		    <button open-type="chooseAvatar" class="avatar-btn" @chooseavatar="onChooseAvatar">
		      <image v-if="user.avatar" :src="user.avatar" class="avatar"></image>
		    </button>
		    <view class="user-meta">
		      <input type="nickname" class="nickname-input" :value="user.nickname" @blur="userNameInput"
		        placeholder="请输入昵称" />
		      <text class="user-desc">时尚搭配达人</text>
		    </view>
		  </view>
		
		  <view class="quota-section">
		    <view class="quota-box">
		      <text class="quota-title">衣橱额度</text>
		      <text class="quota-count pink">10/50</text>
		      <view class="quota-bar">
		        <view class="quota-bar-fill pink-bar" :style="{ width: '20%' }"></view>
		      </view>
		      <text class="expand-text">+扩容</text>
		    </view>
		    <view class="quota-box">
		      <text class="quota-title">搭配额度</text>
		      <text class="quota-count blue">25/100</text>
		      <view class="quota-bar">
		        <view class="quota-bar-fill blue-bar" :style="{ width: '25%' }"></view>
		      </view>
		      <text class="expand-text">+扩容</text>
		    </view>
		  </view>
		</view>

		<!-- 设置项 -->
		<view class="settings-list">
			<navigator url="/pages/settings/messageList" class="setting-item">
				<image src="/static/settingIcons/message.png" class="icon" />
				<text class="label">消息</text>
				<text class="arrow">›</text>
			</navigator>

			<navigator url="/pages/settings/categorySetting" class="setting-item">
				<image src="/static/settingIcons/category.png" class="icon" />
				<text class="label">类目设置</text>
				<text class="arrow">›</text>
			</navigator>

			<navigator url="/pages/settings/themeSetting" class="setting-item">
				<image src="/static/settingIcons/theme.png" class="icon" />
				<text class="label">主题设置</text>
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
		</view>

		<!-- 版本信息 -->
		<view class="version-text">版本 1.0.0</view>
	</view>
</template>

<script>
	import PrivacyCheck from '@/components/PrivacyCheck.vue';
	import {
		themes
	} from '@/components/theme.js'
	export default {
		components: {
			PrivacyCheck
		},
		data() {
			return {
				user: {
					avatar: '/static/tabBarIcons/setting.png',
					nickname: '小明'
				},
				usageTime: 22,
				theme: themes[0],
				themes,
				messages: ["qweqwe", "fffff"],
				pushCount: 10
			};
		},
		onShow() {
			uni.setNavigationBarColor({
			  frontColor:  '#000000',
			  backgroundColor: '#ffffff' 
			});
			const saved = uni.getStorageSync('theme') || this.themes[0];
			this.theme = saved;
		},
		methods: {
			openMessage() {
				uni.navigateTo({
					url: "/pages/settings/messageList"
				});
			},
			userNameInput(e){
				console.log("修改昵称："+e.detail.value)
				this.user.nickname = e.detail.value;
			},
			onChooseAvatar(e) {
				this.user.avatar = e.detail.avatarUrl;
			},
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
	}
	
	.avatar {
		position: absolute;
		left: 0;
		top: 0;
	  width: 60px;
	  height: 60px;
	  border-radius: 50%;
	}
	
	.user-meta {
	  flex: 1;
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	}
	
	.nickname-input {
	  font-size: 16px;
	  font-weight: bold;
	  color: #111;
	}
	
	.user-desc {
	  font-size: 13px;
	  color: #888;
	  margin-top: 2px;
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
		border-radius: 20px;
		border: 1px solid #e5e5e5;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
		overflow: hidden;
	}

	.setting-item {
		background-color: #fff;
		display: flex;
		align-items: center;
		padding: 12px;
		border-bottom: 1px solid #e5e5e5;
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
</style>