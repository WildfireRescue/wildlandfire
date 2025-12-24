import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';

export function HowWeDeployAid() {
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl mb-6">How We Deploy Aid</h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Our proactive approach means wildfire survivors get help without bureaucracy.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'We Respond',
                description: 'Our team deploys to major wildfire scenes within our coverage area—no application needed'
              },
              {
                step: '2',
                title: 'We Assess',
                description: 'We work directly with survivors on-site to understand immediate needs and long-term support'
              },
              {
                step: '3',
                title: 'We Deliver',
                description: 'Emergency funds, housing assistance, and ongoing support arrive rapidly'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-2xl mb-3 font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-primary/20 to-orange-500/20 border-2 border-primary/30 rounded-2xl p-8"
          >
            <p className="text-xl mb-4">
              <strong>Your donations power this rapid response.</strong>
            </p>
            <p className="text-muted-foreground mb-6">
              Every dollar you give helps us expand our coverage area, hire more field responders, and reach more families in their darkest hour.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <a href="#donate">
                <Heart size={20} className="mr-2" />
                Support Our Mission
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}