import request from './request';
import { Permission } from '@/types';

// 获取权限树
export const getPermissionTree = (): Promise<Permission[]> => {
  return request.get<Permission[]>('/permissions/tree');
};

// 获取所有菜单
export const getAllMenus = (): Promise<Permission[]> => {
  return request.get<Permission[]>('/permissions/menus');
};

// 获取所有按钮
export const getAllButtons = (): Promise<Permission[]> => {
  return request.get<Permission[]>('/permissions/buttons');
};

// 获取用户菜单
export const getUserMenus = (userId: number): Promise<Permission[]> => {
  return request.get<Permission[]>('/permissions/user/menus', { params: { userId } });
};

// 获取用户按钮
export const getUserButtons = (userId: number): Promise<Permission[]> => {
  return request.get<Permission[]>('/permissions/user/buttons', { params: { userId } });
};

// 创建权限
export const createPermission = <T = Permission>(data: Partial<Permission>): Promise<T> => {
  return request.post<T>('/permissions', data);
};

// 更新权限
export const updatePermission = <T = Permission>(id: number, data: Partial<Permission>): Promise<T> => {
  return request.put<T>(`/permissions/${id}`, data);
};

// 删除权限
export const deletePermission = (id: number): Promise<boolean> => {
  console.log(`发送删除权限请求，ID: ${id}`);
  return request.delete<boolean>(`/permissions/${id}`);
};
