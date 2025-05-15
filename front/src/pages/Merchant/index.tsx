import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import { ShopOutlined } from '@ant-design/icons';

const MerchantPage: React.FC = () => {
  // 模拟数据
  const mockData = [
    {
      id: 1,
      name: '测试商户1',
      code: 'TEST001',
      contactPerson: '张三',
      contactPhone: '13800138001',
      status: 'active',
      createTime: Date.now()
    },
    {
      id: 2,
      name: '测试商户2',
      code: 'TEST002',
      contactPerson: '李四',
      contactPhone: '13800138002',
      status: 'inactive',
      createTime: Date.now() - 86400000
    },
  ];

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small">删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title={
        <span>
          <ShopOutlined style={{ marginRight: 8 }} />
          商户管理
        </span>
      }>
        <p>这是商户管理页面，您可以在这里管理所有商户信息。</p>
        <Button type="primary" style={{ marginBottom: 16 }}>新增商户</Button>
        
        <Table 
          rowKey="id"
          dataSource={mockData} 
          columns={columns} 
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default MerchantPage;
