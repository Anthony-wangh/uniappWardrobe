<template>
	<view class="container">
		<!-- 顶部标题栏 -->

		<view class="header">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">消息</text>
			<view class="mark-all" @click="markAllAsRead">全部已读</view>
		</view>

		<!-- 消息列表 -->
		<scroll-view scroll-y class="message-scroll">
			<view v-for="(msg, index) in messages" :key="msg.id" class="swipe-wrapper"
				:class="{ swiped: swipedIndex === index }" @touchstart="touchStart($event, index)"
				@touchmove="touchMove($event, index)" @touchend="touchEnd">
				<!-- 删除按钮：与 .message-item 同级，跟随 .swipe-wrapper 一起平移 -->
				<view class="delete-button" @click.stop="deleteMessage(index)">
					删除
				</view>

				<!-- 消息卡片 -->
				<view class="message-item" @click="toggleExpand(index)">
					<view class="message-header">
						<view class="base-item">
							<view class="left">
								<text class="message-title">{{ msg.title }}</text>
								<view v-if="!msg.read" class="unread-dot" />
							</view>
							<text class="time">{{ msg.time }}</text>
						</view>
					</view>
					<view class="message-content" v-if="msg.expanded">
						<text>{{ msg.content }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				messages: [{
						id: 1,
						title: '欢迎使用衣橱管家！',
						content: '这是您的第一条站内信，感谢您的使用，让我们一起进入精致的生活吧。',
						time: '2025-06-11 10:00',
						read: false,
						expanded: false
					},
					{
						id: 2,
						title: '容量即将用尽',
						content: '您的搭配容量已不足 10%，请及时清理或升级。',
						time: '2025-05-12 18:30',
						read: false,
						expanded: false
					},
					{
						id: 3,
						title: '功能更新通知',
						content: '新增类目编辑功能和主题设置界面，欢迎体验！',
						time: '2025-05-10 14:20',
						read: false,
						expanded: false
					},
				],
				startX: 0,
				swipedIndex: -1,
			};
		},
		methods: {
			toggleExpand(index) {
				const msg = this.messages[index];
				msg.expanded = !msg.expanded;
				if (msg.expanded) {
					msg.read = true;
				}
			},
			markAllAsRead() {
				this.messages.forEach(msg => (msg.read = true));
				uni.showToast({
					title: '全部标记为已读',
					icon: 'none'
				});
			},
			deleteMessage(index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这条消息吗？',
					success: res => {
						if (res.confirm) {
							this.messages.splice(index, 1);
							this.swipedIndex = -1;
						}
					},
				});
			},
			touchStart(e, index) {
				this.startX = e.touches[0].clientX;
				// 先收起其他项
				if (this.swipedIndex !== index) {
					this.swipedIndex = -1;
				}
			},
			touchMove(e, index) {
				const moveX = e.touches[0].clientX;
				const deltaX = this.startX - moveX;
				// 左滑超过 40px 展开当前项
				if (deltaX > 40) {
					this.swipedIndex = index;
				}
				// 右滑超过 40px 收起
				else if (deltaX < -40) {
					this.swipedIndex = -1;
				}
			},
			touchEnd() {
				// 结束时，无需额外处理
			},
			goBack() {
				uni.navigateBack();
			}
		},
	};
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.header {
		display: flex;
		align-items: center;
		padding: 12px 20px;
		background-color: #fff;
		border-bottom: 1px solid #e5e5e5;

		padding-top: calc(var(--status-bar-height) + 40px);
	}

	.back-icon {
		width: 24px;
		height: 24px;
		margin-right: 12px;
	}

	.title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	.mark-all {
		font-size: 12px;
		color: #4b60d5b3;
		margin-left: 10px;
	}

	.message-scroll {
		flex: 1;
		padding: 10px 0;
		overflow: hidden;
	}

	/* 滑动容器，统一平移 .swipe-wrapper，里面的按钮和卡片一起动 */
	.swipe-wrapper {
		position: relative;

		margin-bottom: 10px;
		transition: transform 0.2s ease-in-out;

	}

	/* 平移距离等于删除按钮宽度 */
	.swipe-wrapper.swiped {
		transform: translateX(-80px);
	}

	/* 删除按钮 */
	.delete-button {
		position: absolute;
		right: -80px;
		top: 0;
		bottom: 0;
		width: 80px;
		background-color: #be2c2c;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 16px;
		z-index: 1;
		border-top-left-radius: 10px;
		border-bottom-left-radius: 10px;
	}

	/* 消息卡片 */
	.message-item {
		background: #ffffff;
		border-radius: 10px;
		padding: 12px 0;
		margin: 0 10px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		/* 不再需要 transform 了 */
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-left: 10px;
	}

	.base-item {
		width: 100vw;
	}

	.left {
		display: flex;
		align-items: center;
	}

	.message-title {
		font-weight: bold;
		font-size: 16px;
		margin-right: 6px;
	}

	.unread-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #ff3b30;
	}

	.time {
		font-size: 12px;
		color: #999;
	}

	.message-content {
		margin-top: 10px;
		color: #333;
		line-height: 20px;
		margin-left: 10px;
	}
</style>