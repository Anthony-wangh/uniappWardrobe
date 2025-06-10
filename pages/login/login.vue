<template>
	<view class="login-container">
		<image class="bg-image" src="/static/main/bg.png" mode="aspectFill"></image>
		
		<view class="main-body">
			<image class="center-icon" src="/static/main/icon_Center.png" mode="aspectFit"></image>
			<text class="name">我的衣橱管家</text>
			<text class="slogen">开启你的精致生活</text>
			
			<text class="login-btn" @click="loginClick">
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
				
			}
		},
		methods: {
			loginClick(){
				uni.switchTab({
					url:'/pages/main/main'
				})
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
	margin-top: 20%;
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
.bottom-icon{
	height: 20px;
	margin-bottom: 20px;
	position: fixed;
	bottom: 20px;
}


</style>
