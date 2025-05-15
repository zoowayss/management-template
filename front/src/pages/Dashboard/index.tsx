import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const Dashboard: React.FC = () => {
  const { user, permissions } = useAuthStore();

  // 统计按钮权限数量
  const buttonPermissions = permissions.filter(p => p.type === 'button').length;
  
  // 统计菜单权限数量
  const menuPermissions = permissions.filter(p => p.type === 'menu').length;

  return (
    <div>
      <h1>欢迎，{user?.fullName || user?.username}！</h1>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="用户名"
              value={user?.username || '-'}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="菜单权限数"
              value={menuPermissions}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="按钮权限数"
              value={buttonPermissions}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <h2>系统说明</h2>
        <p>这是一个基于React 18和Antd UI组件的权限管理系统，具有以下特点：</p>
        <ul>
          <li>基于RBAC（基于角色的访问控制）模型</li>
          <li>支持细粒度的权限控制，精确到按钮级别</li>
          <li>动态菜单，根据用户权限自动生成</li>
          <li>JWT认证，保障系统安全</li>
        </ul>
      </Card>
    </div>
  );
};

export default Dashboard;
