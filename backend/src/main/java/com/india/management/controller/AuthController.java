package com.india.management.controller;

import com.india.management.dto.ChangePasswordRequest;
import com.india.management.dto.LoginRequest;
import com.india.management.dto.RegisterRequest;
import com.india.management.dto.UpdateUserRequest;
import com.india.management.entity.User;
import com.india.management.exception.ValidationException;
import com.india.management.service.AuthService;
import com.india.management.service.UserService;
import com.india.management.vo.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ApiResponse<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        Map<String, Object> result = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return ApiResponse.success(result);
    }

    @PostMapping("/register")
    public ApiResponse<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        // 检查用户名是否已存在
        User existingUser = userService.getUserByUsername(registerRequest.getUsername());
        if (existingUser != null) {
            throw new ValidationException("用户名已存在");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setEmail(registerRequest.getEmail());
        user.setFullName(registerRequest.getFullName());
        user.setEnabled(true);

        User createdUser = userService.createUser(user);
        return ApiResponse.success(createdUser);
    }

    @GetMapping("/me")
    public ApiResponse<?> getCurrentUser() {
        // 使用HashMap代替Map.of()，避免空指针异常
        Map<String, Object> result = new HashMap<>();
        result.put("user", authService.getCurrentUser());
        result.put("permissions", authService.getCurrentUserPermissions());
        return ApiResponse.success(result);
    }

    @PutMapping("/me")
    public ApiResponse<?> updateCurrentUser(@Valid @RequestBody UpdateUserRequest updateUserRequest) {
        User updatedUser = authService.updateCurrentUser(updateUserRequest);
        return ApiResponse.success(updatedUser);
    }

    @PutMapping("/password")
    public ApiResponse<?> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        boolean result = authService.changePassword(changePasswordRequest);
        return ApiResponse.success(result);
    }
}
