package com.india.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.india.management.entity.Permission;
import com.india.management.mapper.PermissionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionService extends ServiceImpl<PermissionMapper, Permission> {

    private final PermissionMapper permissionMapper;

    /**
     * 获取权限树
     */
    public List<Permission> getPermissionTree() {
        // 获取所有权限
        List<Permission> allPermissions = list();

        // 构建树形结构
        return buildPermissionTree(allPermissions);
    }

    /**
     * 获取用户权限
     */
    public List<Permission> getUserPermissions(Long userId) {
        return permissionMapper.selectPermissionsByUserId(userId);
    }

    /**
     * 构建权限树
     */
    private List<Permission> buildPermissionTree(List<Permission> permissions) {
        // 按父ID分组
        Map<Long, List<Permission>> permissionMap = permissions.stream()
                .collect(Collectors.groupingBy(Permission::getParentId));

        // 设置子权限
        permissions.forEach(permission -> {
            permission.setChildren(permissionMap.getOrDefault(permission.getId(), new ArrayList<>()));
        });

        // 返回顶级权限
        return permissions.stream()
                .filter(permission -> permission.getParentId() == 0)
                .collect(Collectors.toList());
    }

    /**
     * 获取所有菜单权限
     */
    public List<Permission> getAllMenus() {
        LambdaQueryWrapper<Permission> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Permission::getType, "menu");
        wrapper.orderByAsc(Permission::getSort);
        return list(wrapper);
    }

    /**
     * 获取所有按钮权限
     */
    public List<Permission> getAllButtons() {
        LambdaQueryWrapper<Permission> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Permission::getType, "button");
        return list(wrapper);
    }

    /**
     * 根据用户ID获取菜单权限
     */
    public List<Permission> getUserMenus(Long userId) {
        List<Permission> permissions = permissionMapper.selectPermissionsByUserId(userId);
        return permissions.stream()
                .filter(permission -> "menu".equals(permission.getType()))
                .collect(Collectors.toList());
    }

    /**
     * 根据用户ID获取按钮权限
     */
    public List<Permission> getUserButtons(Long userId) {
        List<Permission> permissions = permissionMapper.selectPermissionsByUserId(userId);
        return permissions.stream()
                .filter(permission -> "button".equals(permission.getType()))
                .collect(Collectors.toList());
    }

    /**
     * 删除权限（包括子权限）
     *
     * @param id 权限ID
     * @return 是否删除成功
     */
    @Transactional
    public boolean deletePermissionWithChildren(Long id) {
        log.info("开始删除权限，ID: {}", id);

        // 查找所有子权限
        LambdaQueryWrapper<Permission> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Permission::getParentId, id);
        List<Permission> children = list(wrapper);

        // 递归删除子权限
        for (Permission child : children) {
            log.info("删除子权限，ID: {}", child.getId());
            deletePermissionWithChildren(child.getId());
        }

        // 删除当前权限
        log.info("删除当前权限，ID: {}", id);
        return removeById(id);
    }
}
