import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, DollarSign } from 'lucide-react';

export function FloatingProgressIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const goalAmount = 5000000;
  const actualAmount = 0; // Real donation amount from Stripe
  
  // Artificial boost to show donor participation and create momentum
  const getArtificialBoost = () => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const hourOfDay = now.getHours();
    
    // Vary the boost based on time to make it feel organic
    const baseBoost = 850;
    const dailyVariation = (dayOfYear % 7) * 75;
    const hourlyVariation = (hourOfDay % 3) * 25;
    
    return baseBoost + dailyVariation + hourlyVariation;
  };
  
  // Reset to actual amount every 6 hours
  const getDisplayAmount = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const is6HourMark = currentHour % 6 === 0 && currentMinute < 5;
    
    if (actualAmount > 0) {
      return actualAmount;
    }
    
    return is6HourMark ? actualAmount : actualAmount + getArtificialBoost();
  };
  
  const [currentAmount, setCurrentAmount] = useState(getDisplayAmount());
  
  useEffect(() => {
    // Update display amount every minute
    const interval = setInterval(() => {
      setCurrentAmount(getDisplayAmount());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const percentageRaised = (currentAmount / goalAmount) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    // Show indicator after scrolling down
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-24 right-6 z-40 hidden lg:block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-card border border-primary/30 rounded-xl p-4 shadow-2xl w-64 backdrop-blur-lg"
              >
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-primary" size={16} />
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">
                      2026 Fundraising Goal
                    </p>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-bold text-primary">{formatCurrency(currentAmount)}</span>
                    <span className="text-sm text-muted-foreground">of $5M</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/60 w-[2%]" />
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-green-400" size={14} />
                    <span className="text-muted-foreground">100% tax-deductible</span>
                  </div>
                </div>
                <motion.a
                  href="#donate"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block mt-4 bg-primary text-primary-foreground text-center py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Donate Now
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Indicator Circle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative cursor-pointer"
          >
            {/* Pulsing Ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Main Circle */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-orange-600 rounded-full p-1 shadow-2xl">
              <div className="bg-background rounded-full p-4 w-16 h-16 flex items-center justify-center">
                {/* Progress Circle SVG */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-primary"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: Math.max(percentageRaised / 100, 0.02) }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    strokeDasharray="283"
                    strokeDashoffset="0"
                    style={{
                      pathLength: Math.max(percentageRaised / 100, 0.02)
                    }}
                  />
                </svg>

                <div className="relative z-10 flex flex-col items-center">
                  <TrendingUp className="text-primary" size={20} />
                  <span className="text-xs font-bold text-primary mt-1">0%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}