import { motion } from 'motion/react';

const partners = [
  "Local Fire Departments",
  "Community Organizations",
  "Mental Health Professionals",
  "Housing Assistance Groups",
  "Educational Institutions",
  "Emergency Response Teams"
];

export function TrustIndicators() {
  return (
    <section className="py-12 bg-card/30 border-y border-border">
      <div className="container mx-auto px-4">
        {/* Partners */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-center text-muted-foreground mb-6 text-sm uppercase tracking-wider">
            Working Together With
          </h3>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {partners.map((partner, index) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-background/50 border border-border/50 rounded-full text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}