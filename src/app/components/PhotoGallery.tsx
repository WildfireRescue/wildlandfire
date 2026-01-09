import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import familyRubbleImage from '../../assets/fire22222.jpg';
import idahoMountainImage from '../../assets/fire33333.webp';

const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1736976050816-bdacec2444a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWxpc2FkZXMlMjBmaXJlJTIwbG9zJTIwYW5nZWxlc3xlbnwxfHx8fDE3NjY0NjQ5NjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "The Palisades Fire—devastating Los Angeles communities",
    span: "col-span-2 row-span-2"
  },
  {
    url: "https://images.unsplash.com/photo-1602980045360-d94be60e4775?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpZGFobyUyMHdpbGRmaXJlJTIwZmxhbWVzfGVufDF8fHx8MTc2NjQ2NTA0NHww&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Idaho wildfires threatening rural communities",
    span: "col-span-1 row-span-1"
  },
  {
    url: "https://images.unsplash.com/photo-1736636990289-d891ac0decc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3MlMjBhbmdlbGVzJTIwd2lsZGZpcmUlMjBkZXN0cnVjdGlvbnxlbnwxfHx8fDE3NjY0NjQ5NjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Los Angeles neighborhoods destroyed—families displaced",
    span: "col-span-1 row-span-1"
  },
  {
    url: "https://images.unsplash.com/photo-1666518871327-b4134de451d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMGJhdHRsaW5nJTIwd2lsZGZpcmV8ZW58MXx8fHwxNzY2NDY0ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Brave firefighters risking everything to protect our communities",
    span: "col-span-1 row-span-1"
  },
  {
    url: "https://images.unsplash.com/photo-1671959784652-8096fd28b17c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpZGFobyUyMGZvcmVzdCUyMGZpcmV8ZW58MXx8fHwxNzY2NDY1MDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Idaho forests burning—devastating natural landscapes",
    span: "col-span-1 row-span-1"
  },
  {
    url: "https://images.unsplash.com/photo-1541959745973-a077c204173a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxpYnUlMjB3aWxkZmlyZSUyMGFmdGVybWF0aHxlbnwxfHx8fDE3NjY0NjQ5NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Malibu wildfire aftermath—entire California neighborhoods lost",
    span: "col-span-2 row-span-1"
  },
  {
    url: idahoMountainImage,
    caption: "Idaho mountain communities threatened by raging wildfires",
    span: "col-span-2 row-span-1"
  }
];

export function PhotoGallery() {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl mb-4">The Reality We're Responding To</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every photo shows why our mission matters—and the transformation we'll help create.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {galleryImages.slice(0, 6).map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className={`relative ${image.span} rounded-2xl overflow-hidden group cursor-pointer shadow-lg`}
            >
              <ImageWithFallback
                src={image.url}
                alt={image.caption}
                className="w-full h-full object-cover min-h-[200px]"
                width="1080"
                height="720"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium">{image.caption}</p>
              </div>
            </motion.div>
          ))}
          {/* Load last image separately to reduce initial bundle */}
          {galleryImages.slice(6).map((image, idx) => (
            <motion.div
              key={idx + 6}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className={`relative ${image.span} rounded-2xl overflow-hidden group cursor-pointer shadow-lg`}
            >
              <ImageWithFallback
                src={image.url}
                alt={image.caption}
                className="w-full h-full object-cover min-h-[200px]"
                width="1080"
                height="720"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium">{image.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Family Photo - Emotional Connection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 mb-8 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={familyRubbleImage}
              alt="Family affected by wildfire"
              className="w-full h-[450px] md:h-[550px] object-cover"
              width="1920"
              height="1280"
              loading="lazy"
              decoding="async"
            />
            {/* Film grain overlay for photographic realism */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
              }}
            />
            {/* Subtle vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            {/* Edge darkening for photographic feel */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.15) 100%)',
              }}
            />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-foreground mt-12 max-w-3xl mx-auto text-xl md:text-2xl leading-relaxed"
        >
          These images represent real families, real firefighters, and real communities whose lives you can help transform with your generosity.
        </motion.p>
      </div>
    </section>
  );
}