import { expect, test } from "@playwright/test";
import { gotoStore } from "./helpers";

const SCRIPT_PAYLOAD = '<script>alert("xss")</script>';
const EVENT_PAYLOAD = '<img src="x" onerror="alert(1)">';

const REQUIRED_API_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
} as const;

async function expectApiSecurityHeaders(headers: Record<string, string>) {
  for (const [name, value] of Object.entries(REQUIRED_API_HEADERS)) {
    expect(headers[name], `${name} should be set`).toBe(value);
  }
}

test.describe("security", () => {
  test("API routes send security headers", async ({ request }) => {
    const checkout = await request.post("/api/checkout", {
      data: { items: [] },
    });
    expect(checkout.status()).toBe(400);
    await expectApiSecurityHeaders(checkout.headers());
    expect(checkout.headers()["content-type"]).toMatch(/application\/json/);

    const custom = await request.post("/api/custom-request", {
      multipart: {
        fullName: "Test",
        contact: "not-valid",
      },
    });
    expect(custom.status()).toBe(400);
    await expectApiSecurityHeaders(custom.headers());
    expect(custom.headers()["content-type"]).toMatch(/application\/json/);
  });

  test("custom request API does not reflect script payloads as HTML", async ({
    request,
  }) => {
    const response = await request.post("/api/custom-request", {
      multipart: {
        fullName: SCRIPT_PAYLOAD,
        contact: EVENT_PAYLOAD,
        garment: "Standard Fit Tee",
        size: "M",
        colour: "Classic Black",
        notes: SCRIPT_PAYLOAD,
      },
    });

    expect(response.status()).toBe(400);
    await expectApiSecurityHeaders(response.headers());
    expect(response.headers()["content-type"]).toMatch(/application\/json/);

    const body = await response.text();
    expect(body.startsWith("<")).toBeFalsy();
    expect(body).not.toMatch(/<script/i);
    expect(body).not.toMatch(/onerror=/i);

    const payload = JSON.parse(body) as { error?: string };
    expect(payload.error).toMatch(/email address or Instagram handle/i);
  });

  test("custom order form treats injection payloads as plain text", async ({
    page,
  }) => {
    await gotoStore(page, "/#custom");

    const dialogs: string[] = [];
    page.on("dialog", (dialog) => {
      dialogs.push(dialog.message());
      void dialog.dismiss();
    });

    let postedNotes: string | null = null;
    let postedName: string | null = null;
    await page.route("**/api/custom-request", async (route) => {
      const body =
        route.request().postData() ??
        route.request().postDataBuffer()?.toString("latin1") ??
        "";
      postedName = body.includes(SCRIPT_PAYLOAD) ? SCRIPT_PAYLOAD : null;
      postedNotes = body.includes(EVENT_PAYLOAD) ? EVENT_PAYLOAD : null;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Custom request received!",
        }),
      });
    });

    const custom = page.locator("#custom");
    await custom.getByLabel("Full Name").click();
    await expect(custom.getByLabel("Full Name")).toBeFocused();
    await custom.getByLabel("Full Name").fill(SCRIPT_PAYLOAD);
    await custom.getByLabel("Email or Instagram Handle").fill("safe@example.com");
    await custom.getByLabel("Garment Choice").selectOption("Standard Fit Tee");
    await custom.getByLabel("Preferred Size").selectOption("M");
    await custom.getByLabel("Garment Base Colour").selectOption("Classic Black");
    await custom.getByLabel("Design Idea / Notes").fill(EVENT_PAYLOAD);

    await expect(custom.getByLabel("Full Name")).toHaveValue(SCRIPT_PAYLOAD);
    await expect(custom.getByLabel("Design Idea / Notes")).toHaveValue(
      EVENT_PAYLOAD,
    );
    await expect(custom.locator("script")).toHaveCount(0);
    await expect(custom.locator("img[onerror]")).toHaveCount(0);

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/custom-request") && res.status() === 200,
      ),
      custom.getByRole("button", { name: "Submit Custom Request" }).click(),
    ]);

    await expect(
      page.getByRole("status").getByText(/Request Received/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("#custom script")).toHaveCount(0);
    expect(postedName).toBe(SCRIPT_PAYLOAD);
    expect(postedNotes).toBe(EVENT_PAYLOAD);
    expect(dialogs).toEqual([]);
  });
});
