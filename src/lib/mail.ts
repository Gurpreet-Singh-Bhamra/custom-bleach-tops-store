import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { ParsedCustomRequest } from "./custom-request";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ownerEmail() {
  const email = process.env.OWNER_EMAIL?.trim();
  if (!email) {
    throw new Error("OWNER_EMAIL is not set");
  }
  return email;
}

export function isMailConfigured() {
  if (process.env.RESEND_API_KEY?.trim()) return true;

  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

function requestEmailContent(request: ParsedCustomRequest) {
  const rows = [
    ["Full name", request.fullName],
    ["Email or Instagram", request.contact],
    ["Garment", request.garment],
    ["Preferred size", request.size],
    ["Base colour", request.colour],
    ["Design notes", request.notes || "—"],
    ["Reference image", request.image?.filename ?? "None attached"],
  ] as const;

  const html = `
    <div style="font-family:Georgia,serif;color:#171412;line-height:1.5">
      <h1 style="font-size:20px;margin:0 0 12px">New custom order request</h1>
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

  return {
    subject: `Custom request from ${request.fullName}`,
    html,
    text,
  };
}

export async function sendCustomRequestEmail(request: ParsedCustomRequest) {
  const to = ownerEmail();
  const { subject, html, text } = requestEmailContent(request);
  const from =
    process.env.CUSTOM_REQUEST_FROM?.trim() ||
    "Bleach Tops <onboarding@resend.dev>";
  const attachment = request.image
    ? {
        filename: request.image.filename,
        content: request.image.bytes,
        contentType: request.image.contentType,
      }
    : undefined;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const resend = new Resend(resendKey);
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo: request.replyTo,
      attachments: attachment
        ? [
            {
              filename: attachment.filename,
              content: attachment.content,
              contentType: attachment.contentType,
            },
          ]
        : undefined,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return;
  }

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    throw new Error("Email is not configured");
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.CUSTOM_REQUEST_FROM?.trim() || user,
    to,
    replyTo: request.replyTo,
    subject,
    html,
    text,
    attachments: attachment
      ? [
          {
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
          },
        ]
      : undefined,
  });
}
