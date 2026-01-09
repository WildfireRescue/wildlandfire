import { Menu, X, Heart, Users, DollarSign, Home, Phone, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImage from '../../assets/e43d164f2f92fa60d5e9ac721dd31bf10ad9da66.png';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home, description: 'Our mission to rebuild lives' },
  { id: 'about', label: 'About Us', icon: Users, description: 'Learn about our mission and purpose' },
  { id: 'donate', label: 'Donate', icon: DollarSign, description: 'Make a difference today', highlight: true },
  { id: 'stories', label: 'Stories', icon: Users, description: 'See the lives you can change' },
  { id: 'articles', label: 'Articles', icon: FileText, description: 'Latest updates and stories' },
  { id: 'grants', label: 'Grants', icon: FileText, description: 'Apply for support programs' },
  { id: 'contact', label: 'Contact Us', icon: Phone, description: 'Get in touch with our team' },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when page changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPage]);

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            ? 'bg-background/98 backdrop-blur-xl border-b border-border shadow-lg'
            : 'bg-background/95 backdrop-blur-lg border-b border-border/50'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Clean and Simple */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-3 cursor-pointer transition-opacity ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <img src={logoImage} alt="Logo" className="h-12 w-auto" />
            </motion.div>

            {/* Right Side: Donate Button + Hamburger */}
            <div className="flex items-center gap-3">
              {/* Donate Button - Always Visible */}
              <Button
                size="sm"
                className={`bg-primary text-primary-foreground hover:bg-primary/90 gap-2 transition-opacity ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => handleNavClick('donate')}
              >
                <Heart size={16} className="hidden sm:block" />
                <span>Donate</span>
              </Button>

              {/* Hamburger Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-lg hover:bg-secondary/80 transition-colors border border-border relative z-[70]"
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              style={{ top: '0px' }}
            />

            {/* Menu Panel - Full Screen Overlay */}
            <motion.nav
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 overflow-y-auto p-4 pt-20"
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
                  <img src={logoImage} alt="Logo" className="h-16 w-auto" />
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
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        onClick={() => handleNavClick(item.id)}
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
                      </motion.button>
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
                  <button
                    onClick={() => handleNavClick('donate')}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-full transition-all hover:scale-105"
                  >
                    Donate Now
                  </button>
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