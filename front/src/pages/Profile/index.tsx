import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Avatar, Row, Col, Divider, Spin, Modal } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SaveOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { updateCurrentUser, changePassword } from '../../api/auth';

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const { user, fetchCurrentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // 当用户信息加载完成后，设置表单初始值
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        fullName: user.fullName || '',
      });
    }
  }, [user, form]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await updateCurrentUser({
        email: values.email,
        fullName: values.fullName,
      });
      message.success('个人信息更新成功');
      // 重新获取用户信息
      await fetchCurrentUser();
    } catch (error) {
      console.error('更新个人信息失败:', error);
      message.error('更新个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开修改密码模态框
  const showPasswordModal = () => {
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  // 处理修改密码
  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success('密码修改成功');
      setPasswordModalVisible(false);
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('修改密码失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <h1>个人信息</h1>
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar size={120} icon={<UserOutlined />} />
              <h2 style={{ marginTop: 16 }}>{user.fullName || user.username}</h2>
              <p>{user.email}</p>
              <p>
                {user.roles?.map(role => role.name).join(', ') || '无角色'}
              </p>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="基本信息">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                username: user.username,
                email: user.email,
                fullName: user.fullName || '',
              }}
            >
              <Form.Item
                name="username"
                label="用户名"
              >
                <Input
                  prefix={<UserOutlined />}
                  disabled
                  placeholder="用户名不可修改"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入邮箱"
                />
              </Form.Item>

              <Form.Item
                name="fullName"
                label="姓名"
              >
                <Input
                  placeholder="请输入姓名"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  style={{ marginRight: 8 }}
                >
                  保存修改
                </Button>
                <Button
                  type="default"
                  icon={<KeyOutlined />}
                  onClick={showPasswordModal}
                >
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="旧密码"
            rules={[
              { required: true, message: '请输入旧密码!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入旧密码"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码!' },
              { min: 6, message: '密码长度不能少于6个字符!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请确认新密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
