import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Table, Tree, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Permission, Role } from '../../types';
import { createRole, deleteRole, getRoleDetail, getRoleList, updateRole } from '../../api/role';
import { getPermissionTree } from '../../api/permission';
import PermissionButton from '../../components/Permission/PermissionButton';
import { useAuthStore } from '../../store/authStore';
import { formatTimestamp } from '../../utils';

const RoleList: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [loading, setLoading] = useState(false);
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionTree, setPermissionTree] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // 检查用户是否有任何操作权限（编辑或删除）
  const hasAnyActionPermission = (): boolean => {
    return hasPermission('system:role:edit') || hasPermission('system:role:delete');
  };

  // 获取角色列表
  const fetchRoleList = async (current = 1, size = 10, name?: string) => {
    try {
      setLoading(true);
      const res = await getRoleList({ current, size, name });
      const { records, total } = res;
      setRoleList(records);
      setPagination({
        ...pagination,
        current,
        total,
      });
    } catch (error) {
      console.error('获取角色列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取权限树
  const fetchPermissionTree = async () => {
    try {
      const permissions = await getPermissionTree();
      setPermissionTree(permissions);
    } catch (error) {
      console.error('获取权限树失败:', error);
    }
  };

  useEffect(() => {
    fetchRoleList();
    fetchPermissionTree();
  }, []);

  // 处理搜索
  const handleSearch = (values: any) => {
    fetchRoleList(1, pagination.pageSize, values.name);
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    fetchRoleList(1, pagination.pageSize);
  };

  // 处理表格分页变化
  const handleTableChange = (pagination: any) => {
    fetchRoleList(pagination.current, pagination.pageSize, searchForm.getFieldValue('name'));
  };

  // 打开新增角色模态框
  const handleAdd = () => {
    setModalTitle('新增角色');
    setEditingRole(null);
    roleForm.resetFields();
    setSelectedPermissions([]);
    setModalVisible(true);
  };

  // 打开编辑角色模态框
  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      console.log('获取角色详情，ID:', id);
      const role = await getRoleDetail(id);
      console.log('获取到的角色详情:', role);
      setModalTitle('编辑角色');
      setEditingRole(role);
      roleForm.setFieldsValue(role);

      // 设置已选权限
      // 根据后端返回的数据格式处理权限ID
      let permissionIds: number[] = [];

      // 处理不同的后端返回格式
      if (role.permissions) {
        if (Array.isArray(role.permissions)) {
          // 如果后端返回的是对象数组，则提取ID
          if (role.permissions.length > 0 && typeof role.permissions[0] === 'object') {
            permissionIds = role.permissions.map((p: any) => p.id);
          } else {
            // 如果后端直接返回ID数组，则直接使用
            permissionIds = role.permissions as unknown as number[];
          }
        }
      } else if (role.permissionIds) {
        // 如果后端直接返回permissionIds字段
        permissionIds = Array.isArray(role.permissionIds) ? role.permissionIds : [role.permissionIds];
      }

      console.log('设置权限IDs:', permissionIds);
      setSelectedPermissions(permissionIds);

      setModalVisible(true);
    } catch (error) {
      console.error('获取角色详情失败:', error);
      message.error('获取角色详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除角色
  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      message.success('删除成功');
      fetchRoleList(pagination.current, pagination.pageSize, searchForm.getFieldValue('name'));
    } catch (error) {
      console.error('删除角色失败:', error);
    }
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await roleForm.validateFields();

      // 构建角色对象，后端接口只接受权限ID数组
      // 由于Tree组件的checkStrictly设置为true，selectedPermissions中只包含用户明确选中的节点
      // 这样用户可以单独选择或取消选择任何节点，包括父节点和子节点
      const roleData = {
        ...values,
        permissionIds: selectedPermissions, // 直接使用选中的权限ID数组
      };

      console.log('保存角色数据:', roleData);
      console.log('选中的权限IDs:', selectedPermissions);

      if (editingRole) {
        // 编辑角色
        console.log('更新角色ID:', editingRole.id);
        await updateRole(editingRole.id, roleData);
        message.success('更新成功');
      } else {
        // 新增角色
        await createRole(roleData);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchRoleList(pagination.current, pagination.pageSize, searchForm.getFieldValue('name'));
    } catch (error) {
      console.error('保存角色失败:', error);
      message.error('保存角色失败，请稍后重试');
    }
  };

  // 处理权限树选择变化
  const handlePermissionChange = (
    checkedKeys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] },
    info: any
  ) => {
    // 由于checkStrictly设置为true，checkedKeys将是一个对象，包含checked和halfChecked两个数组
    // 我们只需要使用checked数组，表示完全选中的节点
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    console.log('选中的权限键值:', keys);
    console.log('半选中的节点:', Array.isArray(checkedKeys) ? [] : checkedKeys.halfChecked);
    console.log('选择事件信息:', info);

    // 获取当前操作的节点和操作类型（选中或取消选中）
    const { node, checked } = info;

    // 递归获取所有子节点的key
    const getAllChildrenKeys = (children: any[]): number[] => {
      let childKeys: number[] = [];
      children.forEach(child => {
        childKeys.push(Number(child.key));
        if (child.children && child.children.length > 0) {
          childKeys = [...childKeys, ...getAllChildrenKeys(child.children)];
        }
      });
      return childKeys;
    };

    // 构建父子关系映射，用于查找父节点
    const buildParentMap = () => {
      const parentMap = new Map<number, number>();

      const processNode = (node: Permission) => {
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            parentMap.set(child.id, node.id);
            processNode(child);
          });
        }
      };

      permissionTree.forEach(node => processNode(node));
      return parentMap;
    };

    // 获取所有父节点的ID
    const getAllParentIds = (nodeId: number, parentMap: Map<number, number>): number[] => {
      const parentIds: number[] = [];
      let currentId = nodeId;

      while (parentMap.has(currentId)) {
        const parentId = parentMap.get(currentId)!;
        parentIds.push(parentId);
        currentId = parentId;
      }

      return parentIds;
    };

    // 如果是取消选中操作，并且该节点有子节点，则同时取消选中所有子节点
    if (!checked && node.children && node.children.length > 0) {
      // 获取当前节点的所有子节点key
      const childrenKeys = getAllChildrenKeys(node.children);
      console.log('需要一并取消选中的子节点:', childrenKeys);

      // 从当前选中的keys中移除这些子节点key
      const filteredKeys = keys.filter(key => !childrenKeys.includes(Number(key)));

      // 将选中的键值转换为数字ID
      setSelectedPermissions(filteredKeys.map(key => Number(key)));
    } else if (checked) {
      let newKeys = [...keys.map(key => Number(key))];

      // 如果是选中父节点操作，则同时选中所有子节点
      if (node.children && node.children.length > 0) {
        // 获取当前节点的所有子节点key
        const childrenKeys = getAllChildrenKeys(node.children);
        console.log('需要一并选中的子节点:', childrenKeys);

        // 将子节点ID添加到选中的keys中
        newKeys = [...new Set([...newKeys, ...childrenKeys])];
      }

      // 同时选中所有父节点
      const parentMap = buildParentMap();
      const nodeId = Number(node.key);
      const parentIds = getAllParentIds(nodeId, parentMap);
      console.log('需要一并选中的父节点:', parentIds);

      // 将父节点ID添加到选中的keys中
      newKeys = [...new Set([...newKeys, ...parentIds])];
      console.log('更新后的选中节点:', newKeys);

      // 更新选中的权限列表
      setSelectedPermissions(newKeys);
    } else {
      // 正常取消选中操作
      setSelectedPermissions(keys.map(key => Number(key)));
    }
  };

  // 表格列定义
  const getColumns = () => {
    // 基础列定义
    const baseColumns: any[] = [
      {
        title: '角色名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '角色编码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (timestamp: number) => formatTimestamp(timestamp),
      },
    ];

    // 如果用户有任何操作权限，添加操作列
    if (hasAnyActionPermission()) {
      baseColumns.push({
        title: '操作',
        key: 'action',
        render: (_: any, record: Role) => (
          <Space>
            <PermissionButton permissionCode="system:role:edit">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record.id)}
              >
                编辑
              </Button>
            </PermissionButton>

            <PermissionButton permissionCode="system:role:delete">
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
          <Form.Item name="name" label="角色名称">
            <Input placeholder="请输入角色名称" allowClear />
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
            <PermissionButton permissionCode="system:role:add">
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
          dataSource={roleList}
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
          form={roleForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            label="权限"
            required
          >
            <Card style={{ maxHeight: 400, overflow: 'auto' }}>
              <Tree
                checkable
                checkedKeys={selectedPermissions}
                onCheck={handlePermissionChange}
                checkStrictly={true} // 设置为true，表示父子节点选中状态不关联，可以单独选择
                autoExpandParent={true} // 自动展开父节点
                defaultExpandAll={true} // 默认展开所有节点
                treeData={permissionTree.map(p => ({
                  title: `${p.name} (ID: ${p.id})`,
                  key: p.id,
                  children: p.children?.map(c => ({
                    title: `${c.name} (ID: ${c.id})`,
                    key: c.id,
                    children: c.children?.map(cc => ({
                      title: `${cc.name} (ID: ${cc.id})`,
                      key: cc.id,
                    })),
                  })),
                }))}
              />
            </Card>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleList;
