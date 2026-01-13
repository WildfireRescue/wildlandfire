import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import logoImage from '../../assets/e43d164f2f92fa60d5e9ac721dd31bf10ad9da66.png';

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61585125667396', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Mail, href: 'mailto:info@thewildlandfirerecoveryfund.org', label: 'Email' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand / Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <div className="mb-4">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={logoImage}
                alt="The Wildland Fire Recovery Fund"
                className="h-16 w-auto mb-3"
              />
              <div className="text-sm text-muted-foreground max-w-md">
                For families, firefighters & children after the flames
              </div>
            </div>

            <p className="text-muted-foreground mt-4 max-w-md">
              Supporting communities devastated by wildfires through direct financial relief
              and long-term recovery assistance.
            </p>

            {/* Entity Disambiguation */}
            <p className="text-xs text-muted-foreground mt-4 max-w-md">
              The Wildland Fire Recovery Fund is an independent nonprofit organization and is
              not affiliated with the California Community Foundation or other similarly named
              wildfire funds.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              {[
                { name: 'Home', url: '#home' },
                { name: 'About Us', url: '#about' },
                { name: 'Stories', url: '#stories' },
                { name: 'Grants', url: '#grants' },
                { name: 'Donate', url: '#donate' },
                { name: 'Blog', url: '#blog' },
                { name: 'Contact Us', url: '#contact' }
              ].map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <a
                    href={link.url}
                    className="hover:text-primary transition-colors inline-block"
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="mb-4 uppercase tracking-wider text-sm">Contact</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="mailto:info@thewildlandfirerecoveryfund.org"
                  className="hover:text-primary transition-colors"
                >
                  info@thewildlandfirerecoveryfund.org
                </a>
              </li>

              <li className="pt-4">
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.2, y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        className="hover:text-primary transition-colors p-3 min-h-[48px] min-w-[48px] flex items-center justify-center"
                        aria-label={social.label}
                      >
                        <Icon size={24} />
                      </motion.a>
                    );
                  })}
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground"
        >
          <p>
            © {new Date().getFullYear()} The Wildland Fire Recovery Fund. All rights reserved.
          </p>
          <div className="flex gap-6">
            <motion.a
              href="#privacy"
              whileHover={{ scale: 1.05 }}
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#terms"
              whileHover={{ scale: 1.05 }}
              className="hover:text-primary transition-colors"
            >
              Terms of Use
            </motion.a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
