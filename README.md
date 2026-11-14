# Org SaaS

多组织 SaaS 平台 Monorepo（Bun Workspaces）。主站为 TanStack Start + Solid 2；文档站为 Fumadocs（React）。

## 项目定位

| 端点       | 说明                         | 权限                        |
| ---------- | ---------------------------- | --------------------------- |
| **Admin**  | 系统管理员管理所有组织和用户 | 全局权限                    |
| **Org**    | 组织成员管理团队、成员、邀请 | Owner/Admin/Member 三级权限 |
| **Public** | 公开访问页面（落地页、关于） | 无需认证                    |

## 技术栈

- **主站**：TanStack Start / Router / Query（Solid 2.0 RC）+ `@ui-sdk/solid`
- **文档站**：Fumadocs + React + TanStack Start（React）
- **API**：oRPC（契约优先）+ Zod
- **认证**：Better Auth（Admin + Organization）
- **数据**：Drizzle ORM + PostgreSQL
- **工具**：Bun Workspaces、vite-plus（`check` / `fix` / `test`）
- **遗留**：`packages/ui`（React / shadcn），主站不再依赖

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 数据库设置

1. 确保 PostgreSQL 数据库已就绪
2. 在 `apps/web/.env` 中配置数据库连接字符串
3. 推送 schema 到数据库：

```bash
bun run db:push
```

### 3. 启动开发服务器

```bash
bun run dev:web
```

访问 [http://localhost:3001](http://localhost:3001) 查看应用。

## 项目结构

```
org-saas/
├── apps/
│   ├── web/              # 主站（Solid 2 + TanStack Start）
│   ├── fumadocs/         # 文档站（React / Fumadocs）
│   └── mini/             # 微信小程序骨架
├── packages/
│   ├── api/              # oRPC 契约与业务
│   ├── auth/             # Better Auth
│   ├── db/               # Drizzle 模型
│   ├── env/              # 环境变量校验
│   ├── config/           # 共享 TS 配置
│   └── ui/               # 遗留 React/shadcn（非主站路径）
├── docs/                 # 架构、ADR、实施计划
└── tests/                # 集中测试
```

## 详细文档

| 主题             | 文档                                                               |
| ---------------- | ------------------------------------------------------------------ |
| **架构设计**     | [架构文档与阅读导航](docs/architecture/README.md)                  |
| **权限实施计划** | [阶段、改动入口与验收场景](docs/implementation/permissions.md)     |
| **路由实施计划** | [Web 路由迁移、URL 兼容与验收](docs/implementation/web-routing.md) |
| **Agent 约定**   | [AGENTS.md](AGENTS.md)                                             |
| **Web App 开发** | [apps/web/AGENTS.md](apps/web/AGENTS.md)                           |
| **API 开发**     | [packages/api/AGENTS.md](packages/api/AGENTS.md)                   |
| **认证流程**     | [packages/auth/AGENTS.md](packages/auth/AGENTS.md)                 |
| **数据库**       | [packages/db/AGENTS.md](packages/db/AGENTS.md)                     |

## 常用命令

### 开发和构建

```bash
bun run dev              # 并行启动 web + fumadocs
bun run dev:web          # 仅主站
bun run build            # 构建 web + fumadocs
```

### 数据库操作

```bash
bun run db:push          # 推送 schema（开发环境）
bun run db:studio        # Drizzle Studio
bun run db:generate      # 生成迁移
bun run db:migrate       # 执行迁移
```

### 代码质量

```bash
bun run check            # 格式 / lint / 类型（只读）
bun run fix              # 自动修复格式与 lint
bun run test             # tests/ 行为测试
```

## 核心概念

- **类型安全**：oRPC 端到端契约
- **同构**：同一业务入口服务 SSR 与客户端
- **权限分层**：平台 Admin → 组织 → 成员；个人空间 `/me`，组织空间 `/org/$orgSlug`
- **多租户**：同一账号可加入多个组织，按 slug 进入工作空间

## 相关资源

- [TanStack Start](https://tanstack.com/start/latest)
- [Solid](https://www.solidjs.com/)
- [oRPC](https://orpc.unnoq.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/docs)
