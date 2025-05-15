package com.india.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.india.management.entity.Permission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PermissionMapper extends BaseMapper<Permission> {
    
    /**
     * 根据角色ID查询权限列表
     */
    List<Permission> selectPermissionsByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 根据用户ID查询权限列表
     */
    List<Permission> selectPermissionsByUserId(@Param("userId") Long userId);
    
    /**
     * 查询所有菜单权限，并构建树形结构
     */
    List<Permission> selectMenuTree();
}
