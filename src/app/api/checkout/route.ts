import { NextResponse } from "next/server";
import catalog from "@/data/products.json";
import { CHECKOUT_CURRENCY, toMinorUnits } from "@/lib/money";
import { getBaseUrl, getStripe, toAbsoluteUrl } from "@/lib/stripe";
import type { Product } from "@/types/product";

const products = catalog as Product[];

const SHIPPING_COUNTRIES = ["GB", "US", "CA", "AU", "DE", "FR"] as const;

type IncomingItem = {
  title?: unknown;
  size?: unknown;
  price?: unknown;
  quantity?: unknown;
  image?: unknown;
  productId?: unknown;
};

function findProduct(item: IncomingItem) {
  if (typeof item.productId === "string") {
    const byId = products.find((product) => product.id === item.productId);
    if (byId) return byId;
  }

  if (typeof item.title === "string") {
    return products.find((product) => product.title === item.title);
  }

  return undefined;
}

function parseItems(body: unknown) {
  const items = Array.isArray(body)
    ? body
    : body &&
        typeof body === "object" &&
        Array.isArray((body as { items?: unknown }).items)
      ? (body as { items: IncomingItem[] }).items
      : null;

  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  return items.map((raw) => {
    const item = (raw ?? {}) as IncomingItem;
    const product = findProduct(item);

    if (!product || !product.inStock) {
      throw new Error("One or more items are no longer available");
    }

    if (
      typeof item.size !== "string" ||
      !(product.sizes as string[]).includes(item.size)
    ) {
      throw new Error(`Invalid size for ${product.title}`);
    }

    const quantity =
      typeof item.quantity === "number" && Number.isInteger(item.quantity)
        ? item.quantity
        : Number.parseInt(String(item.quantity), 10);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for ${product.title}`);
    }

    const image =
      typeof item.image === "string" && item.image.startsWith("/media/")
        ? item.image
        : product.image;

    return {
      product,
      size: item.size,
      quantity,
      image,
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lineItems = parseItems(body);
    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "en-GB",
      submit_type: "pay",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: [...SHIPPING_COUNTRIES],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: "UK Standard Shipping",
            fixed_amount: {
              amount: toMinorUnits(3.99),
              currency: CHECKOUT_CURRENCY,
            },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: "UK Express Shipping",
            fixed_amount: {
              amount: toMinorUnits(6.99),
              currency: CHECKOUT_CURRENCY,
            },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: "International Tracked Shipping (USA & Rest of World)",
            fixed_amount: {
              amount: toMinorUnits(16.99),
              currency: CHECKOUT_CURRENCY,
            },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 9 },
            },
          },
        },
      ],
      line_items: lineItems.map(({ product, size, quantity, image }) => ({
        quantity,
        price_data: {
          currency: CHECKOUT_CURRENCY,
          unit_amount: toMinorUnits(product.price),
          product_data: {
            name: product.title,
            description: `Size ${size}`,
            images: [toAbsoluteUrl(image)],
            metadata: {
              productId: product.id,
              size,
            },
          },
        },
      })),
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start checkout";
    const status =
      message === "Cart is empty" ||
      message.startsWith("Invalid") ||
      message.includes("no longer available")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
