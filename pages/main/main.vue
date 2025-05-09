<template>
  <view class="page" :style="{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }">
    <!-- 顶部轮播 -->
    <swiper class="banner-swiper" indicator-dots autoplay circular>
      <swiper-item v-for="(item, index) in banners" :key="index">
        <image class="banner-image" :src="item" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 内容区域可滚动 -->
    <scroll-view class="content" scroll-y>
      <!-- 用户信息（移入滚动区） -->
      <!-- <view class="user-info">
        <text class="mp-name" :style="{ color: theme.textColor }">我的衣橱管家</text>
      </view> -->

      <!-- 穿衣建议卡片 -->
      <view class="card">
        <view class="card-header" :style="{ background: theme.primaryColor }">
          <text class="card-title" :style="{ color: theme.textColor }">今日穿衣建议</text>
        </view>
        <view class="card-body">
          <text class="temp" >{{ weatherDetail }}</text>
          <text class="tips" >{{ weatherTips }}</text>
        </view>
      </view>

      <!-- slogan -->
      <view class="slogan-wrapper">
        <view class="slogan">
          <text>让穿搭变得简单</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>



<script>
	import {
		themes
	} from '@/components/theme.js'
	export default {

		data() {
			return {
				nickName: '帅哥',
				usingDate: 99,
				weatherInfo: {},
				clothingAdvice: {},
				weatherDetail: '',
				weatherTips: '',
				weatherIcon: '',
				theme: themes[0],
				themes,
				banners: [
				      '/static/banners/banner1.jpeg',
				      '/static/banners/banner2.jpeg',
				      '/static/banners/banner3.jpeg',
					  '/static/banners/banner4.jpeg'
				    ],
			};
		},
		onShow() {
			const saved = uni.getStorageSync('theme') || this.themes[0];
			this.theme = saved;
			this.getWeather();
		},
		methods: {
			isToday(dateStr) {
				const [y, m, d] = dateStr.split('-').map(Number);
				const target = new Date(y, m - 1, d);
				const today = new Date();
				return target.getFullYear() === today.getFullYear() &&
					target.getMonth() === today.getMonth() &&
					target.getDate() === today.getDate();
			},
			async getWeather() {
				const cache = uni.getStorageSync('weatherInfo');
				if (cache && this.isToday(cache.fxDate)) {
					this.weatherInfo = cache;
					this.updateWeather(cache);
					return;
				}
				uni.getLocation({
					type: 'wgs84',
					success: res => {
						const loc = `${res.longitude},${res.latitude}`;
						wx.request({
							url: 'https://nd3tefcedt.re.qweatherapi.com/v7/weather/3d',
							data: {
								location: loc,
								key: '38c34a465f6f4afa9e15de9954fc542c'
							},
							success: ({
								data
							}) => {
								const today = data.daily[0];
								uni.setStorageSync('weatherInfo', today);
								this.weatherInfo = today;
								this.updateWeather(today);
							},
							fail: err => console.error('获取天气失败:', err)
						});
					},
					fail: err => console.error('获取位置失败:', err)
				});
			},
			updateWeather(w) {
				const tempText = `${w.textDay}  ${w.tempMin}℃ ~ ${w.tempMax}℃`;
				const windText = `${w.windDirDay} ${w.windScaleDay}级 紫外线: ${w.uvIndex}`;
				this.weatherDetail = `${tempText}\n${windText}`;
				this.weatherIcon = `/static/weather_icons/${w.textDay}.png`;
				this.clothingAdvice = this.getClothingAdvice(w);
				this.weatherTips = this.clothingAdvice.summary;
			},
			getClothingAdvice(weatherData) {
				const tMax = parseInt(weatherData.tempMax),
					tMin = parseInt(weatherData.tempMin),
					avg = (tMax + tMin) / 2,
					diff = tMax - tMin;
				const levelMap = [{
						max: -10,
						level: 'extremeCold',
						name: '极寒'
					},
					{
						max: 0,
						level: 'severeCold',
						name: '严寒'
					},
					{
						max: 10,
						level: 'cold',
						name: '寒冷'
					},
					{
						max: 16,
						level: 'chilly',
						name: '微寒'
					},
					{
						max: 22,
						level: 'cool',
						name: '凉爽'
					},
					{
						max: 28,
						level: 'comfortable',
						name: '舒适'
					},
					{
						max: 32,
						level: 'warm',
						name: '炎热'
					},
					{
						max: Infinity,
						level: 'hot',
						name: '酷热'
					}
				];
				const lvl = levelMap.find(l => avg <= l.max);
				const rec = {
					level: lvl.name,
					upper: [],
					lower: [],
					accessories: [],
					tips: [],
					specialNotes: []
				};
				switch (lvl.level) {
					case 'extremeCold':
						rec.upper = ['加厚羽绒服', '高领羊毛衫'];
						rec.lower = ['加绒棉裤'];
						rec.accessories = ['毛线帽', '围巾'];
						rec.tips.push('注意保暖');
						break;
					case 'severeCold':
						rec.upper = ['长款羽绒服', '毛衣+大衣'];
						rec.lower = ['保暖打底裤'];
						rec.accessories = ['针织帽'];
						break;
					case 'cold':
						rec.upper = ['短款羽绒服', '厚卫衣'];
						rec.lower = ['加绒牛仔裤'];
						rec.accessories = ['薄围巾'];
						break;
					case 'chilly':
						rec.upper = ['风衣', '薄毛衣'];
						rec.lower = ['休闲裤'];
						rec.accessories = ['便携外套'];
						break;
					case 'cool':
						rec.upper = ['长袖衬衫', '薄外套'];
						rec.lower = ['薄款牛仔裤'];
						rec.accessories = ['丝巾'];
						rec.tips.push('适合叠穿');
						break;
					case 'comfortable':
						rec.upper = ['短袖T恤', 'POLO衫'];
						rec.lower = ['九分裤'];
						rec.accessories = ['防晒衣'];
						break;
					case 'warm':
						rec.upper = ['透气短袖', '雪纺上衣'];
						rec.lower = ['短裤'];
						rec.accessories = ['遮阳帽'];
						rec.tips.push('选透气面料');
						break;
					case 'hot':
						rec.upper = ['无袖上衣', '真丝衬衫'];
						rec.lower = ['凉感裙装'];
						rec.accessories = ['防晒伞'];
						rec.tips.push('避免正午外出');
						break;
				}
				if (weatherData.textDay.includes('雨')) {
					rec.accessories.push('雨伞');
					if (parseInt(weatherData.windScaleDay) > 3) rec.specialNotes.push('风雨较大，穿防滑鞋');
				}
				if (parseInt(weatherData.windScaleDay) >= 4) {
					rec.specialNotes.push('注意防风');
				}
				if (diff > 8) {
					rec.specialNotes.push(`昼夜温差${diff}℃，建议洋葱式穿搭`);
				}
				const parts = [];
				if (rec.upper.length) parts.push(`- 上衣：${rec.upper.join(' / ')}`);
				if (rec.lower.length) parts.push(`- 下装：${rec.lower.join(' / ')}`);
				if (rec.accessories.length) parts.push(`- 配饰：${rec.accessories.join('、')}`);
				if (rec.specialNotes.length) parts.push(`- 注意：${rec.specialNotes.join('；')}`);
				if (rec.tips.length) parts.push(`- 小贴士：${rec.tips.join('；')}`);
				rec.summary = `天气${rec.level}\n${parts.join('\n')}`;
				return rec;
			}
		}
	};
