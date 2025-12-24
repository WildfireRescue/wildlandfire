import { motion } from 'motion/react';
import { Heart, Flame, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function MissionStatement() {
  return (
    <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Flame className="text-primary" size={48} />
          </motion.div>
          <h2 className="text-3xl md:text-5xl mb-6 leading-tight">
            When flames take everything,{' '}
            <span className="text-primary">your donation becomes hope.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            We believe every person who loses their home deserves more than sympathy. 
            They deserve action. Support. A chance to rebuild not just a house, but a life.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            This isn't just about rebuilding walls. It's about restoring dignity, 
            renewing hope, and proving that even in the darkest moments, humanity shines brightest.{' '}
            <strong className="text-foreground">Together, we rise from the ashes.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8"
            >
              <a href="#donate">
                <Heart size={20} className="mr-2" />
                Donate Now
              </a>
            </Button>
            <Button
              variant="outline"
              className="text-lg px-8"
            >
              <a href="#stories">
                See Our Vision
                <ArrowRight size={20} className="ml-2" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}