// spec: tests/validation/test-plan.md § AC-004-a
import { test, expect } from "@playwright/test";
import { login, topNav } from "../lib/auth";
import { addManualBook, openBookByTitle } from "../lib/catalog";

test("AC-004-a: marking a book read updates that member's own read status on the book", async ({
  page,
}) => {
  const title = `AC-004-a Book ${Date.now()}`;

  // 1. Log in, add a book, open its detail page
  await login(page);
  await addManualBook(page, title, "Author");
  await openBookByTitle(page, title);

  // 2. Toggle Read on and save
  await page.getByRole("switch", { name: "Read" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  // 3. Navigate away and back (link clicks, never reload) to confirm persistence
  await topNav(page).getByRole("link", { name: "Catalog" }).click();
  await expect(page.getByRole("row").filter({ hasText: title })).toContainText("Read");
  await openBookByTitle(page, title);
  await expect(page.getByRole("switch", { name: "Read" })).toBeChecked();
});
