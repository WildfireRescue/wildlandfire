import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export function GrantsHero() {
  return (
    <section className="relative py-20 pb-8 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Heart className="text-primary mx-auto" size={56} fill="currentColor" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl mb-6">
            Grant Applications
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-8 leading-relaxed">
            Supporting wildfire survivors, their families, and the brave fire departments who serve them.
          </p>
        </motion.div>
      </div>
    </section>
  );
}