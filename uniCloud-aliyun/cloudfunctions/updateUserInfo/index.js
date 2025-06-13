'use strict';
const db = uniCloud.database();
const userCollection = db.collection('users');

exports.main = async (event, context) => {
	
	const { openid, userInfo } = event; // 前端传入 code 和用户信息
	if (!openid) {
	  return { code: 400, msg: '缺少 openid 参数' };
	}
	
	if (!userInfo) {
	  return { code: 400, msg: '缺少 userInfo 参数' };
	}
	
	let userRecord = await userCollection.where({ openid }).get();
	if (userRecord.data.length > 0) {
		const userId = userRecord.data[0]._id;
		const newNickName = userInfo && userInfo.nickName ? userInfo.nickName : userRecord.data[0].nickName;
		const newAvatarUrl = userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : userRecord.data[0].avatarUrl;
		const newUpdateTime = Date.now();
		
		await userCollection.doc(userId).update({
		  nickName: newNickName,
		  avatarUrl: newAvatarUrl,
		  updateTime: newUpdateTime
		});
	}
	else{
		return { code: 400, msg: '还未登录！' };
	}
	
	//返回数据给客户端
	return {
	  code: 200,
	  msg: '成功'
	};
};
