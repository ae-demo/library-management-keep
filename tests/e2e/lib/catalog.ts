import { Page, expect } from "@playwright/test";
import { topNav } from "./auth";

// Shared by every spec that needs its own, uniquely-titled catalog entry —
// the deployed environment persists between runs, so callers pass a
// run-marked title (see tests/validation/test-plan.md "Unique test data").
export async function addManualBook(page: Page, title: string, author: string): Promise<void> {
  await topNav(page).getByRole("link", { name: "Add Book" }).click();
  await page.getByRole("link", { name: "Enter details manually" }).click();
  await page.getByRole("textbox", { name: "Title Required" }).fill(title);
  await page.getByRole("textbox", { name: "Author Required" }).fill(author);
  await page.getByRole("button", { name: "Add to Catalog" }).click();
  await expect(page.getByRole("heading", { name: "Shared Catalog" })).toBeVisible();
}

export function catalogRow(page: Page, title: string) {
  return page.getByRole("row").filter({ hasText: title });
}

export async function openBookByTitle(page: Page, title: string): Promise<void> {
  await catalogRow(page, title).first().getByRole("link", { name: title, exact: true }).click();
}
