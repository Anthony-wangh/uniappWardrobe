<!-- pages/outfitDetail/outfitDetail.vue -->
<template>
  <view class="container">
    
    <!-- 主标题 -->
    <view class="title">OOTD</view>

    <!-- 副标题 -->
    <view class="subtitle">这份搭配，专属于今天的你✨</view>

    <!-- 搭配图片 -->
    <image
      :src="outfit.thumbnail"
      class="outfit-image"
      mode="aspectFit"
    />

    <!-- 搭配名称 -->
    <view class="outfit-name">{{ outfit.name }}</view>

    <!-- 适宜场景 -->
    <view class="scene">
      <text class="scene-icon">🌿</text>
      <text class="scene-text">适合：{{ outfit.category }}</text>
    </view>
	
	<!-- 关闭按钮 -->
	<view class="close-btn" @click="onClose">
	  关闭
	</view>
	
  </view>
</template>

<script>
export default {
  data() {
    return {
      outfit: {
		  name:'',
		  category:'',
		  thumbnail:''
	  }
    };
  },
  onLoad(options) {
    // 通常通过 outfitId 从云数据库获取详情
    const { outfitId } = options;
    if (outfitId) {
      this.loadOutfitDetail(outfitId);
    }
  },
  methods: {
	loadOutfitDetail(outfitId) {
	  const outfits = uni.getStorageSync("outfits") || [];
	  const matching = outfits.find(c=>c.id === outfitId);
	  if(matching){
		  this.outfit = matching;
	  }
	  else{
		  uni.showToast({
		  	title:'加载搭配失败！',
			icon:'error'
		  })
		  setTimeout(()=>{
			  uni.navigateBack();			  
		  },300)		  
	  }	  
	  
    },
    onClose() {
      // 返回上一页 或 退出
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果没有上一页（如从订阅消息直接进入），则跳转首页
          uni.reLaunch({
            url: '/pages/main/main'
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 60rpx 40rpx 40rpx;
  background-color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
}

/* 关闭按钮 */
.close-btn {
  /* background-color: #8A6FDF; */
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 34rpx;
  color: #ffffff;
  text-align: center;
  border: #8A6FDF solid 1px;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.03);
}


/* 标题 */
.title {
  font-size: 64rpx;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-top: calc(var(--status-bar-height) + 20px) ;
}

/* 副标题 */
.subtitle {
  font-size: 28rpx;
  color: #888;
  text-align: center;
  margin: 20rpx 0 60rpx;
}

/* 搭配图片 */
.outfit-image {
	
  width: calc(100vw - 60px);
  height: calc((100vw - 60px)*4/3);
  border-radius: 24rpx;
  margin: 20rpx 0;
  border: #dfdfdf solid 1px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.03);
}

/* 搭配名称 */
.outfit-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin: 30rpx 0;
}

/* 适宜场景 */
.scene {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}

.scene-icon {
  margin-right: 10rpx;
  font-size: 28rpx;
}

.scene-text {
  font-size: 28rpx;
  color: #666;
}
</style>