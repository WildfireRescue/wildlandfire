import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';

export function ArticlesPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const flag = sessionStorage.getItem('allow_articles');
    if (!flag) {
      // Not allowed — redirect to home
      window.location.hash = 'home';
      setAllowed(false);
      return;
    }

    // Consume the flag so direct reload won't work
    sessionStorage.removeItem('allow_articles');
    setAllowed(true);
  }, []);

  if (allowed === null) {
    return null; // avoid flashing
  }

  if (!allowed) {
    return null; // redirected
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl mb-6">Articles</h1>
          <p className="text-muted-foreground mb-8">
            Curated articles and resources about wildfire recovery, prevention, and community support.
          </p>

          <div className="space-y-6 text-left">
            <article className="p-6 border border-border rounded-lg">
              <h2 className="text-2xl mb-2">How Communities Rebuild After Wildfires</h2>
              <p className="text-muted-foreground">A deep dive into the process of recovery and long-term support.</p>
            </article>

            <article className="p-6 border border-border rounded-lg">
              <h2 className="text-2xl mb-2">Fire Prevention and Preparedness</h2>
              <p className="text-muted-foreground">Practical steps families and communities can take to reduce risk.</p>
            </article>
          </div>

          <div className="mt-12">
            <Button size="lg" onClick={() => (window.location.hash = 'home')}>
              Return Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
