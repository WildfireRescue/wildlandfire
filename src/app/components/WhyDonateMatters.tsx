import { motion } from 'motion/react';
import { DollarSign, Shield, Users, CheckCircle } from 'lucide-react';

export function WhyDonateMatters() {
  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl mb-8 text-center">Why Your Donation Matters More Than Ever</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: DollarSign,
                title: "Immediate Impact",
                description: "Your donation goes to work rapidly. Emergency grants are distributed immediately to families in crisis. Every minute counts when someone has lost everything."
              },
              {
                icon: Shield,
                title: "100% Tax Deductible",
                description: "We're a registered 501(c)(3) nonprofit. Your generosity is fully tax-deductible, and you'll receive documentation for your records."
              },
              {
                icon: Users,
                title: "Community Multiplier",
                description: "When you give, you inspire others to give. Your donation often leads to matching gifts from corporations and encourages others to join the cause."
              },
              {
                icon: CheckCircle,
                title: "Full Transparency",
                description: "We're building this organization the right way from day one. Every dollar is tracked and accounted for with complete transparency—you'll always know where your money goes."
              }
            ].map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card border border-border rounded-xl p-8"
                >
                  <Icon className="text-primary mb-4" size={40} />
                  <h3 className="text-2xl mb-4 font-semibold">{reason.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}