import { expect, test } from "@playwright/test";
import { expectDarkDrawer, POUND_PRICE, startWithEmptyCart } from "./helpers";

test.describe("core shopping flow", () => {
  test.beforeEach(async ({ page }) => {
    await startWithEmptyCart(page);
    await page.goto("/#custom", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("link", { name: "Bleach Tops" })).toBeVisible();
  });

  test("renders catalog cards with images, titles, and rounded pound prices", async ({
    page,
  }) => {
    const shop = page.getByRole("region", { name: "Products" });
    await expect(
      shop.getByRole("heading", { name: "Custom bleach tops" }),
    ).toBeVisible();

    const cards = shop.getByRole("article");
    await expect(cards).toHaveCount(6);

    for (const card of await cards.all()) {
      await expect(card.getByRole("img").first()).toBeVisible();
      await expect(card.getByRole("heading")).toBeVisible();
      await expect(card.getByText(POUND_PRICE)).toBeVisible();
    }
  });

  test("selects a size, adds to cart, and drives the dark cart drawer", async ({
    page,
  }) => {
    const product = page.getByRole("article").filter({
      hasText: "Tiger Bloom Long Sleeve",
    });

    await product.getByRole("button", { name: "M", exact: true }).click();
    await expect(
      product.getByRole("button", { name: "M", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");

    await product.getByRole("button", { name: "Add to Cart" }).click();

    const drawer = await expectDarkDrawer(page);
    await expect(drawer.getByText("Tiger Bloom Long Sleeve")).toBeVisible();
    await expect(drawer.getByText("Size M")).toBeVisible();
    await expect(drawer.getByText("£35.00")).toHaveCount(2);

    await drawer
      .getByRole("button", { name: /Increase quantity of Tiger Bloom/ })
      .click();
    await expect(drawer.getByText("£70.00")).toHaveCount(2);
    await expect(page.getByRole("button", { name: /Shopping cart, 2 items/ })).toBeVisible();

    await drawer
      .getByRole("button", { name: /Decrease quantity of Tiger Bloom/ })
      .click();
    await expect(drawer.getByText("£35.00")).toHaveCount(2);

    await drawer
      .getByRole("button", { name: /Remove Tiger Bloom Long Sleeve size M/ })
      .click();
    await expect(drawer.getByText("Your cart is empty")).toBeVisible();
    await expect(
      drawer.getByRole("button", { name: "Proceed to Checkout" }),
    ).toBeDisabled();

    await drawer.getByRole("button", { name: "Continue shopping" }).click();
    await expect(page.getByRole("dialog", { name: "Your cart" })).toBeHidden();

    await product
      .getByRole("button", { name: /Add to [Cc]art|Added to cart/ })
      .click();
    await expectDarkDrawer(page);

    await page.route("**/api/checkout", async (route) => {
      expect(route.request().method()).toBe("POST");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "http://localhost:3000/?e2e-checkout=1" }),
      });
    });

    await page.getByRole("button", { name: "Proceed to Checkout" }).click();
    await page.waitForURL("**/?e2e-checkout=1");
  });
});
