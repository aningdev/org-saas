# Web 应用约定

## 职责与入口

主站使用 TanStack Start / Router（Solid 2.0 RC）与 `@ui-sdk/solid`，承载公开页面、认证流程、个人中心和组织业务。

| 内容                         | 入口                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ |
| 路由与根布局                 | `src/routes/`、`src/routes/__root.tsx`                                         |
| Router 与 QueryClient 集成   | `src/router.tsx`、`src/utils/orpc.ts`                                          |
| 认证客户端与服务端会话       | `src/lib/auth-client.ts`、`src/functions/auth.fn.ts`、`src/middleware/auth.ts` |
| 页面守卫与组织上下文         | `src/utils/guards.ts`、`src/lib/org-context.ts`                                |
| 组织查询配置                 | `src/lib/query-options.ts`                                                     |
| 共享业务组件与错误页面       | `src/components/`、`src/components/fallback/`                                  |
| UI 封装（ui-sdk + Tailwind） | `src/ui/`                                                                      |

修改认证或权限相关代码前，读取 [Auth 约定](../../packages/auth/AGENTS.md)。调整页面加载、SSR 或组织上下文时，读取 [请求与数据流](../../docs/architecture/request-data-flow.md)。

## ui-sdk

使用 ui-sdk 前，若已安装 `ui-sdk` skill 则先遵循该 skill，并阅读 `node_modules/@ui-sdk/solid/docs/llms.txt`。要构建新组件时，再按标题检索 `node_modules/@ui-sdk/solid/docs/core.md`，并阅读同目录下的 `rendering.md`。

默认样式在入口 CSS 中优先导入：`@import "@ui-sdk/core/web.css"`（见 `src/index.css`）。业务侧优先组合 `src/ui/` 封装；需要新原语时从 `@ui-sdk/solid/<component>` 引入并在 `src/ui/` 中加 Tailwind 样式。

## 路由与服务端边界

- 路由树由 TanStack 工具生成，修改路由源文件，不手工编辑 `src/routeTree.gen.ts`。
- 路由专属组件放在同级 `-components/`，避免被识别为路由；跨页面组件放 `src/components/`。组件文件用 kebab-case，导出名用 PascalCase。
- 保持 SSR / 客户端边界：客户端组件不直接导入数据库、服务端环境变量或认证服务端实现。
- Server Functions 的认证中间件通过 `@org-saas/auth/session` 创建请求级 session getter；该模块仅在服务端入口使用，getter 不跨请求共享。
- 页面守卫：会话用 `requireSession`，平台用 `requirePlatformAdmin`，组织操作用 `requireOrgOperation`（资源名与 Better Auth 一致，如 `ac` / `member`）。不要用角色名字符串守卫动态角色。
- 组织突变优先 `authClient.organization.*` / `authClient.admin.*`，并**显式传 `organizationId`**；权限判定以 Better Auth `hasPermission` 为准。oRPC 仅用于 BA 没有的能力（按 slug 解析、access-context DTO、归档／恢复、审计列表、聚合查询）。
- 组织上下文入口：`src/routes/_authenticated/org/$orgSlug/route.tsx` 调 `client.organization.resolveBySlug`。不要在导航路径调用 `setActiveOrganization`（本仓将其视为写操作并串行化）。页面守卫不能替代服务端访问检查。
- `src/routes/api/` 负责 oRPC / Better Auth 的 HTTP 接入，业务处理放对应共享包。

## 数据交互与表单

- 业务 RPC 使用 `src/utils/orpc.ts` 提供的 `orpc` / `client`，不在组件中手写 `fetch` 调 RPC；认证及组织插件调用使用 `authClient`。
- 查询使用 `@tanstack/solid-query`：选项以 accessor 传入（如 `useQuery(() => ...)`）；路由主体数据由 `loader` 使用 `await ensureQueryData(...)` 预取；导航等待由路由 `pendingComponent` / `<Loading>` 处理。
- QueryClient 通过 `createHydrationOptions(rpcJsonSerializer)` 做 SSR 脱水／注水，与 `createTanstackQueryUtils` 共用同一 `RPCJsonSerializer`（见 `src/utils/rpc-json.ts`），以保留 `Date` 等非 JSON 类型。
- 查询配置集中复用；涉及组织的数据，查询键包含组织标识。变更成功后通过 `queryClient.invalidateQueries(...)` 更新受影响查询。
- 用户操作提供明确的等待、成功和失败反馈；适合即时提示的操作使用 `@/ui/toast`。
- Better Auth 操作检查返回值的 `error`；路由访问错误使用现有错误类型并交给 fallback，业务 RPC 按契约处理错误。
- 对话框由父级控制 `open` / `onOpenChange`（信号），操作成功通过回调协调关闭与查询失效。
- 表单使用 Solid 信号 + Zod `safeParse` 在提交时校验；业务 RPC 表单复用可共享的服务端输入 schema。参考 `src/components/sign-in-form.tsx`。

## UI 与验证

- 使用 Solid 2：`class`（非 `className`）、`for`（非 `htmlFor`）；列表与条件用 `<For>` / `<Show>`；异步边界用 `<Loading>`。
- 保持语义化元素、表单 label、列表稳定 key 和键盘可操作性。
- 完成页面改动后检查相关状态与交互；涉及路由、SSR 或客户端边界时，从仓库根运行 `vp run --filter web build` 或在 `apps/web` 运行 `bun run build`。
