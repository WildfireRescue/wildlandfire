import { motion } from 'motion/react';
import { TrendingUp, Target, Eye } from 'lucide-react';

export function ImpactHero() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <TrendingUp className="text-green-400 mx-auto" size={56} />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl mb-6">
            Our Vision for Impact
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-8 leading-relaxed">
            We're building something powerful: a donation-driven fund where every dollar becomes hope, housing, and healing. 
            <span className="text-foreground font-semibold"> Here's our commitment for how your support will transform lives.</span>
          </p>

          {/* Transparency Promise */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            {[
              {
                icon: Eye,
                title: "100% Transparent",
                description: "See exactly where every dollar goes"
              },
              {
                icon: Target,
                title: "Mission Focused",
                description: "75% of funds go directly to survivors"
              },
              {
                icon: TrendingUp,
                title: "Measurable Results",
                description: "Track real outcomes and recovery milestones"
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <Icon className="text-primary mx-auto mb-3" size={32} />
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}