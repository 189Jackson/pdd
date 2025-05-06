import axios from "axios";
import qs from "qs";

export const host = {
  // 'chat': 'https://task.bookan.com.cn:52865', // 语言大模型
  'chat': 'https://cankao.bookan.com.cn', // 语言大模型
  'user': 'https://opapi2.bookan.com.cn', // 用户中心
  'opapi': "https://opapi.bookan.com.cn", // 用户中心获取token用
  'qiniu': "https://upload-z2.qiniup.com/", // 七牛
  'ucapi': "https://ucapi.bookan.com.cn/", // ucapi
  'crm': "https://crm-inner.bookan.com.cn:52501/", // crm,tts接口
  'liblib': "http://127.0.0.1:3000", // 第三方平台liblib接口(本地服务nodejs)
}

// 封装 GET POST 请求并导出
export function request(url = "", params = {}, type = "GET", configData = {}) {
  const service = axios.create({
    baseURL: host[configData.host] || import.meta.env.VITE_BASE_URL,
    timeout: 120000,
  });

  //http request 拦截器
  service.interceptors.request.use(
    (config) => {
      if (!configData.noToken) {
        const token = localStorage.getItem("token");
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      // 配置请求头
      //'Content-Type':'application/x-www-form-urlencoded',   // 传参方式表单
      config.headers["Content-Type"] = "application/json;charset=UTF-8";
      if (configData.headers) {
        for (let key in configData.headers) {
          config.headers[key] = configData.headers[key];
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  //http response 拦截器
  service.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const { response } = error;
      if (response) {
        // 请求已发出，但是不在2xx的范围
        // showMessage(response.status);           // 传入响应码，匹配响应码对应信息
        // showToast({
        //   type: "fail",
        //   message: response.data.message || "响应失败",
        // });
        return Promise.reject(response.data);
      } else {
        // showToast({
        //   type: "fail",
        //   message: "网络连接异常，请稍后再试！",
        // });
      }
    }
  );

  //设置 url params type 的默认值
  return new Promise((resolve, reject) => {
    let promise;
    if (type.toUpperCase() === "GET") {
      promise = service({
        url,
        params,
        // params: qs.stringify(params),
      });
    } else if (type.toUpperCase() === "POST") {
      promise = service({
        method: "POST",
        url,
        data: params,
      });
    }
    //处理返回
    promise
      .then((res) => {
        if (res?.data?.data?.code === -1) {
          // showToast({
          //   type: "fail",
          //   message: res.data.data.msg,
          // });
          reject(res.data.data);
          return;
        }
        if (res?.data?.code == 5000) {
          reject(res.data);
          return;
        }
        if (configData?.isSourceData) { // 处理返回，sd接口直接返回
          resolve(res);
        } else {
          resolve(res?.data?.data);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// export default service;
