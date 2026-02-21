import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Heart, Users } from 'lucide-react';
import firefightersImage from '../../assets/8e03279e68063925af6fae8f1b72f359c89244cb.png';
import firefighterWildfireImage from '../../assets/25f81b33a62ecb9579f111d065e2caf91bdd44bb.png';

export function WhoWeAre() {
  return (
    <section id="who-we-are" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Label */}
            <p className="text-primary uppercase tracking-widest text-sm font-semibold mb-4">
              WHO WE ARE
            </p>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-5xl mb-8">
              Our Mission
            </h2>

            {/* Mission Statement - Bold */}
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              We exist to stand beside wildfire survivors and firefighter families in their hardest moments.
            </p>

            {/* Detailed Description */}
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                The Wildland Fire Recovery Fund Inc. is a 501(c)(3) non-profit organization based in Caldwell, Idaho. We exist to support the families of fallen firefighters and to provide meaningful relief to individuals and communities affected by wildfires.
              </p>

              <p>
                When a wildfire strikes, the damage doesn't end when the flames are contained. Families face financial strain, emotional trauma, and the long process of rebuilding their lives from the ground up.
              </p>

              <p>
                Our mission is to walk alongside them in that process. We offer immediate financial assistance, essential resources, and ongoing support so that no one feels forgotten once the news cameras leave.
              </p>
            </div>

            {/* Icon Features */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <Shield className="text-primary" size={28} />
                </div>
                <p className="text-sm font-semibold">501(c)(3)</p>
                <p className="text-xs text-muted-foreground mt-1">Non-Profit</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <Heart className="text-primary" size={28} />
                </div>
                <p className="text-sm font-semibold">Direct Aid</p>
                <p className="text-xs text-muted-foreground mt-1">To Families</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <Users className="text-primary" size={28} />
                </div>
                <p className="text-sm font-semibold">Community</p>
                <p className="text-xs text-muted-foreground mt-1">Support</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Large Featured Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1602980068837-2d0df11d9e65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlJTIwdHJ1Y2slMjB3aWxkZmlyZXxlbnwxfHx8fDE3NjYzODUxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fire truck responding to wildfire"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>

            {/* Small Grid of Images */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative h-[200px] rounded-xl overflow-hidden shadow-lg group">
                <img
                  src={firefighterWildfireImage}
                  alt="Firefighter battling wildfire"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width="720"
                  height="480"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>

              <div className="relative h-[200px] rounded-xl overflow-hidden shadow-lg group">
                <img
                  src={firefightersImage}
                  alt="Firefighter team"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width="720"
                  height="480"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}