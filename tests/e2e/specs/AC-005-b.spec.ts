// spec: tests/validation/test-plan.md § AC-005-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { addManualBook, openBookByTitle } from "../lib/catalog";
import { target } from "../lib/targets";

test("AC-005-b: a rating outside the 1-5 range is rejected", async ({ page, request }) => {
  const title = `AC-005-b Book ${Date.now()}`;

  // 1. Log in, add a book, open its detail page to obtain the book id
  await login(page);
  await addManualBook(page, title, "Author");
  await openBookByTitle(page, title);
  const bookId = page.url().split("/books/")[1];
  expect(bookId).toBeTruthy();

  // 2. Extract the access token the browser session holds
  const accessToken = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith("oidc.user:"));
    if (!key) return null;
    return JSON.parse(localStorage.getItem(key)!).access_token as string;
  });
  expect(accessToken).toBeTruthy();

  // 3. Attempt to set a rating outside 1-5, above and below range
  const headers = { Authorization: `Bearer ${accessToken}` };
  const apiBase = target("library-api");

  const tooHigh = await request.put(`${apiBase}/books/${bookId}/status`, {
    headers,
    data: { rating: 6 },
  });
  expect(tooHigh.status()).toBe(400);

  const tooLow = await request.put(`${apiBase}/books/${bookId}/status`, {
    headers,
    data: { rating: 0 },
  });
  expect(tooLow.status()).toBe(400);
});
