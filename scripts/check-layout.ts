#!/usr/bin/env bun
/**
 * Fail when a non-hidden top-level directory is not listed in Layout.
 * Keep ALLOWED_ROOT_DIRS in sync with docs/architecture/code-organization.md ## Layout.
 *
 * Hidden dirs (`.…`) are not enforced here except project-owned ones listed in docs;
 * editor / agent local dirs (e.g. `.vscode`) may exist without failing check.
 */
import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ALLOWED_ROOT_DIRS = new Set(["apps", "docs", "node_modules", "packages", "scripts", "tests"]);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const unexpected: string[] = [];

for (const name of readdirSync(root)) {
  if (name.startsWith(".")) continue;
  if (!statSync(join(root, name)).isDirectory()) continue;
  if (ALLOWED_ROOT_DIRS.has(name)) continue;
  unexpected.push(name);
}

if (unexpected.length > 0) {
  console.error(
    [
      "Unexpected top-level directories (not in Layout allowlist):",
      ...unexpected.map((name) => `  - ${name}`),
      "",
      "Add the directory to docs/architecture/code-organization.md ## Layout",
      "and to ALLOWED_ROOT_DIRS in scripts/check-layout.ts, or remove it.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("Layout check passed.");
