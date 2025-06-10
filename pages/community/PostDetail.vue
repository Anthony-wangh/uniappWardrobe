<!-- PostDetail.vue -->
<template>
	<view class="detail-container">
		<!-- Header -->
		<view class="header">
			<image class="back-btn" src="/static/back.png" @click="goBack">‹</image>
			<image :src="post.avatar" class="avatar" mode="aspectFill" />
			<text class="username">{{ post.user }}</text>
			<text class="follow-btn" @click="toggleFollow">{{ followed ? '已关注' : '+关注' }}</text>
		</view>



		<!-- Content -->
		<scroll-view class="content-wrap" scroll-y @scroll="onScroll">
			<!-- Image Carousel -->
			<swiper class="image-swiper" :indicator-dots="true" :autoplay="false" :indicator-color="'#fff'"
				:indicator-active-color="theme.primaryColor" @change="onSwipeChange">
				<swiper-item v-for="(img, idx) in post.images" :key="idx">
					<image :src="img" mode="aspectFill" class="swiper-image" @click="previewImage(idx)" />
				</swiper-item>
			</swiper>
			<!-- Title & Like Inline -->
			<view class="text-content-row" v-if="post.title">
				<text class="post-title">{{ post.title }}</text>
				<view class="like-action-inline" @click="toggleLike">
					<text>{{ liked ? '❤️' : '🤍' }}</text>
					<text class="like-count">{{ likeCount }}</text>
				</view>
			</view>

			<!-- Post Content -->
			<view class="text-content">
				<text class="post-text">{{ post.content }}</text>
			</view>

			<text class="time">{{ formattedTime }}</text>

			<!-- Action Bar -->
			<view class="action-bar">
				<view class="comment-action">
					<text class="comment-action-text" @click="openPopup('comment')">说点什么...</text>
				</view>
			</view>

			<!-- Separator -->
			<view class="sep"></view>
			<text class="postCount-text">共{{ post.commentCount }}条评论</text>

			<!-- Comments -->
			<view class="comments-section">
				<view v-for="(comment, idx) in post.comments" :key="idx" class="comment-item">
					<view class="c-body">
						<view class="c-header">
							<text class="c-user">{{ comment.user }}</text>
						</view>
						<text class="c-text">{{ comment.content }}</text>
						<text class="c-time">{{ formatTime(comment.time) }}</text>
						<text class="c-reply" @click="openPopup('reply', comment, idx)">回复</text>

						<view v-if="comment.replies" class="replies">
							<view v-for="(reply, rIdx) in comment.replies" :key="rIdx" class="reply-item">
								<text class="reply-text"><text
										class="c-user">{{ reply.user }}</text>：{{ reply.content }}</text>
								<text class="c-time">{{ formatTime(reply.time) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- Comment Popup -->
		<comment-input-popup :visible="popupVisible" @update:visible="popupVisible = $event"
			@submit="handlePopupSubmit" />
	</view>
</template>


<script>
	import {
		themes
	} from '@/components/theme.js';
	import CommentInputPopup from '@/components/CommentInputPopup.vue';
	export default {
		components: {
			CommentInputPopup
		},
		data() {
			return {
				post: {
					images: [],
					user: '',
					avatar: '',
					title: '',
					content: '',
					comments: [],
					commentCount: 0
				},
				liked: false,
				likeCount: 0,
				followed: false,
				theme: themes[0],
				popupVisible: false,
				popupMode: 'comment', // 'comment' or 'reply'
				targetComment: null,
				targetIndex: null
			};
		},
		computed: {
			formattedTime() {
				return new Date().toLocaleString();
			}
		},


		onLoad({
			id
		}) {
			this.theme = uni.getStorageSync('theme') || themes[0];
			const all = uni.getStorageSync('posts') || [];
			const p = all.find(x => x.id === id);
			if (p) {
				this.post = p;
				this.liked = p.liked;
				this.likeCount = p.likeCount;
				this.followed = p.followed;
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			onSwipeChange() {},
			previewImage(idx) {
				uni.previewImage({
					urls: this.post.images,
					current: this.post.images[idx]
				});
			},
			toggleLike() {
				this.liked = !this.liked;
				this.likeCount += this.liked ? 1 : -1;
				this.syncStorage();
			},
			sharePost() {
				uni.showToast({
					title: '分享功能待实现',
					icon: 'none'
				});
			},

			toggleFollow() {
				this.followed = !this.followed;
				this.syncStorage();
			},
			formatTime(ts) {
				const d = new Date(ts);
				return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
			},
			openPopup(mode, comment = null, idx = null) {
				this.popupMode = mode;
				this.targetComment = comment;
				this.targetIndex = idx;
				this.popupVisible = true;
			},
			handlePopupSubmit(text) {
				const userProfile = uni.getStorageSync('userProfile') || {};
				const obj = {
					user: '我',
					avatar: userProfile.avatar || '',
					content: text,
					time: Date.now()
				};
				if (this.popupMode === 'reply' && this.targetIndex !== null) {
					if (!this.post.comments[this.targetIndex].replies) {
						this.$set(this.post.comments[this.targetIndex], 'replies', []);
					}
					this.post.comments[this.targetIndex].replies.push(obj);
				} else {
					if (!this.post.comments)
						this.post.comments = [];

					this.post.comments.unshift(obj);
					this.post.commentCount++;
				}
				this.syncPosts();
			},
			syncStorage() {
				const posts = uni.getStorageSync('posts') || [];
				const idx = posts.findIndex(x => x.id === this.post.id);
				if (idx !== -1) {
					posts[idx].liked = this.liked;
					posts[idx].likeCount = this.likeCount;
					posts[idx].followed = this.followed;
					uni.setStorageSync('posts', posts);
				}
			},
			syncPosts() {
				const posts = uni.getStorageSync('posts') || [];
				const idx = posts.findIndex(x => x.id === this.post.id);
				if (idx !== -1) {
					posts[idx] = this.post;
					uni.setStorageSync('posts', posts);
				}
			}
		}
	};
</script>

<style scoped>
	.detail-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f7f7f7;
	}

	.header {
		background-color: #ffffff;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
		padding-top: calc(var(--status-bar-height) + 30px);
		padding-bottom: 10px;
		height: 40px;
		display: flex;
		align-items: center;
		
		border-bottom: #888 solid 1px;
	}

	.back-btn {
		width: 20px;
		height: 20px;
		margin-left: 10px;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 20px;
		margin-left: 10px;
	}

	.username {
		font-size: 18px;
		font-weight: bold;
		margin-left: 5px;
		color: #272727;
	}

	.follow-btn {
		font-size: 14px;
		padding: 4px 10px;
		border: 1px solid #4b5bb4;
		border-radius: 8px;
		color: #4b5bb4;
		margin-left: 20px;
	}

	.image-swiper {
		width: 100%;
		height: 100vw;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	.content-wrap {
		padding-bottom: 60px;
		height: calc(100vh - 130px);
	}

	.text-content {
		padding: 5px 12px;
		display: flex;
		flex-direction: column;
	}


	.post-text {
		font-size: 14px;
		line-height: 1.6;
		margin-top: 6px;
	}

	.time {
		font-size: 12px;
		color: #888;
		padding: 5px 12px;
	}

	.action-bar {
		display: flex;
		justify-content: space-between;
		padding: 12px 0;
		margin: 10px;
		background: #e8e8e8;
		border-radius: 20px;
	}

	.comment-action {
		margin-left: 10px;
	}

	.comment-action-text {
		color: #888;
	}

	.like-action {
		margin-left: 40%;
	}



	.sep {
		height: 8px;
		background: #f5f5f5;
	}

	.postCount-text {
		font-size: 16px;
		padding: 0 12px;
		margin: 10px 0;
	}

	.comments-section {
		padding: 8px 10px;
	}

	.comment-item {
		display: flex;
		margin-bottom: 12px;
	}

	.c-body {
		flex: 1;
		margin: 10px;
	}

	.c-header {
		display: flex;
		justify-content: space-between;
	}

	.c-user {
		font-size: 14px;
		font-weight: bold;
	}

	.c-text {
		font-size: 14px;
		margin: 4px 0;
		color: #4b4b4b;
	}

	.c-time {
		font-size: 10px;
		color: #888;
		margin-left: 5px;
	}

	.c-reply {
		font-size: 12px;
		color: #4b5bb4;
		margin-left: 5px;
	}

	.replies {
		margin-top: 8px;
		padding-left: 20px;
	}

	.reply-item {
		margin-bottom: 6px;
	}

	.reply-text {
		font-size: 14px;
		color: #707070;
	}



	.text-content-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 12px 0 12px;
	}

	.post-title {
		font-size: 18px;
		font-weight: bold;
		flex: 1;
	}

	.like-action-inline {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.like-count {
		margin-left: 4px;
		font-size: 14px;
	}
</style>