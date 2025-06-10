<template>
	<view class="container">
		
		<!-- 顶部标题栏 -->
		<view class="header-container">
			<view class="header">
				<text class="title-text" :style="{ color: theme.textColor }">我的搭配</text>		
			</view>
			<view class="edit-container">
				<view class="search-container">
					<image class="search-btn" src="/static/search.png"></image>
					<input v-model="searchKeyword" class="search-input" placeholder="搜索搭配名称" />
				</view>
			</view>
			</view>

		<!-- 套装列表 -->
		<scroll-view scroll-y class="scroll-container">
		  <view v-if="filteredOutfits.length > 0" class="outfits-grid">
		    <view v-for="(item, index) in filteredOutfits" :key="index" class="outfit-card">
				<view class="thumbnail">
					<image :src="item.thumbnail" class="outfit-icon" mode="aspectFit"/>
				</view>		      
		      <view class="outfit-info">
		        <view class="name">{{ item.name }}</view>
		        <view class="time">{{ item.time?item.time: getTime}}</view>
		      </view>
		    </view>
		  </view>
		  <view v-else class="empty">
		    <image src="/static/empty.png" class="emptyIcon"></image>
		    <text class="empty-state-text">暂无搭配...</text>
		  </view>
		</scroll-view>



		<!-- 右下角浮动按钮 -->
		<!-- <view class="floating-btn" @click="goAddOutfit" :style="{ background: '#8A6FDF' }">
			<image class="floating-btn-image" src="/static/plus-l.png" mode="aspectFit"></image>
		</view> -->
	</view>
</template>

<script>
	import {themes} from '@/components/theme.js'
	export default {
		data() {
			return {
				outfits: [{
						icon: 'https://cdn.example.com/outfit1.jpg',
						name: '夏日通勤',
						scene: '上班',
						remark: '轻便舒适，适合夏天穿搭'
					},
					{
						icon: 'https://cdn.example.com/outfit2.jpg',
						name: '运动套装',
						scene: '健身房',
						remark: '透气速干衣搭配运动鞋'
					}
				],
				theme: themes[0],
				themes,
				searchKeyword: '',
			};
		},
		 computed: {
		    filteredOutfits() {
		      if (!this.searchKeyword.trim()) return this.outfits;
		      const keyword = this.searchKeyword.toLowerCase();
		      return this.outfits.filter(item =>
		        item.name.toLowerCase().includes(keyword)
		      );
		    },
			getTime() {
				const date = new Date()
				return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
			}
		  },
		onShow() {
			const saved = uni.getStorageSync('theme') || this.themes[0];
			this.theme=saved;
			// 模拟数据加载
			this.outfits = uni.getStorageSync("outfits") || [];
		},
		methods: {
			goAddOutfit() {
				uni.navigateTo({
					url: '/pages/addMatching/addMatching' // 替换为你的添加页面路径
				});
			}
		}
	};
</script>

<style scoped>
	.container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f7f7f7;
	}

	/* 顶部栏 */
	.header-container {
		width: 100%;
		padding: 12px 0px;
		background-color: #fff;
		box-shadow: 0px 4px 12rpx rgba(0, 0, 0, 0.05);
		padding-top: calc(var(--status-bar-height) + 30px);	
	}
	
	.header {
		display: flex;
		align-items: center;
		/* border-bottom: 1px solid #b0b0b0; */
		padding-bottom: 15px;
	}
	
	
	.title-text {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-left: 20px;
	}
	.edit-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	.search-container {
		border-radius: 8px;
		align-items: center;
		display: flex;
		flex-direction: row;
		box-shadow: 4px 4px 12rpx rgba(0, 0, 0, 0.05);
		border: 1px solid #e3e3e3;
		background-color: #f8f8f8;
		margin: 5px 20px;
		width: 100%;
	}
	.search-input {
		padding: 8px 12px 8px 5px;
		font-size: 14px;
	}
	
	.search-btn {
		width: 20px;
		height: 20px;
		margin-left: 10px;
	}

	.scroll-container {
		flex: 1;
		padding: 16rpx;
		height: calc(100vh - 200px);
	}

	.outfits-grid {
	  display: flex;
	  flex-wrap: wrap;
	  justify-content: flex-start;
	  gap: 4%;
	}
	
	.outfit-card {
	  width: calc(46% - 20px); /* 一排2个，留空隙 */
	  background-color: #ffffff;
	  border-radius: 16rpx;
	  padding: 0px 10px;
	  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	  display: flex;
	  flex-direction: column;
	  margin-bottom: 16rpx;
	}
	.thumbnail{
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;		
	}
	
	.outfit-icon {
	  width: 100%;
	  height: 100%;
	  justify-items: center;
	  align-items: center;	  
	}
	
	.outfit-info {
	  display: flex;
	  flex-direction: column;
	  justify-content: space-between;
	  margin-top: 12rpx; 
	}
	
	.name {
	  font-size: 16px;
	  margin-bottom: 6rpx;
	}
	
	.remark,
	.time {
	  font-size: 24rpx;
	  color: #666;
	  margin-bottom: 5px;
	}

	.floating-btn {
		position: fixed;
		right: 20px;
		bottom: 40px;
		width: 50px;
		height: 50px;
		background-color: #ccd3ff;
		border-radius: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.floating-btn-image {
		width: 30px;
		height: 30px;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30px 0;
	}

	.emptyIcon {
		width: 150px;
		height: 150px;
		margin-bottom: 10px;
	}

	.empty-state-text {
		color: #b1a5df;
		font-size: 14px;
	}
</style>