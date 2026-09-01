// spec: tests/validation/test-plan.md § AC-003-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { addManualBook } from "../lib/catalog";

test("AC-003-a: the catalog view lists every book any member has added", async ({ page }) => {
  const marker = Date.now();
  const titleOne = `AC-003-a Book One ${marker}`;
  const titleTwo = `AC-003-a Book Two ${marker}`;

  // 1. Log in and add two distinct books
  await login(page);
  await addManualBook(page, titleOne, "Author One");
  await addManualBook(page, titleTwo, "Author Two");

  // 2. Assert both are listed in the shared catalog
  await expect(page.getByRole("row").filter({ hasText: titleOne })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: titleTwo })).toBeVisible();
});
