import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

const heroImages = [
  {
    mobile: "https://images.unsplash.com/photo-1562457346-b1b743feb764?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMGFjdGlvbnxlbnwxfHx8fDE3NjU4NDY0NDV8MA&ixlib=rb-4.1.0&q=65&w=480",
    tablet: "https://images.unsplash.com/photo-1562457346-b1b743feb764?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMGFjdGlvbnxlbnwxfHx8fDE3NjU4NDY0NDV8MA&ixlib=rb-4.1.0&q=70&w=768",
    desktop: "https://images.unsplash.com/photo-1562457346-b1b743feb764?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMGFjdGlvbnxlbnwxfHx8fDE3NjU4NDY0NDV8MA&ixlib=rb-4.1.0&q=75&w=1200",
    alt: "Firefighters in action",
    width: 1920,
    height: 1080
  },
  {
    mobile: "https://images.unsplash.com/photo-1550522485-b6dcf200b087?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGZvcmVzdCUyMGZpcmV8ZW58MXx8fHwxNzY1OTIyODE3fDA&ixlib=rb-4.1.0&q=65&w=480",
    tablet: "https://images.unsplash.com/photo-1550522485-b6dcf200b087?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGZvcmVzdCUyMGZpcmV8ZW58MXx8fHwxNzY1OTIyODE3fDA&ixlib=rb-4.1.0&q=70&w=768",
    desktop: "https://images.unsplash.com/photo-1550522485-b6dcf200b087?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGZvcmVzdCUyMGZpcmV8ZW58MXx8fHwxNzY1OTIyODE3fDA&ixlib=rb-4.1.0&q=75&w=1200",
    alt: "Wildfire scene",
    width: 1920,
    height: 1080
  },
  {
    mobile: "https://images.unsplash.com/photo-1764639568368-9a60bdd7602c?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMHdpbGRmaXJlJTIwc21va2V8ZW58MXx8fHwxNzY1OTIzMTYxfDA&ixlib=rb-4.1.0&q=65&w=480",
    tablet: "https://images.unsplash.com/photo-1764639568368-9a60bdd7602c?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMHdpbGRmaXJlJTIwc21va2V8ZW58MXx8fHwxNzY1OTIzMTYxfDA&ixlib=rb-4.1.0&q=70&w=768",
    desktop: "https://images.unsplash.com/photo-1764639568368-9a60bdd7602c?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMHdpbGRmaXJlJTIwc21va2V8ZW58MXx8fHwxNzY1OTIzMTYxfDA&ixlib=rb-4.1.0&q=75&w=1200",
    alt: "Firefighter in smoke",
    width: 1920,
    height: 1080
  },
  {
    mobile: "https://images.unsplash.com/photo-1694700792440-042af6d0e8fb?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGFmdGVybWF0aCUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjU5MjMxNjJ8MA&ixlib=rb-4.1.0&q=65&w=480",
    tablet: "https://images.unsplash.com/photo-1694700792440-042af6d0e8fb?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGFmdGVybWF0aCUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjU5MjMxNjJ8MA&ixlib=rb-4.1.0&q=70&w=768",
    desktop: "https://images.unsplash.com/photo-1694700792440-042af6d0e8fb?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGFmdGVybWF0aCUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjU5MjMxNjJ8MA&ixlib=rb-4.1.0&q=75&w=1200",
    alt: "Wildfire aftermath",
    width: 1920,
    height: 1080
  }
];

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile for reduced animations
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    
    // Only run slideshow on desktop or if user prefers motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isMobile && !prefersReducedMotion) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-28">
      {/* Rotating Background Slideshow */}
      <div className="absolute inset-0" style={{ minHeight: '90vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={currentImageIndex === 0 || isMobile ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={isMobile ? {} : { opacity: 0 }}
            transition={{ duration: currentImageIndex === 0 || isMobile ? 0 : 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              srcSet={`${heroImages[currentImageIndex].mobile} 480w, ${heroImages[currentImageIndex].tablet} 768w, ${heroImages[currentImageIndex].desktop} 1200w`}
              sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, 1200px"
              src={heroImages[currentImageIndex].mobile}
              alt={heroImages[currentImageIndex].alt}
              className="w-full h-full object-cover"
              fetchPriority={currentImageIndex === 0 ? "high" : "low"}
              loading={currentImageIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              width={heroImages[currentImageIndex].width}
              height={heroImages[currentImageIndex].height}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0 : 0.8, delay: isMobile ? 0 : 0.2 }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* Overline */}
          <motion.p
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0 : 0.6, delay: isMobile ? 0 : 0.3 }}
            className="text-primary uppercase tracking-wider mb-6 text-sm font-semibold"
          >
            The Wildland Fire Recovery Fund
          </motion.p>

          {/* Main Headline - Matching your site exactly */}
          <motion.h1
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0 : 0.8, delay: isMobile ? 0 : 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight"
          >
            Empowering Communities Affected by Wildfires to{' '}
            <span className="text-primary font-bold">
              Rise from the Ashes.
            </span>
          </motion.h1>

          {/* Tagline - From your site */}
          <motion.p
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0 : 0.6, delay: isMobile ? 0 : 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            We provide financial relief and support to firefighters and families affected by wildfires. When the flames are gone, we help communities begin to rebuild.
          </motion.p>

          {/* Tagline Below Buttons */}
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
            className="mt-8 text-sm text-muted-foreground italic"
          >
            For families, firefighters & children after the flames
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}