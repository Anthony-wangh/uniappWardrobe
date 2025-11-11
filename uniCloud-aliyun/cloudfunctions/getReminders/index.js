'use strict';
const db = uniCloud.database();
const reminders = db.collection('reminders');
exports.main = async (event, context) => {
	const {
	  openid
	} = event;
	
	if (!openid) {
	  return { code: 400, msg: '缺少 openid 参数' };
	}
	let dataRecord = await reminders.where({
		openid
	}).get();
	let resposeData = null;
	if (dataRecord.affectedDocs > 0) {
		resposeData = dataRecord.data[0];
	}
	return {
		code: 200,
		msg: 'success',
		data: resposeData
	};
};
