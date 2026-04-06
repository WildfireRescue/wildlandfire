/**
 * Footer.tsx — motion/react-free
 *
 * Removed the static import of motion/react (the only remaining eager-path
 * consumer after Hero and Navigation were fixed). The motion chunk is now
 * exclusively a dynamic import loaded by below-fold lazy-loaded sections,
 * so it no longer blocks the initial page paint.
 *
 * Hover effects preserved via Tailwind transition utilities.
 * Entrance animations removed — the footer is below the fold and entrance
 * animations on scroll are a progressive enhancement, not a requirement.
 */
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61585125667396', label: 'Facebook' },
    { icon: Twitter,  href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Mail, href: 'mailto:info@thewildlandfirerecoveryfund.org', label: 'Email' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* Brand / Mission */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <picture>
                <source srcSet="/Images/logo-footer.webp" type="image/webp" />
                <img
                  src="/Images/logo-footer.png"
                  alt="The Wildland Fire Recovery Fund"
                  className="h-16 w-auto mb-3 transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  width="303"
                  height="180"
                />
              </picture>
              <div className="text-sm text-muted-foreground max-w-md">
                For families, firefighters &amp; children after the flames
              </div>
            </div>

            <p className="text-muted-foreground mt-4 max-w-md">
              Supporting communities devastated by wildfires through direct financial relief
              and long-term recovery assistance.
            </p>

            <p className="text-xs text-muted-foreground mt-4 max-w-md">
              The Wildland Fire Recovery Fund is an independent nonprofit organization and is
              not affiliated with the California Community Foundation or other similarly named
              wildfire funds.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              {[
                { name: 'Home',       url: '/' },
                { name: 'About Us',   url: '/about' },
                { name: 'Stories',    url: '/stories' },
                { name: 'Grants',     url: '/grants' },
                { name: 'Donate',     url: '/donate' },
                { name: 'Blog',       url: '/blog' },
                { name: 'Contact Us', url: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.url}
                    className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
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
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        className="hover:text-primary hover:scale-110 hover:-translate-y-0.5 active:scale-90 transition-all duration-200 p-3 min-h-[48px] min-w-[48px] flex items-center justify-center"
                        aria-label={social.label}
                      >
                        <Icon size={24} />
                      </a>
                    );
                  })}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} The Wildland Fire Recovery Fund. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

