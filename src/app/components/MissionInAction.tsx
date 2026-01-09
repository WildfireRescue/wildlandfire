import { motion } from 'motion/react';
import { Heart, Users, Home, Shield, Clock, TrendingUp } from 'lucide-react';

const impactAreas = [
  {
    id: 1,
    icon: Home,
    title: "Emergency Housing & Rebuilding",
    image: "https://images.unsplash.com/photo-1760273463901-199a180b2886?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbWVyZ2VuY3klMjBob3VzaW5nJTIwc2hlbHRlcnxlbnwxfHx8fDE3NjYxMTcyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "When families lose everything, we provide immediate emergency housing assistance and support for rebuilding—covering essentials like temporary shelter, clothing, and household items.",
    commitment: "Our commitment: Immediate emergency response"
  },
  {
    id: 2,
    icon: Heart,
    title: "Mental Health & Emotional Support",
    image: "https://images.unsplash.com/photo-1758273240360-76b908e7582a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Vuc2VsaW5nJTIwdGhlcmFweSUyMHN1cHBvcnR8ZW58MXx8fHwxNzY2MTE3MjE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "The trauma of losing your home extends far beyond physical loss. We connect survivors with therapy, counseling, and support groups to help families heal emotionally.",
    commitment: "Our commitment: Whole-person recovery"
  },
  {
    id: 3,
    icon: Users,
    title: "Firefighter & First Responder Care",
    image: "https://images.unsplash.com/photo-1713689824343-77d2f99e19b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMGhlcm8lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjYxMTcyMTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Those who risk everything to save others, deserve our support. We provide resources for firefighters and their families, including mental health services and emergency assistance.",
    commitment: "Our commitment: Supporting our heroes"
  }
];

const values = [
  {
    icon: Shield,
    title: "Direct Action",
    quote: "When disaster strikes, families need immediate essentials—shelter, food, clothing. We cut through red tape to get help where it's needed most.",
  },
  {
    icon: Clock,
    title: "Speed When It Matters",
    quote: "In disaster recovery, hours matter. Our goal is rapid emergency response—getting critical resources to survivors before bureaucracy gets in the way.",
  },
  {
    icon: Heart,
    title: "Dignity, Not Charity",
    quote: "Survivors don't need pity—they need support to rebuild with dignity. We meet people where they are and empower them to rise again.",
  },
  {
    icon: TrendingUp,
    title: "Sustainable Impact",
    quote: "We're building a foundation that serves families for years to come. Your support helps us reach more communities and create lasting change.",
  }
];

export function MissionInAction() {
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        {/* Main Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl mb-4">Our Mission in Action</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Turning compassion into action. Here's how we serve wildfire survivors and the values that guide our work.
          </p>
        </motion.div>

        {/* How We Help - Programs */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl md:text-4xl mb-3">How We Help</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three core programs designed to rebuild lives and restore hope.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-3xl" />
            {impactAreas.map((area, index) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="bg-card border border-border rounded-lg overflow-hidden h-full transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={area.image}
                      alt={area.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      width="1080"
                      height="720"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/30">
                      <area.icon className="text-primary" size={24} />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{area.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {area.description}
                    </p>
                    <p className="text-sm text-primary font-semibold italic">
                      {area.commitment}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* What We Stand For - Values */}
        <div className="bg-secondary/30 rounded-3xl p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl md:text-4xl mb-3">What We Stand For</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that shape how we serve families in crisis.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <value.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{value.quote}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}