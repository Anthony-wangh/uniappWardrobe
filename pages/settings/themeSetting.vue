<template>
	<view class="theme-setting-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">主题设置</text>
		</view>

		<!-- 主题列表 -->
		<view class="theme-list">
			<view
				v-for="item in themes"
				:key="item.id"
				class="theme-item"
				:class="{ active: currentTheme === item.id }"
				@click="selectTheme(item)"
			>
				<view
					class="theme-icon"
					:style="{
						background: `linear-gradient(135deg, ${item.primaryColor}, ${item.secondaryColor})`
					}"
				>
					<image class="icon-img" src="/static/theme.png" />
				</view>
				<text class="theme-name">{{ item.name }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	// import { themes } from '@/components/theme.js';

	export default {
		data() {
			return {
				themes,
				currentTheme: uni.getStorageSync('theme')?.id || themes[0].id
			};
		},
		methods: {
			selectTheme(item) {
				this.currentTheme = item.id;
				uni.setStorageSync('theme', item);
				uni.showToast({
					title: `已切换到 ${item.name}`,
					icon: 'none'
				});
			},
			goBack() {
				uni.navigateBack();
			}
		}
	};
</script>

<style scoped>
.theme-setting-container {	
	background-color: #f9f9f9;
	min-height: 100vh;
}

/* 顶部栏 */
.navbar {	
	display: flex;
	align-items: center;
	padding: 10px 20px;
	background-color: #fff;
	border-bottom: 1px solid #ddd;
	padding-top: calc(var(--status-bar-height) + 40px);
}

.back-icon {
	width: 24px;
	height: 24px;
	margin-right: 10px;
}

.title {
	font-size: 18px;
	font-weight: bold;
	color: #333;
}

/* 主题列表 */
.theme-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-around;
	padding: 20px 10px;
}

.theme-item {
	width: 28%;
	margin-bottom: 20px;
	text-align: center;
}

.theme-icon {
	width: 64px;
	height: 64px;
	border-radius: 14px;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 auto 10px;
	border: 2px solid transparent;
	transition: transform 0.2s, border 0.3s;
}

.theme-item.active .theme-icon {
	border-color: #007aff;
	transform: scale(1.05);
}

.icon-img {
	width: 30px;
	height: 30px;
}

.theme-name {
	font-size: 14px;
	color: #333;
}
</style>
