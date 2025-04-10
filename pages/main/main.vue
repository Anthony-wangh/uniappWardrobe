<template>
	<view class="container">
		<!-- 头部信息（名称，昵称，头像，使用时间等） -->
		<view class="header-container">
			<text class="mp-name-text">我的衣橱管家</text>
			<text class="nickName-text">欢迎你，{{nickName}}</text>
			<text class="usingDate-text">今天是小管家陪你度过的第{{usingDate}}天</text>
		</view>


		<view class="enter-container">
			<view class="module-enter" @click="clickWardrobe">
				<image class="wardrobe-icon" src="/static/tabBarIcons/wardrode-select.png"></image>
				<text class="wardrobe-name">我的衣橱</text>
			</view>
			<view class="module-enter" @click="clickSuit">
				<image class="suit-icon" src="/static/tabBarIcons/matching-select.png"></image>
				<text class="suit-name">我的搭配</text>
			</view>
		</view>


		<view class="weather-container">
			<view class="weather-tip">
				<text class="tips-title">今日穿衣建议</text>
				<text class="tempreture-text">{{weatherDetail}}</text>
				<text class="tips-text">{{weatherTips}}</text>
			</view>

		</view>

	</view>
	
	<PrivacyCheck></PrivacyCheck>
</template>

<script>
	import PrivacyCheck from '../../components/PrivacyCheck.vue';
	export default {
		components: {
			PrivacyCheck
		},
		data() {
			return {
				nickName: '帅哥',
				usingDate: 99,
				weatherDetail: '',
				weatherTips: '',

				weatherInfo: {},
				clothingAdvice: {}

			}
		},

		onLoad() {
			this.getWeather();
		},
		methods: {
			isToday(dateStr) {
				const [y, m, d] = dateStr.split('-').map(Number)
				const target = new Date(y, m - 1, d)
				const today = new Date()
				return target.getFullYear() === today.getFullYear() &&
					target.getMonth() === today.getMonth() &&
					target.getDate() === today.getDate()
			},
			async getWeather() {

				const weather = uni.getStorageSync('weatherInfo');
				if (weather) {
					if (this.isToday(weather.fxDate)) {
						this.weatherInfo = weather;
						this.updateWeather(weather);
						return;
					}
				}

				uni.getLocation({
					type: 'wgs84',
					success: (res) => {
						const latitude = res.latitude;
						const longitude = res.longitude;
						const location = `${longitude},${latitude}`;

						wx.request({
							url: 'https://nd3tefcedt.re.qweatherapi.com/v7/weather/3d',
							data: {
								location: location,
								key: '38c34a465f6f4afa9e15de9954fc542c'
							},
							success: (res) => {
								const data = res.data.daily[0];
								uni.setStorageSync('weatherInfo', data);
								this.weatherInfo = data;
								this.updateWeather(data);
								console.log(data);
							},
							fail: (err) => {
								console.error('获取天气失败:', err);
							}
						});
					},
					fail: (err) => {
						console.error('获取位置信息失败', err);
					}
				});
			},

			updateWeather(weather) {

				const tempreture = weather.textDay + '  ' + weather.tempMin + '℃ ~ ' + weather.tempMax + '℃';
				const wind = `${weather.windDirDay}  ${weather.windScaleDay}级  紫外线等级: ${weather.uvIndex}`;//weather.windDirDay + ' ' + weather.windScaleDay + '级' + `$紫外线{weather.uvIndex}`;

				this.weatherDetail=`${tempreture}\n${wind}`;

				// 获取穿衣建议
				this.clothingAdvice = this.getClothingAdvice(weather);
				this.weatherTips = this.clothingAdvice.summary;
			},
			clickWardrobe() {
				uni.navigateTo({
					url: '/pages/wardrobe/wardrobe'
				})
			},
			clickSuit() {
				uni.navigateTo({
					url: '/pages/matching/matching'
				})
			},

			// 在Vue组件的methods中添加以下方法
			getClothingAdvice(weatherData) {
				const tempMax = parseInt(weatherData.tempMax) || 0;
				const tempMin = parseInt(weatherData.tempMin) || 0;
				const avgTemp = (tempMax + tempMin) / 2;
				const tempDiff = tempMax - tempMin; // 昼夜温差

				// 1. 温度分级配置
				const tempLevel = [{
						max: -10,
						level: "extremeCold",
						name: "极寒"
					},
					{
						max: 0,
						level: "severeCold",
						name: "严寒"
					},
					{
						max: 10,
						level: "cold",
						name: "寒冷"
					},
					{
						max: 16,
						level: "chilly",
						name: "微寒"
					},
					{
						max: 22,
						level: "cool",
						name: "凉爽"
					},
					{
						max: 28,
						level: "comfortable",
						name: "舒适"
					},
					{
						max: 32,
						level: "warm",
						name: "炎热"
					},
					{
						max: Infinity,
						level: "hot",
						name: "酷热"
					}
				].find(l => avgTemp <= l.max);

				// 2. 初始化推荐对象
				let recommendation = {
					level: tempLevel.name,
					upper: [],
					lower: [],
					accessories: [],
					tips: [],
					specialNotes: []
				};

				// 3. 完整温度区间建议
				switch (tempLevel.level) {
					// 极寒（≤-10℃）
					case "extremeCold":
						recommendation.upper = ["加厚羽绒服", "防风冲锋衣", "高领羊毛衫", "保暖内衣"];
						recommendation.lower = ["加绒加厚棉裤", "保暖秋裤", "羊毛裤"];
						recommendation.accessories = ["毛线帽", "围巾", "加厚手套", "雪地靴"];
						recommendation.tips.push("避免皮肤直接暴露在空气中");
						break;

						// 严寒（-10℃~0℃）
					case "severeCold":
						recommendation.upper = ["长款羽绒服", "毛衣+大衣", "抓绒内搭"];
						recommendation.lower = ["加厚毛呢裤", "保暖打底裤"];
						recommendation.accessories = ["针织帽", "围巾", "保暖手套"];
						break;

						// 寒冷（0℃~10℃）
					case "cold":
						recommendation.upper = ["短款羽绒服", "羊毛大衣", "厚卫衣"];
						recommendation.lower = ["加绒牛仔裤", "灯芯绒裤子"];
						recommendation.accessories = ["薄围巾", "耳罩"];
						recommendation.tips.push("注意手脚保暖");
						break;

						// 微寒（10℃~16℃）
					case "chilly":
						recommendation.upper = ["风衣", "针织开衫", "薄毛衣"];
						recommendation.lower = ["普通牛仔裤", "休闲裤"];
						recommendation.accessories = ["薄外套备用"];
						break;

						// 凉爽（16℃~22℃）
					case "cool":
						recommendation.upper = ["长袖衬衫", "卫衣", "薄外套"];
						recommendation.lower = ["卡其裤", "薄款牛仔裤"];
						recommendation.accessories = ["丝巾装饰"];
						recommendation.tips.push("适合叠穿搭配");
						break;

						// 舒适（22℃~28℃）
					case "comfortable":
						recommendation.upper = ["短袖T恤", "POLO衫", "薄衬衫"];
						recommendation.lower = ["九分裤", "短裙+打底袜"];
						recommendation.accessories = ["防晒衣备用"];
						break;

						// 炎热（28℃~32℃）
					case "warm":
						recommendation.upper = ["透气短袖", "背心", "雪纺上衣"];
						recommendation.lower = ["短裤", "薄款连衣裙"];
						recommendation.accessories = ["遮阳帽", "太阳镜"];
						recommendation.tips.push("选择透气速干面料");
						break;

						// 酷热（≥32℃）
					case "hot":
						recommendation.upper = ["吊带衫", "无袖上衣", "真丝衬衫"];
						recommendation.lower = ["超短裤", "凉感面料裙装"];
						recommendation.accessories = ["UV防晒伞", "冰袖"];
						recommendation.tips.push("尽量避免正午外出");
						break;
				}

				// 4. 天气特殊处理
				this.applyWeatherEffects(recommendation, weatherData);

				// 5. 温差处理（昼夜温差＞8℃时）
				if (tempDiff > 8) {
					recommendation.specialNotes.push(`昼夜温差大（${tempDiff}℃），建议采用洋葱式穿衣法`);
					recommendation.accessories.push("便携外套");
				}

				// 6. 生成最终建议
				return {
					...recommendation,
					summary: this.generateAdviceSummary(recommendation, weatherData)
				};
			},

			// 天气影响处理
			applyWeatherEffects(recommendation, weather) {
				// 雨天处理
				if (weather.textDay.includes("雨")) {
					recommendation.accessories.push("雨伞");
					recommendation.upper.unshift("防水外套"); // 优先显示

					if (parseInt(weather.windScaleDay) > 3) {
						recommendation.specialNotes.push("风雨较大，建议穿防滑鞋");
					}
				}

				// 大风处理
				if (parseInt(weather.windScaleDay) >= 4) {
					recommendation.upper = recommendation.upper.map(item =>
						item.includes("外套") ? `防风${item}` : item
					);
					recommendation.accessories.push("防风眼镜");
				}

				// 晴天处理
				if (weather.textDay.includes("晴")) {
					recommendation.accessories.push("防晒霜");
					if (parseInt(weather.tempMax) > 25) {
						recommendation.tips.push("建议选择浅色系衣物");
					}
				}
			},

			// 生成自然语言建议
			generateAdviceSummary(recommendation, weather) {
				const parts = [];
				const tempRange = `${weather.tempMin}~${weather.tempMax}℃`;

				// 1. 核心建议
				if (recommendation.upper.length) {
					parts.push(`- 上衣：${recommendation.upper.join(" / ")}`);
				}
				if (recommendation.lower.length) {
					parts.push(`- 下装：${recommendation.lower.join(" / ")}`);
				}

				// 2. 配饰建议
				if (recommendation.accessories.length) {
					parts.push(`-️ 配饰：${recommendation.accessories.join("、")}`);
				}

				// 3. 特殊提示
				if (recommendation.specialNotes.length) {
					parts.push(`- 注意：${recommendation.specialNotes.join("；")}`);
				}

				// 4. 小贴士
				if (recommendation.tips.length) {
					parts.push(`- 小贴士：${recommendation.tips.join("；")}`);
				}
				return `天气${recommendation.level}\n${parts.join("\n")}`;
			}
		}
	}
