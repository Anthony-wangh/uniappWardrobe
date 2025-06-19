'use strict';
const db = uniCloud.database();
const outfitsCollection = db.collection('outfits');

exports.main = async (event, context) => {
	const { userId, outfits } = event;

	if (!userId || !Array.isArray(outfits)) {
		return {
			code: 400,
			msg: '缺少 userId 参数或 outfits 格式错误'
		};
	}

	// 获取该用户的账单文档
	const recordRes = await outfitsCollection.where({ userId }).get();
	let recordId = '';
	let currentData = [];
	if (recordRes.affectedDocs === 0) {
		// 将本地数据与用户关联后保存到 localData 集合中
		const dataToUpload = {
			userId: userId,
			createTime: Date.now()
		};
		const addRes = await outfitsCollection.add(dataToUpload);
		recordId = addRes.id;
	}
	else{
		recordId = recordRes.data[0]._id;
		const docRes = await outfitsCollection.doc(recordId).get();
		currentData = docRes.data[0]?.data || [];
	}
	
	const now = Date.now();

	let modified = false;

	// 处理每一个账单操作
	for (const item of outfits) {
		const { type, data } = item;
		if (!type || !data) continue;

		switch (type) {
			case 'add':
				currentData.push(data);
				modified = true;
				break;

			case 'update':
				const updateIndex = currentData.findIndex(b => b.id === data.id);
				if (updateIndex !== -1) {
					currentData[updateIndex] = data;
					modified = true;
				}
				break;

			case 'delete':
				const beforeLength = currentData.length;
				// 按 _id 过滤掉
				const filtered = currentData.filter(b => b.id !== data.id);
				if (filtered.length < beforeLength) {
					currentData=filtered;
					modified = true;
				}
				break;
		}
	}

	if (modified) {
		await outfitsCollection.doc(recordId).update({
			data: currentData,
			updateTime: now
		});
	}

	return {
		code: 200,
		msg: '数据同步完成',
		data: {
			modified
		}
	};
};

