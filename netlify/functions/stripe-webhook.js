const Stripe = require('stripe');

// Public Supabase info (non-secret)
const projectId = 'qckavajzhqlzicnjphvp';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFja2F2YWp6aHFsemljbmpwaHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNTc3NTAsImV4cCI6MjA4MTYzMzc1MH0.fSeDguIEeKlsG1pP4DxkNnlwJhA6iJihboLiNiyWuD0';

exports.handler = async function (event, context) {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET env var');
    return { statusCode: 500, body: JSON.stringify({ error: 'Webhook not configured' }) };
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!sig) {
    console.error('Missing stripe-signature header');
    return { statusCode: 400, body: 'Missing stripe-signature header' };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

  let stripeEvent;
  try {
    // event.body must be the raw body (string)
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;

      // Retrieve session to get payment_intent and customer details
      const sessionFull = await stripe.checkout.sessions.retrieve(session.id);

      const paymentIntentId = sessionFull.payment_intent || sessionFull.payment_intent?.id || null;
      const amount = sessionFull.amount_total || null; // cents
      const donorName = (sessionFull.customer_details && sessionFull.customer_details.name) || 'Anonymous';
      const donorEmail = (sessionFull.customer_details && sessionFull.customer_details.email) || '';

      console.log('Checkout session completed:', { sessionId: session.id, paymentIntentId, amount, donorName, donorEmail });

      if (paymentIntentId && amount) {
        // Record donation via the Supabase server function
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-39bb2c80/record-donation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ paymentIntentId, amount, donorName, donorEmail }),
        });

        const json = await res.json();
        console.log('record-donation response', json);
      } else {
        console.warn('Missing paymentIntentId or amount on session — skipping record');
      }
    }

    // Respond with 200 to acknowledge
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Error handling webhook event:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
