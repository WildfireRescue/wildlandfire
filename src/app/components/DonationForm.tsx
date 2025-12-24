import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X, Loader2, CheckCircle, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// Initialize Stripe with LIVE key
const stripePromise = loadStripe('pk_live_51SaUet0HqeUkkipyn2FiPTXWNbfgEZMSei7xzJZrpepi5NFudAVnz7iTYSVig6SVcKn5hCM708py0rMI7JX16jEM00eCi9eedw');

interface DonationFormProps {
  onClose: () => void;
}

const donationPresets = [
  { amount: 50, label: '$50' },
  { amount: 100, label: '$100' },
  { amount: 250, label: '$250' },
  { amount: 500, label: '$500' },
  { amount: 1000, label: '$1,000' },
  { amount: 5000, label: '$5,000' },
];

function CheckoutForm({ amount, donorName, donorEmail, onSuccess, onBack }: {
  amount: number;
  donorName: string;
  donorEmail: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Record donation in database
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-39bb2c80/record-donation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            amount,
            donorName,
            donorEmail,
          }),
        });

        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl mb-2">Complete Your Donation</h3>
        <p className="text-muted-foreground mb-6">
          ${(amount / 100).toFixed(2)} donation to The Wildland Fire Recovery Fund
        </p>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Donate Now'}
        </button>
      </div>
    </form>
  );
}

export function DonationForm({ onClose }: DonationFormProps) {
  const [step, setStep] = useState<'amount' | 'payment' | 'success'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(parseInt(value) * 100);
    } else {
      setSelectedAmount(null);
    }
  };

  const handleContinue = async () => {
    if (!selectedAmount || selectedAmount < 100) {
      alert('Please select or enter a donation amount of at least $1');
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-39bb2c80/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            amount: selectedAmount,
            donorName: donorName || 'Anonymous',
            donorEmail,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setIsLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setStep('success');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl">Make a Donation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'amount' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Select Amount</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {donationPresets.map((preset) => (
                    <button
                      key={preset.amount}
                      onClick={() => handleAmountSelect(preset.amount * 100)}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        selectedAmount === preset.amount * 100
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send you a receipt and updates on your impact
                  </p>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedAmount || isLoading}
                className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : `Continue to Payment`}
              </button>
            </div>
          )}

          {step === 'payment' && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#FF9933',
                    colorBackground: '#0a0a0a',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <CheckoutForm
                amount={selectedAmount!}
                donorName={donorName || 'Anonymous'}
                donorEmail={donorEmail}
                onSuccess={handleSuccess}
                onBack={() => setStep('amount')}
              />
            </Elements>
          )}

          {step === 'success' && (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl mb-2">Thank You! 🔥</h3>
                <p className="text-muted-foreground">
                  Your donation of ${(selectedAmount! / 100).toFixed(2)} has been received.
                </p>
                <p className="text-muted-foreground mt-2">
                  You're helping wildfire survivors rise from the ashes.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}