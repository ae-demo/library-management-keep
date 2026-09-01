// spec: tests/validation/test-plan.md § AC-001-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";

test("AC-001-b: after signing in, the member reaches the catalog as themself", async ({
  page,
}) => {
  // 1. Log in with the test account
  await login(page);
  // 2. Assert the personalized catalog view is reached
  await expect(page.getByRole("heading", { name: "Shared Catalog" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "My rating" })).toBeVisible();
});
