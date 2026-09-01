// spec: tests/validation/test-plan.md § AC-005-a
import { test, expect } from "@playwright/test";
import { login, topNav } from "../lib/auth";
import { addManualBook, openBookByTitle } from "../lib/catalog";

test("AC-005-a: a member can set a rating between 1 and 5 stars on a book", async ({ page }) => {
  const title = `AC-005-a Book ${Date.now()}`;

  // 1. Log in, add a book, open its detail page
  await login(page);
  await addManualBook(page, title, "Author");
  await openBookByTitle(page, title);

  // 2. Set a rating within range and save
  await page.getByRole("combobox", { name: "My rating" }).click();
  await page.getByRole("option", { name: "4 stars" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  // 3. Navigate away and back (link clicks) to confirm persistence
  await topNav(page).getByRole("link", { name: "Catalog" }).click();
  await openBookByTitle(page, title);
  await expect(page.getByRole("combobox", { name: "My rating" })).toHaveText("4 stars");
});
