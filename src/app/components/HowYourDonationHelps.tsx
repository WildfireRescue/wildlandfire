import { motion } from 'motion/react';
import { Home, Heart, Shield, CheckCircle, Eye, DollarSign } from 'lucide-react';

export function HowYourDonationHelps() {
  const impactAreas = [
    {
      tag: 'RELIEF FOR COMMUNITIES',
      title: 'On-site help for displaced families.',
      description: 'We provide relief and supplies on-site to displaced and evacuated families during wildland fire operations — along with immediate relief funds to help communities rebuild and recover.',
      icon: Home,
      gradient: 'from-primary/20 to-primary/5'
    },
    {
      tag: 'GRANTS FOR FAMILIES',
      title: 'Standing with families of fallen firefighters.',
      description: 'We provide financial grants to families of firefighters who have tragically lost their lives while serving on the frontlines.',
      icon: Heart,
      gradient: 'from-primary/20 to-primary/5'
    },
    {
      tag: 'SUPPORT PARTNERSHIPS',
      title: 'Equipping those who protect us.',
      description: 'We partner with Wildland Firefighter Organizations to ensure frontline responders have the tools, equipment, and support they need to stay safe.',
      icon: Shield,
      gradient: 'from-primary/20 to-primary/5'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Rebuilds Lives, Restores Hope",
      description: "Your donation rebuilds lives, restores hope, and proves the world still cares"
    },
    {
      icon: Eye,
      title: "See Real Impact",
      description: "Meet the families whose lives are being transformed by donations like yours"
    },
    {
      icon: CheckCircle,
      title: "100% Transparency",
      description: "See exactly where every dollar goes with full financial accountability"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-6 max-w-4xl mx-auto">
            How Your Donation Helps
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            When wildfires destroy everything, your generosity becomes the foundation for rebuilding.
          </p>
        </motion.div>

        {/* Three Impact Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
          {impactAreas.map((area, index) => (
            <motion.div
              key={area.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
              
              <div className="relative z-10">
                {/* Tag */}
                <p className="text-primary uppercase tracking-wider text-xs font-semibold mb-6">
                  {area.tag}
                </p>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                  <area.icon className="text-primary" size={28} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-4 leading-tight">
                  {area.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Supporting Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <Icon className="text-primary mb-3 mx-auto" size={32} />
                <h3 className="text-lg mb-2 font-semibold">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
