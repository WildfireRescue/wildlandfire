import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight } from 'lucide-react';

const recoveryExamples = [
  {
    id: 1,
    location: "Paradise, CA",
    context: "Camp Fire Recovery",
    before: "https://images.unsplash.com/photo-1764639568022-e78a62df2851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGRlc3RydWN0aW9uJTIwYWZ0ZXJtYXRofGVufDF8fHx8MTc2NjExNzA4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    after: "https://images.unsplash.com/photo-1744092476578-30b8c33d649c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWJ1aWx0JTIwY29tbXVuaXR5JTIwaG91c2VzfGVufDF8fHx8MTc2NjExNzA4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "This is the transformation we envision"
  },
  {
    id: 2,
    location: "Sonoma County",
    context: "Tubbs Fire Area",
    before: "https://images.unsplash.com/photo-1569963737067-221b7baafde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJuZWQlMjBmb3Jlc3QlMjB3aWxkZmlyZXxlbnwxfHx8fDE3NjYxMTcwODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    after: "https://images.unsplash.com/photo-1762130099386-a206cd876302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjByZWNvdmVyeSUyMHJlZ3Jvd3RofGVufDF8fHx8MTc2NjExNzA4MXww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "From devastation to hope and renewal"
  },
  {
    id: 3,
    location: "Southern California",
    context: "Community Resilience",
    before: "https://images.unsplash.com/photo-1694700792440-042af6d0e8fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGRhbWFnZWQlMjBuZWlnaGJvcmhvb2R8ZW58MXx8fHwxNzY2MTE3MDgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    after: "https://images.unsplash.com/photo-1694105050266-911023811297?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjByZWJ1aWx0JTIwaG9tZXN8ZW58MXx8fHwxNzY2MTE3MDgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Stronger and more resilient together"
  }
];

export function BeforeAfter() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4">The Recovery We'll Make Possible</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Communities have risen from the ashes before. With your support, we'll help more survivors rebuild with dignity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {recoveryExamples.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="group"
            >
              <div className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer">
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute inset-0">
                    <img
                      src={story.after}
                      alt={`${story.location} after recovery`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 right-4 text-white font-semibold">After</div>
                  </div>

                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      clipPath: hoveredIndex === index ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)'
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <img
                      src={story.before}
                      alt={`${story.location} before recovery`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white font-semibold">Before</div>
                  </motion.div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                      animate={{
                        scale: hoveredIndex === index ? 1.1 : 1,
                        opacity: hoveredIndex === index ? 1 : 0.8
                      }}
                      transition={{ duration: 0.3 }}
                      className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
                    >
                      <ArrowLeftRight size={24} />
                    </motion.div>
                  </div>

                  <motion.div
                    animate={{ opacity: hoveredIndex === index ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full"
                  >
                    Hover to compare
                  </motion.div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold">{story.location}</h3>
                    <span className="text-sm text-primary">{story.context}</span>
                  </div>
                  <p className="text-muted-foreground">{story.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-lg">
            These transformations are possible because of donors like you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
