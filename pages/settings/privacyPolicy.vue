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
				<text class="section-title">一、开发者处理的信息</text>
				<text class="section-text">
					本指引是我的衣橱管家小程序开发者 （以下简称“开发者”）为处理你的个人信息而制定。\n
					根据法律规定，开发者仅处理实现小程序功能所必需的信息。\n
					1.1 开发者将在获取你的明示同意后，收集你的微信昵称、头像，用途是【用户头像和名称展示】；\n					
					1.2 开发者将在获取你的明示同意后，收集你的位置信息，用途是【获取本地天气信息】；\n
					1.3 开发者  收集你选中的照片或视频信息，用于上传衣物图片和头像图片。\n
				</text>
			</view>

			<view class="section">
				<text class="section-title">二、第三方插件信息/SDK信息</text>
				<text class="section-text">
					2.1 关于你的个人信息，你可以通过以下方式与开发者联系，行使查询、复制、更正、删除等法定权利。\n
					2.2 若你在小程序中注册了账号，你可以通过以下方式与开发者联系。申请注销你在小程序中使用的账号。在受理你的申请后，开发者将在七个工作日内完成核查并处理，并按照法律法规要求处理你的相关信息。
					
				</text>
			</view>

			<view class="section">
				<text class="section-title">三、你的权益</text>
				<text class="section-text">
					关于你的个人信息，你可以通过以下方式与开发者联系，行使查询、复制、更正、删除等法定权利。\n微信号：AnthonyW2024
				</text>
			</view>

			<view class="section">
				<text class="section-title">四、开发者对信息的存储</text>
				<text class="section-text">
					4.1 开发者将在本指引所明示的用途内使用收集的信息。\n
					4.2 如果在使用你的信息超出本指引目的和范围时，开发者会另行征得你的同意。
				</text>
			</view>

			<view class="section">
				<text class="section-title">五、信息的使用规则</text>
				<text class="section-text">
					5.1 开发者将在本指引所明示的用途内使用收集的信息。\n
					5.2 开发者将遵循、不公开外泄不披露你的信息。如必须公开披露时，开发者应告知你披露的目的、类型及范围，并征得你的单独同意。
				</text>
			</view>

			<view class="section">
				<text class="section-title">六、信息对外提供</text>
				<text class="section-text">
					微信号：AnthonyW2024
				</text>
			</view>

			<view class="section">
				<text class="section-title">七、我们如何保护您的信息</text>
				<text class="section-text">
					我们采用业界通行的数据加密存储与传输技术，确保您的个人信息安全。非经您同意，我们不会向任何第三方披露您的信息。
				</text>
			</view>

			<view class="section">
				<text class="section-title">八、变更通知</text>
				<text class="section-text">
					如我们对隐私政策进行重大变更，会通过应用弹窗、站内信等方式通知您，以便您及时了解具体变更内容。
				</text>
			</view>

			<view class="section">
				<text class="section-title">九、联系我们</text>
				<text class="section-text">
					如您对本政策有任何疑问，可通过客服邮箱：511072280@qq.com 或微信号：AnthonyW2024 联系我们。\n
					更新时间：2025-06-11 \n
					生效时间：2025-06-11
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
	width: calc(100% - 40px);
	/* background-color: #fff; */
	margin: 5px 20px;
	height: calc(100vh - 120px);
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
