import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Heart, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function DonateCallout() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary uppercase tracking-widest text-sm font-semibold mb-4">
              MAKE A DIFFERENCE TODAY
            </p>

            <h2 className="text-4xl md:text-5xl mb-6">
              Your Donation{' '}
              <span className="text-primary">Changes Lives</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Every dollar goes directly to families in crisis — providing emergency shelter, food, clothing, and the resources they need to rebuild their lives with dignity.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Immediate Relief</p>
                  <p className="text-sm text-muted-foreground">Emergency funds reach families rapidly</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Direct Impact</p>
                  <p className="text-sm text-muted-foreground">100% of donations go to wildfire survivors</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Long-Term Support</p>
                  <p className="text-sm text-muted-foreground">Education grants and rebuilding assistance</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <a href="#donate">
                  <Heart size={20} />
                  Donate Now
                  <ArrowRight size={20} />
                </a>
              </Button>

              <Button
                variant="outline"
                className="border-2 border-border hover:bg-secondary"
              >
                <a href="#about">
                  Learn More About Us
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl group"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1741119064982-c740f83dbc3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMHNpbGhvdWV0dGUlMjBmbGFtZXMlMjBzdW5zZXR8ZW58MXx8fHwxNzY2Mzg1MzczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Community standing together"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Overlay stat badge */}
            <div className="absolute bottom-8 left-8 right-8 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Our commitment</p>
                  <p className="text-3xl font-bold text-primary">Rapid Response</p>
                </div>
                <Heart className="text-primary" size={48} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}