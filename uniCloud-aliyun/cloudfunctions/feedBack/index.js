'use strict';
const db = uniCloud.database();
const feedBackCollection = db.collection('feedBacks');
exports.main = async (event, context) => {
	const { feedBack } = event; 
	if(!feedBack){
		return { code:400,msg:'请检查参数！'};
	}
	
	const addRes = await feedBackCollection.add({
	  userId: feedBack && feedBack.userId? feedBack.userId : '',
	  type: feedBack && feedBack.type ? feedBack.type : '',
	  description: feedBack && feedBack.description ? feedBack.description : '',
	  contact: feedBack && feedBack.contact ? feedBack.contact : '',
	  createTime: formatDateToYMDHM()
	});
	
	return {
	  code: 200,
	  msg: '上传成功'
	};
};

function formatDateToYMDHM() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

