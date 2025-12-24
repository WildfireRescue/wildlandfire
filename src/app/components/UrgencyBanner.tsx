import { motion } from 'motion/react';
import { AlertCircle, TrendingUp, Heart } from 'lucide-react';
import { Button } from './ui/button';

export function UrgencyBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="bg-primary/20 border-y border-primary/30 py-4 relative overflow-hidden"
    >
      {/* Animated pulse effect */}
      <motion.div
        className="absolute left-0 top-0 h-full w-1 bg-primary"
        animate={{
          scaleY: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Heart className="text-primary" size={24} />
            </motion.div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">Help wildfire survivors rebuild their lives with dignity and hope</span>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
          >
            <motion.a
              href="#donate"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart size={16} className="mr-2" />
              Donate Now
            </motion.a>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}