import { expect, test } from "@playwright/test";
import { gotoStore } from "./helpers";

const SCRIPT_PAYLOAD = '<script>alert("xss")</script>';
const EVENT_PAYLOAD = '<img src="x" onerror="alert(1)">';

const REQUIRED_API_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
} as const;

const POLICY_ROUTES = ["/shipping", "/returns"] as const;

async function expectApiSecurityHeaders(headers: Record<string, string>) {
  for (const [name, value] of Object.entries(REQUIRED_API_HEADERS)) {
    expect(headers[name], `${name} should be set`).toBe(value);
  }
}

async function expectPolicySecurityHeaders(headers: Record<string, string>) {
  await expectApiSecurityHeaders(headers);
  const csp = headers["content-security-policy"] ?? "";
  expect(csp, "Content-Security-Policy should be set").toMatch(/default-src 'self'/);
  expect(csp).toMatch(/frame-ancestors 'none'/);
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

  test("policy pages send security headers", async ({ request }) => {
    for (const path of POLICY_ROUTES) {
      const response = await request.get(path);
      expect(response.status(), `${path} status`).toBe(200);
      await expectPolicySecurityHeaders(response.headers());
    }
  });

  test("policy page mailto and internal links render without unsafe targets", async ({
    page,
  }) => {
    for (const path of POLICY_ROUTES) {
      await gotoStore(page, path);

      const links = await page.locator("a[href]").evaluateAll((anchors) =>
        anchors
          .filter((anchor) => !anchor.closest("nextjs-portal"))
          .map((anchor) => ({
            href: anchor.getAttribute("href") ?? "",
            target: anchor.getAttribute("target"),
            rel: anchor.getAttribute("rel") ?? "",
          })),
      );

      expect(links.length, `${path} should render links`).toBeGreaterThan(0);

      for (const link of links) {
        expect(link.href, `${path} link must not use javascript:`).not.toMatch(
          /^javascript:/i,
        );
        expect(link.href, `${path} link must not use data:`).not.toMatch(
          /^data:/i,
        );

        if (link.target === "_blank") {
          expect(link.rel).toMatch(/noopener/);
        }

        if (link.href.startsWith("mailto:")) {
          expect(link.href).toBe("mailto:orders@jbdesignz.uk");
          expect(link.target === null || link.target === "" || link.target === "_self").toBe(
            true,
          );
        }

        const isInternal =
          link.href.startsWith("/") ||
          link.href.startsWith("#") ||
          link.href.startsWith("http://localhost");
        if (isInternal) {
          expect(link.target, `${link.href} should stay in-app`).not.toBe("_blank");
        }
      }

      await expect(
        page.getByRole("link", { name: "orders@jbdesignz.uk" }),
      ).toHaveAttribute("href", "mailto:orders@jbdesignz.uk");
      await expect(
        page.getByRole("link", { name: "Return to shop" }),
      ).toHaveAttribute("href", "/");
    }
  });
});
