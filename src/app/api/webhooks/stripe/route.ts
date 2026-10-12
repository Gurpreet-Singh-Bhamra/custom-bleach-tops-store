import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful checkout session
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve line items to display purchased items in the email
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const customerEmail = session.customer_details?.email;

    if (customerEmail) {
      try {
        await resend.emails.send({
          from: 'JBDesignz <orders@jbdesignz.uk>', // Replace with your verified Resend domain sender
          to: [customerEmail],
          subject: 'Order Confirmation - JBDesignz',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Thank you for your order!</h2>
              <p>Your order <strong>#${session.id.slice(-8)}</strong> is confirmed.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <h3>Items Ordered:</h3>
              <ul>
                ${lineItems.data
                  .map(
                    (item) =>
                      `<li>${item.description} - Qty: ${item.quantity} - £${(
                        (item.amount_total || 0) / 100
                      ).toFixed(2)}</li>`
                  )
                  .join('')}
              </ul>
              <p><strong>Total Paid:</strong> £${((session.amount_total || 0) / 100).toFixed(2)}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p>We're getting your 1-of-1 piece ready for shipment. If you have any questions, simply reply to this email!</p>
            </div>
          `,
        });
        console.log(`Order confirmation email sent to ${customerEmail}`);
      } catch (emailErr) {
        console.error('Failed to send Resend email:', emailErr);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}