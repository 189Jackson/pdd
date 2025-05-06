// 商品
import { request  } from "@/utils/axios";  

// 查询商品列表
export const getGoodsList = (params) => {
    return request("/commodity/getList", params, 'get');
}

// 查询商品详情
export const getGoodsDetail = (params) => {
    return request("/commodity/getDetail", params, 'get');
}
