import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Home, Users, Flame, Heart } from 'lucide-react';

const impactLevels = [
  { amount: 50, icon: Heart, impact: "Provides emergency supplies for 1 family", color: "text-red-400" },
  { amount: 100, icon: Users, impact: "Supports mental health counseling for 2 firefighters", color: "text-blue-400" },
  { amount: 250, icon: Flame, impact: "Funds fire prevention education for 1 community", color: "text-orange-400" },
  { amount: 500, icon: Home, impact: "Helps rebuild 1 family's home essentials", color: "text-green-400" },
  { amount: 1000, icon: Home, impact: "Provides housing assistance for multiple families", color: "text-purple-400" },
];

export function DonationCalculator() {
  const [amount, setAmount] = useState(100);

  async function startDonation() {
    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Donation checkout failed.");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }

  const impacts = [
    { amount: 50, description: 'Emergency food and essentials for 1 family for a week' },
    { amount: 100, description: 'Emergency shelter for 1 family for 3 days' },
    { amount: 250, description: 'Mental health counseling for 1 survivor' },
    { amount: 500, description: 'Safety equipment for 1 firefighter' },
    { amount: 1000, description: 'One month of temporary housing for 1 family' },
    { amount: 2500, description: 'Complete recovery support package for 1 family' },
  ];

  const getImpact = (inputAmount: number) => {
    for (let i = impacts.length - 1; i >= 0; i--) {
      if (inputAmount >= impacts[i].amount) {
        return impacts[i];
      }
    }
    return impacts[0];
  };

  const getImpactLevel = (inputAmount: number) => {
    for (let i = impactLevels.length - 1; i >= 0; i--) {
      if (inputAmount >= impactLevels[i].amount) {
        return impactLevels[i];
      }
    }
    return impactLevels[0];
  };

  const currentImpact = getImpact(amount);
  const currentLevel = getImpactLevel(amount);
  const IconComponent = currentLevel.icon;

  return (
    <section className="py-10 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-5xl md:text-6xl mb-4">Every Dollar Makes a Real Difference</h2>
          <p className="text-xl md:text-2xl text-primary max-w-3xl mx-auto">
            Click an amount below to discover exactly how your donation helps survivors
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12"
          >
            {/* Amount Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {impactLevels.map((level) => (
                <motion.button
                  key={level.amount}
                  onClick={() => setAmount(level.amount)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    amount === level.amount
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background/50 hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl">${level.amount}</div>
                </motion.button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block text-sm text-muted-foreground mb-2">Or enter custom amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-4 text-2xl bg-background border border-border rounded-lg"
                />
              </div>
            </div>

            {/* Impact Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={amount}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-primary/10 rounded-xl p-8 mb-8"
              >
                <div className="flex gap-4">
                  <IconComponent size={48} className="text-primary" />
                  <div>
                    <div className="text-3xl mb-2">${amount}</div>
                    <div className="text-lg">{currentImpact.description}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* STRIPE BUTTON */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={startDonation}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
              >
                <Heart size={24} className="mr-2" />
                Donate ${amount} Now
              </Button>
            </motion.div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              100% tax-deductible • Secure processing • Your donation goes directly to helping those in need
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
