import { Card } from './ui/card';
import { HandHeart, Users, Handshake } from 'lucide-react';
import { motion } from 'motion/react';

const workAreas = [
  {
    icon: HandHeart,
    title: 'RELIEF FOR COMMUNITIES',
    description: 'We will provide immediate financial assistance and resources to families affected by wildfires, helping them recover and rebuild their lives.',
  },
  {
    icon: Users,
    title: 'GRANTS FOR FAMILIES',
    description: 'Direct financial support to help families cover emergency expenses, temporary housing, and essential needs during recovery.',
  },
  {
    icon: Handshake,
    title: 'SUPPORT PARTNERSHIPS',
    description: 'We will collaborate with local organizations and agencies to maximize our impact and ensure resources reach those who need them most.',
  },
];

export function OurWork() {
  return (
    <section id="our-work" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-sm tracking-widest uppercase text-primary mb-3">OUR VISION</p>
          <h2 className="text-4xl md:text-5xl mb-4">
            How Your Donations Will Support Affected Communities
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {workAreas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card 
                className="bg-card border-border p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6"
                >
                  <area.icon size={28} className="text-primary" />
                </motion.div>
                <p className="text-xs tracking-widest uppercase text-primary mb-3">
                  {area.title}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}