import React from 'react';
import { useAuthStore } from '../../store/authStore';

interface PermissionButtonProps {
  permissionCode: string;
  children: React.ReactNode;
}

/**
 * 权限按钮组件
 * 根据用户权限决定是否渲染按钮
 */
const PermissionButton: React.FC<PermissionButtonProps> = ({
  permissionCode,
  children,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  // 如果用户没有权限，则不渲染任何内容
  if (!hasPermission(permissionCode)) {
    return null;
  }

  // 如果用户有权限，则渲染子组件
  return <>{children}</>;
};

export default PermissionButton;
