import { motion } from 'motion/react';
import { Flame, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

export function UrgencyTopBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="relative w-full bg-gradient-to-r from-red-600/90 via-orange-600/90 to-primary/90 border-t border-primary/30 overflow-hidden"
    >
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
        }}
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Message */}
          <div className="flex items-center gap-3 flex-1">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="hidden sm:block"
            >
              <Flame className="text-white" size={24} />
            </motion.div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <p className="text-white font-bold text-sm sm:text-base">
                🚨 URGENT: 2026 Wildfire Season Approaching
              </p>
              <p className="text-white/90 text-xs sm:text-sm">
                Help us reach our $5M goal to be ready when disaster strikes
              </p>
            </div>
          </div>

          {/* Right: CTA + Close */}
          <div className="flex items-center gap-3">
            <motion.a
              href="#donate"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 px-5 py-2 bg-white text-red-600 font-bold text-sm rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <TrendingUp size={16} />
              Donate Now
            </motion.a>

            <button
              onClick={() => setIsVisible(false)}
              className="p-2.5 text-white/80 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Close banner"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundSize: '200% 100%'
        }}
      />
    </motion.div>
  );
}
