import request from './request';
import { PageResponse, Role } from '@/types';

// 获取角色列表
export const getRoleList = (params: {
  current: number;
  size: number;
  name?: string;
}): Promise<PageResponse<Role>> => {
  return request.get<PageResponse<Role>>('/roles', { params });
};

// 获取所有角色
export const getAllRoles = (): Promise<Role[]> => {
  return request.get<Role[]>('/roles/all');
};

// 获取角色详情
export const getRoleDetail = (id: number): Promise<Role> => {
  console.log(`发送获取角色详情请求，ID: ${id}`);
  return request.get<Role>(`/roles/${id}`);
};

// 创建角色
export const createRole = <T = Role>(data: Partial<Role>): Promise<T> => {
  return request.post<T>('/roles', data);
};

// 更新角色
export const updateRole = <T = Role>(id: number, data: Partial<Role>): Promise<T> => {
  console.log(`发送更新角色请求，ID: ${id}，数据:`, data);
  return request.put<T>(`/roles/${id}`, data);
};

// 删除角色
export const deleteRole = (id: number): Promise<boolean> => {
  return request.delete<boolean>(`/roles/${id}`);
};
