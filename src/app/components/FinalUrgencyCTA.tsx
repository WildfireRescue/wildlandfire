import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';

export function FinalUrgencyCTA() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-primary/20 to-orange-500/20 border-2 border-primary/30 rounded-3xl p-6 sm:p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6">
            Right Now, Someone Needs You
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
            A family is sleeping in a shelter. A child is wearing borrowed clothes. 
            A firefighter is wondering how to rebuild. <span className="text-foreground font-semibold">Your donation changes that today.</span>
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 w-full sm:w-auto"
          >
            <a href="#donate" className="flex items-center justify-center">
              <Heart size={24} className="mr-2 flex-shrink-0" />
              Give Hope Now
            </a>
          </Button>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
            💳 Secure donation • 🔒 100% tax-deductible • ⚡ Rapid deployment to those in need
          </p>
        </motion.div>
      </div>
    </section>
  );
}