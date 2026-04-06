/**
 * Hero.tsx — motion/react-free, LCP-optimised
 *
 * Performance decisions:
 *  1. No static import of motion/react — removes the ~125 KB motion chunk
 *     from the eager-load waterfall. Motion is still available to below-fold
 *     lazy-loaded sections; it just isn't needed here.
 *  2. Slide 0 image is a plain <img fetchPriority="high" loading="eager"> so
 *     the browser can pair it with the <link rel="preload"> in index.html and
 *     paint it the moment React hydrates — without waiting for any animation
 *     library to initialise.
 *  3. Slides 1-3 are added to the DOM only AFTER the LCP window closes
 *     (SLIDE_SHOW_DELAY ms). This prevents the browser's resource scheduler
 *     from treating those images as in-viewport candidates and competing with
 *     the LCP image for bandwidth.
 *  4. The crossfade is a simple CSS opacity transition — zero JS cost.
 *  5. Text reveals use CSS keyframe classes (.hero-fade-1/2/3) defined in
 *     theme.css — also JS-free and respect prefers-reduced-motion.
 *  6. User Timing marks let you verify the LCP path in DevTools / PerformanceObserver.
 */
import { useState, useEffect, useRef } from 'react';

// ── LCP slide — must exactly match the preload href/imagesrcset in index.html ──
// Local assets: generated WebP + AVIF variants (portrait 0.825 aspect ratio)
const LCP_MOBILE  = "/Images/hero/hero-480.webp";
const LCP_TABLET  = "/Images/hero/hero-768.webp";
const LCP_DESKTOP = "/Images/hero/hero-1200.webp";

const extraSlides = [
  {
    mobile:  "https://images.unsplash.com/photo-1550522485-b6dcf200b087?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGZvcmVzdCUyMGZpcmV8ZW58MXx8fHwxNzY1OTIyODE3fDA&ixlib=rb-4.1.0&q=55&w=480",
    tablet:  "https://images.unsplash.com/photo-1550522485-b6dcf200b087?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGZvcmVzdCUyMGZpcmV8ZW58MXx8fHwxNzY1OTIyODE3fDA&ixlib=rb-4.1.0&q=63&w=768",
    desktop: "https://images.unsplash.com/photo-1550522485-b6dcf200b087?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGZvcmVzdCUyMGZpcmV8ZW58MXx8fHwxNzY1OTIyODE3fDA&ixlib=rb-4.1.0&q=62&w=1200",
    alt: "Wildfire scene",
  },
  {
    mobile:  "https://images.unsplash.com/photo-1764639568368-9a60bdd7602c?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMHdpbGRmaXJlJTIwc21va2V8ZW58MXx8fHwxNzY1OTIzMTYxfDA&ixlib=rb-4.1.0&q=55&w=480",
    tablet:  "https://images.unsplash.com/photo-1764639568368-9a60bdd7602c?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMHdpbGRmaXJlJTIwc21va2V8ZW58MXx8fHwxNzY1OTIzMTYxfDA&ixlib=rb-4.1.0&q=63&w=768",
    desktop: "https://images.unsplash.com/photo-1764639568368-9a60bdd7602c?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMHdpbGRmaXJlJTIwc21va2V8ZW58MXx8fHwxNzY1OTIzMTYxfDA&ixlib=rb-4.1.0&q=62&w=1200",
    alt: "Firefighter in smoke",
  },
  {
    mobile:  "https://images.unsplash.com/photo-1694700792440-042af6d0e8fb?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGFmdGVybWF0aCUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjU5MjMxNjJ8MA&ixlib=rb-4.1.0&q=55&w=480",
    tablet:  "https://images.unsplash.com/photo-1694700792440-042af6d0e8fb?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGFmdGVybWF0aCUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjU5MjMxNjJ8MA&ixlib=rb-4.1.0&q=63&w=768",
    desktop: "https://images.unsplash.com/photo-1694700792440-042af6d0e8fb?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMGFmdGVybWF0aCUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjU5MjMxNjJ8MA&ixlib=rb-4.1.0&q=62&w=1200",
    alt: "Wildfire aftermath",
  },
];

// How long (ms) to wait after mount before starting the slideshow.
// Should be comfortably after LCP is measured (~2.5 s target).
const SLIDESHOW_DELAY = 2500;

