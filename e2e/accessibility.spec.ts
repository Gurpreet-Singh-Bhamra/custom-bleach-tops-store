import { expect, test } from "@playwright/test";
import {
  expectAccordionState,
  expectKeyboardFocusable,
  gotoStore,
  gotoStoreWithTigerBloom,
  openCartDrawer,
  scanWcag21Aa,
} from "./helpers";

test.describe("accessibility", () => {
  test.use({ hasTouch: false, isMobile: false });
  test("homepage has no critical or serious WCAG 2.1 AA violations", async ({
    page,
  }) => {
    await gotoStore(page, "/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const violations = await scanWcag21Aa(page);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  test("dark cart drawer has no critical or serious WCAG 2.1 AA violations", async ({
    page,
  }) => {
    await gotoStoreWithTigerBloom(page, "/");
    const drawer = await openCartDrawer(page);
    await expect(drawer.getByRole("button", { name: "Close cart" })).toBeVisible();

    const violations = await scanWcag21Aa(page, "#cart-drawer");
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  test("custom order form has no critical or serious WCAG 2.1 AA violations", async ({
    page,
  }) => {
    await gotoStore(page, "/#custom");
    await expect(
      page.getByRole("heading", { name: "Custom Orders & Colour Options" }),
    ).toBeVisible();

    const violations = await scanWcag21Aa(page, "#custom");
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  for (const route of [
    { path: "/shipping", heading: "Delivery & Shipping Info" },
    { path: "/returns", heading: "Refund & Returns Policy" },
  ] as const) {
    test(`${route.path} has no critical or serious WCAG 2.1 AA violations`, async ({
      page,
    }) => {
      await gotoStore(page, route.path);
      await expect(
        page.getByRole("heading", { level: 1, name: route.heading }),
      ).toBeVisible();

      const violations = await scanWcag21Aa(page);
      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });
  }

  test("footer policy links are Tab-focusable and open with Enter", async ({
    page,
  }) => {
    await gotoStore(page, "/");
    const policies = page.getByRole("navigation", { name: "Policies" });
    const shipping = policies.getByRole("link", { name: "Delivery & Shipping" });
    const returns = policies.getByRole("link", { name: "Refund & Returns" });

    await expectKeyboardFocusable(shipping);
    await expectKeyboardFocusable(returns);
    await page.keyboard.press("Enter");
    await page.waitForURL("/returns");
    await expect(
      page.getByRole("heading", { name: "Refund & Returns Policy" }),
    ).toBeVisible();
  });

  test("PDP accordion headers expose ARIA and toggle with Enter and Space", async ({
    page,
  }) => {
    await gotoStore(page, "/#shop");
    const product = page.getByRole("article").filter({
      hasText: "Tiger Bloom Long Sleeve",
    });
    const accordionTrigger = product.getByRole("button", {
      name: "Delivery & Shipping",
    });
    const returnsTrigger = product.getByRole("button", { name: "Returns & Care" });

    await expect(product.getByRole("button", { pressed: true })).toBeVisible();
    await expectAccordionState(accordionTrigger, false);
    await expectAccordionState(returnsTrigger, false);

    const deliveryControls = await accordionTrigger.getAttribute("aria-controls");
    const returnsControls = await returnsTrigger.getAttribute("aria-controls");
    expect(deliveryControls).toBeTruthy();
    expect(returnsControls).toBeTruthy();
    expect(deliveryControls).not.toBe(returnsControls);
    await expect(page.locator(`[id="${deliveryControls}"]`)).toHaveCount(1);
    await expect(page.locator(`[id="${returnsControls}"]`)).toHaveCount(1);

    await accordionTrigger.scrollIntoViewIfNeeded();
    await accordionTrigger.focus();
    await page.keyboard.press("Space");
    await expect(accordionTrigger).toHaveAttribute("aria-expanded", "true");
    await expectAccordionState(accordionTrigger, true);
    await expect(
      product.getByRole("link", { name: "View full delivery policy" }),
    ).toBeVisible();

    await returnsTrigger.scrollIntoViewIfNeeded();
    await returnsTrigger.focus();
    await page.keyboard.press("Enter");
    await expect(returnsTrigger).toHaveAttribute("aria-expanded", "true");
    await expectAccordionState(returnsTrigger, true);
    await expectAccordionState(accordionTrigger, true);
    await expect(
      product.getByRole("link", { name: "View full returns policy" }),
    ).toBeVisible();

    await returnsTrigger.focus();
    await page.keyboard.press("Space");
    await expect(returnsTrigger).toHaveAttribute("aria-expanded", "false");
  });
});
