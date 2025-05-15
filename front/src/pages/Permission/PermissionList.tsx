import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Permission } from '../../types';
import { createPermission, deletePermission, getPermissionTree, updatePermission } from '../../api/permission';
import PermissionButton from '../../components/Permission/PermissionButton';

const PermissionList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [permissionList, setPermissionList] = useState<Permission[]>([]);
  const [permissionForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  // 获取权限树
  const fetchPermissionTree = async () => {
    try {
      setLoading(true);
      const res = await getPermissionTree();
      setPermissionList(res);
    } catch (error) {
      console.error('获取权限树失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissionTree();
  }, []);

  // 打开新增权限模态框
  const handleAdd = (parentId = 0) => {
    setModalTitle('新增权限');
    setEditingPermission(null);
    permissionForm.resetFields();
    permissionForm.setFieldsValue({ parentId });
    setModalVisible(true);
  };

  // 打开编辑权限模态框
  const handleEdit = (record: Permission) => {
    setModalTitle('编辑权限');
    setEditingPermission(record);
    permissionForm.setFieldsValue(record);
    setModalVisible(true);
  };

  // 处理删除权限
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除此权限将同时删除其所有子权限，确定要继续吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          console.log('删除权限ID:', id);
          await deletePermission(id);
          message.success('删除成功');
          fetchPermissionTree();
        } catch (error) {
          console.error('删除权限失败:', error);
          message.error('删除权限失败，请稍后重试');
        }
      }
    });
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await permissionForm.validateFields();

      if (editingPermission) {
        // 编辑权限
        await updatePermission(editingPermission.id, values);
        message.success('更新成功');
      } else {
        // 新增权限
        await createPermission(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchPermissionTree();
    } catch (error) {
      console.error('保存权限失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '权限类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span>{type === 'menu' ? '菜单' : '按钮'}</span>
      ),
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: '组件',
      dataIndex: 'component',
      key: 'component',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Permission) => (
        <Space>
          <PermissionButton permissionCode="system:permission:add">
            <Button
              type="primary"
              onClick={() => handleAdd(record.id)}
            >
              添加子权限
            </Button>
          </PermissionButton>

          <PermissionButton permissionCode="system:permission:edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </PermissionButton>

          <PermissionButton permissionCode="system:permission:delete">
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
    },
  ];

  return (
    <div>
      <Card>
        <PermissionButton permissionCode="system:permission:add">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
            新增顶级权限
          </Button>
        </PermissionButton>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={permissionList}
          loading={loading}
          pagination={false}
          expandable={{
            defaultExpandAllRows: true,
          }}
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
          form={permissionForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item
            name="parentId"
            label="父级权限"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="权限编码"
            rules={[{ required: true, message: '请输入权限编码' }]}
          >
            <Input placeholder="请输入权限编码，例如：system:user:add" />
          </Form.Item>

          <Form.Item
            name="type"
            label="权限类型"
            rules={[{ required: true, message: '请选择权限类型' }]}
          >
            <Select
              placeholder="请选择权限类型"
              options={[
                { label: '菜单', value: 'menu' },
                { label: '按钮', value: 'button' },
              ]}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => (
              getFieldValue('type') === 'menu' ? (
                <>
                  <Form.Item
                    name="path"
                    label="路径"
                  >
                    <Input placeholder="请输入路径" />
                  </Form.Item>

                  <Form.Item
                    name="component"
                    label="组件"
                  >
                    <Input placeholder="请输入组件路径" />
                  </Form.Item>

                  <Form.Item
                    name="icon"
                    label="图标"
                  >
                    <Input placeholder="请输入图标" />
                  </Form.Item>
                </>
              ) : null
            )}
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
            initialValue={0}
          >
            <Input type="number" placeholder="请输入排序" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PermissionList;
