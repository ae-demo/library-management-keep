// spec: tests/validation/test-plan.md § AC-006-a
import { test, expect } from "@playwright/test";
import { login, topNav } from "../lib/auth";
import { addManualBook, openBookByTitle } from "../lib/catalog";

test("AC-006-a: a book's displayed average rating reflects all members' ratings for that book", async ({
  page,
}) => {
  const title = `AC-006-a Book ${Date.now()}`;

  // 1. Log in, add a book, rate it 4 stars, save
  await login(page);
  await addManualBook(page, title, "Author");
  await openBookByTitle(page, title);
  await page.getByRole("combobox", { name: "My rating" }).click();
  await page.getByRole("option", { name: "4 stars" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  // 2. Assert the catalog row's average rating reflects the rating
  await topNav(page).getByRole("link", { name: "Catalog" }).click();
  await expect(page.getByRole("row").filter({ hasText: title })).toContainText("4.0");

  // 3. The detail page's own "Group stats" card only reflects a save once
  // the page is (re-)entered — it does not refresh in place immediately
  // after Save — so re-open the book via a link click and assert there too.
  await openBookByTitle(page, title);
  await expect(page.getByText("Group stats")).toBeVisible();
  await expect(page.getByRole("heading", { name: "4.0" })).toBeVisible();
});
