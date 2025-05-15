import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';
import globalMessage from '@/utils/message';

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 基础URL
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    // 如果有token，则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;

    // 对于登录和获取当前用户请求，直接返回整个响应数据，让authStore处理成功/失败
    if (response.config.url?.includes('/auth/login') || response.config.url?.includes('/auth/me')) {
      return res;
    }

    // 对于其他请求，如果响应成功
    if (res.success) {
      return res.data;
    } else {
      // 显示错误信息
      globalMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
  },
  (error) => {
    // 处理HTTP错误
    if (error.response) {
      const { status, data, config } = error.response;
      console.error(`请求错误: ${config.method?.toUpperCase()} ${config.url}`, error);

      // 处理401未授权错误
      if (status === 401) {
        globalMessage.error('登录已过期，请重新登录');
        // 清除token
        localStorage.removeItem('token');
        // 跳转到登录页 
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
      // 处理403禁止访问错误
      else if (status === 403) {
        globalMessage.error('您没有权限访问此资源');
        // 如果是在登录页面，不显示错误
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          // 可能需要跳转到登录页 这里暂时不跳了
          // window.location.href = '/login';
        }
      }
      else {
        // 显示错误信息
        console.error('请求详情:', {
          url: config.url,
          method: config.method,
          params: config.params,
          data: config.data,
          response: data
        });
        // 尝试将响应数据作为ApiResponse处理
        const apiResponse = data as ApiResponse;
        globalMessage.error(apiResponse?.message || `请求错误 ${status}`);
      }
    } else {
      console.error('网络错误:', error);
      globalMessage.error('网络错误，请检查您的网络连接');
    }
    return Promise.reject(error);
  }
);

// 定义请求函数的类型
interface RequestFunctions {
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
}

// 导出带有类型的request对象
export default request as unknown as RequestFunctions;
