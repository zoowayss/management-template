import request from './request';
import { PageResponse, User } from '@/types';

// 获取用户列表
export const getUserList = (params: {
  current: number;
  size: number;
  username?: string;
}): Promise<PageResponse<User>> => {
  return request.get<PageResponse<User>>('/users', { params });
};

// 获取用户详情
export const getUserDetail = (id: number): Promise<User> => {
  return request.get<User>(`/users/${id}`);
};

// 创建用户
export const createUser = <T = User>(data: Partial<User>): Promise<T> => {
  return request.post<T>('/users', data);
};

// 更新用户
export const updateUser = <T = User>(id: number, data: Partial<User>): Promise<T> => {
  return request.put<T>(`/users/${id}`, data);
};

// 删除用户
export const deleteUser = (id: number): Promise<boolean> => {
  return request.delete<boolean>(`/users/${id}`);
};
