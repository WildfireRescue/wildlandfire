import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MapPin } from 'lucide-react';

// Sample "recent" donations for social proof
const sampleDonations = [
  { name: "Sarah M.", location: "California", amount: 100, timeAgo: "2 min ago" },
  { name: "John D.", location: "Oregon", amount: 250, timeAgo: "5 min ago" },
  { name: "Emily R.", location: "Washington", amount: 500, timeAgo: "8 min ago" },
  { name: "Michael S.", location: "Idaho", amount: 50, timeAgo: "12 min ago" },
  { name: "Jennifer L.", location: "Montana", amount: 1000, timeAgo: "15 min ago" },
  { name: "David K.", location: "Colorado", amount: 100, timeAgo: "18 min ago" },
];

export function LiveDonationNotifications() {
  const [currentDonation, setCurrentDonation] = useState<typeof sampleDonations[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show after user has been on page for 30 seconds
    const initialDelay = setTimeout(() => {
      showRandomDonation();
      
      // Then show a new one every 120-180 seconds (2-3 minutes)
      const interval = setInterval(() => {
        showRandomDonation();
      }, Math.random() * 60000 + 120000); // Random between 120-180 seconds

      return () => clearInterval(interval);
    }, 30000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showRandomDonation = () => {
    const randomDonation = sampleDonations[Math.floor(Math.random() * sampleDonations.length)];
    setCurrentDonation(randomDonation);
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {isVisible && currentDonation && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: -50 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-primary/30 rounded-2xl shadow-2xl backdrop-blur-lg overflow-hidden">
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <div className="relative p-4 flex items-start gap-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300,
                  delay: 0.1 
                }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-primary/30 rounded-full blur-md"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative bg-primary/20 p-3 rounded-full border border-primary/40">
                    <Heart className="text-primary fill-primary" size={20} />
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {currentDonation.name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {currentDonation.timeAgo}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span>{currentDonation.location}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground">Donated</span>
                    <span className="text-lg font-bold text-primary">
                      ${currentDonation.amount}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Pulse indicator */}
              <motion.div
                className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Progress bar at bottom */}
            <motion.div
              className="h-1 bg-primary/30"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              style={{ transformOrigin: "left" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}