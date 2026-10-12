import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Delivery & Shipping Info — Bleach Tops",
};

export default function ShippingPage() {
  return (
    <PolicyLayout title="Delivery & Shipping Info">
      <PolicySection title="Processing & Dispatch">
        <p>
          Orders are handmade and packed with care. Please allow{" "}
          <strong className="font-semibold text-zinc-200">
            1 to 3 business days
          </strong>{" "}
          for processing and dispatch after your order is placed.
        </p>
      </PolicySection>

      <PolicySection title="Shipping Rates & Delivery Timeframes">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-zinc-200">
              UK Standard Shipping:
            </strong>{" "}
            £3.99 (3 to 5 business days via Royal Mail tracked service)
          </li>
          <li>
            <strong className="font-semibold text-zinc-200">
              Europe Shipping:
            </strong>{" "}
            £9.99 (5 to 10 business days via Royal Mail International Tracked)
          </li>
          <li>
            <strong className="font-semibold text-zinc-200">
              Rest of World Shipping:
            </strong>{" "}
            £14.99 (7 to 14 business days via Royal Mail International Tracked)
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Customs & Import Duties">
        <p>
          International customers are responsible for any local customs fees,
          import duties, or taxes levied by their destination country. These
          charges are not collected at checkout and may be requested by the
          carrier or customs authority on delivery.
        </p>
      </PolicySection>

      <PolicySection title="Tracking & Questions">
        <p>
          Tracking links are emailed when your order is dispatched. For
          delivery questions, contact customer support at{" "}
          <a
            href="mailto:orders@jbdesignz.uk"
            className="font-medium text-rust hover:text-rust-hover"
          >
            orders@jbdesignz.uk
          </a>
          .
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
