<!-- PublishPost.vue -->
<template>
	<view class="publish-container">
		<!-- Header -->
		<view class="header">
			<image class="back-btn" src="/static/back.png" @click="goBack">‹</image>
			<text class="header-title">发布动态</text>
			<text class="header-empty"></text>
		</view>

		<!-- Publish Form -->
		<scroll-view class="publish-section" scroll-y>

			<!-- 图片选择 -->
			<view class="image-picker">
				<view v-for="(img, idx) in newPost.images" :key="idx" class="picked-image-wrapper">
					<image :src="img" class="picked-image" mode="aspectFill" />
					<text class="remove-btn" @click="removeImage(idx)">×</text>
				</view>
				<view v-if="newPost.images.length < 9" class="add-image-btn" @click="chooseImage">
					+
				</view>
			</view>


			<!-- 标题输入 -->
			<input v-model="newPost.title" placeholder="添加标题 (可选)" class="publish-title" maxlength="50" />

			<!-- 内容输入 -->
			<textarea v-model="newPost.content" placeholder="说点什么..." class="publish-input" autoHeight />

			<!-- 发布按钮 -->
			<button class="publish-btn" @click="publishPost" :style="{ background: theme.primaryColor }">
				发布
			</button>
		</scroll-view>
	</view>
</template>

<script>
	import {
		themes
	} from '@/components/theme.js';
	export default {
		data() {
			return {
				newPost: {
					id: '',
					user: '我',
					avatar: '',
					title: '',
					content: '',
					images: [],
					likeCount: 0,
					commentCount: 0,
					liked: false,
					favorited: false
				},
				theme: themes[0],
				themes
			};
		},
		onLoad() {
			this.theme = uni.getStorageSync('theme') || this.themes[0];
			// 假设头像存储在用户信息中
			const profile = uni.getStorageSync('userProfile') || {};
			this.newPost.avatar = profile.avatar || '/static/tabBarIcons/personal.png';
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
			removeImage(index) {
				this.newPost.images.splice(index, 1);
			},
			publishPost() {
				if (!this.newPost.content.trim() && this.newPost.images.length === 0) {
					uni.showToast({
						title: '请输入内容或选择图片',
						icon: 'none'
					});
					return;
				}
				// 生成唯一ID
				this.newPost.id = Date.now().toString();
				const posts = uni.getStorageSync('posts') || [];
				// 预设 title 为 content 的前20字
				if (!this.newPost.title) {
					this.newPost.title = this.newPost.content
						.trim()
						.slice(0, 20);
				}
				posts.unshift({
					...this.newPost
				});
				uni.setStorageSync('posts', posts);
				uni.showToast({
					title: '发布成功',
					icon: 'success'
				});
				uni.navigateBack();
			}
		}
	};
</script>

<style scoped>
	.publish-container {
		flex: 1;
		background: #f5f5f5;
		position: relative;
		height: 100vh;
	}

	.header {
		padding-top: calc(var(--status-bar-height) + 40px);
		padding-bottom: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		text-align: center;
		background-color: #f5f5f5;
	}
	
	.back-btn {
		width: 20px;
		height: 20px;
		margin-left: 10px;
	}

	.header-empty {
		width: 50px;
		color: #fff;
	}

	.header-title {
		font-size: 18px;
		font-weight: bold;
	}

	.publish-section {
		padding: 10px 0;
		background: #fff;
		height: calc(100vh - var(--status-bar-height) - 60px);
		margin: 2px 0px;
		position: relative;
	}

	.publish-title {
		height: 36px;
		border-radius: 4px;
		padding: 0 8px;
		margin-bottom: 8px;
		font-size: 14px;
	}

	.publish-input {
		min-height: 80px;
		border-radius: 4px;
		padding: 8px;
		box-sizing: border-box;
		font-size: 14px;
	}

	.image-picker {
		display: flex;
		flex-wrap: wrap;
		margin: 8px;
	}

	.picked-image-wrapper {
		position: relative;
		width: 60px;
		height: 60px;
		margin-right: 8px;
		margin-bottom: 8px;
		border-radius: 4px;
		overflow: hidden;
	}

	.picked-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-btn {
		position: absolute;
		top: 2px;
		right: 2px;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		width: 16px;
		height: 16px;
		line-height: 16px;
		text-align: center;
		border-radius: 8px;
		font-size: 12px;
	}

	.add-image-btn {
		width: 60px;
		height: 60px;
		margin-right: 8px;
		margin-bottom: 8px;
		border: 1px dashed #ccc;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		color: #999;
		border-radius: 4px;
	}

	.publish-btn {
		width: 70%;
		height: 40px;
		border-radius: 15px;
		color: #fff;
		font-size: 16px;
		text-align: center;
		position: fixed;
		bottom: 15px;
		left: 15%;
		
	}
</style>