// spec: tests/validation/test-plan.md § AC-002-c
import { test, expect } from "@playwright/test";
import { login, topNav } from "../lib/auth";

test("AC-002-c: selecting a candidate match adds a book to the shared catalog with its looked-up details populated", async ({
  page,
}) => {
  // The book-lookup proxies a third-party API observed live taking well
  // over the default 30s test timeout; extend it for this spec only.
  test.setTimeout(60000);
  // 1. Log in, search, and select a candidate match
  await login(page);
  await topNav(page).getByRole("link", { name: "Add Book" }).click();
  await page.getByRole("textbox", { name: "Search by title or ISBN" }).fill("Dune");
  await page.getByRole("button", { name: "Search" }).click();
  await page
    .getByRole("list", { name: "Matches" })
    .getByRole("button", { name: "Dune Frank Herbert", exact: true })
    .click({ timeout: 30000 });
  // 2. Confirm and add to catalog
  await expect(page.getByRole("heading", { name: "Confirm Book" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dune", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add to Catalog" }).click();
  // 3. Open the newly added book from the catalog
  await expect(page.getByRole("heading", { name: "Shared Catalog" })).toBeVisible();
  await page
    .getByRole("row")
    .filter({ hasText: "Dune" })
    .filter({ hasText: "Frank Herbert" })
    .first()
    .getByRole("link", { name: "Dune", exact: true })
    .click();
  // 4. Assert the looked-up details were populated
  await expect(page.getByRole("heading", { name: "Dune", exact: true })).toBeVisible();
  await expect(page.getByText("by Frank Herbert")).toBeVisible();
  await expect(page.getByText("Added via lookup")).toBeVisible();
});
