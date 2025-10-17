'use strict';
const crypto = require('crypto');

exports.main = async (event, context) => {
  const aki = "123";
  const aks = "123";
  const bucket = "wardrobe-bucket";
  const region = "oss-cn-shanghai";
  const host = `https://${bucket}.${region}.aliyuncs.com`;

  // 过期时间 30 秒后
  const expiration = new Date(Date.now() + 30 * 1000).toISOString();

  const policyText = {
    expiration,
    conditions: [
      ["content-length-range", 0, 1048576000] // 允许最大 1GB
    ]
  };

  const policyBase64 = Buffer.from(JSON.stringify(policyText)).toString('base64');
  const signature = crypto.createHmac('sha1', aks)
                          .update(policyBase64)
                          .digest('base64');

  return {
    aki,
    host,
    policy: policyBase64,
    signature,
    aks, 
  };
};
