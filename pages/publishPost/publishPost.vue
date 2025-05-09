// PublishPost.vue
<template>
	<view class="publish-container">
		<view class="header">
			<text class="header-back" @click="goBack">返回</text>
			<text class="header-title">发布动态</text>
			<text class="header-empty"></text>
		</view>
		<view class="publish-section">
			<textarea v-model="newPost.content" placeholder="说点什么..." class="publish-input" />
			<view class="image-picker">
				<image v-for="(img, idx) in newPost.images" :key="idx" :src="img" class="picked-image"
					mode="aspectFill" />
				<view v-if="newPost.images.length < 9" class="add-image-btn" @click="chooseImage">
					+
				</view>
			</view>
			<button class="publish-btn" @click="publishPost" :style="{ background: theme.primaryColor}">发布</button>
		</view>
	</view>
</template>

<script>
	import {
		themes
	} from '@/components/theme.js'
	export default {
		data() {
			return {
				newPost: {
					user: '我',
					content: '',
					images: [],
					likeCount: 0,
					commentCount: 0,
					liked: false,
					favorited: false,					
				},
				theme: themes[0],
				themes,
			};
		},
		onLoad() {
			const saved = uni.getStorageSync('theme') || this.themes[0];
			this.theme = saved;
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			chooseImage() {
				uni.chooseImage({
					count: 9 - this.newPost.images.length,
					success: (res) => {
						this.newPost.images.push(...res.tempFilePaths);
					}
				});
			},
			publishPost() {
				if (!this.newPost.content && this.newPost.images.length === 0) {
					uni.showToast({
						title: '请输入内容或选择图片',
						icon: 'none'
					});
					return;
				}
				const posts = uni.getStorageSync('posts') || [];
				posts.unshift(JSON.parse(JSON.stringify(this.newPost)));
				uni.setStorageSync('posts', posts);
				uni.navigateBack();
			}
		}
	};
</script>

<style scoped>
	.publish-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f5f5f5;
	}

	.header {
		background-color: #ffffff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding-top: calc(var(--status-bar-height) + 30px);
		padding-bottom: 10px;
		align-items: center;
		justify-content: space-between;
		position: relative;
		height: 40px;
	}

	.header-back,
	.header-empty {
		color: #fff;
		width: 50px;
		text-align: center;
	}

	.header-title {
		font-size: 18px;
		font-weight: bold;
		text-align: center;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.publish-section {
		background: #fff;
		padding: 10px;
		flex: 1;
	}

	.publish-input {
		width: 100%;
		min-height: 80px;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 8px;
		box-sizing: border-box;
	}

	.image-picker {
		display: flex;
		flex-wrap: wrap;
		margin-top: 8px;
	}

	.picked-image,
	.add-image-btn {
		width: 60px;
		height: 60px;
		margin-right: 8px;
		margin-bottom: 8px;
		border: 1px dashed #ccc;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.publish-btn {
		margin-top: 6px;
		background: #4b5bb4;
		color: #fff;
		padding: 8px;
		border-radius: 4px;
		text-align: center;
	}
</style>