<template>
	<view class="home-page">
		<!-- 状态栏占位 -->
		<view class="status-safe-area"></view>

		<!-- 头部 欢迎 & 头像 -->
		<view class="header">
			<image class="avatar" :src='userInfo.avatarUrl ? userInfo.avatarUrl : "/static/avatorDefault.png"'
				mode="aspectFill" />
			<view v-if="userInfo.nickName" class="greeting">
				<text class="welcome-text">{{"欢迎回来，" + userInfo.nickName }}</text>
				<text class="subtitle">{{ '小管家已经陪伴你' + this.usageDay +'天'}}</text>
			</view>
			<view v-if="!userInfo.nickName" class="login-btn" @click="clickLogin">点击登录</view>
		</view>


		<!-- 天气卡片 -->
		<view class="weather-card">
			<view class="weather-main">
				<!-- 左侧 温度 & 图标 -->
				<view class="weather-left">
					<text class="temperature">{{ weatherDetail}}</text>
					<text class="advice">{{ windText }}</text>
				</view>
				<!-- 右侧 天气说明 & 日期 -->
				<view class="weather-right">
					<text class="weather-desc">{{ weatherTips}}</text>
					<text class="date">{{ currentDate }} {{ weekDay }}</text>
				</view>
			</view>
		</view>

		<!-- 功能入口 -->
		<view class="actions">
			<view class="action-btn" @click="upload">
				<image class="action-icon" src="/static/main/Upload.png" />
				<text class="action-text">上传衣物</text>
			</view>
			<view class="action-btn" @click="startMatch">
				<image class="action-icon" src="/static/main/Shuffle.png" />
				<text class="action-text">我的搭配</text>
			</view>
		</view>
		<!-- 推荐模块 -->
		<section class="recommendation-section">
			<h2 class="section-title">最近上传</h2>
			<view class="empty-state-text" v-if="recentlyClothes.length===0">
				还没有上传任何衣服哦，快去上传一件吧~
			</view>
			<div class="recommendation-list" v-else>
				<div v-for="(item, index) in recentlyClothes" :key="index" class="recommendation-card">
					<image :src="item.image" mode="aspectFit" class="item-icon" />
					<view class="item-info">
						<text class="item-name">{{ item.name }}</text>
						<text class="item-category">{{ item.primaryCategory }}/{{item.secondaryCategory}}</text>
						<text class="item-time">{{ formatTime(item.createTime) }}</text>
					</view>
				</div>
			</div>
		</section>



	</view>
</template>

