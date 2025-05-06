import { request  } from "@/utils/axios";  

// 获取用户信息
export const getUserInfo = (params) => {
    return request("/user/getUserInfo", params);
}
