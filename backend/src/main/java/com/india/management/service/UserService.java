package com.india.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.india.management.entity.User;
import com.india.management.entity.UserRole;
import com.india.management.mapper.RoleMapper;
import com.india.management.mapper.UserMapper;
import com.india.management.mapper.UserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService extends ServiceImpl<UserMapper, User> {

    private final RoleMapper roleMapper;
    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 根据用户名查询用户
     */
    public User getUserByUsername(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        return getOne(wrapper);
    }

    /**
     * 创建用户
     */
    @Transactional
    public User createUser(User user) {
        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 保存用户
        save(user);
        // 保存用户角色关系
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            user.getRoles().forEach(role -> {
                UserRole userRole = new UserRole();
                userRole.setUserId(user.getId());
                userRole.setRoleId(role.getId());
                userRoleMapper.insert(userRole);
            });
        }
        return user;
    }

    /**
     * 更新用户
     */
    @Transactional
    public User updateUser(User user) {
        // 如果密码不为空，则加密密码
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            // 不更新密码
            user.setPassword(null);
        }
        // 更新用户
        updateById(user);
        
        // 如果角色不为空，则更新用户角色关系
        if (user.getRoles() != null) {
            // 删除原有角色关系
            LambdaQueryWrapper<UserRole> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(UserRole::getUserId, user.getId());
            userRoleMapper.delete(wrapper);
            
            // 添加新的角色关系
            user.getRoles().forEach(role -> {
                UserRole userRole = new UserRole();
                userRole.setUserId(user.getId());
                userRole.setRoleId(role.getId());
                userRoleMapper.insert(userRole);
            });
        }
        
        return user;
    }

    /**
     * 分页查询用户列表
     */
    public Page<User> getUserPage(int current, int size, String username) {
        Page<User> page = new Page<>(current, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (username != null && !username.isEmpty()) {
            wrapper.like(User::getUsername, username);
        }
        Page<User> userPage = page(page, wrapper);
        
        // 查询用户角色
        userPage.getRecords().forEach(user -> {
            user.setRoles(roleMapper.selectRolesByUserId(user.getId()));
        });
        
        return userPage;
    }

    /**
     * 获取用户详情
     */
    public User getUserDetail(Long id) {
        User user = getById(id);
        if (user != null) {
            user.setRoles(roleMapper.selectRolesByUserId(id));
        }
        return user;
    }

    /**
     * 删除用户
     */
    @Transactional
    public boolean deleteUser(Long id) {
        // 删除用户角色关系
        LambdaQueryWrapper<UserRole> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserRole::getUserId, id);
        userRoleMapper.delete(wrapper);
        
        // 删除用户
        return removeById(id);
    }
}
