import { motion } from 'motion/react';
import { Shield, CheckCircle, Heart } from 'lucide-react';

export function TrustBadges() {
  return (
    <section className="py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={20} />
            <span>SSL Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-primary" size={20} />
            <span>501(c)(3) Nonprofit</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="text-primary" size={20} />
            <span>100% Tax Deductible</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}