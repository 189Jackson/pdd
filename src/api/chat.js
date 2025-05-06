import { request  } from "@/utils/axios";  

// 向chatGPT发出消息
export const sendChatGPT = (params) => {
    return request("/chat/send", params, 'post');
}
