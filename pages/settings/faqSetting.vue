<template>
	<view class="faq-container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<image class="back-icon" src="/static/back.png" @click="goBack" />
			<text class="title">常见问题</text>
		</view>

		<!-- 问题列表 -->
		<view class="faq-list">
			<view
				v-for="(item, index) in faqList"
				:key="index"
				class="faq-item"
				@click="toggleItem(index)"
			>
				<view class="faq-question">
					<text>{{ item.question }}</text>
					<text class="arrow" :class="{ rotated: openIndex === index }">▶</text>
				</view>
				<view v-if="openIndex === index" class="faq-answer">
					{{ item.answer }}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			openIndex: null,
			faqList: [
				{
					question: '如何上传衣物和进行搭配？',
					answer: '1.上传衣物，在“我的衣橱”标签页中，点击二级类目后面的“上传”按钮，可以在当前类目下上传衣物；\n 2.搭配套装，在“我的衣橱”标签页中，点击右上角“编辑”按钮，然后选中衣物列表中你想进行搭配的衣物，点击底部“搭配”按钮，即可进入搭配模式。'
				},
				{
					question: '如何修改头像和名称？',
					answer: '请前往“设置”页中，点击顶部头像或者名称进行修改，可以使用微信头像昵称或者自定义。'
				},
				{
					question: '怎么删除已经上传的衣物和搭配？',
					answer: '在“我的衣橱”或者“我的搭配”页面右上角点击“编辑”按钮，可以进行批量删除或其他操作。'
				},
				{
					question: '使用数据会同步吗？',
					answer: '是的，登录账户后，您的衣服数据和搭配将自动同步至云端。'
				},
				{
					question: '可以直接上传我的套装吗？',
					answer: '是的，如果您不想使用“我的衣橱”中上传的衣服来进行搭配，也可以在“首页-上传套装”或者“我的搭配-上传套装”来直接上传自己搭配好的套装图片。'
				},
				{
					question: '设置中配额有什么用？',
					answer: '配额表示你当前可以上传的衣物和套装的数量，数量超过配额即不可再上传。'
				},
				{
					question: '配额可以增加吗？',
					answer: '当然！可以点击配额模块里面的“扩容”按钮来增加额度，你可以通过观看视频广告或者邀请好友来增加额度。'
				}
			]
		};
	},
	methods: {
		toggleItem(index) {
			this.openIndex = this.openIndex === index ? null : index;
		},
		goBack() {
			uni.navigateBack();
		}
	}
};
</script>

<style scoped>
.faq-container {
	background-color: #f9f9f9;
	min-height: 100vh;
}

/* 顶部栏 */
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

/* FAQ 列表 */
.faq-list {
	padding: 20px;
}

.faq-item {
	background-color: #fff;
	border-radius: 10px;
	margin-bottom: 12px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
	padding: 14px 16px;
	transition: all 0.3s ease;
}

.faq-question {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 16px;
	color: #333;
}

.arrow {
	transition: transform 0.3s ease;
	color: #666;
}

.arrow.rotated {
	transform: rotate(90deg);
}

.faq-answer {
	margin-top: 10px;
	font-size: 14px;
	color: #666;
	line-height: 1.6;
	white-space: pre-line;
}
</style>
