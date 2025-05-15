package com.india.management.controller;

import com.india.management.entity.Permission;
import com.india.management.service.PermissionService;
import com.india.management.vo.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@Slf4j
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('system:permission:list')")
    public ApiResponse<List<Permission>> getPermissionTree() {
        List<Permission> permissionTree = permissionService.getPermissionTree();
        return ApiResponse.success(permissionTree);
    }

    @GetMapping("/menus")
    public ApiResponse<List<Permission>> getAllMenus() {
        List<Permission> menus = permissionService.getAllMenus();
        return ApiResponse.success(menus);
    }

    @GetMapping("/buttons")
    public ApiResponse<List<Permission>> getAllButtons() {
        List<Permission> buttons = permissionService.getAllButtons();
        return ApiResponse.success(buttons);
    }

    @GetMapping("/user/menus")
    public ApiResponse<List<Permission>> getUserMenus(@RequestParam Long userId) {
        List<Permission> menus = permissionService.getUserMenus(userId);
        return ApiResponse.success(menus);
    }

    @GetMapping("/user/buttons")
    public ApiResponse<List<Permission>> getUserButtons(@RequestParam Long userId) {
        List<Permission> buttons = permissionService.getUserButtons(userId);
        return ApiResponse.success(buttons);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:permission:add')")
    public ApiResponse<Permission> createPermission(@RequestBody Permission permission) {
        boolean result = permissionService.save(permission);
        return ApiResponse.success(permission);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:permission:edit')")
    public ApiResponse<Permission> updatePermission(@PathVariable Long id, @RequestBody Permission permission) {
        permission.setId(id);
        boolean ignore = permissionService.updateById(permission);
        return ApiResponse.success(permission);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:permission:delete')")
    public ApiResponse<Boolean> deletePermission(@PathVariable Long id) {
        log.info("接收到删除权限请求，ID: {}", id);
        boolean result = permissionService.deletePermissionWithChildren(id);
        return ApiResponse.success(result);
    }
}
