import { expect, test, type Page, type Request } from "@playwright/test";
import { REFERENCE_PNG, startWithEmptyCart } from "./helpers";

async function fillRequiredCustomFields(page: Page) {
  const custom = page.locator("#custom");
  await expect(async () => {
    await custom.getByLabel("Full Name").click();
    await expect(custom.getByLabel("Full Name")).toBeFocused();
    await custom.getByLabel("Full Name").fill("Gurpreet Bhamra");
    await custom.getByLabel("Email or Instagram Handle").fill("test@example.com");
    await custom.getByLabel("Garment Choice").selectOption("Standard Fit Tee");
    await custom.getByLabel("Preferred Size").selectOption("M");
    await custom.getByLabel("Garment Base Colour").selectOption("Classic Black");
    await custom
      .getByLabel("Design Idea / Notes")
      .fill("Hand-bleached moth on the back, rust finish.");
    await expect(custom.getByLabel("Full Name")).toHaveValue("Gurpreet Bhamra");
    await expect(custom.getByLabel("Garment Choice")).toHaveValue(
      "Standard Fit Tee",
    );
  }).toPass({ timeout: 10_000 });
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

    const fileInput = page.locator('#custom input[type="file"]');
    await expect(async () => {
      await fileInput.setInputFiles({
        name: "reference.png",
        mimeType: "image/png",
        buffer: REFERENCE_PNG,
      });
      if (!(await page.getByText("reference.png").isVisible().catch(() => false))) {
        await fileInput.dispatchEvent("input");
        await fileInput.dispatchEvent("change");
      }
      await expect(page.getByText("reference.png")).toBeVisible();
    }).toPass({ timeout: 10_000 });
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

    let postedBody = "";
    await page.route("**/api/custom-request", async (route) => {
      postedBody =
        route.request().postData() ??
        route.request().postDataBuffer()?.toString("latin1") ??
        "";
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
    await honeypot.dispatchEvent("input");
    await honeypot.dispatchEvent("change");
    const submit = page.getByRole("button", { name: "Submit Custom Request" });
    await submit.scrollIntoViewIfNeeded();
    await submit.click();

    await expect(
      page.getByRole("status").getByText(/Request Received/i),
    ).toBeVisible({ timeout: 10000 });
    expect(postedBody).toContain('name="website_url"');
    expect(postedBody).toContain("https://spam.example");
  });
});
