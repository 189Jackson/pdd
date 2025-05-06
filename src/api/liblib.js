import { request  } from "@/utils/axios";  

export const liblibModelUuid = {
    "sdxl_base": {
        uuid: "fa5e552314b59c4e4e0117e6f0b2d3b5",
        url: "https://www.liblib.art/modelinfo/77a9ca05a2c7c93ceb05f4dceae9ed97?from=search&versionUuid=fa5e552314b59c4e4e0117e6f0b2d3b5",
        name: "SDXL基础模型",
    }
}

//  获取模型信息
export const getModelVersion = (params) => {
    return request('/liblib/getModelVersion', params, 'post', {noToken: true, host: 'liblib'});
}

// 文生图
export const text2img = (params) => {
    return request('/liblib/text2img', params, 'post', {noToken: true, host: 'liblib'});
}

// 查看进度条
export const getStatus = (params) => {
    return request('/liblib/getStatus', params, 'post', {noToken: true, host: 'liblib'});
}