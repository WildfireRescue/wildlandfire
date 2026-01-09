import { motion } from 'motion/react';
import kendraImage from '../../assets/Kendra.jpg';

export function AboutKendra() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-primary uppercase tracking-widest text-xs font-semibold mb-4"
          >
            LEADERSHIP
          </motion.p>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl mb-12"
          >
            About Kendra Talbot
          </motion.h2>

          {/* Content with Image and Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row gap-8 md:gap-12 items-start"
          >
            {/* Left - Circular Image */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                <img
                  src={kendraImage}
                  alt="Kendra Talbot - Founder and Leader"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Right - Text Content */}
            <div className="flex-1 space-y-6 text-foreground leading-relaxed">
              <p className="text-lg">
                Kendra Talbot is a national advocate for the wildland firefighting community, dedicated to supporting the families of fallen firefighters and those impacted by catastrophic wildfires. With extensive experience volunteering for charitable organizations and community initiatives, she brings both informed perspective and determined leadership to her work. Her deep personal ties to the firefighting community include her husband and multiple family members who have served across the country.
              </p>

              <p className="text-lg">
                As a mother, Kendra recognized the long term financial uncertainty faced by fire families and the lack of meaningful support many received following devastating events such as the Palisades Fire. This awareness shaped her commitment to ensuring that no family is left navigating loss, displacement, or inadequate insurance support alone. Central to her work is expanding access to higher education for the children of fallen firefighters through dedicated education grants.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}