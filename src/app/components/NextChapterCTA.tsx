import { motion } from 'motion/react';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function NextChapterCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl mb-6">
            Your Donation Writes The Next Chapter
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Behind every statistic is a person. A family. A story waiting to be told. 
            Your generosity today becomes tomorrow's testimony of hope.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8"
            >
              <a href="#donate">
                <Heart size={20} className="mr-2" />
                Give Hope Today
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              <a href="#donate">
                See Donation Impact
                <ArrowRight size={20} className="ml-2" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}