import { Page, expect } from "@playwright/test";

// Thunder exposes no ROPC/password grant, so every authenticated spec drives
// the real browser login (see tests/validation/test-plan.md).
export async function login(page: Page): Promise<void> {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Username" })
    .fill(process.env.AEP_E2E_USERNAME!);
  await page
    .getByRole("textbox", { name: "Password" })
    .fill(process.env.AEP_E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Shared Catalog" })).toBeVisible();
}

export function topNav(page: Page) {
  return page.getByRole("navigation", { name: "Top navigation" });
}
