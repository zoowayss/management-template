import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Permission, User } from '@/types';
import { getCurrentUser, login } from '../api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  permissions: Permission[];
  permissionCodes: string[];
  isLoggedIn: boolean;
  isLoading: boolean; // 添加加载状态标志
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<{ user: User; permissions: Permission[] } | void>;
  hasPermission: (code: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permissions: [],
      permissionCodes: [],
      isLoggedIn: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        const response = await login({ username, password });

        // 检查响应是否成功
        if (!response.success) {
          throw new Error(response.message || '登录失败');
        }

        const { token, user, permissions } = response.data;

        // 提取权限编码
        const permissionCodes = permissions.map((p: Permission) => p.code);

        set({
          token,
          user,
          permissions,
          permissionCodes,
          isLoggedIn: true,
        });

        // 保存token到localStorage
        localStorage.setItem('token', token);
      },

      logout: () => {
        // 清除token
        localStorage.removeItem('token');

        set({
          token: null,
          user: null,
          permissions: [],
          permissionCodes: [],
          isLoggedIn: false,
        });
      },

      fetchCurrentUser: async () => {
        // 如果已经在加载中，则直接返回
        if (get().isLoading) {
          return;
        }

        try {
          // 设置加载状态
          set({ isLoading: true });

          const response = await getCurrentUser();

          // 检查响应是否成功
          if (!response.success) {
            throw new Error(response.message || '获取用户信息失败');
          }

          const { user, permissions } = response.data;

          // 提取权限编码
          const permissionCodes = permissions.map((p: Permission) => p.code);

          set({
            user,
            permissions,
            permissionCodes,
            isLoggedIn: true,
            isLoading: false, // 重置加载状态
          });

          return { user, permissions }; // 返回用户信息和权限
        } catch (error) {
          // 如果获取用户信息失败，则登出
          get().logout();
          // 重置加载状态
          set({ isLoading: false });
          throw error; // 重新抛出错误，以便调用者可以处理
        }
      },

      hasPermission: (code: string) => {
        const { permissionCodes } = get();
        return permissionCodes.includes(code);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
