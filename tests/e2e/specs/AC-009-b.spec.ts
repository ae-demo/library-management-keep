// spec: tests/validation/test-plan.md § AC-009-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { addManualBook } from "../lib/catalog";

test("AC-009-b: submitting manually entered title and author adds the book to the shared catalog", async ({
  page,
}) => {
  const title = `AC-009-b Manual Book ${Date.now()}`;
  const author = "Manual Author";

  // 1. Log in and submit a manual entry
  await login(page);
  await addManualBook(page, title, author);

  // 2. Assert it is listed in the shared catalog
  const row = page.getByRole("row").filter({ hasText: title });
  await expect(row).toBeVisible();
  await expect(row).toContainText(author);
});
