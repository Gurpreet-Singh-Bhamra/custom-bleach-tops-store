import { expect, type Page } from "@playwright/test";

export const POUND_PRICE = /£\d+\.00/;

export const REFERENCE_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export async function startWithEmptyCart(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("bleach-tops-cart");
  });
}

export async function expectDarkDrawer(page: Page) {
  const drawer = page.getByRole("dialog", { name: "Your cart" });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveClass(/bg-zinc-900/);
  return drawer;
}
