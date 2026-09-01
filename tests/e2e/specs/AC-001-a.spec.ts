// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";

test("AC-001-a: an unauthenticated visitor is directed to sign in before reaching the catalog", async ({
  page,
}) => {
  // 1. Navigate to / with no session
  await page.goto("/");
  // 2. Assert the redirect lands on Thunder's sign-in screen. The webapp
  // performs a silent-auth check (prompt=none) before the full authorize
  // redirect, which can take longer than the default assertion timeout.
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Shared Catalog" })).not.toBeVisible();
});
