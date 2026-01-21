import { Menu, X, Heart, Users, DollarSign, Home, Phone, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'home', label: 'Home', icon: Home, description: 'Our mission to rebuild lives', path: '/' },
  { id: 'about', label: 'About Us', icon: Users, description: 'Learn about our mission and purpose', path: '/about' },
  { id: 'donate', label: 'Donate', icon: DollarSign, description: 'Make a difference today', highlight: true, path: '/donate' },
  { id: 'stories', label: 'Stories', icon: Users, description: 'See the lives you can change', path: '/stories' },
  { id: 'blog', label: 'Blog', icon: FileText, description: 'Latest updates and insights', path: '/blog' },
  { id: 'grants', label: 'Grants', icon: FileText, description: 'Apply for support programs', path: '/grants' },
  { id: 'contact', label: 'Contact Us', icon: Phone, description: 'Get in touch with our team', path: '/contact' },
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Determine current page from pathname
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/admin')) return 'admin';
    return path.slice(1); // Remove leading slash
  };

  const currentPage = getCurrentPage();

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
          isMenuOpen ? 'z-[60]' : 'z-50'
        } ${
          scrolled || isMenuOpen
            ? 'bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl shadow-black/10'
            : 'bg-background/95 backdrop-blur-lg border-b border-border/50'
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with Professional Typography */}
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-4 cursor-pointer transition-opacity group ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img 
                    src="/Images/logo-128.png" 
                    alt="Wildland Fire Recovery Fund" 
                    className="h-14 w-14 relative z-10 drop-shadow-lg" 
                    loading="eager"
                    fetchpriority="high"
                    decoding="async"
                    width="56"
                    height="56"
                  />
                </div>
                <div className="hidden md:flex flex-col leading-tight">
                  <span className="text-base font-bold tracking-tight text-foreground">
                    The Wildland Fire
                  </span>
                  <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Recovery Fund
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Right Side: Donate Button + Hamburger */}
            <div className="flex items-center gap-4">
              {/* Donate Button - Premium Style */}
              <Link to="/donate">
                <Button
                  size="lg"
                  className={`bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 font-semibold ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <Heart size={18} className="hidden sm:block" fill="currentColor" />
                  <span>Donate Now</span>
                </Button>
              </Link>

              {/* Hamburger Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-4 rounded-xl hover:bg-primary/10 transition-colors border border-border/50 hover:border-primary/50 relative z-[70] backdrop-blur-sm min-h-[48px] min-w-[48px] flex items-center justify-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} className="text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Full-Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Menu Panel - Full Screen Overlay */}
            <motion.nav
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 overflow-y-auto p-4 pt-32 bg-background"
            >
              {/* Menu Content */}
              <div className="max-w-2xl w-full mx-auto pb-8">
                {/* Logo at top */}
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center gap-3 mb-12"
                >
                  <img src="/Images/logo-128.png" alt="Wildland Fire Recovery Fund" className="h-16 w-auto" loading="eager" fetchpriority="high" decoding="async" width="64" height="64" />
                  <div>
                    <div className="text-lg tracking-wider uppercase">THE WILDLAND FIRE</div>
                    <div className="text-lg tracking-wider uppercase">RECOVERY FUND</div>
                  </div>
                </motion.div>

                {/* Navigation Items */}
                <div className="space-y-3 mb-12">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <Link key={item.id} to={item.path}>
                        <motion.div
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 10 }}
                          className={`w-full text-left p-6 rounded-2xl transition-all group ${
                            isActive
                              ? 'bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20'
                              : 'bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary/50 hover:bg-card'
                          } ${item.highlight && !isActive ? 'ring-2 ring-rose-500/30' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl transition-all ${
                              isActive 
                                ? 'bg-primary/30 scale-110' 
                                : 'bg-secondary group-hover:bg-primary/10'
                            }`}>
                              <Icon size={28} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} />
                            </div>
                            <div className="flex-1">
                              <div className={`text-2xl font-semibold mb-1 ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                                {item.label}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            {item.highlight && !isActive && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-semibold"
                              >
                                URGENT
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Get Involved CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-primary/20 to-orange-500/20 border-2 border-primary/30 rounded-2xl p-6 text-center"
                >
                  <h3 className="text-lg font-semibold mb-3">Make an Impact Today</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your donation helps wildfire survivors rebuild their lives with dignity and hope.
                  </p>
                  <Link to="/donate">
                    <button
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-full transition-all hover:scale-105"
                    >
                      Donate Now
                    </button>
                  </Link>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-[72px]" />
    </>
  );
}