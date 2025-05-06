import { request  } from "@/utils/axios";  

// 获取用户信息
export const login = (params) => {
    return request("/user/api/login", params, 'post', { noToken: true });
}

// 注册
export const register = (params) => {
    return request("/user/api/register", params, 'post', { noToken: true });
}

export const getUserInfo = (params) => {
    return request("/user/getUserInfo", params);
}
