<template>
	<view class="container" >
		<!-- 用户信息 -->
		<view class="user-info" :style="{ background: `linear-gradient(100deg, ${theme.primaryColor}, ${theme.secondaryColor})` }"
			>
			<image class="avatar" :src="user.avatar" mode="aspectFill" />
			<view class="user-details">
				<text class="nickname" :style="{ color: theme.textColor }">{{ user.nickname }}</text>
				<text class="usage-time" :style="{ color: theme.textColor }">已陪伴：{{ usageTime }} 天</text>
			</view>
		</view>
		<view class="settings-container">		
			<!-- 主题列表 -->
			<view class="theme-group">
				<view class="theme-header" @click="toggleList">
					<text class="group-title" >主题选择</text>
					<view class="toggle-icon" :class="{ rotated: !collapsed }">▶
					</view>
				</view>
				<transition name="collapse">
					<view class="theme-list" v-if="!collapsed">
						<view v-for="item in themes" :key="item.id" class="theme-item"
							:class="{ active: currentTheme === item.id }" @click="selectTheme(item)">
							<view class="theme-icon"
								:style="{ background: `linear-gradient(135deg, ${item.primaryColor}, ${item.secondaryColor})` }">
								<image class="icon-text" src='/static/theme.png'></image>
							</view>
							<text class="theme-name">{{ item.name }}</text>
						</view>
					</view>
				</transition>
			</view>
		</view>
	</view>
	<PrivacyCheck />
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
					avatar: '/static/tabBarIcons/personal.png',
					nickname: '小明'
				},
				usageTime: 22,
				currentTheme: 'theme-pure',
				collapsed: true,
				theme: themes[0],
				themes,
				//天气信息
				weatherInfo: {},
				clothingAdvice: {},
				weatherDetail: '',
				weatherTips: '',
			};
		},
		onShow() {
			const saved = uni.getStorageSync('theme') || this.themes[0];
			this.currentTheme = saved.id;
			this.theme = saved;
		},
		methods: {
			toggleList() {
				this.collapsed = !this.collapsed;
			},
			selectTheme(item) {
				this.currentTheme = item.id;
				this.theme = item;
				uni.setStorageSync('theme', item);

				uni.showToast({
					title: `已切换到 ${item.name}`,
					icon: 'none'
				});
			}
		}

	};
</script>

<style scoped>
	.container {
		flex: 1;
		background-color: #eee;
		min-height:  100vh;
	}

	.settings-container {
		min-height: calc(100vh -100px);
		flex: 1;
		margin-top: 10px;
		/* background: #f4f4f4; */
		/* border-top-left-radius: 24px;
		border-top-right-radius: 24px; */
		padding: 10px 0 40px 0;
		/* box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05); */
	}

	.user-info {
		display: flex;
		align-items: center;
		padding-top: calc(var(--status-bar-height) + 30px);
		border-bottom-left-radius: 24px;
		border-bottom-right-radius: 24px;
		padding-bottom: 20px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}

	.avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		margin-right: 16px;
		margin-left: 12px;
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.nickname {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 6px;
	}

	.usage-time {
		font-size: 14px;
		color: #666;
	}

	.theme-group {
		margin: 10px;
		/* background: #fff; */
		/* border-radius: 8px; */
		overflow: hidden;
		border-bottom : 1px solid #616161;
	}

	.theme-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		/* border-bottom: 1px solid #616161; */
		cursor: pointer;
	}

	.group-title {
		font-size: 15px;
		color: #333;
	}

	.toggle-icon {
		color: #333333;
		transition: transform 0.3s;
	}

	.toggle-icon.rotated {
		transform: rotate(90deg);
	}

	/* 折叠动画 */
	.collapse-enter-active,
	.collapse-leave-active {
		transition: height 0.3s, opacity 0.3s;
	}

	.collapse-enter,
	.collapse-leave-to {
		height: 0;
		opacity: 0;
		overflow: hidden;
	}

	.theme-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 12px 16px;
	}

	.theme-item {
		width: 25%;
		box-sizing: border-box;
		padding: 4px;
		text-align: center;
		transition: transform 0.2s, background 0.2s;
	}

	.theme-item:nth-child(4n) {
		padding-right: 0;
	}

	.theme-item.active {
		background: rgba(0, 0, 0, 0.05);
		transform: scale(1.05);
	}

	.theme-item.active .theme-icon {
		border: 2px solid #007AFF;
	}

	.theme-icon {
		width: 60px;
		height: 60px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 8px;
	}

	.icon-text {
		width: 30px;
		height: 30px;
	}

	.theme-name {
		font-size: 14px;
		color: #555;
	}
</style>