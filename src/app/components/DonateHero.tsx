import { motion } from "motion/react";
import { Heart, Gift, Users } from "lucide-react";
import { DonateControls } from "./DonateControls";

export function DonateHero() {
  async function startDonation(opts: { amount: number; monthly: boolean }) {
    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: opts.amount, monthly: opts.monthly }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Donation checkout failed. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="relative py-12 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Heart className="text-primary mx-auto" size={48} fill="currentColor" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl mb-4">Give Hope Today</h1>

          <p className="text-2xl text-muted-foreground mb-4 leading-relaxed">
            Your donation doesn't just help rebuild homes. It rebuilds lives, restores dignity, and
            proves to someone who's lost everything that{" "}
            <span className="text-foreground font-semibold">the world still cares about them.</span>
          </p>

          {/* Active Need Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 px-5 py-2.5 bg-primary/10 rounded-full inline-flex mx-auto border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-foreground font-medium text-sm">Currently serving families nationwide</span>
          </div>

          {/* ✅ Donate controls (above the fold) */}
          <div className="max-w-xl mx-auto mb-10">
            <DonateControls
              defaultAmount={50}
              defaultMonthly={true}
              onDonate={({ amount, monthly }) => startDonation({ amount, monthly })}
            />
          </div>


        </motion.div>
      </div>
    </section>
  );
}