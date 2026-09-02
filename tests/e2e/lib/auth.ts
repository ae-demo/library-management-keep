import { Page, expect, test } from "@playwright/test";

// Thunder exposes no ROPC/password grant, so every authenticated spec drives
// the real browser login (see tests/validation/test-plan.md). The webapp's
// silent-auth check (prompt=none) before landing on the sign-in page has been
// observed taking 12-16s, occasionally more on a cold connection — widen this
// helper's budget so that observed latency doesn't fail the login step itself.
export async function login(page: Page): Promise<void> {
  test.setTimeout(45000);
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Username" })
    .waitFor({ state: "visible", timeout: 25000 });
  await page
    .getByRole("textbox", { name: "Username" })
    .fill(process.env.AEP_E2E_USERNAME!);
  await page
    .getByRole("textbox", { name: "Password" })
    .fill(process.env.AEP_E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Shared Catalog" })).toBeVisible({ timeout: 15000 });
}

export function topNav(page: Page) {
  return page.getByRole("navigation", { name: "Top navigation" });
}