</script>

<style scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100vw;
	}

	.hero {
		width: 100%;
		height: 150px;
		padding-top: calc(var(--status-bar-height) + 24px);
		display: flex;
		justify-content: center;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		color: #fff;
	}

	.mp-name {
		font-size: 22px;
		font-weight: bold;
	}

	.greeting {
		font-size: 15px;
		margin-top: 30px;
	}

	.date {
		font-size: 13px;
		margin-top: 4px;
	}

	/* 内容区域卡片容器 */
	.content {
		flex: 1;
		background: #f9f9f9;
		padding: 10px 0 40px 0;
	}

	/* 卡片基础样式 */
	.card {
		border-radius: 5px;
		margin: 5px 10px;
		background: rgba(255, 255, 255, 0.2);
		/* border : 1px solid #9f9f9f; */
		box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.05);
		padding: 10px 0;
	}

	/* 卡片内容 */
	.card-header {
		display: flex;
		padding: 10px 0;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.card-title {
		font-size: 18px;
		color: #0d0d0d;
		margin: 5px 12px;
	}

	.weather-icon {
		width: 32px;
		height: 32px;
	}

	.card-body {
		line-height: 1.6;
		display: flex;
		flex-direction: column;
		margin: 12px;
	}

	.temp {
		font-size: 15px;
		color: #0d0d0d;
		margin-bottom: 6px;
	}

	.tips {
		font-size: 13px;
		color: #323232;
	}

	/* slogan 区域 */
	.slogan-wrapper {
		position: absolute;
		bottom: 20px;
		width: 100%;
		margin-top: 24px;
		/* background: #f9f9f9; */
		/* border-radius: 12px; */
		padding: 12px 0;
	}

	.slogan {
		display: flex;
		justify-content: center;
	}

	.slogan text {
		font-size: 14px;
		color: #1f1f1f;
	}
	
	.banner-swiper {
	  width: 100vw;
	  height: calc(100vw * 0.67);
	  overflow: hidden;
	}
	
	.banner-image {
	  width: 100%;
	  height: 100%;
	}
	
	.scroll-view {
	  flex: 1;
	  background: #fff;
	  border-top-left-radius: 24px;
	  border-top-right-radius: 24px;
	  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
	}
	
	.user-info {
	  padding: 20px 0 0;
	  text-align: center;
	}

</style>