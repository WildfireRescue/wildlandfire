import { motion } from 'motion/react';
import { Heart, Gift, Users } from 'lucide-react';

export function DonateHero() {
  return (
    <section className="relative py-12 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Heart className="text-primary mx-auto" size={48} fill="currentColor" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl mb-4">
            Give Hope Today
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-8 leading-relaxed">
            Your donation doesn't just help rebuild homes. It rebuilds lives, restores dignity, 
            and proves to someone who's lost everything that{' '}
            <span className="text-foreground font-semibold">the world still cares about them.</span>
          </p>

          {/* Quick Impact Preview */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              {
                amount: "$50",
                impact: "Provides emergency supplies for a family",
                icon: Gift
              },
              {
                amount: "$250",
                impact: "Funds fire prevention education for a community",
                icon: Users
              },
              {
                amount: "$1,000",
                impact: "Provides housing assistance for multiple families",
                icon: Heart
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="bg-card border border-primary/30 rounded-xl p-6"
                >
                  <Icon className="text-primary mx-auto mb-3" size={32} />
                  <div className="text-3xl text-primary mb-2">{item.amount}</div>
                  <p className="text-sm text-muted-foreground">{item.impact}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}