import { motion } from 'motion/react';
import { Shield, Clock, Heart, TrendingUp } from 'lucide-react';

const commitments = [
  {
    icon: Shield,
    title: "Radical Transparency",
    quote: "Every dollar tracked. Every impact measured. Every decision made with survivors in mind. We're building trust from day one.",
  },
  {
    icon: Clock,
    title: "Speed When It Matters",
    quote: "In disaster recovery, hours matter. Our goal is rapid emergency response. We get critical resources to survivors before bureaucracy can slow us down.",
  },
  {
    icon: Heart,
    title: "Dignity, Not Charity",
    quote: "Survivors don't need pity. They need support to rebuild with dignity. We meet people where they are and empower them to rise again.",
  },
  {
    icon: TrendingUp,
    title: "Built to Scale",
    quote: "We're starting lean and focused, but our vision is big: become the most trusted name in wildfire recovery. Every donation brings us closer.",
  }
];

export function TestimonialWall() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-center">What We Stand For</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our values are unshakeable. Here's what guides every decision we make.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {commitments.map((commitment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <commitment.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">{commitment.title}</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{commitment.quote}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}