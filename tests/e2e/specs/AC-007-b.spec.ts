// spec: tests/validation/test-plan.md § AC-007-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { addManualBook, openBookByTitle } from "../lib/catalog";

test("AC-007-b: filtering by the caller's own read status narrows the catalog to books matching that status", async ({
  page,
}) => {
  const title = `AC-007-b Unique Title ${Date.now()}`;

  // 1. Log in, add a book, and mark it Read
  await login(page);
  await addManualBook(page, title, "Author Seven B");
  await openBookByTitle(page, title);
  await page.getByRole("switch", { name: "Read" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await page.getByRole("navigation", { name: "Top navigation" }).getByRole("link", { name: "Catalog" }).click();

  // 2. Filter by this run's title, then filter read status to Unread
  await page.getByRole("textbox", { name: "Search by title or author" }).fill(title);
  await expect(page.getByRole("row").filter({ hasText: title })).toBeVisible();
  await page.getByRole("combobox", { name: "Read status" }).click();
  await page.getByRole("option", { name: "Unread" }).click();

  // 3. Assert the Read book no longer matches the Unread filter
  await expect(page.getByRole("heading", { name: "No books match your filters" })).toBeVisible();
});
