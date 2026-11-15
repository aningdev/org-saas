import { setTimeout } from "node:timers/promises";

import type { Page } from "@playwright/test";

import { expect } from "../fixtures/browser";

type Credentials = { email: string; password: string };

/** Matches packages/auth `rateLimit.customRules["/sign-in/email"]`. */
const signInWindowMs = 60_000;
const signInMaxPerWindow = 5;
const signInCompletedAt: number[] = [];

async function waitForSignInRateLimitSlot() {
  // Shared IP bucket across serial Chromium workers in one e2e run.
  for (;;) {
    const now = Date.now();
    while (signInCompletedAt.length > 0 && now - signInCompletedAt[0]! >= signInWindowMs) {
      signInCompletedAt.shift();
    }
    if (signInCompletedAt.length < signInMaxPerWindow) return;
    const oldest = signInCompletedAt[0];
    if (oldest === undefined) return;
    await setTimeout(signInWindowMs - (now - oldest) + 50);
  }
}

export async function submitSignIn(page: Page, credentials: Credentials) {
  await page.getByRole("button", { name: "Already have an account? Sign In" }).click();
  await page.getByLabel("Email", { exact: true }).fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await waitForSignInRateLimitSlot();
  const responsePromise = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/auth/sign-in/email",
  );
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  const response = await responsePromise;
  signInCompletedAt.push(Date.now());
  expect(response.status(), "Signing in through the real application must succeed").toBe(200);
}

export async function signIn(page: Page, credentials: Credentials, target: string) {
  await page.goto(`/login?redirect=${encodeURIComponent(target)}`);
  await submitSignIn(page, credentials);
  await expect(page).toHaveURL((url) => url.pathname === target);
}
