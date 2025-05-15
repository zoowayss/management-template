// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  enabled: boolean;
  roles?: Role[];
  createTime?: number;
  updateTime?: number;
}

// 角色类型
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions?: Permission[];
  permissionIds?: number[]; // 添加permissionIds字段，用于接收后端返回的权限ID数组
  createTime?: number;
  updateTime?: number;
}

// 权限类型
export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: 'menu' | 'button';
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  parentId: number;
  children?: Permission[];
  createTime?: number;
  updateTime?: number;
}

// 商户类型
export interface Merchant {
  id: number;
  name: string;
  code: string;
  contactPerson: string;
  contactPhone: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  businessType?: string;
  description?: string;
  createTime?: number;
  updateTime?: number;
}

// 分页响应类型
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// API统一响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}