<script>
	export default {

		data() {
			return {
				weatherInfo: {},
				clothingAdvice: {
					upper: [],
					lower: [],
					accessories: [],
					tips: [],
					specialNotes: [],
					summary: ''
				},
				weatherDetail: '',
				weatherTips: '',
				windText: '',
				weatherIcon: '',
				banners: [
					'/static/banners/banner1.png',
					'/static/banners/banner2.png',
					'/static/banners/banner3.png'
				],
				userInfo: {},
				isLoggedIn: false,
				slogan: '让穿搭变得简单',
				weatherIcon: '/static/weather_icons/theme.png',
				currentDate: '',
				weekDay: '',
				recentlyClothes: [],
				usageDay: 0 //使用时长
			};
		},
		onShow() {
			this.userInfo = uni.getStorageSync('wardrobeUserInfo') || {};
			this.usageDay = uni.getStorageSync('wardrobeUsingDates') || 1;
			const clothes = uni.getStorageSync("clothes") || [];
			if (clothes.length > 0) {
				//取最近五个上传的衣服
				this.recentlyClothes = clothes.length > 5 ? clothes.slice(-5) : clothes;
				this.recentlyClothes.sort((a, b) => {
					const timeA = a.createTime ? a.createTime : 0;
					const timeB = b.createTime ? b.createTime : 0;
					return timeB - timeA; // 时间越近越靠前
				});
			}

			this.getTime();
			this.getWeather();
		},
		onShareAppMessage() {
			return {
				title: "每天穿什么不再纠结！这个衣橱管理神器推荐给你",
				path: "pages/main/main",
				imageUrl: "https://mp-5df80302-4973-4391-bd75-89493f11fa67.cdn.bspapp.com/cloudstorage/ShareIcon.jpg"
			};
		},
		onShareTimeline() {
			return {
				title: '衣服再也不怕乱堆！这个电子衣橱帮你轻松整理～👗👕', // 自定义朋友圈分享标题		
			};
		},
		methods: {
			getTime() {
				const date = new Date()
				this.currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
				const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
				this.weekDay = days[date.getDay()]
			},
			formatTime(time) {
				const date = new Date(time);

				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const hour = date.getHours().toString().padStart(2, '0');
				const minute = date.getMinutes().toString().padStart(2, '0');

				return `${year}年${month}月${day}日 ${hour}:${minute}`;
			},
			upload() {
				if (!this.checkLogin())
					return;
				uni.navigateTo({
					url: "/pages/addClothes/addClothes"
				});
			},
			startMatch() {
				if (!this.checkLogin())
					return;
				uni.switchTab({
					url: "/pages/matching/matching"
				});
			},
			clickLogin() {
				uni.navigateTo({
					url: "/pages/login/login"
				});
			},
			checkLogin() {
				const userInfo = uni.getStorageSync('wardrobeUserInfo');
				if (userInfo) {
					return true;
				}
				uni.navigateTo({
					url: "/pages/login/login"
				});
				return false;
			},
			isToday(dateStr) {
				const [y, m, d] = dateStr.split('-').map(Number);
				const target = new Date(y, m - 1, d);
				const today = new Date();
				return target.getFullYear() === today.getFullYear() &&
					target.getMonth() === today.getMonth() &&
					target.getDate() === today.getDate();
			},
			refreshWeather() {
				this.getWeather();
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
						uni.request({
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
				const tempText = `${w.tempMin}℃ ~ ${w.tempMax}℃`;
				this.windText = `${w.windDirDay} ${w.windScaleDay}级  紫外线: ${w.uvIndex}`;
				this.weatherDetail = `${tempText} ${w.textDay}`;
				this.weatherIcon = `/static/weather_icons/${w.textDay}.png`;
				this.clothingAdvice = this.getClothingAdvice(w);
				this.weatherTips = `${this.clothingAdvice.summary}`;
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
				rec.summary = `[穿衣建议]\n${parts.join('\n')}`;
				return rec;
			}
		}
	};
</script>

<style scoped lang="scss">
	.home-page {
		display: flex;
		flex-direction: column;
		background: #F9F9F9;
		height: 100vh;
		position: relative;
	}

	.login-btn {
		font-size: 16px;
		font-weight: bold;
		padding: 8px 0px;
		color: #8A6FDF;
		text-align: start;
		margin-left: 15px;
	}

	.status-safe-area {
		height: calc(var(--status-bar-height) + 40px);
	}

	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 20px;
		padding-bottom: 10px;
	}

	.avatar {
		width: 50px;
		height: 50px;
		border-radius: 25px;
	}

	.greeting {
		margin-left: 15px;
		display: flex;
		flex-direction: column;
	}

	.welcome-text {
		font-size: 16px;
		color: #1D1D1D;
		font-weight: bold;
	}

	.subtitle {
		margin-top: 4px;
		font-size: 14px;
		color: #666666;
	}

	.weather-card {
		margin: 20px;
		padding: 15px;
		border-radius: 10px;
		background: linear-gradient(170deg, #ece2ff, #F9F9F9);
		display: flex;
		flex-direction: column;
	}

	.weather-main {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.weather-left {
		align-items: center;
		justify-content: space-between;
		display: flex;
		margin-left: 6px;
		margin-bottom: 10px;
	}

	.temperature {
		font-size: 18px;
		font-weight: bold;
		color: #333333;

	}

	.weather-icon {
		width: 40px;
		height: 40px;
		margin-top: 5px;
	}

	.weather-right {
		flex: 1;
		margin-left: 6px;
		display: flex;
		flex-direction: column;
	}

	.weather-desc {
		font-size: 14px;
		color: #333333;
	}

	.weather-tip {
		margin-top: 6px;
		font-size: 12px;
		color: #888888;
	}

	.date {
		margin-top: 8px;
		font-size: 10px;
		color: #AAAAAA;
	}

	.advice {
		margin-top: 10px;
		font-size: 14px;
		color: #444444;
	}

	.actions {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}

	.action-btn {
		width: 40%;
		border-radius: 8px;
		padding: 15px 0;
		align-items: center;
		background: linear-gradient(135deg, #8E7AFF, #C09AFF);
		display: flex;
		flex-direction: column;
		justify-items: center;
	}

	.action-icon {
		width: 40px;
		height: 40px;
	}

	.action-text {
		margin-top: 8px;
		font-size: 13px;
		color: #FFFFFF;
		font-weight: bold;
	}

	.empty-state-text {
		font-size: 12px;
		color: #8A6FDF;
		text-align: center;
		margin-top: 20px;
	}

	.recommendation-section {
		margin-top: 20px;

		.section-title {
			font-size: 16px;
			font-weight: 600;
			margin-bottom: 12px;
			margin-left: 20px;
		}

		.recommendation-list {
			display: flex;
			overflow-x: auto;
			margin: 0 20px;

			.recommendation-card {
				min-width: 150px;
				margin-right: 10px;
				// border-radius: 12px;
				// background: #f8f8f8;
				// padding: 10px;
				box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.05);
				display: flex;
				flex-direction: column;
				// align-items: center;
				// justify-items: center;
				border: #d1d1d1 solid 1px;
				border-radius: 20px;

				border-bottom-left-radius: 10px;
				border-bottom-right-radius: 10px;

				.item-icon {
					width: 150px;
					height: 150px;
					object-fit: contain;
					border-radius: 20px;
				}

				.item-info {
					margin: 10px;
					display: flex;
					flex-direction: column;

					.item-name {
						font-size: 15px;
						color: #161616;

						max-width: 100px;
						/* 限制最大宽度，可根据需要调整 */
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.item-category {
						align-self: flex-start;
						font-size: 10px;
						color: #ffffff;
						background: #8E7AFF;
						border-radius: 10px;
						padding: 3px 6px;
						text-align: center;
						margin: 3px 0;
					}

					.item-time {
						font-size: 10px;
						color: #666;
						padding: 3px 0px;
					}
				}



			}
		}
	}
</style>