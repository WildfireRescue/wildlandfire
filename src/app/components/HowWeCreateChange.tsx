import { motion } from 'motion/react';

export function HowWeCreateChange() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl mb-4">How We'll Create Change</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We won't just write checks. We'll walk alongside survivors through every step of their recovery journey.
          </p>
        </motion.div>
      </div>
    </section>
  );
}