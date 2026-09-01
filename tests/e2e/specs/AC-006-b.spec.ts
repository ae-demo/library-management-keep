// spec: tests/validation/test-plan.md § AC-006-b
import { test, expect } from "@playwright/test";
import { login, topNav } from "../lib/auth";
import { addManualBook, openBookByTitle } from "../lib/catalog";

test("AC-006-b: a book's displayed read count reflects the number of members who marked it read", async ({
  page,
}) => {
  const title = `AC-006-b Book ${Date.now()}`;

  // 1. Log in, add a book, mark it read, save
  await login(page);
  await addManualBook(page, title, "Author");
  await openBookByTitle(page, title);
  await page.getByRole("switch", { name: "Read" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  // 2. Assert the catalog row's read count reflects it
  await topNav(page).getByRole("link", { name: "Catalog" }).click();
  const row = page.getByRole("row").filter({ hasText: title });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell").nth(3)).toHaveText("1");

  // 3. The detail page's own "Read by" card only reflects a save once the
  // page is (re-)entered — it does not refresh in place immediately after
  // Save — so re-open the book via a link click and assert there too.
  await openBookByTitle(page, title);
  await expect(page.getByText("Read by")).toBeVisible();
  await expect(page.getByRole("heading", { name: "1", exact: true })).toBeVisible();
});
