const Stripe = require('stripe');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { amount } = body;

    if (amount === undefined || amount === null) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing amount' }) };
    }

    const cents = Math.round(Number(amount) * 100);
    if (isNaN(cents) || cents < 100) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Donation amount must be at least $1' }) };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Stripe secret key not configured' }) };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = process.env.SITE_URL || process.env.URL || 'https://thewildlandfirerecoveryfund.org';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to The Wildland Fire Recovery Fund',
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/#thankyou?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#donate?canceled=true`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session', details: err.message }),
    };
  }
};
