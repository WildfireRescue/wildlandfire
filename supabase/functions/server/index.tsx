import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import Stripe from "npm:stripe@17.4.0";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Stripe with secret key from environment
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-39bb2c80/health", (c) => {
  return c.json({ status: "ok" });
});

// Create Stripe payment intent
app.post("/make-server-39bb2c80/create-payment-intent", async (c) => {
  try {
    const body = await c.req.json();
    const { amount, donorName, donorEmail } = body;

    // Validate amount (minimum $1)
    if (!amount || amount < 100) {
      return c.json({ error: 'Donation amount must be at least $1' }, 400);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      metadata: {
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail || '',
      },
      description: `Donation to The Wildland Fire Recovery Fund from ${donorName || 'Anonymous'}`,
    });

    console.log(`Payment intent created: ${paymentIntent.id} for $${amount / 100}`);

    return c.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return c.json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    }, 500);
  }
});

// Record successful donation
app.post("/make-server-39bb2c80/record-donation", async (c) => {
  try {
    const body = await c.req.json();
    const { paymentIntentId, amount, donorName, donorEmail } = body;

    // Store donation record in KV store
    const donationKey = `donation:${paymentIntentId}`;
    const donationData = {
      paymentIntentId,
      amount,
      donorName: donorName || 'Anonymous',
      donorEmail: donorEmail || '',
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    await kv.set(donationKey, donationData);

    console.log(`Donation recorded: ${paymentIntentId} - $${amount / 100} from ${donorName || 'Anonymous'}`);

    return c.json({ 
      success: true,
      message: 'Donation recorded successfully' 
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    return c.json({ 
      error: 'Failed to record donation',
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);