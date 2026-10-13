import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/PolicyLayout";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Refund & Returns Policy — Bleach Tops",
};

export default function ReturnsPage() {
  return (
    <PolicyLayout title="Refund & Returns Policy">
      <PolicySection title="1-of-1 Custom Nature">
        <p>
          Every piece is hand-bleached, so no two garments are identical.
          Variations in pattern, tone, and contrast are intentional and part of
          the handmade finish — they are not faults.
        </p>
      </PolicySection>

      <PolicySection title="14-Day Return Window">
        <p>
          Standard 1-of-1 pieces may be returned within{" "}
          <strong className="font-semibold text-zinc-200">
            14 days of delivery
          </strong>
          , provided they are unworn, unwashed, and in original condition with
          tags attached.
        </p>
      </PolicySection>

      <PolicySection title="Custom & Bespoke Requests">
        <p>
          Custom requests, bespoke pieces, or items altered or made specifically
          to individual customer specifications are{" "}
          <strong className="font-semibold text-zinc-200">
            strictly non-refundable and non-returnable
          </strong>
          , unless they arrive damaged or defective.
        </p>
      </PolicySection>

      <PolicySection title="Return Postage">
        <p>
          Buyers are responsible for covering return shipping costs. Please use
          a tracked delivery service and keep proof of postage until the refund
          is complete.
        </p>
      </PolicySection>

      <PolicySection title="Refund Processing">
        <p>
          Once we receive and inspect the returned item, refunds are processed
          back to the original payment method within{" "}
          <strong className="font-semibold text-zinc-200">
            3 to 5 business days
          </strong>
          .
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          To start a return, email{" "}
          <a
            href="mailto:orders@jbdesignz.uk"
            className="font-medium text-rust transition-colors hover:underline"
          >
            orders@jbdesignz.uk
          </a>{" "}
          with your order reference (for example{" "}
          <span className="font-mono text-zinc-200">#KMKBeDzu</span>).
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
