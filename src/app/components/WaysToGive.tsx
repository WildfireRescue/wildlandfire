import { motion } from 'motion/react';
import { Button } from './ui/button';

export function WaysToGive() {
  return (
    <section className="py-12 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl mb-8 text-center">More Ways to Give</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Monthly Giving",
                description: "Become a Recovery Partner with recurring donations. Provide steady, reliable support.",
                action: "Start Monthly Gift"
              },
              {
                title: "Corporate Matching",
                description: "Check if your employer will match your donation to double your impact.",
                action: "Learn About Matching"
              },
              {
                title: "Legacy Giving",
                description: "Include us in your estate plans to create lasting impact for future survivors.",
                action: "Explore Legacy Options"
              }
            ].map((option, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card border border-border rounded-xl p-6 flex flex-col"
              >
                <h3 className="text-xl font-semibold mb-3">{option.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{option.description}</p>
                <Button variant="outline" className="w-full">
                  {option.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}