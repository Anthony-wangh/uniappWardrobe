<template>
	<view class="community-container">
		<!-- 头部 -->
		<view class="header" :style="{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }">
			<text class="header-title" :style="{ color: theme.textColor }">社区</text>
		</view>

		<!-- 动态列表 -->
		<scroll-view class="feed-list" scroll-y>
			<view v-for="(post, pIndex) in posts" :key="pIndex" class="post-card">
				<view class="post-header">
					<image src="/static/tabBarIcons/personal.png" class="avatar" mode="aspectFill" />
					<text class="username">{{ post.user }}</text>
				</view>
				<text class="post-content">{{ post.content }}</text>
				<view class="post-images">
					<view v-for="(img, idx) in post.images.slice(0, 9)" :key="idx" class="image-wrapper"
						@click="previewImages(post.images, idx)">
						<image :src="img" mode="aspectFill" class="post-image-fallback" />
					</view>
				</view>

				<!-- 评论列表 -->
				<view class="comments-section">
					<view v-for="(comment, cIndex) in post.comments" :key="cIndex" class="comment-item">
						<text>{{ comment.user }}: {{ comment.content }}</text>
						<text class="reply-btn" @click="openReply(post, comment)">回复</text>
						<view v-for="(reply, rIndex) in comment.replies" :key="rIndex" class="reply-item">
							<text>{{ reply.user }} 回复 {{ comment.user }}: {{ reply.content }}</text>
						</view>
					</view>
				</view>
				<!-- 操作按钮 -->
				<view class="post-actions">
					<view class="action" @click="toggleLike(post)">
						<text>{{ post.liked ? '❤️' : '🤍' }} {{ post.likeCount }}</text>
					</view>
					<view class="action" @click="openComment(post)">
						<text>💬 评论</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 弹出输入框 -->
		<comment-input-popup :visible="isPopupVisible" @submit="handlePopupSubmit" @close="isPopupVisible = false" />

		<!-- 右下角添加按钮 -->
		<view class="floating-add-btn" @click="goToPublish" :style="{ background: theme.secondaryColor }">
			<image src="/static/plus-l.png" mode="aspectFit" class="add-btn-image"  />
		</view>
	</view>
</template>

<script>
	import CommentInputPopup from '@/components/CommentInputPopup.vue';
	import {themes} from '@/components/theme.js'
	export default {
		components: {
			CommentInputPopup
		},
		data() {
			return {
				posts: [],
				isPopupVisible: false,
				currentPost: null,
				currentComment: null,
				theme: themes[0],
				themes
			};
		},
		onShow() {
			const saved = uni.getStorageSync('theme') || this.themes[0];
			this.theme=saved;
			
			this.posts = uni.getStorageSync('posts') || [];
			// 初始化每个 post 的 comments/replies
			this.posts.forEach(post => {
				if (!post.comments) post.comments = [];
				post.comments.forEach(comment => {
					if (!comment.replies) comment.replies = [];
				});
			});
		},
		methods: {
			goToPublish() {
				uni.navigateTo({
					url: '/pages/publishPost/publishPost'
				});
			},
			toggleLike(post) {
				post.liked = !post.liked;
				post.likeCount += post.liked ? 1 : -1;
				uni.setStorageSync('posts', this.posts);
			},
			openComment(post) {
				this.currentPost = post;
				this.currentComment = null;
				this.isPopupVisible = true;
			},
			openReply(post, comment) {
				this.currentPost = post;
				this.currentComment = comment;
				this.isPopupVisible = true;
			},
			handlePopupSubmit(content) {
				if (!content) return;

				if (!this.currentPost.comments) {
					this.$set(this.currentPost, 'comments', []);
				}

				if (this.currentComment) {
					if (!this.currentComment.replies) {
						this.$set(this.currentComment, 'replies', []);
					}
					this.currentComment.replies.push({
						user: '我',
						content
					});
				} else {
					this.currentPost.comments.push({
						user: '我',
						content,
						replies: []
					});
				}

				uni.setStorageSync('posts', this.posts);
				this.isPopupVisible = false;
				this.currentPost = null;
				this.currentComment = null;
			},
			previewImages(images, index) {
				uni.previewImage({
					urls: images,
					current: images[index]
				});
			}
		}
	};
</script>

<style scoped>
	.community-container {
		flex: 1;
		background: #f5f5f5;
		position: relative;
	}

	/* 固定头部 */
	.header {
		padding: 20px;
		background-color: #ffffff;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
		padding-top: calc(var(--status-bar-height) + 30px) ;
		position: relative;
		height: 40px;
	}

	.header-title {
		font-size: 18px;
		font-weight: bold;
		text-align: center;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	/* 留出头部高度 */
	.feed-list {
		flex: 1;
		margin: 10px;
		height: calc(100vh - 120px);
		width: calc(100vw - 20px);
	}

	/* 帖子卡片样式 */
	.post-card {
		background: #fff;
		padding: 12px 0px;
		border-radius: 8px;
		margin: 12px 0px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
	}

	/* 头像和用户名 */
	.post-header {
		display: flex;
		align-items: center;
		margin-bottom: 8px;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 18px;
		margin-right: 10px;
		margin-left: 10px;
	}

	.username {
		font-weight: bold;
		font-size: 15px;
	}

	/* 帖子文字内容 */
	.post-content {
		margin: 8px 0 10px 10px;
		line-height: 1.6;
		font-size: 15px;
	}

	/* 图片区域 */
	.post-images {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: flex-start;
		margin-top: 6px;
	}

	.image-wrapper {
		width: calc((100% - 12px) / 3);
		padding-bottom: calc((100% - 12px) / 3);
		/* 保持正方形 */
		position: relative;
		border-radius: 6px;
		overflow: hidden;
	}

	.post-image-fallback {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* 评论区域 */
	.comments-section {
		margin-top: 10px;
		padding-top: 8px;
		border-top: 1px solid #f0f0f0;
	}

	.comment-item {
		margin-bottom: 8px;
		font-size: 14px;
		line-height: 1.5;
	}

	.reply-item {
		padding-left: 20px;
		margin-top: 4px;
		font-size: 13px;
		color: #666;
	}

	.reply-btn {
		color: #4b5bb4;
		margin-left: 8px;
		font-size: 13px;
	}

	/* 操作按钮 */
	.post-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
		border-top: 1px solid #eee;
		padding-top: 10px;
	}

	.action {
		flex: 1;
		text-align: center;
		font-size: 15px;
	}

	/* 添加按钮 */
	.floating-add-btn {
		position: fixed;
		right: 20px;
		bottom: 40px;
		width: 50px;
		height: 50px;
		background-color: #4b5bb4;
		border-radius: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 20;
	}

	.add-btn-image {
		width: 30px;
		height: 30px;
	}
</style>