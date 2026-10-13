import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  expectAccordionState,
  expectNoHorizontalPageScroll,
  gotoStore,
} from "./helpers";

const POLICY_ROUTES = [
  {
    path: "/shipping",
    heading: "Delivery & Shipping Info",
    body: "UK Standard Shipping",
  },
  {
    path: "/returns",
    heading: "Refund & Returns Policy",
    body: "14 days of delivery",
  },
] as const;

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 375, height: 667 },
] as const;

function tigerBloom(page: Page) {
  return page.getByRole("article").filter({ hasText: "Tiger Bloom Long Sleeve" });
}

async function setAccordionExpanded(
  header: Locator,
  desired: "true" | "false",
) {
  await expect(async () => {
    const current = await header.getAttribute("aria-expanded");
    if (current === desired) return;

    await header.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await header.click({ force: true });

    await expect(header).toHaveAttribute("aria-expanded", desired, {
      timeout: 1000,
    });
  }).toPass({ timeout: 10000 });
}

async function followAccordionCta(
  page: Page,
  accordionTrigger: Locator,
  ctaLink: Locator,
  expectedPath: "/shipping" | "/returns",
) {
  await setAccordionExpanded(accordionTrigger, "true");
  await expect(ctaLink).toBeVisible({ timeout: 5000 });
  await ctaLink.scrollIntoViewIfNeeded();
  await ctaLink.click();
  await expect(page).toHaveURL(new RegExp(expectedPath + "$"), { timeout: 10000 });
}

test.describe("policy pages and PDP accordions", () => {
  test("static policy routes return 200 quickly with cache headers", async ({
    request,
  }) => {
    for (const route of POLICY_ROUTES) {
      await request.get(route.path);

      const started = Date.now();
      const response = await request.get(route.path);
      const elapsed = Date.now() - started;

      expect(response.status(), `${route.path} status`).toBe(200);
      expect(elapsed, `${route.path} should respond quickly after warmup`).toBeLessThan(
        2000,
      );
      expect(response.headers()["content-type"]).toMatch(/text\/html/);

      const cacheControl = response.headers()["cache-control"] ?? "";
      const nextCache = response.headers()["x-nextjs-cache"] ?? "";
      const prerender = response.headers()["x-nextjs-prerender"] ?? "";
      const vary = response.headers()["vary"] ?? "";
      expect(cacheControl, `${route.path} should send Cache-Control`).toMatch(
        /no-cache|must-revalidate|s-maxage|max-age|public/i,
      );
      expect(
        /rsc/i.test(vary) ||
          /HIT|STALE/i.test(nextCache) ||
          prerender === "1" ||
          /s-maxage|public/i.test(cacheControl),
        `${route.path} should look statically generated (cache-control=${cacheControl}, vary=${vary}, x-nextjs-cache=${nextCache}, x-nextjs-prerender=${prerender})`,
      ).toBeTruthy();

      const html = (await response.text()).replace(/&amp;/g, "&");
      expect(html).toContain(route.heading);
      expect(html).toContain(route.body);
    }
  });

  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} ${viewport.width}px`, () => {
      test.use({
        viewport: { width: viewport.width, height: viewport.height },
      });

      test("policy pages render without horizontal scroll", async ({ page }) => {
        for (const route of POLICY_ROUTES) {
          await gotoStore(page, route.path);
          await expect(
            page.getByRole("heading", { level: 1, name: route.heading }),
          ).toBeVisible();
          await expectNoHorizontalPageScroll(page);
        }
      });

      test("PDP accordions toggle open and close independently", async ({
        page,
      }) => {
        await gotoStore(page, "/#shop");
        const product = tigerBloom(page);
        const delivery = product.getByRole("button", {
          name: "Delivery & Shipping",
        });
        const returns = product.getByRole("button", { name: "Returns & Care" });
        const deliveryPolicy = product.getByRole("link", {
          name: "View full delivery policy",
        });
        const returnsPolicy = product.getByRole("link", {
          name: "View full returns policy",
        });

        await expect(product.getByRole("button", { pressed: true })).toBeVisible();
        await delivery.scrollIntoViewIfNeeded();
        await expectAccordionState(delivery, false);
        await expectAccordionState(returns, false);

        await setAccordionExpanded(delivery, "true");
        await expectAccordionState(delivery, true);
        await expect(deliveryPolicy).toBeVisible();
        await expect(product.getByText("UK Standard: £3.99")).toBeVisible();
        await expectAccordionState(returns, false);

        await setAccordionExpanded(returns, "true");
        await expectAccordionState(returns, true);
        await expectAccordionState(delivery, true);
        await expect(returnsPolicy).toBeVisible();
        await expect(product.getByText("Custom/bespoke orders are non-refundable")).toBeVisible();

        await setAccordionExpanded(delivery, "false");
        await expectAccordionState(delivery, false);
        await expectAccordionState(returns, true);

        await setAccordionExpanded(returns, "false");
        await expectAccordionState(returns, false);
      });

      test("accordion CTAs redirect to full policy pages", async ({ page }) => {
        await gotoStore(page, "/#shop");
        const product = tigerBloom(page);
        await expect(product.getByRole("button", { pressed: true })).toBeVisible();

        const deliveryBtn = product.getByRole("button", {
          name: "Delivery & Shipping",
        });
        const deliveryPolicy = product.getByRole("link", {
          name: "View full delivery policy",
        });
        await followAccordionCta(page, deliveryBtn, deliveryPolicy, "/shipping");
        await expect(
          page.getByRole("heading", { name: "Delivery & Shipping Info" }),
        ).toBeVisible();

        await gotoStore(page, "/#shop");

        const productAgain = tigerBloom(page);
        await expect(productAgain.getByRole("button", { pressed: true })).toBeVisible();
        const returnsBtn = productAgain.getByRole("button", {
          name: "Returns & Care",
        });
        const returnsPolicy = productAgain.getByRole("link", {
          name: "View full returns policy",
        });
        await followAccordionCta(page, returnsBtn, returnsPolicy, "/returns");
        await expect(
          page.getByRole("heading", { name: "Refund & Returns Policy" }),
        ).toBeVisible();
      });

      test("footer policy links redirect to policy pages", async ({ page }) => {
        await gotoStore(page, "/");
        const policies = page.getByRole("navigation", { name: "Policies" });

        await Promise.all([
          page.waitForURL("**/shipping"),
          policies.getByRole("link", { name: "Delivery & Shipping" }).click(),
        ]);
        await expect(
          page.getByRole("heading", { name: "Delivery & Shipping Info" }),
        ).toBeVisible();

        await Promise.all([
          page.waitForURL("**/returns"),
          page
            .getByRole("navigation", { name: "Policies" })
            .getByRole("link", { name: "Refund & Returns" })
            .click(),
        ]);
        await expect(
          page.getByRole("heading", { name: "Refund & Returns Policy" }),
        ).toBeVisible();
      });
    });
  }
});
