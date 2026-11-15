# 部署运维清单

上线前与日常维护共用。权限代码已完成；**目标库 schema 应用与存量授权处置仍须维护者先点名连接目标**（见 [#24](https://github.com/aningdev/org-saas/issues/24) / [#30](https://github.com/aningdev/org-saas/issues/30)）。

## 1. 环境变量

| 变量                         | 必需         | 说明                                                  |
| ---------------------------- | ------------ | ----------------------------------------------------- |
| `DATABASE_URL`               | 是           | `postgres://` 或 `postgresql://`                      |
| `BETTER_AUTH_SECRET`         | 是           | ≥32 字符；各环境独立                                  |
| `BETTER_AUTH_URL`            | 是           | 对外可达的应用根 URL（含协议）                        |
| `CORS_ORIGIN`                | 是           | 可信前端 Origin，与 Auth `trustedOrigins` 一致        |
| `RESEND_API_KEY`             | 邮件流       | 配置后才真正发信                                      |
| `EMAIL_FROM`                 | 邮件流       | 已验证发件地址，如 `Org SaaS <noreply@example.com>`   |
| `REQUIRE_EMAIL_VERIFICATION` | 否           | `true` 时且邮件已配置，才拦截未验证邮箱登录；默认关闭 |
| `AUTH_TRUSTED_PROXIES`       | 反代后       | 逗号分隔可信代理 IP／CIDR，用于解析真实客户端 IP      |
| `PLATFORM_ADMIN_BOOTSTRAP_*` | 仅 bootstrap | 见下一节                                              |
| `LOG_LEVEL` / `NODE_ENV`     | 否           | 默认值见 `packages/env`；对外部署用 `production`／`prod` |

Auth 限流在 `NODE_ENV !== "test"` 时显式开启，使用 **database** 存储（`rateLimit` 表），与 oRPC 进程内 `MemoryRateLimiter` 无关。`advanced.ipAddress` 读取 `x-forwarded-for`／`x-real-ip`／`cf-connecting-ip`；解析不到客户端 IP 时 Better Auth **不会跳过**限流，而是落到共享 per-path 桶。反向代理后务必配置 `AUTH_TRUSTED_PROXIES`，否则多跳 XFF 不会被采信。IP 轮换仍可绕过按 IP 分桶；邮件滥发需另配 CAPTCHA／供应商限额。

## 2. Schema 与存量盘点（人工门禁）

1. 维护者在 issue 中点名目标（例如「仅本地 Docker `org_saas_dev`」或预发连接名），**不要**把开发库当生产。
2. 在该目标上只读盘点：

```sh
DATABASE_URL=postgres://… vp run --filter @org-saas/auth inventory:auth
```

3. 审阅 JSON：`org.owner.missing` / `org.owner.multiple` / `member.multi-role` 为 error；处置方案确认后再改数据。
4. 开发库可用 `vp run db:push`；需迁移交付时用 `db:generate` → 审阅 → 已确认环境 `db:migrate`。Agent 不得对未点名目标执行 push/migrate。

## 3. 首位平台管理员

```sh
DATABASE_URL=… \
PLATFORM_ADMIN_BOOTSTRAP_USER_ID=… \
PLATFORM_ADMIN_BOOTSTRAP_USER_EMAIL=… \
PLATFORM_ADMIN_BOOTSTRAP_CONFIRM=INITIALIZE_PLATFORM_ADMIN \
vp run --filter @org-saas/auth bootstrap:platform-admin
```

目标用户须：ID 与邮箱匹配、`emailVerified`、未封禁、当前角色为默认 `user`；已有其他平台管理员时拒绝。无 HTTP／界面授予入口。

## 4. 审计保留

```sh
vp run audit:prune
```

删除发生时间早于 180 天的审计行。部署环境应配置为**每日**调度。细节见 [审计记录](audit.md)。

## 5. 上线后冒烟

优先跑 Playwright 关键路径（隔离库，不碰业务库）：

```sh
bun run test:e2e
```

覆盖登录回跳、邀请入组、工作区隔离、组织归档／恢复等；见 [测试规范](../agents/testing.md)。

## 6. 邮件能力开关

- 未设 `RESEND_API_KEY` / `EMAIL_FROM`：事务邮件静默跳过（不写收件人／正文／token 到日志，也不向客户端抛导致枚举账号的错误）。重置／验证在无邮件时不会真正送达。
- 设好邮件后再视需要打开 `REQUIRE_EMAIL_VERIFICATION=true`。
- 密码重置成功后会 `revokeSessionsOnPasswordReset`，吊销该用户既有会话。
- 密码重置页：`/forgot-password`、`/reset-password`。
