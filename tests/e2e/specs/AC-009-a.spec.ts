// spec: tests/validation/test-plan.md § AC-009-a
import { test, expect } from "@playwright/test";
import { login, topNav } from "../lib/auth";

test("AC-009-a: when a lookup search returns no matches, the member is offered a manual-entry path", async ({
  page,
}) => {
  const nonsense = `zznonexistentbooktitle${Date.now()}zz`;

  // The book-lookup proxies a third-party API observed live taking well
  // over the default 30s test timeout; extend it for this spec only.
  test.setTimeout(60000);
  // 1. Log in and search for a title guaranteed to have no matches
  await login(page);
  await topNav(page).getByRole("link", { name: "Add Book" }).click();
  await page.getByRole("textbox", { name: "Search by title or ISBN" }).fill(nonsense);
  await page.getByRole("button", { name: "Search" }).click();

  // 2. Assert the manual-entry fallback is offered
  await expect(page.getByRole("heading", { name: "No matches found" })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("link", { name: "Enter details manually" })).toBeVisible();
});