export function Hero() {
  // Total slides = 1 (LCP) + extraSlides. Index 0 is always the LCP slide.
  const totalSlides = 1 + extraSlides.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  // Extra slides are held back until the LCP window closes.
  const [slidesReady, setSlidesReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // --- User Timing: hero mounted ----------------------------------------
    performance?.mark('hero-mount');

    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || prefersReducedMotion) {
      // On mobile the slideshow never starts: no competing image downloads,
      // no interval, no JS timers running in the background.
      return;
    }

    // Delay adding extra slides to the DOM until well after LCP.
    const readyTimer = setTimeout(() => setSlidesReady(true), SLIDESHOW_DELAY);

    // Slideshow interval starts after the slides are rendered.
    // We use a nested timeout so the first tick fires ~5 s after the slides
    // appear rather than immediately.
    const startInterval = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, 5000);
    }, SLIDESHOW_DELAY + 200);

    const handleResize = () => {
      if (window.innerWidth < 768 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(startInterval);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lcpSrcSet = `${LCP_MOBILE} 480w, ${LCP_TABLET} 768w, ${LCP_DESKTOP} 1200w`;
  const SIZES = "(max-width: 480px) 480px, (max-width: 768px) 768px, 100vw";

  return (
    <section
      id="home"
      className="relative flex items-center justify-center overflow-hidden pt-[var(--nav-height)]"
      style={{ minHeight: 'min(90svh, 90vh)' }}
    >
      {/* ── Background images ──────────────────────────────────────────── */}
      <div className="absolute inset-0" aria-hidden="true">

        {/* Slide 0 — LCP image. Always in DOM, always visible first. */}
        <div
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: currentIndex === 0 ? 1 : 0 }}
        >
          {/* picture element lets AVIF-capable browsers skip the larger WebP */}
          <picture>
            <source
              type="image/avif"
              srcSet="/Images/hero/hero-480.avif 480w, /Images/hero/hero-768.avif 768w, /Images/hero/hero-1200.avif 1200w"
              sizes={SIZES}
            />
            <img
              srcSet={lcpSrcSet}
              sizes={SIZES}
              src={LCP_MOBILE}
              alt="Fire rescue vehicles and firefighters ready to respond"
              className="w-full h-full object-cover"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              width={480}
              height={582}
              onLoad={() => performance?.mark('hero-lcp-image-loaded')}
            />
          </picture>
        </div>

        {/* Slides 1-3 — added to DOM only after LCP window closes */}
        {slidesReady && extraSlides.map((slide, i) => {
          const slideIndex = i + 1;
          return (
            <div
              key={slideIndex}
              className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
              style={{ opacity: currentIndex === slideIndex ? 1 : 0 }}
            >
              <img
                srcSet={`${slide.mobile} 480w, ${slide.tablet} 768w, ${slide.desktop} 1200w`}
                sizes={SIZES}
                src={slide.mobile}
                alt={slide.alt}
                className="w-full h-full object-cover"
                fetchPriority="low"
                loading="lazy"
                decoding="async"
                width={1920}
                height={1080}
              />
            </div>
          );
        })}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* ── Text content ──────────────────────────────────────────────── */}
      {/* CSS classes .hero-fade-1/2/3 are defined in theme.css and use   */}
      {/* @keyframes heroFadeUp — no JS animation library needed.         */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">

          <p className="text-primary uppercase tracking-wider mb-6 text-sm font-semibold hero-fade-1">
            The Wildland Fire Recovery Fund &nbsp;|&nbsp; 501(c)(3) Nonprofit
          </p>

          <h1
            className="mb-6 leading-tight hero-fade-2"
            style={{ fontSize: 'clamp(2rem, 6vw + 0.5rem, 5rem)' }}
          >
            Wildfire Relief Donations for{' '}
            <span className="text-primary font-bold">Long-Term Recovery</span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed hero-fade-3">
            We provide financial relief and support to firefighters and families affected by
            wildfires. When the flames are gone, we help communities rebuild.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center hero-fade-3 mb-6">
            <a
              href="/donate"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full text-lg hover:bg-primary/90 transition-colors"
            >
              Donate Now · 100% Tax-Deductible
            </a>
            <a
              href="#programs"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/10 transition-colors"
            >
              See How It Works
            </a>
          </div>

          <p className="text-sm text-muted-foreground italic">
            For families, firefighters &amp; children after the flames
          </p>

        </div>
      </div>
    </section>
  );
}