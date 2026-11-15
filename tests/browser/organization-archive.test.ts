import { randomUUID } from "node:crypto";

import { test, expect } from "../fixtures/browser";
import { signIn } from "../helpers/sign-in";

test("owner 归档组织后进入恢复页，恢复后可再次访问业务导航", async ({ page, account }) => {
  const slug = `browser-archive-${randomUUID()}`;
  const organizationName = `Browser archive ${slug}`;

  await signIn(page, account, "/me/organizations/new");
  await page.getByLabel("组织名称", { exact: true }).fill(organizationName);
  await page.getByLabel("Slug", { exact: true }).fill(slug);
  await page.getByRole("button", { name: "创建组织" }).click();
  await expect(page).toHaveURL((url) => url.pathname === `/org/${slug}`);
  await expect(page.getByRole("heading", { name: organizationName, exact: true })).toBeVisible();

  await page.getByRole("link", { name: "角色", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === `/org/${slug}/roles`);
  await expect(page.getByRole("heading", { name: "组织角色", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "设置", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === `/org/${slug}/settings`);
  await page.getByRole("button", { name: "归档组织", exact: true }).click();
  await page.getByRole("button", { name: "确认归档", exact: true }).click();

  await expect(page).toHaveURL((url) => url.pathname === `/org/${slug}/archived`);
  await expect(page.getByRole("heading", { name: "组织已归档", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "组织已归档", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "恢复组织", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === `/org/${slug}`);
  await expect(page.getByRole("heading", { name: organizationName, exact: true })).toBeVisible();
  await page.getByRole("link", { name: "成员", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === `/org/${slug}/members`);
});
