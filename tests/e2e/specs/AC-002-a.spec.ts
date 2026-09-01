// spec: tests/validation/test-plan.md § AC-002-a
import { test, expect } from "@playwright/test";
import { login, topNav } from "../lib/auth";

test("AC-002-a: searching by title returns candidate matches from the book database", async ({
  page,
}) => {
  // The book-lookup proxies a third-party API observed live taking well
  // over the default 30s test timeout; extend it for this spec only.
  test.setTimeout(60000);
  // 1. Log in and open Add Book
  await login(page);
  await topNav(page).getByRole("link", { name: "Add Book" }).click();
  // 2. Search by title
  await page.getByRole("textbox", { name: "Search by title or ISBN" }).fill("Dune");
  await page.getByRole("button", { name: "Search" }).click();
  // 3. Assert a matching candidate is returned. The lookup proxies a
  // third-party book database and can take longer than the default timeout.
  await expect(
    page.getByRole("list", { name: "Matches" }).getByRole("button", { name: "Dune Frank Herbert", exact: true }),
  ).toBeVisible({ timeout: 30000 });
});
