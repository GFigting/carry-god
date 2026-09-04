---
name: "perm-template"
description: "管理和生成角色-菜单权限关联 SQL 模板。当用户需要将菜单/按钮权限分配给角色时调用此技能。"
---

# 权限模板技能

## 功能
生成 `system_role_menu` 权限关联 SQL，将菜单及其子按钮一次性分配给指定角色。配合 `menu-template` 使用：menu-template 创建菜单/按钮，perm-template 将菜单/按钮授权给角色。

## 核心规则
- 使用 `@role_code` 按角色标识查找角色 ID
- 使用 `@menu_component` 定位菜单（也可用 `@menu_permission`）
- **批量分配**：菜单及其所有子按钮一次性授权（`WHERE id = @menu_id OR parent_id = @menu_id`）
- 幂等插入：使用 `NOT EXISTS` 按 `(role_id, menu_id)` 去重
- 结果确认：输出角色+菜单+权限的关联视图
- 角色或菜单不存在时，`@role_id` / `@menu_id` 为 NULL，INSERT 不会执行

## SQL 规则
- 先查角色：`SELECT id FROM system_role WHERE code = @role_code AND deleted = b'0'`
- 再查菜单：`SELECT id FROM system_menu WHERE component = @menu_component AND deleted = b'0'`
- 批量 INSERT：`INSERT INTO system_role_menu SELECT @role_id, id, ... FROM system_menu WHERE (id = @menu_id OR parent_id = @menu_id) AND NOT EXISTS (...)`
- `tenant_id` 默认 `1`

## 模板
```sql
-- 角色-菜单权限分配
-- 使用前修改 @role_code 为目标角色标识，@menu_component 为目标菜单组件路径
SET @role_code := 'TODO_角色标识';
SET @menu_component := 'TODO_菜单组件路径';

-- 查角色
SELECT id, name, code, status
FROM system_role
WHERE code = @role_code AND deleted = b'0';

SET @role_id := (
    SELECT id FROM system_role
    WHERE code = @role_code AND deleted = b'0'
    LIMIT 1
);

-- 查菜单
SELECT id, name, permission, type, component
FROM system_menu
WHERE component = @menu_component AND deleted = b'0';

SET @menu_id := (
    SELECT id FROM system_menu
    WHERE component = @menu_component AND deleted = b'0'
    LIMIT 1
);

-- 分配菜单+子按钮给角色
INSERT INTO system_role_menu (role_id, menu_id, creator, create_time, updater, update_time, deleted, tenant_id)
SELECT @role_id, id, '1', NOW(), '1', NOW(), b'0', 1
FROM system_menu
WHERE deleted = b'0'
  AND (id = @menu_id OR parent_id = @menu_id)
  AND NOT EXISTS (
      SELECT 1 FROM system_role_menu
      WHERE role_id = @role_id AND menu_id = system_menu.id
  );

-- 结果确认
SELECT
    r.name AS 角色,
    r.code AS 角色标识,
    m.name AS 菜单,
    m.permission AS 权限标识,
    CASE m.type WHEN 1 THEN '目录' WHEN 2 THEN '菜单' WHEN 3 THEN '按钮' END AS 类型,
    m.sort AS 排序
FROM system_role_menu rm
JOIN system_role r ON r.id = rm.role_id
JOIN system_menu m ON m.id = rm.menu_id
WHERE rm.role_id = @role_id
  AND (m.id = @menu_id OR m.parent_id = @menu_id)
ORDER BY m.type, m.sort;
```

## 高级用法：按 permission 定位菜单

若菜单无 component（如纯目录），可用 `@menu_permission` 定位：

```sql
SET @menu_permission := 'TODO_菜单权限标识';

SET @menu_id := (
    SELECT id FROM system_menu
    WHERE permission = @menu_permission AND deleted = b'0'
    LIMIT 1
);
```

## 高级用法：多角色批量授权

同一菜单授权给多个角色时，将 `@role_code` 改为列表循环或逐个执行：

```sql
-- 角色1
SET @role_code := 'role_a';
-- ... 完整分配逻辑 ...

-- 角色2
SET @role_code := 'role_b';
-- ... 完整分配逻辑 ...
```

## 使用
1. 确认目标角色标识（`system_role.code`，如 `tenant_admin`）和菜单组件路径（`system_menu.component`，如 `fms/reconciliation/cost/index`）。
2. 替换模板中的 `@role_code` 和 `@menu_component`。
3. 生成 SQL。推荐与 menu SQL 合并为同一文件（见 `UTIL-SQL管理规范.md`）。
4. 在 SQL 文件末尾附带**注释掉的回滚 SQL**（DELETE `system_role_menu` 语句），供人工手动回滚测试。
5. 不执行 SQL，除非用户明确要求。
6. 回传文件路径和涉及的角色、菜单。

## 注意
- 先查项目实际 `system_role_menu` 表结构；字段不同则按项目结构调整。
- 权限分配只需对菜单（`type=2`）执行一次，子按钮会自动包含。
- 若只需单独分配某个按钮（不分配父菜单），直接查按钮 ID 后单条 INSERT。
- 同一角色对同一菜单的权限只需分配一次（NOT EXISTS 保证幂等）。
