import { request  } from "@/utils/axios";  

export const getTTS = (params) => {
    // https://crm-inner.bookan.com.cn:52501/xunfeiTTS?text=今天的天气怎么样
    return request("xunfeiTTS", params, 'get', { noToken: true , host: 'crm'});
}
