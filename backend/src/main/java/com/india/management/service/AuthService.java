package com.india.management.service;

import com.india.management.dto.ChangePasswordRequest;
import com.india.management.dto.UpdateUserRequest;
import com.india.management.entity.Permission;
import com.india.management.entity.User;
import com.india.management.exception.BusinessException;
import com.india.management.exception.ValidationException;
import com.india.management.mapper.UserMapper;
import com.india.management.security.JwtTokenProvider;
import com.india.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final PermissionService permissionService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    /**
     * 用户登录
     */
    public Map<String, Object> login(String username, String password) {
            // 检查用户是否存在
            User user = userMapper.selectUserWithRolesByUsername(username);
            if (user == null) {
                throw new BusinessException("用户不存在");
            }

            // 认证
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // 设置认证信息
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 生成JWT令牌
            String jwt = tokenProvider.generateToken(authentication);

            // 获取用户权限
            List<Permission> permissions = permissionService.getUserPermissions(user.getId());

            // 构建返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("token", jwt);
            result.put("user", user);
            result.put("permissions", permissions);

            return result;

    }

    /**
     * 获取当前登录用户
     */
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * 获取当前登录用户的权限
     */
    public List<Permission> getCurrentUserPermissions() {
        UserPrincipal userPrincipal = getCurrentUser();
        if (userPrincipal != null) {
            return permissionService.getUserPermissions(userPrincipal.getId());
        }
        return null;
    }

    /**
     * 更新当前用户信息
     */
    @Transactional
    public User updateCurrentUser(UpdateUserRequest updateUserRequest) {
        UserPrincipal userPrincipal = getCurrentUser();
        if (userPrincipal == null) {
            throw new BusinessException("用户未登录");
        }

        // 获取当前用户
        User user = userService.getById(userPrincipal.getId());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 更新用户信息
        user.setEmail(updateUserRequest.getEmail());
        user.setFullName(updateUserRequest.getFullName());

        // 保存更新
        userService.updateById(user);

        return user;
    }

    /**
     * 修改当前用户密码
     */
    @Transactional
    public boolean changePassword(ChangePasswordRequest changePasswordRequest) {
        UserPrincipal userPrincipal = getCurrentUser();
        if (userPrincipal == null) {
            throw new BusinessException("用户未登录");
        }

        // 获取当前用户
        User user = userService.getById(userPrincipal.getId());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 验证旧密码是否正确
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new ValidationException("旧密码不正确");
        }

        // 验证新密码与确认密码是否一致
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new ValidationException("新密码与确认密码不一致");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));

        // 保存更新
        return userService.updateById(user);
    }
}
