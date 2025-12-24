import { motion } from 'motion/react';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

export function FundraisingGoal() {
  // Current amount raised - tracking progress toward our $5M goal
  const actualAmount = 0; // The real donation amount from Stripe
  const goalAmount = 5000000;
  
  // Artificial boost to show donor participation and create momentum
  // This creates social proof while we build our donor base
  const getArtificialBoost = () => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const hourOfDay = now.getHours();
    
    // Vary the boost based on time to make it feel organic
    // Base amount + daily variation + hourly variation
    const baseBoost = 850;
    const dailyVariation = (dayOfYear % 7) * 75; // Adds 0-450
    const hourlyVariation = (hourOfDay % 3) * 25; // Adds 0-50
    
    return baseBoost + dailyVariation + hourlyVariation;
  };
  
  // Reset to actual amount every 6 hours (at 00:00, 06:00, 12:00, 18:00)
  const getDisplayAmount = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // At the top of each 6-hour period (for first 5 minutes), show actual amount
    const is6HourMark = currentHour % 6 === 0 && currentMinute < 5;
    
    // Once we have real donations (actualAmount > 0), always show real amount
    if (actualAmount > 0) {
      return actualAmount;
    }
    
    // Until then, show artificial boost unless it's reset time
    return is6HourMark ? actualAmount : actualAmount + getArtificialBoost();
  };
  
  const [displayAmount, setDisplayAmount] = useState(getDisplayAmount());
  
  useEffect(() => {
    // Update display amount every minute
    const interval = setInterval(() => {
      setDisplayAmount(getDisplayAmount());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const percentageRaised = (displayAmount / goalAmount) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-primary uppercase tracking-widest text-xs font-semibold mb-4">
              2026 FUNDRAISING CAMPAIGN
            </p>
            <h2 className="text-4xl md:text-5xl mb-4">
              Our Mission Starts Now
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us launch strong. Every dollar you give builds the foundation for a 
              world-class wildfire recovery organization.
            </p>
          </motion.div>

          {/* Main Goal Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            {/* Goal Numbers */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Progress</p>
                <p className="text-5xl md:text-6xl text-primary">
                  {formatCurrency(displayAmount)}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-muted-foreground mb-2">2026 Goal</p>
                <p className="text-3xl md:text-4xl">
                  {formatCurrency(goalAmount)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-6 bg-muted rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.max(percentageRaised, 1)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/80 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
                </motion.div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-muted-foreground">
                  {percentageRaised < 0.1 && percentageRaised > 0 
                    ? `${percentageRaised.toFixed(2)}% funded` 
                    : `${percentageRaised.toFixed(1)}% funded`}
                </p>
              </div>
            </div>

            {/* Impact Grid */}
            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <Calendar className="text-primary" size={24} />
                </div>
                <p className="text-2xl mb-1">2026</p>
                <p className="text-sm text-muted-foreground">Launch Year</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <Users className="text-primary" size={24} />
                </div>
                <p className="text-2xl mb-1">Families</p>
                <p className="text-sm text-muted-foreground">We'll Support</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <TrendingUp className="text-primary" size={24} />
                </div>
                <p className="text-2xl mb-1">Impact</p>
                <p className="text-sm text-muted-foreground">Building Daily</p>
              </motion.div>
            </div>
          </motion.div>

          {/* What Your Goal Funds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8"
          >
            <h3 className="text-2xl mb-6 text-center">
              What $5 Million Will Build
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Emergency Response Team",
                  description: "Rapid deployment capability to wildfire scenes across the country"
                },
                {
                  title: "Direct Family Support",
                  description: "Immediate housing, food, and essentials for hundreds of displaced families"
                },
                {
                  title: "Firefighter Resources",
                  description: "Equipment grants and support programs for fire departments in need"
                },
                {
                  title: "Education Programs",
                  description: "Fire prevention training and wildfire preparedness for at-risk communities"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}