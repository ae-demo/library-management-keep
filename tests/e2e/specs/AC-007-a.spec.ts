// spec: tests/validation/test-plan.md § AC-007-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { addManualBook } from "../lib/catalog";

test("AC-007-a: filtering by title or author narrows the catalog to matching books", async ({
  page,
}) => {
  const title = `AC-007-a Unique Title ${Date.now()}`;

  // 1. Log in and add a uniquely titled book
  await login(page);
  await addManualBook(page, title, "Author Seven A");

  // 2. Filter the catalog by that title
  await page.getByRole("textbox", { name: "Search by title or author" }).fill(title);

  // 3. Assert only the matching row remains in the table body
  const dataRows = page.getByRole("table").getByRole("rowgroup").nth(1).getByRole("row");
  await expect(dataRows).toHaveCount(1);
  await expect(dataRows.first()).toContainText(title);
});
