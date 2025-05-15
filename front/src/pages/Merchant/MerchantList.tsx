import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Table, Tag, Select, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons';
import { Merchant } from '@/types';
import { createMerchant, deleteMerchant, getMerchantList, updateMerchant } from '@/api/merchant';
import PermissionButton from '@/components/Permission/PermissionButton';
import { useAuthStore } from '@/store/authStore';
import { formatTimestamp } from '@/utils';
import { globalMessage } from '@/utils/message';

const { Option } = Select;

const MerchantList: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [loading, setLoading] = useState(false);
  const [merchantList, setMerchantList] = useState<Merchant[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [searchForm] = Form.useForm();
  const [merchantForm] = Form.useForm();
  const [loadingMerchantIds, setLoadingMerchantIds] = useState<number[]>([]);

  // 获取商户列表
  const fetchMerchantList = async (current = 1, size = 10, name?: string, code?: string) => {
    try {
      setLoading(true);
      const res = await getMerchantList({ current, size, name, code });
      const { records, total } = res;
      setMerchantList(records);
      setPagination({
        ...pagination,
        current,
        total,
      });
    } catch (error) {
      console.error('获取商户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantList();
  }, []);

  // 处理搜索
  const handleSearch = (values: any) => {
    fetchMerchantList(1, pagination.pageSize, values.name, values.code);
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    fetchMerchantList(1, pagination.pageSize);
  };

  // 处理表格分页变化
  const handleTableChange = (pagination: any) => {
    fetchMerchantList(
      pagination.current, 
      pagination.pageSize, 
      searchForm.getFieldValue('name'),
      searchForm.getFieldValue('code')
    );
  };

  // 打开新增商户模态框
  const handleAdd = () => {
    setModalTitle('新增商户');
    setEditingMerchant(null);
    merchantForm.resetFields();
    setModalVisible(true);
  };

  // 打开编辑商户模态框
  const handleEdit = (record: Merchant) => {
    setModalTitle('编辑商户');
    setEditingMerchant(record);
    merchantForm.setFieldsValue(record);
    setModalVisible(true);
  };

  // 处理删除商户
  const handleDelete = async (id: number) => {
    try {
      setLoadingMerchantIds([...loadingMerchantIds, id]);
      await deleteMerchant(id);
      globalMessage.success('删除成功');
      fetchMerchantList(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('删除商户失败:', error);
      globalMessage.error('删除商户失败');
    } finally {
      setLoadingMerchantIds(loadingMerchantIds.filter(item => item !== id));
    }
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await merchantForm.validateFields();
      
      if (editingMerchant) {
        // 更新商户
        await updateMerchant(editingMerchant.id, values);
        globalMessage.success('更新成功');
      } else {
        // 创建商户
        await createMerchant(values);
        globalMessage.success('创建成功');
      }
      
      setModalVisible(false);
      fetchMerchantList(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('保存商户失败:', error);
      globalMessage.error('保存商户失败');
    }
  };

  // 检查是否有任何操作权限
  const hasAnyActionPermission = () => {
    return hasPermission('system:merchant:edit') || 
           hasPermission('system:merchant:delete');
  };

  // 获取列配置
  const getColumns = () => {
    const baseColumns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: '商户名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '商户编码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '联系人',
        dataIndex: 'contactPerson',
        key: 'contactPerson',
      },
      {
        title: '联系电话',
        dataIndex: 'contactPhone',
        key: 'contactPhone',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? '启用' : '禁用'}
          </Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (time: number) => formatTimestamp(time),
      },
    ];

    // 如果用户有任何操作权限，添加操作列
    if (hasAnyActionPermission()) {
      baseColumns.push({
        title: '操作',
        key: 'action',
        render: (_: any, record: Merchant) => (
          <Space>
            <PermissionButton permissionCode="system:merchant:edit">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
            </PermissionButton>

            <PermissionButton permissionCode="system:merchant:delete">
              <Button
                danger
                loading={loadingMerchantIds.includes(record.id)}
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
          <Form.Item name="name" label="商户名称">
            <Input placeholder="请输入商户名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="商户编码">
            <Input placeholder="请输入商户编码" allowClear />
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
            <PermissionButton permissionCode="system:merchant:add">
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
          dataSource={merchantList}
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
          form={merchantForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item
            name="name"
            label="商户名称"
            rules={[{ required: true, message: '请输入商户名称' }]}
          >
            <Input placeholder="请输入商户名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="商户编码"
            rules={[{ required: true, message: '请输入商户编码' }]}
          >
            <Input placeholder="请输入商户编码" />
          </Form.Item>

          <Form.Item
            name="contactPerson"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="address"
            label="地址"
          >
            <Input placeholder="请输入地址" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="businessType"
            label="业务类型"
          >
            <Input placeholder="请输入业务类型" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MerchantList;
