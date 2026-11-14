# 主站采用 Solid 2 RC 与 ui-sdk

主站 `apps/web` 使用 Solid 2.0 RC（`solid-js` / `@solidjs/web`）与 TanStack Start / Router / Query 的 Solid 适配，UI 原语采用 `@ui-sdk/solid` + `@ui-sdk/core`，业务样式封装在 `apps/web/src/ui/`。文档站 `apps/fumadocs` 继续使用 React / Fumadocs。原 `packages/ui`（React / shadcn / Base UI）已移除，连同 `@base-ui/react`、`@shadcn/react` 等仅为其服务的依赖。

选择 Solid 是为了在保持 TanStack Start SSR 与类型化路由的前提下，用更细粒度的响应模型替换 React 主站；ui-sdk 提供与框架对齐的无样式原语，避免再维护一份与主站无关的 React 组件库。未选继续 React + 共享 shadcn 包，也未把文档站一并迁到 Solid。
