import { expect, type Locator, type Page } from "@playwright/test";

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

export async function gotoStore(page: Page, path = "/#custom") {
  await startWithEmptyCart(page);
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByRole("link", { name: "Bleach Tops" })).toBeVisible();
}

export async function expectDarkDrawer(page: Page) {
  const drawer = page
    .getByRole("dialog")
    .filter({ hasText: /cart|your cart|shopping cart/i })
    .first();

  await expect(drawer).toBeVisible({ timeout: 10_000 });
  await expect(drawer).toHaveClass(/bg-zinc-900/);
  return drawer;
}

export async function gotoStoreWithTigerBloom(page: Page, path = "/") {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "bleach-tops-cart",
      JSON.stringify([
        {
          productId: "tiger-bloom-long-sleeve",
          title: "Tiger Bloom Long Sleeve",
          price: 35,
          size: "M",
          quantity: 1,
          image: "/images/products/featured-top.jpg",
        },
      ]),
    );
  });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByRole("link", { name: "Bleach Tops" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Shopping cart/i })).toBeVisible({
    timeout: 10_000,
  });
}

export async function openCartDrawer(page: Page) {
  const cartBtn = page
    .getByRole("button", { name: /cart/i })
    .and(page.locator("#cart-trigger"));
  await expect(cartBtn).toBeVisible({ timeout: 10_000 });
  await expect(async () => {
    await cartBtn.click();
    await expect(
      page
        .getByRole("dialog")
        .filter({ hasText: /cart|your cart|shopping cart/i })
        .first(),
    ).toBeVisible({ timeout: 1_500 });
  }).toPass({ timeout: 10_000 });
  return await expectDarkDrawer(page);
}

export async function expectNoHorizontalPageScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    return {
      root: root.scrollWidth - root.clientWidth,
      body: body.scrollWidth - body.clientWidth,
    };
  });

  expect(overflow.root, "documentElement should not scroll horizontally").toBeLessThanOrEqual(1);
  expect(overflow.body, "body should not scroll horizontally").toBeLessThanOrEqual(1);
}

export async function expectInViewport(locator: Locator, label: string) {
  const box = await locator.boundingBox();
  expect(box, `${label} should have a bounding box`).toBeTruthy();
  const page = locator.page();
  const viewport = page.viewportSize();
  expect(viewport, `${label} needs a viewport`).toBeTruthy();
  if (!box || !viewport) return;

  expect(box.x, `${label} should not clip off the left`).toBeGreaterThanOrEqual(-1);
  expect(
    box.x + box.width,
    `${label} should not clip off the right`,
  ).toBeLessThanOrEqual(viewport.width + 2);
}
