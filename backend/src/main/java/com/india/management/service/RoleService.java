package com.india.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.india.management.entity.Permission;
import com.india.management.entity.Role;
import com.india.management.entity.RolePermission;
import com.india.management.mapper.PermissionMapper;
import com.india.management.mapper.RoleMapper;
import com.india.management.mapper.RolePermissionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleService extends ServiceImpl<RoleMapper, Role> {

    private final PermissionMapper permissionMapper;
    private final RolePermissionMapper rolePermissionMapper;

    /**
     * 创建角色
     */
    @Transactional
    public Role createRole(Role role) {
        // 保存角色
        save(role);

        // 保存角色权限关系
        if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
            role.getPermissions().forEach(permission -> {
                RolePermission rolePermission = new RolePermission();
                rolePermission.setRoleId(role.getId());
                rolePermission.setPermissionId(permission.getId());
                rolePermissionMapper.insert(rolePermission);
            });
        }

        return role;
    }

    /**
     * 更新角色
     */
    @Transactional
    public Role updateRole(Role role) {
        log.info("更新角色: {}", role);

        // 更新角色基本信息
        updateById(role);

        // 如果前端传递了权限ID列表，则更新角色权限关系
        if (role.getPermissionIds() != null && !role.getPermissionIds().isEmpty()) {
            log.info("前端传递的权限IDs: {}", role.getPermissionIds());

            // 1. 获取角色当前的权限ID集合
            List<Permission> currentPermissions = permissionMapper.selectPermissionsByRoleId(role.getId());
            Set<Long> currentPermissionIds = currentPermissions.stream()
                    .map(Permission::getId)
                    .collect(Collectors.toSet());

            log.info("角色当前权限IDs: {}", currentPermissionIds);

            // 2. 计算需要新增的权限
            Set<Long> permissionsToAdd = new HashSet<>(role.getPermissionIds());
            permissionsToAdd.removeAll(currentPermissionIds);
            log.info("需要新增的权限IDs: {}", permissionsToAdd);

            // 3. 计算需要删除的权限
            Set<Long> permissionsToRemove = new HashSet<>(currentPermissionIds);
            permissionsToRemove.removeAll(role.getPermissionIds());
            log.info("需要删除的权限IDs: {}", permissionsToRemove);

            // 4. 删除需要移除的权限
            if (!permissionsToRemove.isEmpty()) {
                LambdaQueryWrapper<RolePermission> removeWrapper = new LambdaQueryWrapper<>();
                removeWrapper.eq(RolePermission::getRoleId, role.getId())
                        .in(RolePermission::getPermissionId, permissionsToRemove);
                int removeCount = rolePermissionMapper.delete(removeWrapper);
                log.info("删除角色权限关系: 角色ID={}, 删除数量={}", role.getId(), removeCount);
            }

            // 5. 添加新的权限
            if (!permissionsToAdd.isEmpty()) {
                for (Long permissionId : permissionsToAdd) {
                    RolePermission rolePermission = new RolePermission();
                    rolePermission.setRoleId(role.getId());
                    rolePermission.setPermissionId(permissionId);
                    rolePermissionMapper.insert(rolePermission);
                    log.info("添加角色权限关系: 角色ID={}, 权限ID={}", role.getId(), permissionId);
                }
            }
        } else if (role.getPermissions() != null) {
            // 兼容旧的方式，如果传递了permissions对象数组
            log.info("使用旧方式更新权限，权限数量: {}", role.getPermissions().size());

            // 删除原有权限关系
            LambdaQueryWrapper<RolePermission> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(RolePermission::getRoleId, role.getId());
            int deleteCount = rolePermissionMapper.delete(wrapper);
            log.info("删除角色权限关系: 角色ID={}, 删除数量={}", role.getId(), deleteCount);

            // 添加新的权限关系
            role.getPermissions().forEach(permission -> {
                log.info("添加角色权限关系: 角色ID={}, 权限ID={}", role.getId(), permission.getId());
                RolePermission rolePermission = new RolePermission();
                rolePermission.setRoleId(role.getId());
                rolePermission.setPermissionId(permission.getId());
                rolePermissionMapper.insert(rolePermission);
            });
        }

        return role;
    }

    /**
     * 分页查询角色列表
     */
    public Page<Role> getRolePage(int current, int size, String name) {
        Page<Role> page = new Page<>(current, size);
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            wrapper.like(Role::getName, name);
        }
        return page(page, wrapper);
    }

    /**
     * 获取角色详情
     */
    public Role getRoleDetail(Long id) {
        log.info("获取角色详情: ID={}", id);
        Role role = getById(id);
        if (role != null) {
            role.setPermissions(permissionMapper.selectPermissionsByRoleId(id));
            log.info("角色详情: {}, 权限数量: {}", role, role.getPermissions().size());
        } else {
            log.warn("未找到角色: ID={}", id);
        }
        return role;
    }

    /**
     * 删除角色
     */
    @Transactional
    public boolean deleteRole(Long id) {
        // 删除角色权限关系
        LambdaQueryWrapper<RolePermission> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RolePermission::getRoleId, id);
        rolePermissionMapper.delete(wrapper);

        // 删除角色
        return removeById(id);
    }

    /**
     * 获取所有角色
     */
    public List<Role> getAllRoles() {
        return list();
    }


}
