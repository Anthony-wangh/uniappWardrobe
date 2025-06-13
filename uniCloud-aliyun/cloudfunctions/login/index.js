'use strict';
const db = uniCloud.database();
const userCollection = db.collection('users');

exports.main = async (event, context) => {
  const { code, userInfo } = event; // 前端传入 code 和用户信息
  if (!code) {
    return { code: 400, msg: '缺少 code 参数' };
  }

  // 请替换成你的小程序 AppID 和 AppSecret（生产环境下请妥善保管 AppSecret）
  const appid = 'wxfb017c6610c38a07';
  const secret = '69aef00ff2f2712e3863466be9dc7664';

  // 调用微信接口使用 code 换取 openid 和 session_key
  const weixinRes = await uniCloud.httpclient.request(
    `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`,
    { method: 'GET', dataType: 'json' }
  );

  if (weixinRes.status !== 200 || !weixinRes.data.openid) {
    return { code: 500, msg: '微信登录失败', error: weixinRes.data };
  }

  const { openid } = weixinRes.data;

  // 检查数据库中是否已存在该用户
  let userRecord = await userCollection.where({ openid }).get();
  let userId = '';
  let newUserInfo = {};

  if (userRecord.data.length > 0) {
    // 用户已存在，更新昵称和头像（如传入了新数据）
	userId = userRecord.data[0]._id;
    // 重新获取最新的用户数据
    const updatedUserRecord = await userCollection.doc(userId).get();
    newUserInfo = updatedUserRecord.data[0]; 
  } else {
    // 用户不存在，创建新记录
    const addRes = await userCollection.add({
      openid,
      nickName: userInfo && userInfo.nickName ? userInfo.nickName : '',
      avatarUrl: userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : '',
      createTime: Date.now()
    });
    userId = addRes.id;

    // 直接构造新用户数据
    newUserInfo = {
      _id: userId,
      openid,
      nickName: userInfo && userInfo.nickName ? userInfo.nickName : '',
      avatarUrl: userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : '',
      createTime: Date.now()
    };
  }

  // 生成简单的 token（建议生产环境使用更安全的 JWT 方案）
  const token = Buffer.from(openid + '-' + Date.now()).toString('base64');

  return {
    code: 200,
    msg: '登录成功',
    data: { openid, token, newUserInfo }
  };
};
