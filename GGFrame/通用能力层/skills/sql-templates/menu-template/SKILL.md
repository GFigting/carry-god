---
name: "menu-template"
description: "管理和生成菜单 SQL 模板。当用户需要创建或修改系统菜单、按钮权限、父级菜单关联 SQL 时调用此技能。"
---

# 菜单模板技能

## 功能
生成 `system_menu` 菜单 SQL，包含菜单和按钮权限。

## 核心规则
- 优先生成单个 SQL 文件，包含父级查询、菜单插入、按钮插入、结果确认。
- 不猜父级菜单 ID；让用户提供父级菜单名称。
- 使用 `@parent_name` 按 `name = @parent_name` 查询父级菜单。
- 新目录或菜单无父级时，允许 `@parent_name := NULL` 或空字符串，`parent_id` 使用 `0`。
- 顶级目录通常用 `type=1`、`parent_id=0`、`component=NULL`，路径按项目约定使用 `/xxx` 或 `xxx`。
- 若父级名称可能重复，脚本先输出查询结果；默认取 `id` 最小的一条。
- 不自动创建父级菜单，除非用户明确要求。
- 插入语句要幂等：使用 `WHERE NOT EXISTS` 防重复。
- 菜单、按钮都写全 `visible/keep_alive/always_show/creator/create_time/updater/update_time/deleted` 等字段，除非项目表结构不同。
- 非自动迁移脚本不要使用 Flyway `V*` 文件名；若仓库忽略非 `V*` SQL，需要同步调整 `.gitignore` 或按项目规则命名。

## 字段说明
- `name`：菜单/按钮名称
- `permission`：权限标识；按钮必填，菜单可放查询权限
- `type`：类型；`1=目录`、`2=菜单`、`3=按钮`
- `sort`：显示顺序
- `parent_id`：父菜单 ID
- `path`：路由路径
- `icon`：图标
- `component`：组件路径
- `component_name`：组件名称，仅菜单需要
- `status`：状态，`0=启用`

## 推荐模板
```sql
-- 使用前修改 @parent_name 为父级菜单名称，例如：对账管理。
-- 若新增顶级目录或菜单无父级，设置为 NULL 或空字符串，parent_id 自动使用 0。
SET @parent_name := 'TODO_父级菜单名称';

-- 父级查询
SELECT id, name, type, sort, parent_id, path, component, component_name
FROM system_menu
WHERE deleted = b'0'
  AND type IN (1, 2)
  AND @parent_name IS NOT NULL
  AND @parent_name <> ''
  AND name = @parent_name
ORDER BY id;

SET @parent_id := IF(
    @parent_name IS NULL OR @parent_name = '',
    0,
    (
        SELECT id
        FROM system_menu
        WHERE deleted = b'0'
          AND type IN (1, 2)
          AND name = @parent_name
        ORDER BY id
        LIMIT 1
    )
);

-- 菜单
INSERT INTO system_menu (
    name, permission, type, sort, parent_id,
    path, icon, component, component_name, status,
    visible, keep_alive, always_show,
    creator, create_time, updater, update_time, deleted
)
SELECT
    '菜单名称', 'module:resource:query', 2, 10, @parent_id,
    'route-path', 'ep:menu', 'module/resource/index', 'ComponentName', 0,
    b'1', b'1', b'1',
    '1', NOW(), '1', NOW(), b'0'
WHERE @parent_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM system_menu
      WHERE deleted = b'0'
        AND parent_id = @parent_id
        AND (component = 'module/resource/index' OR permission = 'module:resource:query' OR name = '菜单名称')
  );

SET @menu_id := (
    SELECT id
    FROM system_menu
    WHERE deleted = b'0'
      AND component = 'module/resource/index'
    ORDER BY id DESC
    LIMIT 1
);

-- 按钮
INSERT INTO system_menu (
    name, permission, type, sort, parent_id,
    path, icon, component, component_name, status,
    visible, keep_alive, always_show,
    creator, create_time, updater, update_time, deleted
)
SELECT
    '菜单查询', 'module:resource:query', 3, 1, @menu_id,
    '', '', '', NULL, 0,
    b'1', b'1', b'1',
    '1', NOW(), '1', NOW(), b'0'
WHERE @menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM system_menu
      WHERE deleted = b'0'
        AND parent_id = @menu_id
        AND permission = 'module:resource:query'
  );

-- 结果确认
SELECT id, name, permission, type, sort, parent_id, path, icon, component, component_name, status
FROM system_menu
WHERE deleted = b'0'
  AND (id = @menu_id OR parent_id = @menu_id)
ORDER BY type, sort, id;
```

## 使用
1. 确认菜单名称、路由、组件、组件名、按钮权限。
2. 让用户提供父级菜单名称；无父级时设置 `@parent_name := NULL`。
3. 生成单文件 SQL。
4. 在 SQL 文件末尾附带**注释掉的回滚 SQL**（DELETE 语句，按先子后父顺序：按钮→菜单），供人工手动回滚测试。
5. 不执行 SQL，除非用户明确要求。
6. 回传文件路径和需要填写的变量。

## 注意
- 先查项目实际 `system_menu` 表结构；字段不同则按项目结构调整。
- 权限标识使用模块前缀，如 `fms:cost:query`。
- 按钮类型不需要组件名，`component_name` 用 `NULL`。
- 父级没找到时，`@parent_id` 为 `NULL`，插入不会发生；无父级时 `@parent_id = 0`，可插入顶级目录或菜单。
