package com.india.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.india.management.entity.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RoleMapper extends BaseMapper<Role> {
    
    /**
     * 根据用户ID查询角色列表
     */
    List<Role> selectRolesByUserId(@Param("userId") Long userId);
    
    /**
     * 根据角色ID查询角色信息，包括权限
     */
    Role selectRoleWithPermissionsById(@Param("roleId") Long roleId);
}
