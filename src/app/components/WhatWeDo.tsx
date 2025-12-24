import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Target, Coins, Calendar } from 'lucide-react';

export function WhatWeDo() {
  return (
    <section id="what-we-do" className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
          {/* Right Column - Images (showing first on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 order-2 lg:order-1"
          >
            {/* Stacked Images with Offset */}
            <div className="relative">
              {/* Back Image */}
              <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-xl mb-6 ml-8">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1762086649719-4d62f45a98c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMHJlYnVpbGQlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzY1OTIyODE4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Rebuilding homes"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>

              {/* Front Image - Offset */}
              <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-2xl -mt-24 mr-8 group">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1764639567003-67eca9d60329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMHZvbHVudGVlciUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjYxMTEwNTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Community support and recovery"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-semibold">
                    Your support creates real change
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            {/* Section Label */}
            <p className="text-primary uppercase tracking-widest text-sm font-semibold mb-4">
              WHAT WE DO
            </p>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-5xl mb-8">
              Our Purpose
            </h2>

            {/* Purpose Statement - Bold */}
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              We exist to make a tangible difference in the lives of families and firefighters impacted by wildfires.
            </p>

            {/* Detailed Description */}
            <div className="space-y-6 text-muted-foreground leading-relaxed mb-12">
              <p>
                We are here to make a real impact during some of the hardest moments families and communities face. From providing immediate relief to helping rebuild futures, our focus is on making sure no one is left to navigate this journey alone.
              </p>

              <p>
                Every dollar donated goes directly to those in need — whether it's helping a family secure temporary housing, supporting a child's education after losing their home, or honoring the memory of a fallen firefighter.
              </p>

              <p>
                This is more than just financial assistance. It's about dignity, hope, and the message that their community hasn't forgotten them.
              </p>
            </div>

            {/* Three Key Actions */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 items-start group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Target className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Immediate Relief</h3>
                  <p className="text-muted-foreground text-sm">
                    Emergency financial assistance when families need it most, covering housing, food, and essentials.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 items-start group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Coins className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Long-Term Support</h3>
                  <p className="text-muted-foreground text-sm">
                    Educational grants for children and ongoing assistance to help families rebuild their lives with dignity.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 items-start group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Calendar className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Firefighter Families</h3>
                  <p className="text-muted-foreground text-sm">
                    Honoring fallen heroes by supporting their families and ensuring their sacrifice is never forgotten.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}