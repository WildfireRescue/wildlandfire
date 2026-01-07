import { motion } from "motion/react";
import { Home, Heart, Shield, CheckCircle, Eye } from "lucide-react";

export function HowYourDonationHelps() {
  const impactAreas = [
    {
      tag: "DIRECT RELIEF",
      title: "Immediate support for displaced families",
      description:
        "On-the-ground essentials and rapid assistance when evacuations and loss happen fast.",
      icon: Home,
      gradient: "from-primary/20 to-primary/5",
    },
    {
      tag: "FALLEN FIREFIGHTER FAMILIES",
      title: "Financial grants when the unthinkable happens",
      description:
        "Direct help to families of firefighters who have lost their lives in the line of duty.",
      icon: Heart,
      gradient: "from-primary/20 to-primary/5",
    },
    {
      tag: "FRONTLINE PARTNERSHIPS",
      title: "Tools and support for those protecting us",
      description:
        "Partnerships that help equip and support wildland firefighters and their organizations.",
      icon: Shield,
      gradient: "from-primary/20 to-primary/5",
    },
  ];

  const impactLadder = [
    {
      amount: "$25",
      text: "Supplies essentials for a family facing displacement",
    },
    {
      amount: "$50",
      text: "Supports rapid relief coordination and on-site assistance",
    },
    {
      amount: "$100",
      text: "Helps fund direct family support and recovery needs",
    },
    {
      amount: "$250",
      text: "Strengthens frontline partnerships and community recovery",
    },
  ];

  const values = [
    {
      icon: CheckCircle,
      title: "Tax-deductible giving",
      description: "You’ll receive a receipt by email for your records.",
    },
    {
      icon: Eye,
      title: "Visible impact",
      description: "Clear updates that show how support reaches people.",
    },
    {
      icon: Heart,
      title: "Human-first mission",
      description: "Relief that restores dignity, stability, and hope.",
    },
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
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl mb-4 max-w-4xl mx-auto">
            Explore how your donations support affected communities
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Clear, direct support for families and firefighters—when it matters most.
          </p>
        </motion.div>

        {/* Impact Ladder (fast decision helper) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-12"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {impactLadder.map((item, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="text-primary text-2xl font-extrabold mb-2">
                  {item.amount}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Three Impact Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {impactAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={area.tag}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300"
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
                />

                <div className="relative z-10">
                  {/* Tag */}
                  <p className="text-primary uppercase tracking-wider text-xs font-semibold mb-5">
                    {area.tag}
                  </p>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="text-primary" size={28} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-3 leading-tight">
                    {area.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
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
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <Icon className="text-primary mb-3 mx-auto" size={30} />
                <h3 className="text-lg mb-2 font-semibold">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}