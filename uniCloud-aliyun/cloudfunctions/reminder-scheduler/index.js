'use strict';
const db = uniCloud.database();

const BATCH_SIZE = 50; // 每次处理最多 50 个用户
const TEMPLATE_ID = 'MZhDJGPUMhEWedtgprs9eAB4jgBPLlz1VZm62ZIJbHE';

// 全局缓存 access_token
let cachedAccessToken = null;
let tokenExpiresAt = 0;

const APPID = 'wxfb017c6610c38a07';
const APPSECRET = '69aef00ff2f2712e3863466be9dc7664';

exports.main = async (event, context) => {
	const now = Date.now();

	try {
		// 获取最多 BATCH_SIZE 个用户文档（无法直接按 data.trigger_time 查询）
		const res = await db.collection('reminders')
			.limit(BATCH_SIZE)
			.get();

		if (!res.data || res.data.length === 0) {
			console.log('无用户提醒数据');
			return {
				success: true,
				count: 0
			};
		}

		let totalTriggered = 0;

		// 并发处理每个用户
		const userTasks = res.data.map(async (userDoc) => {
			const {
				_id,
				openid,
				data = []
			} = userDoc;
			if (!openid || !Array.isArray(data)) return 0;

			const toTrigger = []; // 待触发的提醒
			const toKeep = []; // 保留的提醒

			for (const item of data) {
				if (item.trigger_time <= now) {
					toTrigger.push(item);
				} else {
					toKeep.push(item);
				}
			}

			if (toTrigger.length === 0) return 0;

			// 并发发送消息
			const sendTasks = toTrigger.map(async (item) => {
				try {
					await sendWechatSubscribe({
						openid,
						...item
					});
					console.log(
						`✅ 已触发提醒: openid=${openid.substring(0,8)}..., outfitId=${item.outfitId}`
						);
				} catch (err) {
					console.error(`❌ 推送失败 (outfitId=${item.outfitId}):`, err.message);
					// 注意：即使失败，也从数组中移除（避免重复推送）
					// 如需重试机制，可将失败项标记状态而非删除
				}
			});

			await Promise.all(sendTasks);

			// 更新用户文档：保留未触发的提醒
			try {
				await db.collection('reminders').doc(_id).update({
					data: toKeep,
					updateTime: Date.now()
				});
			} catch (err) {
				console.error(`更新用户提醒列表失败 (openid=${openid}):`, err);
			}

			return toTrigger.length;
		});

		const results = await Promise.all(userTasks);
		totalTriggered = results.reduce((sum, n) => sum + n, 0);

		console.log(`本次调度共触发 ${totalTriggered} 条提醒`);
		return {
			success: true,
			count: totalTriggered
		};
	} catch (err) {
		console.error('调度器异常:', err);
		return {
			success: false,
			error: err.message
		};
	}
};

// 获取 access_token（带缓存）
async function getAccessToken() {
	const now = Date.now();
	if (cachedAccessToken && tokenExpiresAt > now + 60000) {
		console.log('使用缓存AccessToken');
		return cachedAccessToken;
	}

	const tokenRes = await uniCloud.httpclient.request(
		`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`, {
			dataType: 'json',
			timeout: 5000
		}
	);

	const data = tokenRes.data;
	if (data.errcode) {
		throw new Error(`获取 access_token 失败: ${data.errmsg} (code: ${data.errcode})`);
	}

	cachedAccessToken = data.access_token;
	tokenExpiresAt = now + (data.expires_in - 60) * 1000;

	console.log('获取新的AccessToken，有效期', tokenExpiresAt);
	return cachedAccessToken;
}

// 发送微信订阅消息
async function sendWechatSubscribe(reminderItem) {
	const {
		openid,
		content
	} = reminderItem;

	if (!openid) {
		console.warn('缺少 openid，跳过推送');
		return;
	}

	if (!content || typeof content !== 'object') {
		console.warn('content 无效，跳过推送');
		return;
	}

	const page = `/pages/outfitDetail/outfitDetail?outfitId=${reminderItem.outfitId}`; // 请根据实际页面调整

	try {
		const accessToken = await getAccessToken();

		const msgData = {
			touser: openid,
			template_id: TEMPLATE_ID,
			page: page,
			data: content
		};

		const msgRes = await uniCloud.httpclient.request(
			`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`, {
				method: 'POST',
				data: JSON.stringify(msgData),
				dataType: 'json',
				headers: {
					'Content-Type': 'application/json'
				},
				timeout: 5000
			}
		);

		const result = msgRes.data;
		if (result.errcode !== 0) {
			throw new Error(`${result.errmsg} (code: ${result.errcode})`);
		}
	} catch (err) {
		console.error('微信推送异常:', err.message);
		throw err;
	}
}