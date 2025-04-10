'use strict';
exports.main = async (event, context) => {
	
	const { longitude, latitude } = event; // 前端传入经纬度
	if (!longitude || !latitude) {
	  return { code: 400, msg: '经纬度信息' };
	}
	const location = `${longitude},${latitude}`;
	const appKey = '38c34a465f6f4afa9e15de9954fc542c';
	
	const res = await uniCloud.httpclient.request(
	// 'https://api.qweather.com/v7/weather/now?location=101010100',
	 `https://nd3tefcedt.re.qweatherapi.com/v7/weather/3d/location=${location}key=${appKey}?lang=cn`,
	  { 
		  method: 'GET', 
		  dataType: 'json' ,
	  }
	);
	
	if (res.status !== 200) {
	  return { code: 500, msg: '请求天气失败', error: res };
	}
	
	
	
	//event为客户端上传的参数
	return { code: 200, msg: '成功', error: res.data };
	
};
