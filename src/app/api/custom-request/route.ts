import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  isCustomRequestError,
  isHoneypotFilled,
  parseCustomRequest,
} from "@/lib/custom-request";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function requestEmailBody(request: {
  fullName: string;
  contact: string;
  garment: string;
  size: string;
  colour: string;
  notes: string;
  imageName: string | null;
}) {
  const rows = [
    ["Name", request.fullName],
    ["Email or Instagram", request.contact],
    ["Garment", request.garment],
    ["Size", request.size],
    ["Colour", request.colour],
    ["Notes", request.notes || "—"],
    ["Reference image", request.imageName ?? "None attached"],
  ] as const;

  const html = `
    <div style="font-family:Georgia,serif;color:#171412;line-height:1.5">
      <h1 style="font-size:20px;margin:0 0 12px">✨ New Custom Bleach Top Request</h1>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding:8px 12px;border:1px solid #e7e5e4;background:#f6f1e8;font-weight:600;width:180px">${escapeHtml(label)}</td>
                <td style="padding:8px 12px;border:1px solid #e7e5e4;white-space:pre-wrap">${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
      </table>
    </div>
  `;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  return { html, text };
}

export async function POST(request: Request) {
  console.log("OWNER_EMAIL:", process.env.OWNER_EMAIL);
  console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

  try {
    const formData = await request.formData();
    const websiteUrlValue = formData.get("website_url");
    const websiteUrl =
      typeof websiteUrlValue === "string" ? websiteUrlValue.trim() : "";

    if (websiteUrl || isHoneypotFilled(formData)) {
      console.warn("Spam bot submission caught by honeypot!");
      return NextResponse.json(
        { success: true, message: "Request received!" },
        { status: 200 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not defined in .env.local" },
        { status: 500 },
      );
    }

    const customRequest = await parseCustomRequest(formData);
    const customerEmail = customRequest.replyTo;
    const { html, text } = requestEmailBody({
      fullName: customRequest.fullName,
      contact: customRequest.contact,
      garment: customRequest.garment,
      size: customRequest.size,
      colour: customRequest.colour,
      notes: customRequest.notes,
      imageName: customRequest.image?.filename ?? null,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Custom Orders <onboarding@resend.dev>",
      to: [process.env.OWNER_EMAIL || "your-email@gmail.com"],
      subject: "✨ New Custom Bleach Top Request",
      replyTo: customerEmail,
      html,
      text,
      attachments: customRequest.image
        ? [
            {
              filename: customRequest.image.filename,
              content: customRequest.image.bytes,
              contentType: customRequest.image.contentType,
            },
          ]
        : undefined,
    });

    if (error || !data) {
      console.error("Resend email failed", error);
      return NextResponse.json(
        {
          error:
            error?.message ||
            "Unable to send your request just now. Please try again later.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Custom request received!",
    });
  } catch (error) {
    if (isCustomRequestError(error)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Custom request failed", error);
    return NextResponse.json(
      { error: "Unable to send your request just now. Please try again later." },
      { status: 500 },
    );
  }
}
