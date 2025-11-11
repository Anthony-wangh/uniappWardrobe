'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { openid, outfitId } = event;

  if (!openid || typeof openid !== 'string') {
    return { code: 400, msg: '缺少有效的 openid' };
  }

  if (!outfitId || typeof outfitId !== 'string') {
    return { code: 400, msg: '缺少有效的套装 ID' };
  }

  try {
    // 1. 查询该用户的提醒文档
    const userRes = await db.collection('reminders')
      .where({ openid })
      .get();

    if (!userRes.data || userRes.data.length === 0) {
      return { code: 404, msg: '用户提醒记录不存在' };
    }

    const doc = userRes.data[0];
    const docId = doc._id;
    const currentData = Array.isArray(doc.data) ? doc.data : [];

    // 2. 检查是否存在该 outfitId 的提醒
    const targetExists = currentData.some(item => item.outfitId === outfitId);
    if (!targetExists) {
      return { code: 404, msg: '未找到该套装的提醒' };
    }

    // 3. 过滤掉要删除的项
    const newData = currentData.filter(item => item.outfitId !== outfitId);

    // 4. 更新文档
    await db.collection('reminders')
      .doc(docId)
      .update({
        data: newData,
        updateTime: Date.now()
      });

    return {
      code: 200,
      msg: '删除成功',
      data: newData
    };

  } catch (err) {
    console.error('删除提醒失败:', err);
    return { code: 500, msg: '系统错误' };
  }
};