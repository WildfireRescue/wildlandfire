import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X } from 'lucide-react';

export function MobileStickyDonateBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling down 500px
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY < 300) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        >
          <div className="bg-gradient-to-r from-primary via-primary to-orange-600 px-4 py-3 shadow-2xl border-t-2 border-primary/30 backdrop-blur-lg">
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <div className="relative flex items-center justify-between gap-3">
              {/* Left: Message */}
              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Heart className="text-white fill-white" size={24} />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm leading-tight">
                    Help Wildfire Survivors
                  </span>
                  <span className="text-white/90 text-xs">
                    Every dollar rebuilds lives
                  </span>
                </div>
              </div>

              {/* Right: CTA + Dismiss */}
              <div className="flex items-center gap-2">
                <motion.a
                  href="#donate"
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-primary font-bold text-sm rounded-lg shadow-lg min-h-[48px] flex items-center justify-center"
                >
                  Donate
                </motion.a>

                <button
                  onClick={handleDismiss}
                  className="p-3 text-white/80 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                  aria-label="Dismiss"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Progress indicator - shows time until auto-hide */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-white/30"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 30, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
