<template>
	<view class="login-container">
		<image class="bg-image" src="/static/main/bg.png" mode="aspectFill"></image>
		
		<view class="main-body">
			<image class="center-icon" :src="iconUrl" mode="aspectFill"></image>
			<text class="name">我的衣橱管家</text>
			<text class="slogen">开启你的精致生活</text>
			
			<text :class="['login-btn','']" @click="loginClick">
				一键登录
			</text>		
			<image class="bottom-icon" src="/static/main/icon.png" mode="aspectFit"></image>
		</view>			
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isLoggedin:false,
				iconUrl:'https://mp-5df80302-4973-4391-bd75-89493f11fa67.cdn.bspapp.com/cloudstorage/MainIcon.png'
			}
		},
		onShow() {
			const token = uni.getStorageSync('wardrobeToken') || '';
			this.isLoggedin = token !=='';
		},
		onShareAppMessage() {
		    return {
		      title: "每天穿什么不再纠结！这个衣橱管理神器推荐给你",
		      path: "pages/main/main",
		      imageUrl: "https://mp-5df80302-4973-4391-bd75-89493f11fa67.cdn.bspapp.com/cloudstorage/MainIcon.png"
		    };
		  },
		  onShareTimeline() {
		  	return {
		  		title: '衣服再也不怕乱堆！这个电子衣橱帮你轻松整理～👗👕', // 自定义朋友圈分享标题		
		  	};
		  },
		methods: {
			loginClick(){
				if(this.isLoggedin){
					uni.switchTab({
						url:'/pages/main/main'
					})
				}
				else{
					this.handleLogin();
				}
			},
			handleLogin() {
				uni.showLoading({
					title: '登录中...',
					mask: true // 防止触摸穿透
				});
			
				// 1. 直接调用 uni.getUserProfile，确保由用户点击直接触发
				uni.getUserProfile({
					desc: '获取您的昵称和头像用于展示', // 此描述必填
					success: (userProfileRes) => {
			
						// 2. 在获取用户信息成功后，再调用 uni.login 获取 code
						uni.login({
							provider: 'weixin',
							success: (loginRes) => {
								if (!loginRes.code) {
									// 隐藏加载提示框
									uni.hideLoading();
									uni.showToast({
										title: '获取 code 失败',
										icon: 'none'
									});
									return;
								}
								// 3. 调用云函数，将 code 和用户信息一起传递过去
								uniCloud.callFunction({
									name: 'login',
									data: {
										code: loginRes.code,
										userInfo: userProfileRes.userInfo
									}
								}).then((result) => {
									
									if (result.result.code === 200) {
										
										//登陆状态，用作保持登录
										uni.setStorageSync('wardrobeToken', result.result.data.token);
										//用作修改用户信息
										uni.setStorageSync('wardrobeOpenid', result.result.data.openid);
										//通用用户信息
										uni.setStorageSync('wardrobeUserInfo', result.result.data.newUserInfo);	
										this.isLoggedin = true;
										const userInfo = result.result.data.newUserInfo;
										const usingDates = userInfo ? (Math.floor((Date
											.now() - userInfo.createTime
										) / (1000 * 60 * 60 * 24))) : 0;
										//使用天数
										uni.setStorageSync('wardrobeUsingDates', usingDates);
										uni.showToast({
											title: '登录成功',
											icon: 'success'
										});
										
										this.requestClothesData(userInfo._id);
																	
										
										setTimeout(()=>{
											uni.hideLoading();
											uni.navigateBack();
										},1000);
			
									} else {
										uni.hideLoading();
										uni.showToast({
											title: result.result.msg,
											icon: 'none'
										});
									}
								}).catch((err) => {
									uni.hideLoading();
									uni.showToast({
										title: '调用云函数失败',
										icon: 'none'
									});
									console.error('云函数错误：', err);
								});
							},
							fail: (err) => {
								uni.hideLoading();
								uni.showToast({
									title: '登录失败',
									icon: 'none'
								});
								console.error('uni.login 错误：', err);
							}
						});
					},
					fail: (err) => {
						uni.hideLoading();
						uni.showToast({
							title: '获取用户信息失败',
							icon: 'none'
						});
						console.error('getUserProfile 错误：', err);
					}
				});
			},
			
			requestClothesData(userId){
				uniCloud.callFunction({
					name: 'getClothes',
					data: {
						userId: userId,
					}
				}).then((result) => {
					if (result.result.code !== 200) {
						console.log("获取数据失败！" + result.result.msg);
					} else {
						// 更新本地存储
						console.log('clothesData',result.result.data);
						uni.setStorageSync('clothes', result.result.data.clothes.data);
						uni.setStorageSync('outfits', result.result.data.outfits.data);
					}
				}).catch((err) => {
					console.error('云函数错误：', err);
				});
			}
			
		}
	}
</script>

<style scoped>

.login-container{
	height: 100vh;
	width: 100vw;
	position: relative;
}
.bg-image{
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}
.main-body{
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	/* justify-content: space-between; */
	justify-items: center;
	align-items: center;
}

.center-icon{
	width: 60vw;
	height: 60vw;
	margin-top: 20%;
	border: #fff solid 10px;
	border-radius: 50%;
	box-shadow: 4px 4px 12rpx rgba(0, 0, 0, 0.05);
}

.name{
	color: #C09AFF;
	font-size: 40px;
	font-weight: bold;
	margin-top: 30px;
}

.slogen{
	color: #353535;
	font-size: 20px;
	margin-top: 15px;
}

.login-btn{
	width: 70%;
	color: #fff;
	background-color: #C09AFF;
	border-radius: 20px;
	font-size: 18px;
	font-weight: bold;
	padding: 10px 00px;
	text-align: center;
	margin-top: 200px;
}

.login-btn.isLoggedin{
	width: 50%;
	padding: 20px 00px;
	color: #fff;
	background-color: #ec9b0d;
	font-size: 22px;
}

.bottom-icon{
	height: 20px;
	margin-bottom: 20px;
	position: fixed;
	bottom: 20px;
}


</style>
