// spec: tests/validation/test-plan.md § AC-007-c
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { addManualBook, openBookByTitle } from "../lib/catalog";

test("AC-007-c: filtering by the caller's own rating narrows the catalog to books matching that rating", async ({
  page,
}) => {
  const title = `AC-007-c Unique Title ${Date.now()}`;

  // 1. Log in, add a book, and rate it 5 stars
  await login(page);
  await addManualBook(page, title, "Author Seven C");
  await openBookByTitle(page, title);
  await page.getByRole("combobox", { name: "My rating" }).click();
  await page.getByRole("option", { name: "5 stars" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await page.getByRole("navigation", { name: "Top navigation" }).getByRole("link", { name: "Catalog" }).click();

  // 2. Filter by this run's title, then filter rating to a non-matching value
  await page.getByRole("textbox", { name: "Search by title or author" }).fill(title);
  await expect(page.getByRole("row").filter({ hasText: title })).toBeVisible();
  await page.getByRole("combobox", { name: "My rating" }).click();
  await page.getByRole("option", { name: "4 stars" }).click();

  // 3. Assert the 5-star book no longer matches the 4-star filter
  await expect(page.getByRole("heading", { name: "No books match your filters" })).toBeVisible();
});
