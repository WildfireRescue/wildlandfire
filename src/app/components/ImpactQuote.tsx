import { motion } from 'motion/react';

export function ImpactQuote() {
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Card container */}
          <div className="relative bg-gradient-to-br from-card via-card to-secondary/30 border border-border rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10">
              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-primary uppercase tracking-widest text-xs font-semibold mb-8"
              >
                YOUR IMPACT
              </motion.p>

              {/* Main Quote */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight"
              >
                Communities rise from the ashes, but never alone.
              </motion.h2>

              {/* Subtext in italic */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-primary italic font-light"
              >
                When the smoke clears, your impact is what remains.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
