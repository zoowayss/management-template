import request from './request';
import { ApiResponse, Permission, User } from '@/types';

// 登录接口
export const login = (data: {
  username: string;
  password: string;
}): Promise<ApiResponse<{ token: string; user: User; permissions: Permission[] }>> => {
  return request.post<ApiResponse<{ token: string; user: User; permissions: Permission[] }>>('/auth/login', data);
};

// 注册接口
export const register = (data: {
  username: string;
  password: string;
  email: string;
  fullName?: string;
}): Promise<ApiResponse<User>> => {
  return request.post<ApiResponse<User>>('/auth/register', data);
};

// 获取当前用户信息
export const getCurrentUser = (): Promise<ApiResponse<{ user: User; permissions: Permission[] }>> => {
  return request.get<ApiResponse<{ user: User; permissions: Permission[] }>>('/auth/me');
};

// 更新当前用户信息
export const updateCurrentUser = (data: {
  email: string;
  fullName?: string;
}): Promise<User> => {
  return request.put<User>('/auth/me', data);
};

// 修改密码
export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<boolean> => {
  return request.put<boolean>('/auth/password', data);
};
