import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { gotoStore, gotoStoreWithTigerBloom, openCartDrawer } from "./helpers";

async function scanWcag21Aa(page: Page, include?: string) {
  const builder = new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("nextjs-portal")
    .disableRules(["meta-viewport"]);

  if (include) {
    builder.include(include);
  }

  const results = await builder.analyze();
  return results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );
}

test.describe("accessibility", () => {
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
});
