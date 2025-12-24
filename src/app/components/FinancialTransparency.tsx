import { motion } from 'motion/react';

export function FinancialTransparency() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl mb-8 text-center">Where Your Money Will Go</h2>
          
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <p className="text-center text-muted-foreground mb-6 italic">
              We haven't helped anyone yet—but here's our commitment for how every dollar will be spent:
            </p>
            <div className="space-y-6">
              {[
                { 
                  category: "Direct Survivor Support", 
                  percentage: 75, 
                  description: "Emergency grants, housing, rebuilding, essential needs",
                  color: "bg-primary"
                },
                { 
                  category: "Programs & Services", 
                  percentage: 20, 
                  description: "Case management, therapy, mental health support, resources",
                  color: "bg-blue-500"
                },
                { 
                  category: "Operations & Growth", 
                  percentage: 5, 
                  description: "Minimal overhead to maximize impact",
                  color: "bg-green-500"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-semibold">{item.category}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">{item.percentage}%</div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-center text-muted-foreground">
            We're committed to radical transparency. Every donation is tracked, every dollar accounted for, 
            and every impact measured. <span className="text-foreground font-semibold">Your trust is sacred to us.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}