import { motion } from "motion/react";
import { Home, Heart, Shield, CheckCircle, Eye, Zap, Users, Package, GraduationCap } from "lucide-react";

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
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl mb-4 max-w-4xl mx-auto">
            Your donation makes an immediate difference
          </h2>
        </motion.div>

        {/* Three Impact Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
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

        {/* Combined Mission & Campaign Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-6xl mx-auto mt-20"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-background border-2 border-primary/30 rounded-3xl p-10 md:p-16">
            {/* Ambient glow effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="inline-block"
                >
                  <p className="text-primary uppercase tracking-widest text-xs font-semibold mb-4">
                    Our 2026 Vision
                  </p>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">Building Lasting Support for Families</h3>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Together, we're creating infrastructure that serves wildfire survivors and first responders when they need it most
                  </p>
                </motion.div>
              </div>

              {/* Goals Grid */}
              <div className="grid md:grid-cols-2 gap-5 mb-10">
                {[
                  {
                    icon: Zap,
                    title: "Emergency Response Team",
                    description: "Rapid deployment capability to wildfire scenes across the country",
                    color: "from-yellow-500/20 to-orange-500/20",
                  },
                  {
                    icon: Users,
                    title: "Direct Family Support",
                    description: "Immediate housing, food, and essentials for hundreds of displaced families",
                    color: "from-blue-500/20 to-purple-500/20",
                  },
                  {
                    icon: Package,
                    title: "Firefighter Resources",
                    description: "Equipment grants and support programs for fire departments in need",
                    color: "from-red-500/20 to-pink-500/20",
                  },
                  {
                    icon: GraduationCap,
                    title: "Education Programs",
                    description: "Fire prevention training and wildfire preparedness for at-risk communities",
                    color: "from-green-500/20 to-teal-500/20",
                  },
                ].map((goal, index) => {
                  const Icon = goal.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="group flex gap-5 bg-card/80 backdrop-blur-sm border-2 border-border rounded-2xl p-7 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="text-primary" size={28} strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                          {goal.title}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {goal.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Message */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center pt-6 border-t border-primary/20"
              >
                <p className="text-lg text-muted-foreground mb-2">
                  Your support makes this possible. Every contribution helps us reach our goal of building these essential programs.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Campaign Goal: $5 Million
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}