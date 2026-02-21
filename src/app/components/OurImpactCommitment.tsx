import { motion } from 'motion/react';
import { Heart, Users, Flame } from 'lucide-react';

export function OurImpactCommitment() {
  const commitments = [
    {
      icon: Heart,
      label: 'Direct Impact',
      description: 'Your donations fund real recovery through housing, counseling, and rebuilding'
    },
    {
      icon: Users,
      label: 'Rapid Response',
      description: 'We find survivors in need and bring help directly to them'
    },
    {
      icon: Flame,
      label: 'Our Promise',
      description: 'Every family deserves to rebuild with dignity and hope'
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      {/* Subtle animated background */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 153, 51, 0.1) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm tracking-widest uppercase text-primary mb-3">OUR COMMITMENT</p>
          <h2 className="text-4xl md:text-5xl mb-4">Built to Make a Difference</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're just getting started, but our vision is clear and our commitment is unwavering
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {commitments.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center"
            >
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
                  <item.icon size={28} className="text-primary" />
                </div>
              </motion.div>
              <h3 className="text-xl md:text-2xl mb-2 text-primary font-bold">{item.label}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}