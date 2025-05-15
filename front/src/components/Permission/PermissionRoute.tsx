import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../../store/authStore';

interface PermissionRouteProps {
  permissionCode: string;
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * 权限路由组件
 * 根据用户权限决定是否允许访问路由
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({
  permissionCode,
  children,
  redirectTo = '/dashboard',
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const permissionCodes = useAuthStore((state) => state.permissionCodes);
  const token = localStorage.getItem('token');
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  // 在组件挂载时检查权限信息是否已经加载
  useEffect(() => {
    // 如果有token但没有权限信息，则获取用户信息和权限
    if (token && !isLoggedIn && permissionCodes.length === 0 && !isLoading) {
      fetchCurrentUser();
    }
  }, [token, isLoggedIn, permissionCodes.length, isLoading, fetchCurrentUser]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载权限中..." />
      </div>
    );
  }

  // 如果未登录，重定向到登录页
  if (!isLoggedIn && !token) {
    return <Navigate to="/login" replace />;
  }

  // 如果没有权限，重定向到指定页面
  const hasRequiredPermission = hasPermission(permissionCode);

  if (!hasRequiredPermission) {
    return <Navigate to={redirectTo} replace />;
  }

  // 如果有权限，渲染子组件
  return <>{children}</>;
};

export default PermissionRoute;
