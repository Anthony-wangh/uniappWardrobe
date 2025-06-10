<!-- CommunityList.vue -->
<template>
	<view class="community-container">
		<!-- Header -->
		<view class="header"
			:style="{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }">
			<text class="header-title" :style="{ color: theme.textColor }">社区</text>
		</view>

		<!-- Posts Grid -->
		<scroll-view class="feed-list" scroll-y>
			<view class="grid">
				<view v-for="(post, index) in posts" :key="post.id || index" class="card" @click="goToDetail(post)">
					<image :src="post.images[0]" class="cover-image" mode="aspectFill" />
					<view class="card-info">
						<text class="card-title" lines="1">{{ post.title }}</text>
						<view class="author-row">
						<view class="author">
							<image :src="post.avatar" class="avatar" mode="aspectFill" />
							<text class="username" lines="1">{{ post.user }}</text>
						</view>
						<view class="card-footer">
							<text>❤️ {{ post.likeCount }}</text>
						</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- Floating Publish Button -->
		<view class="floating-add-btn" @click="goToPublish" :style="{ background: theme.primaryColor }">
			<image src="/static/plus-l.png" mode="aspectFit" class="add-btn-image" />
		</view>
	</view>
</template>

<script>
	import {
		themes
	} from '@/components/theme.js';
	export default {
		data() {
			return {
				posts: [],
				theme: themes[0],
				themes
			};
		},
		onShow() {
			this.theme = uni.getStorageSync('theme') || this.themes[0];
			this.posts = (uni.getStorageSync('posts') || []).map((post, i) => ({
				id: post.id || i,
				title: post.title || '无标题',
				user: post.user,
				avatar: post.avatar || '/static/tabBarIcons/personal.png',
				images: post.images || [],
				likeCount: post.likeCount || 0
			}));
		},
		methods: {
			goToPublish() {
				uni.navigateTo({
					url: '/pages/publishPost/publishPost'
				});
			},
			goToDetail(post) {
				uni.navigateTo({
					url: `/pages/community/PostDetail?id=${post.id}`
				});
			}
		}
	};
</script>

<style scoped>
	.community-container {
		flex: 1;
		background: #ffffff;
		position: relative;
	}

	.header {
		text-align: center;
		background-color: #ffffff;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
		padding-top: calc(var(--status-bar-height) + 30px);
		position: relative;
		height: 40px;
	}

	.header-title {
		font-size: 18px;
		font-weight: bold;
	}

	.feed-list {
		padding: 10px 0;
	}

	.grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}

	.card {
		width: calc(50% - 8px);
		background: #fff;
		border-radius: 8px;
		margin-bottom: 12px;
		overflow: hidden;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	}

	.cover-image {
		width: 100%;
		height: 200px;
	}

	.card-info {
		padding: 8px;
	}

	.card-title {
		font-size: 14px;
		font-weight: bold;
		margin-bottom: 15px;
	}

	.author {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 24px;
		height: 24px;
		border-radius: 12px;
		margin-right: 6px;
	}

	.username {
		font-size: 13px;
	}

	.card-footer {
		text-align: right;
		font-size: 12px;
		color: #666;
	}

	.floating-add-btn {
		position: fixed;
		right: 20px;
		bottom: 40px;
		width: 50px;
		height: 50px;
		border-radius: 25px;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 20;
	}

	.add-btn-image {
		width: 30px;
		height: 30px;
	}
	
	.author-row{
		display: flex;
		justify-content: space-between;
		margin: 5px 0 0 0;
		align-items: center;
	}
</style>