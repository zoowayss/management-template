import request from './request';
import { Merchant, PageResponse } from '@/types';

// 获取商户列表
export const getMerchantList = (params: {
  current: number;
  size: number;
  name?: string;
  code?: string;
}): Promise<PageResponse<Merchant>> => {
  return request.get<PageResponse<Merchant>>('/merchants', { params });
};

// 获取商户详情
export const getMerchantDetail = (id: number): Promise<Merchant> => {
  return request.get<Merchant>(`/merchants/${id}`);
};

// 创建商户
export const createMerchant = <T = Merchant>(data: Partial<Merchant>): Promise<T> => {
  return request.post<T>('/merchants', data);
};

// 更新商户
export const updateMerchant = <T = Merchant>(id: number, data: Partial<Merchant>): Promise<T> => {
  return request.put<T>(`/merchants/${id}`, data);
};

// 删除商户
export const deleteMerchant = (id: number): Promise<boolean> => {
  return request.delete<boolean>(`/merchants/${id}`);
};

// 更新商户状态
export const updateMerchantStatus = (id: number, status: 'active' | 'inactive'): Promise<boolean> => {
  return request.put<boolean>(`/merchants/${id}/status`, { status });
};
