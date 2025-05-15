import React from 'react';
import { Button, Card, Form, Input } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styles from './index.module.css';
import PermissionButton from '@/components/Permission/PermissionButton';
import globalMessage from '@/utils/message';

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      await login(values.username, values.password);
      globalMessage.success('登录成功');
      navigate('/dashboard');
    } catch (error) {
      console.error('登录失败:', error);
      // 显示登录失败的错误消息
      if (error instanceof Error) {
        globalMessage.error(error.message || '登录失败，请检查用户名和密码');
      } else {
        globalMessage.error('登录失败，请检查用户名和密码');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="系统登录" className={styles.card}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>

          <PermissionButton permissionCode="system:user:register">
            <div className={styles.registerLink}>
              没有账号？<Link to="/register">立即注册</Link> {/* 注意：路由路径应与路由配置匹配 */}
            </div>
          </PermissionButton>

        </Form>
      </Card>
    </div>
  );
};

export default Login;
