'use strict';
const db = uniCloud.database();
const reminders = db.collection('reminders');

exports.main = async (event, context) => {
  const {
    openid,
    outfitId,
    trigger_time,
    content
  } = event;

  // === 参数校验 ===
  if (!openid || typeof openid !== 'string') {
    return { code: 400, msg: 'openid 不能为空' };
  }
  if (!outfitId || outfitId === '') {
    return { code: 400, msg: '搭配id为空' };
  }
  if (typeof trigger_time !== 'number' || trigger_time <= 0) {
    return { code: 400, msg: 'trigger_time 必须为有效时间戳' };
  }

  const now = Date.now();
  if (trigger_time < now + 5 * 60 * 1000) {
    return { code: 400, msg: '提醒时间不能早于5分钟后' };
  }

  // 确保 content 是对象（避免 null/undefined）
  const safeContent = content && typeof content === 'object' ? content : {};

  try {
    const updateData = {
      outfitId: outfitId,
      trigger_time: trigger_time,
      content: safeContent
    };
	let currentData = [];
    const reminderRes = await reminders.where({ openid }).get();
	let reminderId = '';
	let message = '';
	if(reminderRes.data.length > 0){
		message = '提醒已更新';
		reminderId = reminderRes.data[0]._id;		
		const docRes = await reminders.doc(reminderId).get();
		currentData = docRes.data[0]?.data || [];
		console.log('获取已经存在的数据：',currentData);
		const updateIndex = currentData.findIndex(b => b.outfitId === outfitId);
		if (updateIndex !== -1) {
			console.log('更新旧数据：',currentData);
			currentData[updateIndex] = updateData;
		}
		else{
			message = '提醒创建成功';
			currentData.push(updateData);
		}
	}
	else{
		message = '提醒创建成功';
		const initData={
			openid,
			createTime:now
		}
		currentData.push(updateData);
		const addRes = await reminders.add(initData);
		reminderId = addRes.id;
	}
	
	
	await reminders.doc(reminderId).update({
		data: currentData,
		updateTime: now
	});


    return {
      code: 200,
      msg: message,
      data: currentData
    };
  } catch (err) {
    console.error('设置提醒失败:', err);
    return {
      code: 500,
      msg: '系统错误',
      error: err.message
    };
  }
};