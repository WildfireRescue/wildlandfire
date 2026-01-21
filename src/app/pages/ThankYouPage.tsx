import { motion } from 'motion/react';
import { Heart, Home, Share2, Mail, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function ThankYouPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1565665681743-6ff01c5181e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kcyUyMHRvZ2V0aGVyJTIwdGVhbXdvcmt8ZW58MXx8fHwxNzY2MDQ0OTMyfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Community working together"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Animated Heart Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/30 mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="text-primary" size={64} fill="currentColor" />
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl md:text-7xl mb-6"
          >
            Thank You for Your{' '}
            <span className="text-primary">Generosity</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            Your donation will directly help wildfire survivors and firefighter families rebuild their lives with dignity and hope. You've made a real difference today.
          </motion.p>

          {/* Impact Message Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-3xl p-8 md:p-12 mb-12"
          >
            <h2 className="text-3xl mb-4">What Happens Next?</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Immediate Action</h3>
                <p className="text-sm text-muted-foreground">
                  Your donation will go directly to families in need when disaster strikes
                </p>
              </div>

              <div>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Real Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Help with housing, food, education, and rebuilding essentials
                </p>
              </div>

              <div>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Stay Connected</h3>
                <p className="text-sm text-muted-foreground">
                  We'll share updates as we grow and start helping survivors
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link to="/">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                <Home size={20} className="mr-2" />
                Return Home
              </Button>
            </Link>

            <Link to="/stories">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-border hover:bg-secondary px-8"
              >
                <TrendingUp size={20} className="mr-2" />
                See Our Impact
              </Button>
            </Link>
          </motion.div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="border-t border-border pt-12"
          >
            <h3 className="text-2xl mb-6">Help Us Reach More People</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Share our mission with your friends and family. Every share helps us find more supporters who want to make a difference.
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-secondary"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'The Wildland Fire Recovery Fund',
                      text: 'I just donated to help wildfire survivors rebuild their lives. Join me in making a difference!',
                      url: window.location.origin
                    });
                  }
                }}
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-secondary"
                asChild
              >
                <a href="mailto:?subject=The Wildland Fire Recovery Fund&body=I just donated to help wildfire survivors rebuild their lives. Check out this amazing organization: https://www.thewildlandfirerecoveryfund.org">
                  <Mail size={16} className="mr-2" />
                  Email
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Footer Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="text-sm text-muted-foreground italic mt-16"
          >
            "In the aftermath of destruction, your compassion becomes the foundation for new beginnings."
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}