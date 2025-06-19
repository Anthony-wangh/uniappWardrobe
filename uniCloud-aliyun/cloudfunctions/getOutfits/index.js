'use strict';
const db = uniCloud.database();
const localDataCollection = db.collection('outfits'); 
exports.main = async (event, context) => {
	const { userId } = event; // 前端传入 code 和用户信息
	if (!userId) {
	  return { code: 400, msg: '缺少 userId 参数' };
	}
	let dataRecord = await localDataCollection.where({
		userId
	}).get();
	let data = '';
	if (dataRecord.affectedDocs > 0) {
		data=dataRecord.data[0];
	}
	//返回数据给客户端
	return {
		code: 200,
		msg: '数据获取成功',
		data: data
	};
};
