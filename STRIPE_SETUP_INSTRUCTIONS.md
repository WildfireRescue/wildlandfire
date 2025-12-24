# Stripe Donation Setup Instructions

## 🔥 Your Custom Stripe Integration is Ready!

Follow these steps to complete the setup:

---

## Step 1: Get Your Stripe API Keys

1. Go to https://stripe.com and create a free account (if you don't have one)
2. Log into your Stripe Dashboard: https://dashboard.stripe.com
3. Click **"Developers"** in the top right corner
4. Click **"API keys"** in the left sidebar
5. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Safe to use in frontend
   - **Secret key** (starts with `sk_test_...`) - KEEP THIS PRIVATE!

---

## Step 2: Add Your Secret Key (Already Done! ✅)

You've already added your `STRIPE_SECRET_KEY` as an environment variable in Supabase.

---

## Step 3: Add Your Publishable Key

Open `/src/app/components/DonationForm.tsx` and find this line:

```typescript
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
```

**Replace** `'pk_test_YOUR_PUBLISHABLE_KEY_HERE'` with your actual Stripe publishable key:

```typescript
const stripePromise = loadStripe('pk_test_51Abc123...xyz');
```

**This is safe to put in your frontend code!** The publishable key is designed to be public.

---

## Step 4: Test Your Donation Form

1. Click the orange **"Donate Now"** button (bottom right of any page)
2. Enter a donation amount
3. Use these **test card numbers** (they won't charge real money):

   **✅ Success:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

   **❌ Declined:**
   - Card: `4000 0000 0000 0002`

4. Complete the test donation and see the success message! 🎉

---

## Step 5: Go Live (When Ready)

When you're ready to accept real donations:

1. Complete Stripe account verification
2. Switch to **Live Mode** in Stripe Dashboard (toggle in top right)
3. Get your **Live API keys** (they start with `pk_live_...` and `sk_live_...`)
4. Update both keys:
   - Update `STRIPE_SECRET_KEY` environment variable in Supabase
   - Update `stripePromise` in `/src/app/components/DonationForm.tsx` with live publishable key

---

## Features You Have:

✅ **Secure payment processing** (PCI compliant via Stripe)  
✅ **Beautiful donation form** matching your brand  
✅ **Preset amounts** ($25, $50, $100, $250) + custom  
✅ **Optional donor info** (name & email)  
✅ **Donation records** stored in database  
✅ **Success confirmation** page  
✅ **Floating "Donate Now" button** on all pages  
✅ **Mobile responsive** design  
✅ **Dark theme** matching your site  

---

## What Happens When Someone Donates:

1. User clicks "Donate Now" button
2. Selects amount and enters optional info
3. Stripe payment form appears
4. Payment is processed securely by Stripe
5. Donation is recorded in your database with:
   - Payment Intent ID
   - Amount
   - Donor name (or "Anonymous")
   - Donor email
   - Timestamp
   - Status
6. Success message is shown
7. Stripe sends receipts automatically

---

## Need Help?

- **Stripe Documentation:** https://stripe.com/docs
- **Test Cards:** https://stripe.com/docs/testing
- **Stripe Support:** Available in your Dashboard

---

## Security Notes:

⚠️ **NEVER share your Secret Key** (`sk_test_...` or `sk_live_...`)  
✅ Publishable Key (`pk_test_...` or `pk_live_...`) is safe to share  
✅ All payments are processed securely by Stripe  
✅ Your site never stores credit card data  
✅ Stripe handles PCI compliance  

---

## 🔥 You're All Set!

Your donation system is ready to help wildfire survivors rise from the ashes!
