import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { useAuthStore } from '../store/authStore';
import PermissionRoute from '../components/Permission/PermissionRoute';

// 懒加载页面组件
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const UserList = React.lazy(() => import('../pages/User/UserList'));
const RoleList = React.lazy(() => import('../pages/Role/RoleList'));
const PermissionList = React.lazy(() => import('../pages/Permission/PermissionList'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Merchant = React.lazy(() => import('../pages/Merchant'));

// 路由守卫组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const token = localStorage.getItem('token');

  if (!isLoggedIn && !token) {
    // 如果未登录且没有token，则重定向到登录页
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 路由配置
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: 'register',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <PermissionRoute permissionCode="system:user:register">
              <Register />
            </PermissionRoute>
          </React.Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </React.Suspense>
        ),
      },
      {
        path: 'user',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <UserList />
          </React.Suspense>
        ),
      },
      {
        path: 'role',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <RoleList />
          </React.Suspense>
        ),
      },
      {
        path: 'permission',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <PermissionList />
          </React.Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Profile />
          </React.Suspense>
        ),
      },
      {
        path: 'merchant',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Merchant />
          </React.Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
];
