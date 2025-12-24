import { motion } from 'motion/react';
import { Shield, Lock, Award, CheckCircle, Heart } from 'lucide-react';

const badges = [
  {
    icon: Award,
    title: "501(c)(3)",
    subtitle: "Tax Deductible",
    color: "text-green-400"
  },
  {
    icon: Shield,
    title: "Secure",
    subtitle: "SSL Encrypted",
    color: "text-blue-400"
  },
  {
    icon: CheckCircle,
    title: "Verified",
    subtitle: "Nonprofit Org",
    color: "text-primary"
  },
  {
    icon: Lock,
    title: "Safe",
    subtitle: "PCI Compliant",
    color: "text-purple-400"
  },
  {
    icon: Heart,
    title: "Transparent",
    subtitle: "100% Accountability",
    color: "text-red-400"
  }
];

export function PremiumTrustBadges() {
  return (
    <section className="py-12 border-y border-border/50 bg-gradient-to-b from-background via-card/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Trusted & Verified
          </p>
          <h3 className="text-xl">Your Donation is Safe & Tax-Deductible</h3>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-8 max-w-5xl mx-auto">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className="flex flex-col items-center gap-2 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/30 transition-all duration-300 min-w-[120px] group cursor-default"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative bg-background/80 p-3 rounded-full border border-border group-hover:border-primary/50 transition-colors duration-300">
                    <Icon className={`${badge.color} transition-transform duration-300 group-hover:scale-110`} size={24} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security Statement */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto"
        >
          🔒 Your donation is processed securely through Stripe. We never store your credit card information. 
          All donations are tax-deductible to the fullest extent allowed by law.
        </motion.p>
      </div>
    </section>
  );
}
