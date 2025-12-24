import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ArrowRight, ExternalLink, Heart } from 'lucide-react';

export function GetInvolvedSection() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-primary uppercase tracking-widest text-xs font-semibold mb-4"
          >
            GET INVOLVED
          </motion.p>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl mb-6"
          >
            Your Contribution Makes a Difference
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed mb-12"
          >
            Your generosity reaches people in their most vulnerable moments. Whether you give once, give monthly, or share our mission, you help families feel less alone and support those who protect us.
          </motion.p>

          {/* Orange Gradient CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-3xl p-8 md:p-10 overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left - Text Content */}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-semibold text-background mb-3">
                  Take the Next Step
                </h3>
                <p className="text-background/90 text-lg">
                  Join us in providing relief, support, and hope to wildfire survivors and firefighters.
                </p>
              </div>

              {/* Right - Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:flex-shrink-0">
                <Button
                  asChild
                  size="lg"
                  className="bg-background text-primary hover:bg-background/90 shadow-lg w-full sm:w-auto"
                >
                  <a 
                    href="#donate"
                    className="flex items-center justify-center whitespace-nowrap"
                  >
                    <Heart size={20} className="mr-2 flex-shrink-0" />
                    Donate Now
                  </a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-background text-background hover:bg-background/10 w-full sm:w-auto"
                >
                  <a href="/contact" className="flex items-center justify-center whitespace-nowrap">
                    Contact Us
                    <ExternalLink size={18} className="ml-2 flex-shrink-0" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}