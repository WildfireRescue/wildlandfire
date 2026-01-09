import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function StoriesHero() {
  return (
    <section className="relative py-32 pb-12 overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1759892587820-4fe1f97046a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGFmdGVybWF0aCUyMGxhbmRzY2FwZSUyMGRyYW1hdGljfGVufDF8fHx8MTc2NjM4NTUwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Wildfire impact landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Heart className="text-primary mx-auto" size={56} fill="currentColor" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl mb-6">
            Stories of Hope
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-8 leading-relaxed">
            Every donation becomes a story of resilience, recovery, and hope. 
            <span className="text-foreground font-semibold"> These are the lives you're helping to rebuild.</span>
          </p>

          {/* Core Values */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="inline-flex flex-wrap gap-4 justify-center mb-12"
          >
            {[
              { text: "Serving families nationwide" },
              { text: "Direct, compassionate support" },
              { text: "Dignity-first approach" }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-card/60 backdrop-blur-sm border border-primary/30 rounded-full"
              >
                <span className="text-sm font-medium text-foreground">{value.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}