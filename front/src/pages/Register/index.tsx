import React from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import styles from './index.module.css';

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  fullName?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      // 确认密码验证已经在表单规则中完成，这里直接提交
      const { confirmPassword, ...registerData } = values;
      await register(registerData);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      console.error('注册失败:', error);
      if (error instanceof Error) {
        message.error(error.message || '注册失败');
      } else {
        message.error('注册失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="用户注册" className={styles.card}>
        <Form
          name="register"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, max: 20, message: '用户名长度必须在3-20之间!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            rules={[{ max: 50, message: '姓名长度不能超过50个字符!' }]}
          >
            <Input
              prefix={<UserAddOutlined />}
              placeholder="姓名（选填）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, max: 40, message: '密码长度必须在6-40之间!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
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
              注册
            </Button>
          </Form.Item>

          <div className={styles.loginLink}>
            已有账号？<Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
