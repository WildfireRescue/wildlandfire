const Stripe = require("stripe");

exports.handler = async (event) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = JSON.parse(event.body || "{}");
    const {
      frequency, // "one_time" | "monthly"
      amount,    // number (dollars) for one-time OR selected tier amount for monthly
      lookupKey, // e.g. "monthly_25" (optional if you map by amount)
      successUrl,
      cancelUrl,
    } = body;

    if (!frequency) {
      return json(400, { error: "Missing frequency" });
    }

    const success_url =
      successUrl || `${process.env.URL || "http://localhost:8888"}/#/thank-you`;
    const cancel_url =
      cancelUrl || `${process.env.URL || "http://localhost:8888"}/#/donate`;

    // ---- Monthly (Subscriptions) ----
    if (frequency === "monthly") {
      // Prefer lookup key mapping (cleanest)
      const priceId =
        (lookupKey && priceFromLookupKey(lookupKey)) ||
        priceFromAmount(amount);

      if (!priceId) {
        return json(400, { error: "Missing or invalid monthly price selection" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url,
        // Optional but recommended:
        billing_address_collection: "auto",
        allow_promotion_codes: false,
      });

      return json(200, { url: session.url });
    }

    // ---- One-time (Payment) ----
    if (frequency === "one_time") {
      const dollars = Number(amount);
      if (!dollars || dollars < 1) {
        return json(400, { error: "Invalid amount" });
      }

      const cents = Math.round(dollars * 100);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Wildland Fire Recovery Fund Donation" },
              unit_amount: cents,
            },
            quantity: 1,
          },
        ],
        success_url: success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url,
        billing_address_collection: "auto",
      });

      return json(200, { url: session.url });
    }

    return json(400, { error: "Invalid frequency" });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return json(500, { error: err.message || String(err) });
  }
};

function json(statusCode, data) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

/**
 * Map lookup keys -> Stripe price IDs (store price IDs in env vars)
 */
function priceFromLookupKey(key) {
  const map = {
    monthly_10: process.env.STRIPE_PRICE_MONTHLY_10,
    monthly_25: process.env.STRIPE_PRICE_MONTHLY_25,
    monthly_50: process.env.STRIPE_PRICE_MONTHLY_50,
    monthly_100: process.env.STRIPE_PRICE_MONTHLY_100,
  };
  return map[key];
}

/**
 * Optional fallback: map by amount
 */
function priceFromAmount(amount) {
  const a = Number(amount);
  if (a === 10) return process.env.STRIPE_PRICE_MONTHLY_10;
  if (a === 25) return process.env.STRIPE_PRICE_MONTHLY_25;
  if (a === 50) return process.env.STRIPE_PRICE_MONTHLY_50;
  if (a === 100) return process.env.STRIPE_PRICE_MONTHLY_100;
  return null;
}
