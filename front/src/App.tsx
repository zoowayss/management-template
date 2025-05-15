import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { routes } from './router';
import { useAuthStore } from './store/authStore';
import { initMessage } from './utils/message';

const App: React.FC = () => {
  const element = useRoutes(routes);
  const { token, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    // 如果有token，则获取用户信息
    if (token) {
      fetchCurrentUser();
    }
  }, [token, fetchCurrentUser]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AntdApp
        message={{
          maxCount: 3,
          duration: 3,
          top: 100
        }}
      >
        <AppContent>{element}</AppContent>
      </AntdApp>
    </ConfigProvider>
  );
};

// 使用 App.useApp() 获取消息实例
const AppContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { message } = AntdApp.useApp();

  // 初始化全局消息实例
  useEffect(() => {
    initMessage(message);
  }, [message]);

  return <>{children}</>;
};

export default App;
