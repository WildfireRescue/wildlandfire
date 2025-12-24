import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Target, Heart, Lightbulb } from 'lucide-react';

const values = [
  { icon: Target, label: 'Mission-Driven', color: 'text-blue-400' },
  { icon: Heart, label: 'Compassionate', color: 'text-red-400' },
  { icon: Lightbulb, label: 'Innovative', color: 'text-yellow-400' },
];

export function About() {
  return (
    <section id="about" className="py-20 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] rounded-lg overflow-hidden group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1603676429893-c763cb7cb2bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB3aWxkZmlyZSUyMHJlY292ZXJ5fGVufDF8fHx8MTc2NTc3Mzc0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Wildfire recovery efforts"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg p-4"
            >
              <div className="text-2xl text-primary mb-1 font-bold">New</div>
              <div className="text-sm text-muted-foreground">Launched 2026</div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm tracking-widest uppercase text-primary mb-3">ABOUT US</p>
            <h2 className="text-4xl md:text-5xl mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              The Wildland Fire Recovery Fund is dedicated to supporting communities devastated by wildfires. 
              We provide immediate relief, long-term recovery assistance, and help families rebuild their lives 
              after losing everything to the flames.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Working directly with firefighters, first responders, and affected families, we ensure that 
              financial support reaches those who need it most, when they need it most.
            </p>

            {/* Values */}
            <div className="flex gap-6 mb-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className={`${value.color} mb-2`}>
                      <Icon size={32} />
                    </div>
                    <div className="text-sm text-muted-foreground">{value.label}</div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Learn More About Our Work
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}