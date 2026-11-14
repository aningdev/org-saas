## What this is

多组织 SaaS Monorepo（Bun Workspaces）。主站 Solid 2 + TanStack Start；文档站 React / Fumadocs。架构与词汇见 `docs/`，本文件只写 agent 在本仓怎么工作。

## Commands

从仓库根执行：

| 命令                                       | 作用                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `bun run check`                            | 根目录 Layout 校验 + 格式／lint／类型（只读）                         |
| `bun run fix`                              | 自动修复格式与 lint                                                   |
| `bun run test`                             | `tests/` 下服务端／工具行为测试（含 Postgres 用例，需库或由 CI 提供） |
| `bun run test:e2e`                         | Playwright 关键流程（自起临时 Postgres + 预览服务）                   |
| `bun run dev:web` / `bun run dev:fumadocs` | 本地开发                                                              |
| `bun run prepare`                          | 安装 Vite+ Git hook dispatcher（`vp config --no-agent`）              |

数据库脚本见根 `package.json` 的 `db:*`；细节以 [DB 约定](packages/db/AGENTS.md)为准。

## Working here

- **Issues / specs**：GitHub Issues，用 `gh`；仓库以当前 clone 的 `git remote` 为准（本仓为 `aningdev/org-saas`）。见 [issue-tracker](docs/agents/issue-tracker.md)。
- **Triage labels**：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。见 [triage-labels](docs/agents/triage-labels.md)。
- **语言**：回复与文档用简体中文；提交用 Conventional Commits（`feat:` / `fix:` / `refactor:` 等）。
- **暂存钩子**：`.vite-hooks/pre-commit` 跑 `vp staged`（配置在根 `vite.config.ts`）。新 clone 经 `bun install` → `prepare`（`vp config --no-agent`）安装 dispatcher；本机可用 `vp hooks enable` / `vp hooks status`。若 `core.hooksPath` 已被其他工具占用，`vp config` 会跳过，需在本机自行衔接或改回后再 enable。
- **领域文档入口**：[domain](docs/agents/domain.md)、[GLOSSARY-MAP.md](GLOSSARY-MAP.md)、系统级 ADR 在 [docs/adr/](docs/adr/)。

## Constraints

- 改某应用／包前，先读该目录 `AGENTS.md`（见下表）。
- 主站 UI 用 `@ui-sdk/solid`（封装在 `apps/web/src/ui/`）。有 `ui-sdk` skill 时先遵循；再读 `node_modules/@ui-sdk/solid/docs/llms.txt`，构建新组件时检索同目录 `core.md` / `rendering.md`。
- 业务 RPC 契约优先（oRPC + Zod），实现在 `@org-saas/api`；认证用 Better Auth；数据用 Drizzle。HTTP 入口只做协议接入，不写业务逻辑。
- 跨包只经 `@org-saas/*` 公开 exports；不引用其他包内部文件。
- 不放宽 TypeScript、不用 `any` 或 lint ignore／disable 规避问题；误报需说明证据。
- 自动化测试只覆盖明确业务风险或已知缺陷；文件一律放根 `tests/`。改测试前读 [测试规范](docs/agents/testing.md)。
- 破坏性／架构／新依赖／持久化数据变更：先确认方案；已授权不重复问。改动只覆盖任务需要的内容。

| 任务                          | 必读                                               |
| ----------------------------- | -------------------------------------------------- |
| 主站页面、路由、SSR、数据交互 | [apps/web/AGENTS.md](apps/web/AGENTS.md)           |
| 业务 RPC、服务端校验和错误    | [packages/api/AGENTS.md](packages/api/AGENTS.md)   |
| 认证、会话、组织插件和权限    | [packages/auth/AGENTS.md](packages/auth/AGENTS.md) |
| 数据模型、关系和库变更        | [packages/db/AGENTS.md](packages/db/AGENTS.md)     |
| 文档站                        | [apps/fumadocs/AGENTS.md](apps/fumadocs/AGENTS.md) |
| 微信小程序                    | [apps/mini/AGENTS.md](apps/mini/AGENTS.md)         |

框架细节用已安装技能（TanStack Solid、ui-sdk、Better Auth 等）；不可用时查官方文档。

## Where to read

- 领域词汇：[docs/GLOSSARY.md](docs/GLOSSARY.md)
- 架构约定：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)（Stack / Layout / Layers / Seams 见 [代码组织](docs/architecture/code-organization.md)）
- 决策记录：[docs/adr/](docs/adr/)
