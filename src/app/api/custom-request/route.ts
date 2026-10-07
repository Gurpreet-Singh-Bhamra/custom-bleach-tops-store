import { NextResponse } from "next/server";
import {
  isCustomRequestError,
  isHoneypotFilled,
  parseCustomRequest,
} from "@/lib/custom-request";
import { isMailConfigured, sendCustomRequestEmail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    if (isHoneypotFilled(formData)) {
      return NextResponse.json({ ok: true });
    }

    const customRequest = await parseCustomRequest(formData);

    if (!isMailConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Unable to send your request just now. Please try again later." },
          { status: 503 },
        );
      }

      console.warn("Custom request received (email not configured)", {
        fullName: customRequest.fullName,
        contact: customRequest.contact,
        garment: customRequest.garment,
        size: customRequest.size,
        colour: customRequest.colour,
        notes: customRequest.notes,
        image: customRequest.image?.filename ?? null,
      });

      return NextResponse.json({ ok: true });
    }

    await sendCustomRequestEmail(customRequest);
    return NextResponse.json({ ok: true });
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
