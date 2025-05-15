package com.india.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("sys_permission")
public class Permission {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String code; // 权限编码，例如：system:user:add

    private String name; // 权限名称，例如：添加用户

    private String description; // 权限描述

    private String type; // 权限类型：menu（菜单）、button（按钮）

    private String path; // 前端路由路径，如果是菜单权限

    private String component; // 前端组件路径，如果是菜单权限

    private String icon; // 图标，如果是菜单权限

    private Integer sort; // 排序

    private Long parentId; // 父权限ID，用于构建权限树

    @TableField(fill = FieldFill.INSERT)
    private Long createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private List<Permission> children;
}
