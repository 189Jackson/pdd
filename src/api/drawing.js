import { request  } from "@/utils/axios";  

// txtToimg sd
export const sdapiTxt2img = (params) => {
    if (process.env.NODE_ENV === 'development') { // 开发环境
        return request("/sd", params, 'post', {noToken: true});
    }
    return request("/sdapi/v1/txt2img", params, 'post', {noToken: true, isSourceData: true});
}

// txtToimg sd progress
export const sdapiProgress = (params) => {
    if (process.env.NODE_ENV === 'development') { // 开发环境
        return request("/progress", params, 'get', {noToken: true});
    }
    return request("/sdapi/v1/progress", params, 'get', {noToken: true, isSourceData: true});
}

// 大模型接口,生成token的接口
export const modelChatBuildToken = (params) => {
    return request("/api/device/buildToken", params, 'get', { noToken: true , host: 'chat'});
}

// 大模型接口(非流式)
export const modelChat = (params, headers) => {
    return request("/api/device/build_verse", params, 'get', { noToken: true , host: 'chat', headers });
}

// 生成二维码
export const QrcodeGenerate = (params) => {
    return request("/common/aidraw/QrcodeGenerate", params, 'get', { noToken: true , host: 'user'});
}
// 轮询登录状态,刷新二维码
export const getQrcodeStatus = (params) => {
    return request("/common/aidraw/QrcodeStatus", params, 'get', { noToken: true , host: 'user'});
}

// 微信扫码登录
export const loginQrcode= (params) => {
    return request("/common/aidraw/QrcodeLogin", params, 'get', { noToken: true , host: 'user'});
}
// 获取作品列表
export const getWorksList= (params) => {
    return request("/common/aidraw/WorksList", params, 'get', { noToken: true , host: 'user'});
}

// 保存作品
export const saveWorks= (params) => {
    return request("/common/aidraw/WorksAdd", params, 'get', { noToken: true , host: 'user'});
}

// 保存日志
export const saveLog= (params) => {
    return request("/common/aidraw/WorksLog", params, 'get', { noToken: true , host: 'user'});
}
// 删除作品
export const delWorks= (params) => {
    return request("/common/aidraw/WorksDel", params, 'get', { noToken: true , host: 'user'});
}

// 获取作品详情
export const getWorksDetail= (params) => {
    return request("/common/aidraw/WorksDetail", params, 'get', { noToken: true , host: 'user'});
}

// 获取七牛上传凭证
export const getQiniuToken= (params) => {
    return request("/qiniu/getUploadToken", params, 'get', { noToken: true , host: 'opapi'});
}

// 获取微信jsdk凭证
export const getJsSDKConfigApi= (params) => {
    return request("/tool/getWxJsapiConfig", params, 'get', { noToken: true , host: 'opapi'});
}
// 作品图片检测(image_base64)
export const checkImgBase64= (params) => {
    return request("/common/aidraw/CheckImgBase64", params, 'post', { noToken: true , host: 'user', headers: {
        'Content-Type': 'multipart/form-data'
    }});
}

// 飞屏接口
export const getFlyScreen= (params) => {
    return request("/common/aidraw/WorksShare", params, 'get', { noToken: true , host: 'user'});
}
// 获取实例信息
export const getInstanceInfo= (params) => {
    return request("/api/orgInstanceInfo", params, 'get', { noToken: true , host: 'ucapi'});
}
// 意见反馈（微信H5）
export const setFeedback= (params) => {
    return request("/common/aidraw/Feedback", params, 'post', { noToken: true , host: 'user', headers: {
        'Content-Type': 'multipart/form-data'
    }});
}

