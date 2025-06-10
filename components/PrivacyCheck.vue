<template>
	<view v-if="showPrivacy" :class="privacyClass">
		<view :class="contentClass">
			<view class="title">用户隐私保护指引</view>
			<view class="des">
				感谢您选择使用我们的小程序，我们非常重视您的个人信息安全和隐私保护。使用我们的产品前，请您仔细阅读“
				<text class="link" @tap="openPrivacyContract">{{privacyContractName}} </text>”，
				如您同意此隐私保护指引,请点击同意按钮,开始使用此小程序,我们将尽全力保护您的个人信息及合法权益，感谢您的信任！<br />
			</view>
			<view class="btns">
				
				<button id="agree-btn" class="item agree" open-type="agreePrivacyAuthorization"
					@agreeprivacyauthorization="handleAgreePrivacyAuthorization">同意并继续</button>
				<text class="item reject" @tap="exitMiniProgram">拒绝并退出</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isRead: false,
				showPrivacy: false,
				privacyContractName: '',
				resolvePrivacyAuthorization: null,
			};
		},
		props: {
			position: {
				type: String,
				default: 'center'
			}
		},
		computed: {
			privacyClass() {
				return this.position === 'bottom' ? 'privacy privacy-bottom' : 'privacy';
			},
			contentClass() {
				return this.position === 'bottom' ? 'content content-bottom' : 'content';
			}
		},
		mounted() {
			this.checkPrivacy();
		},

		methods: {
			checkPrivacy(){
				if (wx.onNeedPrivacyAuthorization) {
					wx.onNeedPrivacyAuthorization((resolve) => {
						this.resolvePrivacyAuthorization = resolve;
					});
				}
				
				if (wx.getPrivacySetting) {
					wx.getPrivacySetting({
						success: (res) => {
						 // console.log(res, 'getPrivacySetting');
							if (res.needAuthorization) {
								this.privacyContractName = res.privacyContractName;
								this.showPrivacy = true;
							}
						},
					});
				}
				
			},		
			
			openPrivacyContract() {
				wx.openPrivacyContract({
					success: () => {
						this.isRead = true;
					},
					fail: () => {
						uni.showToast({
							title: '遇到错误',
							icon: 'error',
						});
					},
				});
			},
			exitMiniProgram() {
				 wx.exitMiniProgram();
			},
			handleAgreePrivacyAuthorization() {
				this.showPrivacy = false;
			},
		},
	};
</script>

<style scoped>
	.privacy {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: rgba(0, 0, 0, .2);
		z-index: 9999999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.privacy-bottom {
		align-items: flex-end;
	}

	.content {
		width: 632rpx;
		padding: 48rpx;
		box-sizing: border-box;
		background: #fff;
		border-radius: 16rpx;
	}

	.content-bottom {
		position: absolute;
		bottom: 0;
		width: 96%;
		padding: 36rpx;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		border-radius: 16rpx 16rpx 0 0;
	}

	.content .title {
		text-align: center;
		color: #333;
		font-weight: bold;
		font-size: 32rpx;
	}

	.content .des {
		font-size: 26rpx;
		color: #666;
		margin-top: 40rpx;
		text-align: justify;
		line-height: 1.6;
	}

	.content .des .link {
		color: #1d82c1;
		text-decoration: underline;
	}

	.btns {
	  margin-top: 48rpx;
	  margin-bottom: 12rpx;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	}
	
	.btns .item {
	  width: 320rpx;
	  height: 72rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  box-sizing: border-box;
	  border-radius: 5px;
	}
	
	.btns .agree {
	  background: #ccd3ff;
	  color: #fff;
	  margin-bottom: 20rpx; /* 设置与下方按钮的间距 */
	  font-size: 18px;
	}
	
	.btns .reject {
	  color: #222222;
	  font-weight: 300;
	  font-size: 14px;
	}

	.privacy-bottom .btns .agree {
		width: 440rpx;

	}
</style>