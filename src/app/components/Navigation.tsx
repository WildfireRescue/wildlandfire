/**
 * Navigation.tsx — motion/react-free, accessibility-fixed, LCP-safe
 *
 * Changes from previous version:
 *  • Removed static import of motion/react — the motion chunk (~125 KB) was
 *    previously loaded eagerly because of this file. All animations are now
 *    CSS-only (transitions + keyframes defined in theme.css / Tailwind).
 *  • Fixed invalid HTML: <Link><Button> rendered as <a><button> (nested
 *    interactive elements). Now uses Button asChild + <Link> → renders as a
 *    single <a> with Button styling.
 *  • Fixed <Link><button> in the mobile menu CTA — replaced with <Link>
 *    styled directly so there is no nesting.
 *  • Header slide-down: CSS @keyframes navSlideDown (theme.css).
 *  • Hamburger icon swap: CSS rotate + opacity transition — no AnimatePresence.
 *  • Full-screen menu: CSS opacity/scale/visibility toggle — no motion.nav.
 *  • Nav item stagger: inline transitionDelay — no motion.div.
 *  • URGENT badge pulse: Tailwind animate-pulse — no motion repeat.
 *  • Touch targets: hamburger button is min 48×48 px.
 */
import { Menu, X, Heart, Users, DollarSign, Home, Phone, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'home',    label: 'Home',       icon: Home,       description: 'Our mission to rebuild lives',           path: '/' },
  { id: 'about',   label: 'About Us',   icon: Users,      description: 'Learn about our mission and purpose',    path: '/about' },
  { id: 'donate',  label: 'Donate',     icon: DollarSign, description: 'Make a difference today', highlight: true, path: '/donate' },
  { id: 'stories', label: 'Stories',    icon: Users,      description: 'See the lives you can change',           path: '/stories' },
  { id: 'blog',    label: 'Blog',       icon: FileText,   description: 'Latest updates and insights',            path: '/blog' },
  { id: 'grants',  label: 'Grants',     icon: FileText,   description: 'Apply for support programs',             path: '/grants' },
  { id: 'contact', label: 'Contact Us', icon: Phone,      description: 'Get in touch with our team',             path: '/contact' },
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/admin')) return 'admin';
    return path.slice(1);
  };
  const currentPage = getCurrentPage();

  return (
    <>
      {/* ── Fixed header — CSS slide-down, no motion needed ──────────── */}
      <header
        className={`nav-slide-down fixed top-0 left-0 right-0 transition-all duration-300 ${
          isMenuOpen ? 'z-[60]' : 'z-50'
        } ${
          scrolled || isMenuOpen
            ? 'bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl shadow-black/10'
            : 'bg-background/95 backdrop-blur-lg border-b border-border/50'
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link
              to="/"
              className={`flex items-center gap-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] group ${
                isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <picture>
                  <source srcSet="/Images/logo-128.webp" type="image/webp" />
                  <img
                    src="/Images/logo-128.png"
                    alt="Wildland Fire Recovery Fund"
                    className="h-14 w-14 relative z-10 drop-shadow-lg"
                    loading="eager"
                    decoding="async"
                    width="56"
                    height="56"
                  />
                </picture>
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-base font-bold tracking-tight text-foreground">
                  The Wildland Fire
                </span>
                <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Recovery Fund
                </span>
              </div>
            </Link>

            {/* Right side: Donate + Hamburger */}
            <div className="flex items-center gap-4">

              {/* ── Donate button: Button asChild avoids <a><button> nesting ── */}
              <Button
                asChild
                size="lg"
                className={`bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 font-semibold ${
                  isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <Link to="/donate">
                  <Heart size={18} className="hidden sm:block" fill="currentColor" />
                  <span>Donate Now</span>
                </Link>
              </Button>

              {/* ── Hamburger — CSS icon swap, no AnimatePresence ─────────── */}
              <button
                className="p-4 rounded-xl hover:bg-primary/10 active:scale-90 transition-all duration-150 border border-border/50 hover:border-primary/50 relative z-[70] backdrop-blur-sm min-h-[48px] min-w-[48px] flex items-center justify-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="nav-menu"
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <X
                    size={24}
                    className={`absolute transition-all duration-200 ${
                      isMenuOpen ? 'opacity-100 rotate-0 text-primary' : 'opacity-0 rotate-90'
                    }`}
                    aria-hidden="true"
                  />
                  <Menu
                    size={24}
                    className={`absolute transition-all duration-200 ${
                      isMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Full-screen menu — CSS opacity/scale/visibility toggle ──── */}
      {/* Keeping it in DOM avoids re-mount cost; visibility:hidden removes
          it from tab order and accessibility tree when closed.             */}
      <nav
        id="nav-menu"
        aria-label="Site navigation"
        className={`fixed inset-0 z-50 overflow-y-auto p-4 pt-32 bg-background transition-all duration-300 ${
          isMenuOpen
            ? 'opacity-100 scale-100 visible'
            : 'opacity-0 scale-95 invisible'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="max-w-2xl w-full mx-auto pb-8">

          {/* Logo in menu */}
          <div
            className={`flex items-center justify-center gap-3 mb-12 transition-all duration-300 ${
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.1s' : '0s' }}
          >
            <img
              src="/Images/logo-128.webp"
              alt="Wildland Fire Recovery Fund"
              className="h-16 w-auto"
              loading="lazy"
              decoding="async"
              width="64"
              height="64"
            />
            <div>
              <div className="text-lg tracking-wider uppercase">THE WILDLAND FIRE</div>
              <div className="text-lg tracking-wider uppercase">RECOVERY FUND</div>
            </div>
          </div>

          {/* Navigation items with staggered CSS delay */}
          <div className="space-y-3 mb-12">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Link key={item.id} to={item.path}>
                  <div
                    className={`w-full text-left p-6 rounded-2xl transition-all duration-300 group cursor-pointer ${
                      isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    } ${
                      isActive
                        ? 'bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20'
                        : 'bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary/50 hover:bg-card hover:translate-x-2'
                    } ${item.highlight && !isActive ? 'ring-2 ring-rose-500/30' : ''}`}
                    style={{ transitionDelay: isMenuOpen ? `${0.15 + index * 0.05}s` : '0s' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary/30 scale-110'
                          : 'bg-secondary group-hover:bg-primary/10'
                      }`}>
                        <Icon
                          size={28}
                          className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}
                        />
                      </div>
                      <div className="flex-1">
                        <div className={`text-2xl font-semibold mb-1 ${
                          isActive ? 'text-primary' : 'group-hover:text-primary'
                        }`}>
                          {item.label}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>

                      {/* URGENT badge — Tailwind animate-pulse, no motion needed */}
                      {item.highlight && !isActive && (
                        <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-semibold animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA block */}
          <div
            className={`bg-gradient-to-r from-primary/20 to-orange-500/20 border-2 border-primary/30 rounded-2xl p-6 text-center transition-all duration-300 ${
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.5s' : '0s' }}
          >
            <h3 className="text-lg font-semibold mb-3">Make an Impact Today</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your donation helps wildfire survivors rebuild their lives with dignity and hope.
            </p>
            {/* ── Link styled as button — no <a><button> nesting ─────────── */}
            <Link
              to="/donate"
              className="block w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-full text-center transition-all hover:scale-[1.02] active:scale-95 min-h-[48px] flex items-center justify-center font-semibold"
            >
              Donate Now
            </Link>
          </div>

        </div>
      </nav>

      {/* Spacer to push page content below the fixed header */}
      <div className="h-[72px]" />
    </>
  );
}
