import { expect, test } from "@playwright/test";
import {
  expectInViewport,
  expectNoHorizontalPageScroll,
  gotoStore,
  gotoStoreWithTigerBloom,
  openCartDrawer,
} from "./helpers";

test.describe("mobile responsive layout", () => {
  test("renders header navigation without horizontal page scroll or clipping", async ({
    page,
  }) => {
    await gotoStore(page, "/#custom");

    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

    for (const label of ["Shop", "Craft", "Sizing", "Custom"]) {
      await expect(
        page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
          name: label,
        }),
      ).toBeVisible();
    }

    await expectInViewport(page.getByRole("link", { name: "Bleach Tops" }), "logo");
    await expectInViewport(
      page.getByRole("button", { name: /Shopping cart/ }),
      "cart trigger",
    );
    await expectNoHorizontalPageScroll(page);
  });

  test("opens the cart drawer as a slide-over that stays on-screen", async ({
    page,
  }) => {
    await gotoStoreWithTigerBloom(page, "/#custom");
    const drawer = await openCartDrawer(page);
    await expect(drawer.getByText("Tiger Bloom Long Sleeve")).toBeVisible();
    await expect
      .poll(async () => {
        const box = await drawer.boundingBox();
        const viewport = page.viewportSize();
        if (!box || !viewport) return Number.POSITIVE_INFINITY;
        return box.x + box.width - viewport.width;
      })
      .toBeLessThanOrEqual(2);
    await expectInViewport(drawer, "cart drawer");
    await expectInViewport(
      drawer.getByRole("button", { name: "Proceed to Checkout" }),
      "checkout button",
    );
    await expectNoHorizontalPageScroll(page);
  });

  test("keeps custom order form fields usable inside the viewport", async ({
    page,
  }) => {
    await gotoStore(page, "/#custom");
    const custom = page.locator("#custom");
    await expect(
      custom.getByRole("heading", { name: "Custom Orders & Colour Options" }),
    ).toBeVisible();

    const fields = [
      custom.getByLabel("Full Name"),
      custom.getByLabel("Email or Instagram Handle"),
      custom.getByLabel("Garment Choice"),
      custom.getByLabel("Preferred Size"),
      custom.getByLabel("Garment Base Colour"),
      custom.getByLabel("Design Idea / Notes"),
      custom.getByRole("button", { name: "Submit Custom Request" }),
    ];

    for (const field of fields) {
      await field.scrollIntoViewIfNeeded();
      await expect(field).toBeVisible();
      await expectInViewport(field, await field.evaluate((el) => el.tagName));
    }

    await expectNoHorizontalPageScroll(page);
  });
});
