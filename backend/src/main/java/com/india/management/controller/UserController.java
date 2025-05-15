package com.india.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.india.management.entity.User;
import com.india.management.service.UserService;
import com.india.management.vo.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('system:user:list')")
    public ApiResponse<Page<User>> getUserPage(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String username) {
        Page<User> page = userService.getUserPage(current, size, username);
        return ApiResponse.success(page);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:query')")
    public ApiResponse<User> getUserDetail(@PathVariable Long id) {
        User user = userService.getUserDetail(id);
        return ApiResponse.success(user);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:user:add')")
    public ApiResponse<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ApiResponse.success(createdUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:edit')")
    public ApiResponse<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        User updatedUser = userService.updateUser(user);
        return ApiResponse.success(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:delete')")
    public ApiResponse<Boolean> deleteUser(@PathVariable Long id) {
        boolean result = userService.deleteUser(id);
        return ApiResponse.success(result);
    }
}
