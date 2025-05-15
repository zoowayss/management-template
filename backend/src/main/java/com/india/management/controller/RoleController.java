package com.india.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.india.management.entity.Role;
import com.india.management.service.RoleService;
import com.india.management.vo.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('system:role:list')")
    public ApiResponse<Page<Role>> getRolePage(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name) {
        Page<Role> page = roleService.getRolePage(current, size, name);
        return ApiResponse.success(page);
    }

    @GetMapping("/all")
    public ApiResponse<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return ApiResponse.success(roles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('system:role:query')")
    public ApiResponse<Role> getRoleDetail(@PathVariable Long id) {
        log.info("获取角色详情，ID: {}", id);
        Role role = roleService.getRoleDetail(id);
        log.info("角色详情: {}", role);
        return ApiResponse.success(role);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:role:add')")
    public ApiResponse<Role> createRole(@RequestBody Role role) {
        Role createdRole = roleService.createRole(role);
        return ApiResponse.success(createdRole);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:role:edit')")
    public ApiResponse<Role> updateRole(@PathVariable Long id, @RequestBody Role role) {
        log.info("更新角色，ID: {}, 角色数据: {}", id, role);
        role.setId(id);
        Role updatedRole = roleService.updateRole(role);
        log.info("更新后的角色: {}", updatedRole);
        return ApiResponse.success(updatedRole);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:role:delete')")
    public ApiResponse<Boolean> deleteRole(@PathVariable Long id) {
        boolean result = roleService.deleteRole(id);
        return ApiResponse.success(result);
    }
}
