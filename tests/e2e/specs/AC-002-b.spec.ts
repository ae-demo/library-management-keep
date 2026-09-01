// spec: tests/validation/test-plan.md § AC-002-b
import { test, expect } from "@playwright/test";
import { login, topNav } from "../lib/auth";

test("AC-002-b: searching by ISBN returns candidate matches from the book database", async ({
  page,
}) => {
  // 1. Log in and open Add Book
  await login(page);
  await topNav(page).getByRole("link", { name: "Add Book" }).click();
  // 2. Search by a known-valid ISBN (Dune)
  await page.getByRole("textbox", { name: "Search by title or ISBN" }).fill("9780441013593");
  await page.getByRole("button", { name: "Search" }).click();
  // 3. Assert at least one candidate match is returned
  await expect(page.getByRole("list", { name: "Matches" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Matches" }).getByRole("listitem").first()).toBeVisible();
});
