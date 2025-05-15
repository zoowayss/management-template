package com.india.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.india.management.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 根据用户名查询用户信息，包括角色和权限
     */
    User selectUserWithRolesByUsername(@Param("username") String username);
}
