import React, { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, theme } from 'antd';
import * as AntdIcons from '@ant-design/icons';
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Permission } from '../types';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer } } = theme.useToken();

  const { user, permissions, logout } = useAuthStore();

  // 移除重复的fetchCurrentUser调用，该逻辑已在App.tsx中处理

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    setSelectedKeys([location.pathname]);
  }, [location.pathname]);

  useEffect(() => {
    // 构建菜单项
    if (permissions && permissions.length > 0) {
      const menuPermissions = permissions.filter(
        (p: Permission) => p.type === 'menu'
      );

      // 构建菜单树
      const menuTree = buildMenuTree(menuPermissions);
      setMenuItems(menuTree);

      // 设置默认展开的菜单项
      const defaultOpenKeys = menuPermissions
        .filter(p => p.parentId === 0 && p.path)
        .map(p => p.path || String(p.id));
      setOpenKeys(defaultOpenKeys);
    }
  }, [permissions]);

  // 处理菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    // 如果key是有效路径，则导航到该路径
    if (key && key.startsWith('/')) {
      setSelectedKeys([key]);
      navigate(key);
    }
  };

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    // 动态获取图标组件
    const Icon = (AntdIcons as any)[iconName];
    return Icon ? React.createElement(Icon) : null;
  };

  // 构建菜单树
  const buildMenuTree = (menuList: Permission[]) => {
    // 顶级菜单
    const rootMenus = menuList.filter((menu) => menu.parentId === 0);

    // 递归构建子菜单
    const buildChildren = (menu: Permission): any => {
      const children = menuList.filter((item) => item.parentId === menu.id);

      if (children.length > 0) {
        return {
          key: menu.path || String(menu.id),
          icon: menu.icon ? getIconComponent(menu.icon) : null,
          label: menu.name,
          children: children.map((child) => buildChildren(child)),
        };
      }

      return {
        key: menu.path || String(menu.id),
        icon: menu.icon ? getIconComponent(menu.icon) : null,
        label: <Link to={menu.path || '/'}>{menu.name}</Link>,
      };
    };

    return rootMenus.map((menu) => buildChildren(menu));
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 用户下拉菜单
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息',
        onClick: () => navigate('/profile'),
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
          onClick={handleMenuClick}
          inlineIndent={16}
          subMenuOpenDelay={0.3}
          triggerSubMenuAction="click"
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ float: 'right', marginRight: 24 }}>
            <Dropdown menu={userMenu} placement="bottomRight">
              <span style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>{user?.username}</span>
              </span>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