</script>

<style scoped>
	.container {
		background: linear-gradient(5deg, #fffccc, #ccd3ff);
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;

	}

	/*头部卡片（用户信息）*/
	.header-container {
		display: flex;
		flex-direction: column;
	}

	.mp-name-text {
		color: azure;
		font-size: 25px;
		font-weight: bold;
		padding: 5px 25px;
	}

	.nickName-text {
		color: #fffccc;
		font-size: 20px;
		padding: 5px 25px;
	}

	.usingDate-text {
		color: azure;
		font-size: 16px;
		padding: 0px 25px;
	}

	/*天气卡片*/
	.weather-container {
		position: absolute;
		bottom: 0;
		padding: 10px 0;
		width: calc(100vw - 60px);
		/* 让天气模块适应屏幕 */
		display: flex;
		flex-direction: column;
		border: none;

		margin: 0px 30px;
	}
	.tips-title {
		font-size: 20px;
		color: #3d3d3d;
		margin: 10px 20px;
		font-weight: bold;
		padding-bottom: 5px;
		border-bottom: 1px solid #e0e0e0;
	}

	.weather-tip {
		display: flex;
		flex-direction: column;
		padding: 5px;
		border-radius: 10px;
		background-color: #fff;
		/* box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); */
		margin-top: 10px;
	}

	.tempreture-text {
		color: #3d3d3d;
		font-size: 16px;
		margin: 0px 20px;
	}

	
	.tips-text {
		color: #797b86;
		font-size: 15px;
		margin: 10px 20px;
		word-wrap: break-word;
		/* 让长文本自动换行 */
		white-space: normal;
		/* 允许换行 */
		text-align: left;
		/* 让文本居中 */
	}

	/*衣橱和搭配入口*/
	.enter-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;

		justify-items: center;
		margin: 30px 30px;
	}

	.module-enter {
		border-radius: 5px;
		background-color: #f0f2ff;
		width: 45%;
		display: flex;
		flex-direction: column;
		justify-items: center;
		align-items: center;
		border: none;
		box-shadow: 2px 4px 4px rgba(0, 0, 0, 0.1);
	}

	.wardrobe-icon {
		width: 50px;
		height: 50px;
		margin-top: 20px;
	}

	.wardrobe-name {
		color: #707070;
		font-size: 15px;
		word-wrap: break-word;
		/* 让长文本自动换行 */
		white-space: normal;
		/* 允许换行 */
		text-align: center;
		/* 让文本居中 */
		margin-bottom: 20px;
	}


	.suit-icon {
		width: 50px;
		height: 50px;
		margin-top: 20px;
	}

	.suit-name {
		color: #707070;
		font-size: 15px;
		margin-bottom: 20px;
		word-wrap: break-word;
		/* 让长文本自动换行 */
		white-space: normal;
		/* 允许换行 */
		text-align: center;
	}
	
</style>