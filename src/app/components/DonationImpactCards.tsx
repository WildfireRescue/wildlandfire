import { motion } from 'motion/react';
import { Home, Heart, Shield } from 'lucide-react';

export function DonationImpactCards() {
  const impactAreas = [
    {
      tag: 'RELIEF FOR COMMUNITIES',
      title: 'On-Site Help for Displaced Families',
      description:
        'Our relief teams provide emergency supplies, cash assistance, and on-site support to displaced families during wildland fire operations. We help them meet urgent needs from day one.',
      icon: Home,
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      tag: 'GRANTS FOR FAMILIES',
      title: 'Standing with Families of Fallen Firefighters',
      description:
        'We provide financial grants to families of firefighters who have lost their lives on the frontlines. These grants cover funeral expenses, living costs, and the financial gap left behind.',
      icon: Heart,
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      tag: 'SUPPORT PARTNERSHIPS',
      title: 'Equipping Those Who Protect Us',
      description:
        'We partner with wildland firefighter organizations to fund essential equipment, safety training, and mental health resources so frontline responders can protect communities and themselves.',
      icon: Shield,
      gradient: 'from-primary/20 to-primary/5',
    },
  ];

  return (
    <section id="programs" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 max-w-4xl mx-auto">
            Explore How Your Wildfire Relief Donations Support Affected Communities
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every dollar you give goes directly to families, firefighters, and communities rebuilding after the flames.
          </p>
        </motion.div>

        {/* Three Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
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
      </div>
    </section>
  );
}
