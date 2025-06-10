<template>
	<view class="privacy-container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">隐私政策</text>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content" scroll-y>
			<view class="section">
				<text class="section-title">一、我们如何收集和使用您的信息</text>
				<text class="section-text">
					我们会在您使用本应用过程中，根据您的授权收集必要的信息，例如昵称、头像等信息用于个性化展示，并保障服务的正常运行。
				</text>
			</view>

			<view class="section">
				<text class="section-title">二、我们如何保护您的信息</text>
				<text class="section-text">
					我们采用业界通行的数据加密存储与传输技术，确保您的个人信息安全。非经您同意，我们不会向任何第三方披露您的信息。
				</text>
			</view>

			<view class="section">
				<text class="section-title">三、您的权利</text>
				<text class="section-text">
					您有权查看、更正、删除您的个人信息，并有权随时撤回授权或注销账号。如需操作，请通过应用内的“设置”页面联系我们。
				</text>
			</view>

			<view class="section">
				<text class="section-title">四、变更通知</text>
				<text class="section-text">
					如我们对隐私政策进行重大变更，会通过应用弹窗、站内信等方式通知您，以便您及时了解具体变更内容。
				</text>
			</view>

			<view class="section">
				<text class="section-title">五、联系我们</text>
				<text class="section-text">
					如您对本政策有任何疑问，可通过客服邮箱：511072280@qq.com 联系我们。
				</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	methods: {
		goBack() {
			uni.navigateBack();
		}
	}
};
</script>

<style scoped>
.privacy-container {
	background-color: #f9f9f9;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.navbar {
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

/* 内容滚动区域 */
.content {
	flex: 1;
	padding: 16px 0;
	background-color: #fff;
	margin: 10px;
}

.section {
	margin-bottom: 20px;
}

.section-title {
	font-size: 16px;
	font-weight: bold;
	color: #1a1a1a;
	margin-bottom: 10px;
	display: block;
}

.section-text {
	font-size: 14px;
	color: #555;
	line-height: 1.8;
}
</style>
