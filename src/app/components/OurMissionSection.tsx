import { motion } from 'motion/react';

export function OurMissionSection() {
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
            WHY WE DO IT
          </motion.p>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl mb-8"
          >
            Our Mission
          </motion.h2>

          {/* Content Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-8 md:p-10 space-y-6"
          >
            <p className="text-lg leading-relaxed text-foreground">
              Our mission is to stand beside wildfire survivors in their darkest moments. We provide immediate relief, essential financial support, and a path forward when the flames have taken everything.
            </p>

            <p className="text-lg leading-relaxed text-foreground">
              By partnering with Wildland Firefighter Organizations, we equip those on the frontlines with lifesaving tools, safety resources, and community-backed support.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}