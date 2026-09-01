// spec: tests/validation/test-plan.md § AC-008-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { addManualBook, openBookByTitle } from "../lib/catalog";

test("AC-008-a: removing a book takes it out of the shared catalog for every member", async ({
  page,
}) => {
  const title = `AC-008-a Book ${Date.now()}`;

  // 1. Log in and add a book
  await login(page);
  await addManualBook(page, title, "Author");
  await expect(page.getByRole("row").filter({ hasText: title })).toBeVisible();

  // 2. Open it and remove it from the catalog
  await openBookByTitle(page, title);
  await page.getByRole("button", { name: "Remove from catalog" }).click();

  // 3. Assert it is gone from the shared catalog
  await expect(page.getByRole("heading", { name: "Shared Catalog" })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: title })).not.toBeVisible();
});
