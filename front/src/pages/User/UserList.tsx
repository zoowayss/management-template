import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Switch, Table } from 'antd';
import { globalMessage } from '../../utils/message';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Role, User } from '../../types';
import { createUser, deleteUser, getUserList, updateUser } from '../../api/user';
import { getAllRoles } from '../../api/role';
import PermissionButton from '../../components/Permission/PermissionButton';
import { useAuthStore } from '../../store/authStore';
import { formatTimestamp } from '../../utils';

const UserList: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [loadingUserIds, setLoadingUserIds] = useState<number[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleList, setRoleList] = useState<Role[]>([]);

  // 检查用户是否有任何操作权限（编辑或删除）
  const hasAnyActionPermission = (): boolean => {
    return hasPermission('system:user:edit') || hasPermission('system:user:delete');
  };

  // 获取用户列表
  const fetchUserList = async (current = 1, size = 10, username?: string) => {
    try {
      setLoading(true);
      const res = await getUserList({ current, size, username });
      const { records, total } = res;
      setUserList(records);
      setPagination({
        ...pagination,
        current,
        total,
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有角色
  const fetchRoleList = async () => {
    try {
      const roles = await getAllRoles();
      setRoleList(roles);
    } catch (error) {
      console.error('获取角色列表失败:', error);
      globalMessage.error('获取角色列表失败');
    }
  };

  useEffect(() => {
    fetchUserList();
    fetchRoleList();
  }, []);

  // 处理搜索
  const handleSearch = (values: any) => {
    fetchUserList(1, pagination.pageSize, values.username);
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    fetchUserList(1, pagination.pageSize);
  };

  // 处理表格分页变化
  const handleTableChange = (pagination: any) => {
    fetchUserList(pagination.current, pagination.pageSize, searchForm.getFieldValue('username'));
  };

  // 打开新增用户模态框
  const handleAdd = () => {
    setModalTitle('新增用户');
    setEditingUser(null);
    userForm.resetFields();
    setModalVisible(true);
  };

  // 打开编辑用户模态框
  const handleEdit = (record: User) => {
    setModalTitle('编辑用户');
    setEditingUser(record);
    userForm.setFieldsValue({
      ...record,
      roleIds: record.roles?.map(role => role.id),
    });
    setModalVisible(true);
  };

  // 处理删除用户
  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      globalMessage.success('删除成功');
      fetchUserList(pagination.current, pagination.pageSize, searchForm.getFieldValue('username'));
    } catch (error) {
      console.error('删除用户失败:', error);
    }
  };

  // 处理用户状态切换
  const handleStatusChange = async (id: number, enabled: boolean) => {
    try {
      // 添加到加载状态
      setLoadingUserIds(prev => [...prev, id]);

      await updateUser(id, { enabled });
      globalMessage.success(`用户状态${enabled ? '启用' : '禁用'}成功`);
      fetchUserList(pagination.current, pagination.pageSize, searchForm.getFieldValue('username'));
    } catch (error) {
      console.error('更新用户状态失败:', error);
      globalMessage.error('更新用户状态失败');
    } finally {
      // 从加载状态中移除
      setLoadingUserIds(prev => prev.filter(userId => userId !== id));
    }
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await userForm.validateFields();

      // 构建用户对象
      const userData = {
        ...values,
        roles: values.roleIds?.map((id: number) => ({ id })),
      };

      if (editingUser) {
        // 编辑用户
        await updateUser(editingUser.id, userData);
        globalMessage.success('更新成功');
      } else {
        // 新增用户
        await createUser(userData);
        globalMessage.success('创建成功');
      }

      setModalVisible(false);
      fetchUserList(pagination.current, pagination.pageSize, searchForm.getFieldValue('username'));
    } catch (error) {
      console.error('保存用户失败:', error);
    }
  };

  // 表格列定义
  const getColumns = () => {
    // 基础列定义
    const baseColumns: any[] = [
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '姓名',
        dataIndex: 'fullName',
        key: 'fullName',
      },
      {
        title: '角色',
        dataIndex: 'roles',
        key: 'roles',
        render: (roles: Role[]) => (
          <span>
            {roles?.map(role => role.name).join(', ')}
          </span>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (timestamp: number) => formatTimestamp(timestamp),
      },
    ];

    // 如果用户有编辑权限，添加状态列
    if (hasPermission('system:user:edit')) {
      baseColumns.splice(3, 0, {
        title: '状态',
        dataIndex: 'enabled',
        key: 'enabled',
        render: (enabled: boolean, record: User) => (
          <Switch
            checked={enabled}
            loading={loadingUserIds.includes(record.id)}
            onChange={(checked) => handleStatusChange(record.id, checked)}
          />
        ),
      });
    }

    // 如果用户有任何操作权限，添加操作列
    if (hasAnyActionPermission()) {
      baseColumns.push({
        title: '操作',
        key: 'action',
        render: (_: any, record: User) => (
          <Space>
            <PermissionButton permissionCode="system:user:edit">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
            </PermissionButton>

            <PermissionButton permissionCode="system:user:delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
              >
                删除
              </Button>
            </PermissionButton>
          </Space>
        ),
      });
    }

    return baseColumns;
  };

  // 获取当前列配置
  const columns = getColumns();

  return (
    <div>
      <Card>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleReset}>重置</Button>
          </Form.Item>
          <Form.Item>
            <PermissionButton permissionCode="system:user:add">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增
              </Button>
            </PermissionButton>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={userList}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={userForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="姓名"
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="roleIds"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roleList.map(role => ({
                label: role.name,
                value: role.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
