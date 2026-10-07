import Link from "next/link";
import type { Metadata } from "next";
import Stripe from "stripe";
import { ClearCartOnSuccess } from "@/components/ClearCartOnSuccess";
import { formatPrice, fromMinorUnits } from "@/lib/money";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Order confirmed — Bleach Tops",
};

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function productFromPrice(price: Stripe.Price | string | null | undefined) {
  if (!price || typeof price === "string") return null;
  return typeof price.product === "object" ? price.product : null;
}

function formatAddress(details: Stripe.Checkout.Session.CollectedInformation.ShippingDetails | null) {
  if (!details) return null;

  const { name, address } = details;
  const lines = [
    name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);

  return lines;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = asString((await searchParams).session_id);

  if (!sessionId) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
          We couldn’t find that order
        </h1>
        <p className="mt-3 text-stone-600">
          This confirmation link is missing a session. If you completed payment,
          check the email from Stripe or return to the shop.
        </p>
        <ClearCartOnSuccess />
        <Link
          href="/"
          className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-stone-950 px-6 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: [
        "line_items.data.price.product",
        "shipping_cost.shipping_rate",
      ],
    });
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
          We couldn’t load this order
        </h1>
        <p className="mt-3 text-stone-600">
          The Stripe session could not be retrieved. If you were charged, keep
          your receipt and we’ll sort it from there.
        </p>
        <ClearCartOnSuccess />
        <Link
          href="/"
          className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-stone-950 px-6 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  const paid =
    session.status === "complete" || session.payment_status === "paid";
  const currency = session.currency ?? "gbp";
  const lineItems = session.line_items?.data ?? [];
  const shippingRate = session.shipping_cost?.shipping_rate;
  const shippingName =
    shippingRate && typeof shippingRate !== "string"
      ? shippingRate.display_name
      : "Shipping";
  const shippingLines = formatAddress(
    session.collected_information?.shipping_details ?? null,
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
      <ClearCartOnSuccess />

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
        {paid ? "Order confirmed" : "Payment pending"}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
        {paid ? "Thank you for your order" : "We’re still waiting on payment"}
      </h1>
      <p className="mt-3 text-stone-600">
        {paid
          ? "Your 1-of-1 bleach top is confirmed. A receipt is on its way to your email."
          : "This checkout session is not marked as paid yet. If you just paid, refresh in a moment."}
      </p>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">
              Order summary
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {session.customer_details?.email ?? "Stripe Checkout"}
            </p>
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
            {session.id}
          </p>
        </div>

        <ul className="divide-y divide-stone-100">
          {lineItems.map((item) => {
            const product = productFromPrice(item.price);
            const title =
              (product && "name" in product && product.name) ||
              item.description ||
              "Item";
            const detail =
              (product &&
                "description" in product &&
                typeof product.description === "string" &&
                product.description) ||
              null;

            return (
              <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-stone-950">{title}</p>
                  <p className="mt-0.5 text-sm text-stone-500">
                    {detail ? `${detail} · ` : ""}
                    Qty {item.quantity ?? 1}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold">
                  {formatPrice(fromMinorUnits(item.amount_total), currency)}
                </p>
              </li>
            );
          })}
        </ul>

        <dl className="space-y-2 border-t border-stone-100 pt-4 text-sm">
          <div className="flex justify-between gap-4 text-stone-600">
            <dt>Subtotal</dt>
            <dd>
              {formatPrice(
                fromMinorUnits(session.amount_subtotal ?? 0),
                currency,
              )}
            </dd>
          </div>
          {session.shipping_cost ? (
            <div className="flex justify-between gap-4 text-stone-600">
              <dt>{shippingName}</dt>
              <dd>
                {formatPrice(
                  fromMinorUnits(session.shipping_cost.amount_total),
                  currency,
                )}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 text-base font-semibold text-stone-950">
            <dt>Total</dt>
            <dd>
              {formatPrice(fromMinorUnits(session.amount_total ?? 0), currency)}
            </dd>
          </div>
        </dl>

        {shippingLines && shippingLines.length > 0 ? (
          <div className="mt-5 border-t border-stone-100 pt-4">
            <h3 className="text-sm font-semibold text-stone-950">Ship to</h3>
            <address className="mt-1 text-sm not-italic leading-6 text-stone-600">
              {shippingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        ) : null}
      </section>

      <Link
        href="/"
        className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-stone-950 px-6 text-sm font-semibold text-white"
      >
        Continue shopping
      </Link>
    </main>
  );
}
