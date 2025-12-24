import { motion } from 'motion/react';
import { Heart, Users, Shield, ArrowRight } from 'lucide-react';

const quickPaths = [
  {
    icon: Heart,
    title: "Make a Difference",
    description: "Your donation rebuilds lives, restores hope, and proves the world still cares",
    path: "#donate",
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "border-rose-500/30",
    iconColor: "text-rose-400"
  },
  {
    icon: Users,
    title: "See Real Impact",
    description: "Meet the families whose lives were transformed by donations like yours",
    path: "#stories",
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400"
  },
  {
    icon: Shield,
    title: "100% Transparency",
    description: "See exactly where every dollar goes with full financial accountability",
    path: "#about",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400"
  }
];

export function WhyGiveSection() {
  return (
    <section className="py-14 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4">Why Your Donation Matters</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            When wildfires destroy everything, your generosity becomes the foundation for rebuilding.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {quickPaths.map((path, index) => {
            const Icon = path.icon;
            return (
              <motion.a
                key={index}
                href={path.path}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group block"
              >
                <div className={`relative bg-gradient-to-br ${path.color} border-2 ${path.borderColor} rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20`}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center mb-6 ${path.iconColor}`}
                  >
                    <Icon size={32} />
                  </motion.div>

                  <h3 className="text-2xl mb-3 font-semibold">{path.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {path.description}
                  </p>

                  <div className="flex items-center gap-2 text-primary group-hover:gap-4 transition-all">
                    <span className="font-semibold">Learn More</span>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}