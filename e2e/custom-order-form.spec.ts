import { expect, test, type Page, type Request } from "@playwright/test";
import { REFERENCE_PNG, startWithEmptyCart } from "./helpers";

async function fillRequiredCustomFields(page: Page) {
  const custom = page.locator("#custom");
  await custom.getByLabel("Full Name").fill("Gurpreet Bhamra");
  await custom.getByLabel("Email or Instagram Handle").fill("test@example.com");
  await custom.getByLabel("Garment Choice").selectOption("Standard Fit Tee");
  await custom.getByLabel("Preferred Size").selectOption("M");
  await custom.getByLabel("Garment Base Colour").selectOption("Classic Black");
  await custom
    .getByLabel("Design Idea / Notes")
    .fill("Hand-bleached moth on the back, rust finish.");
}

function mockCustomRequest(page: Page, onRequest?: (request: Request) => void) {
  return page.route("**/api/custom-request", async (route) => {
    onRequest?.(route.request());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Custom request received!",
      }),
    });
  });
}

test.describe("custom order form", () => {
  test.beforeEach(async ({ page }) => {
    await startWithEmptyCart(page);
    await page.goto("/#custom", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("heading", { name: "Custom Orders & Colour Options" }),
    ).toBeVisible();
  });

  test("fills the form, uploads a reference image, and shows confirmation", async ({
    page,
  }) => {
    await mockCustomRequest(page);

    await fillRequiredCustomFields(page);

    const fileInput = page.locator("#custom input[name='image']");
    await fileInput.setInputFiles({
      name: "reference.png",
      mimeType: "image/png",
      buffer: REFERENCE_PNG,
    });
    await expect(page.getByText("reference.png")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Preview of reference.png" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Submit Custom Request" }).click();

    await expect(
      page.getByRole("status").getByText(/Request Received/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send another request" }),
    ).toBeVisible();
  });

  test("hides the honeypot and short-circuits spam without exposing the trap", async ({
    page,
  }) => {
    const honeypot = page.locator('#custom input[name="website_url"]');
    await expect(honeypot).toBeHidden();
    await expect(honeypot).toHaveAttribute("autocomplete", "off");

    let postedWebsiteUrl: string | null = null;
    await page.route("**/api/custom-request", async (route) => {
      const body =
        route.request().postData() ??
        route.request().postDataBuffer()?.toString("latin1") ??
        "";
      expect(body).toContain('name="website_url"');
      expect(body).toContain("https://spam.example");
      postedWebsiteUrl = "https://spam.example";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Request received!",
        }),
      });
    });

    await fillRequiredCustomFields(page);
    await honeypot.fill("https://spam.example", { force: true });
    await page.getByRole("button", { name: "Submit Custom Request" }).click();

    await expect(
      page.getByRole("status").getByText(/Request Received/i),
    ).toBeVisible();
    expect(postedWebsiteUrl).toBe("https://spam.example");
  });
});
