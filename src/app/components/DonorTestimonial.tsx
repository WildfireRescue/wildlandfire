import { motion } from 'motion/react';

export function DonorTestimonial() {
  return (
    <section className="py-10 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/30 rounded-2xl p-10 text-center"
        >
          <div className="text-5xl mb-4">💡</div>
          <p className="text-xl md:text-2xl mb-4 leading-relaxed">
            Imagine being one of our first donors—the ones who believed in this vision from day one. 
            Your donation today won't just help survivors rebuild; it'll be part of our founding story 
            as we grow into the most trusted name in wildfire recovery.
          </p>
          <div className="font-semibold text-primary">Be a Founding Donor</div>
        </motion.div>
      </div>
    </section>
  );
}