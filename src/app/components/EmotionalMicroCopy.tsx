import { motion } from 'motion/react';
import { Heart, Users, Home, Flame } from 'lucide-react';

const emotionalMessages = [
  {
    icon: Home,
    message: "Every home lost leaves a family searching for hope",
    subtext: "Your donation rebuilds more than buildings—it rebuilds lives",
    color: "from-blue-500/10 to-blue-600/10",
    iconColor: "text-blue-400"
  },
  {
    icon: Heart,
    message: "When the smoke clears, the real work begins",
    subtext: "We're there with survivors through every step of recovery",
    color: "from-red-500/10 to-pink-600/10",
    iconColor: "text-red-400"
  },
  {
    icon: Users,
    message: "No family should face this alone",
    subtext: "Your support becomes their safety net when everything else is gone",
    color: "from-purple-500/10 to-purple-600/10",
    iconColor: "text-purple-400"
  },
  {
    icon: Flame,
    message: "From ashes, we rise together",
    subtext: "Every dollar you give becomes hope, housing, and healing",
    color: "from-orange-500/10 to-primary/10",
    iconColor: "text-primary"
  }
];

export function EmotionalMicroCopy() {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-primary uppercase tracking-widest text-xs font-semibold mb-4">
            Why Your Support Matters
          </p>
          <h2 className="text-4xl md:text-5xl mb-4">
            Every Donation Tells a Story
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Behind every dollar is a survivor's journey from devastation to hope
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {emotionalMessages.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className={`bg-gradient-to-br ${item.color} backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative"
                    >
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-full blur-lg"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <div className="relative bg-background/80 p-4 rounded-full border border-border group-hover:border-primary/50 transition-colors duration-300">
                        <Icon className={`${item.iconColor}`} size={32} />
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl mb-3 leading-tight">
                      {item.message}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.subtext}
                    </p>

                    {/* Decorative element */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                      className="h-0.5 bg-gradient-to-r from-primary/50 to-transparent mt-4"
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA removed */}
      </div>
    </section>
  );
}
