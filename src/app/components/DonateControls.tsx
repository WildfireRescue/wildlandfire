import { useMemo, useState } from "react";

// One-time presets (includes $250)
const ONE_TIME_AMOUNTS = [25, 50, 100, 250];

// Monthly presets (only tiers you created in Stripe)
const MONTHLY_AMOUNTS = [19, 25, 50, 100];

const OTHER = "other" as const;

export function DonateControls({
  defaultAmount = 50,
  defaultMonthly = true,
}: {
  defaultAmount?: number;
  defaultMonthly?: boolean;
}) {
  const [monthly, setMonthly] = useState(defaultMonthly);

  // If defaultMonthly is true but defaultAmount isn't a monthly tier, fallback to 25
  const initialMonthlyAmount = MONTHLY_AMOUNTS.includes(defaultAmount) ? defaultAmount : 25;

  const [amount, setAmount] = useState<number>(defaultMonthly ? initialMonthlyAmount : defaultAmount);
  const [selected, setSelected] = useState<number | typeof OTHER>(
    defaultMonthly ? initialMonthlyAmount : defaultAmount
  );
  const [customAmount, setCustomAmount] = useState<string>("");

  const activePresets = monthly ? MONTHLY_AMOUNTS : ONE_TIME_AMOUNTS;

  const resolvedAmount = useMemo(() => {
    if (selected === OTHER) {
      const n = Number(customAmount);
      return Number.isFinite(n) ? n : 0;
    }
    return amount;
  }, [selected, customAmount, amount]);

  const ctaText = useMemo(() => {
    const label = resolvedAmount > 0 ? `$${resolvedAmount}` : "$—";
    return monthly ? `Donate ${label} Monthly` : `Donate ${label} Now`;
  }, [resolvedAmount, monthly]);

  function pickPreset(a: number) {
    setSelected(a);
    setAmount(a);
    setCustomAmount("");
  }

  function pickOther() {
    setSelected(OTHER);
    // Custom amounts are one-time only
    if (monthly) setMonthly(false);
  }

  async function startCheckout() {
    // Monthly is always a preset
    if (monthly && selected === OTHER) {
      alert("For monthly giving, please choose one of the preset amounts.");
      return;
    }

    const dollars = monthly ? amount : resolvedAmount;

    if (!dollars || dollars < 1) {
      alert("Please enter a valid amount (minimum $1).");
      return;
    }

    const payload = {
      frequency: monthly ? "monthly" : "one_time",
      amount: dollars,
      lookupKey: monthly ? `monthly_${amount}` : undefined,
    };

    console.log("checkout payload:", payload);

    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("checkout error:", data);
      alert(data?.error || "Checkout failed. Please try again.");
      return;
    }

    if (!data?.url) {
      alert("Checkout URL missing. Please try again.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Frequency Toggle */}
      <div className="inline-flex w-full rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => {
            setMonthly(true);
            // Snap to a valid monthly tier if current selection isn't valid
            if (!MONTHLY_AMOUNTS.includes(amount) || selected === OTHER) {
              const fallback = MONTHLY_AMOUNTS.includes(defaultAmount) ? defaultAmount : 25;
              setSelected(fallback);
              setAmount(fallback);
              setCustomAmount("");
            }
          }}
          className={[
            "w-1/2 rounded-xl px-4 py-3 text-sm font-semibold transition",
            monthly
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Monthly
        </button>

        <button
          type="button"
          onClick={() => setMonthly(false)}
          className={[
            "w-1/2 rounded-xl px-4 py-3 text-sm font-semibold transition",
            !monthly
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          One-time
        </button>
      </div>

      {/* Amount Pills */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {activePresets.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => pickPreset(a)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              "border border-white/10 bg-white/5 hover:bg-white/10",
              selected === a
                ? "border-primary/60 bg-primary/15 text-foreground"
                : "text-muted-foreground",
            ].join(" ")}
          >
            ${a}
          </button>
        ))}

        {/* "Other" only for one-time */}
        {!monthly && (
          <button
            type="button"
            onClick={pickOther}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              "border border-white/10 bg-white/5 hover:bg-white/10",
              selected === OTHER
                ? "border-primary/60 bg-primary/15 text-foreground"
                : "text-muted-foreground",
            ].join(" ")}
          >
            Other
          </button>
        )}
      </div>

      {/* Custom amount input (one-time only) */}
      {!monthly && selected === OTHER && (
        <div className="mt-3 mx-auto max-w-sm">
          <label className="block text-xs text-muted-foreground mb-2">
            Enter custom one-time amount
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-muted-foreground">$</span>
            <input
              inputMode="decimal"
              placeholder="50"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={startCheckout}
        className="mt-4 w-full rounded-2xl bg-primary px-5 py-4 text-base font-extrabold text-primary-foreground shadow hover:opacity-95 transition"
      >
        {ctaText}
      </button>

      {/* Trust line */}
      <div className="mt-3 text-center text-xs text-muted-foreground">
        501(c)(3) • Tax-deductible • Secure checkout • Receipt emailed instantly
      </div>
    </div>
  );
}
