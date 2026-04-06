/**
 * HomeFAQ.tsx — SEO-optimised FAQ section for the homepage
 *
 * - Semantic <dl> list with <dt>/<dd> pairs for accessibility
 * - Injects FAQPage JSON-LD schema into <head> on mount (id: homepage-faq-structured-data)
 * - Lazy-loaded from HomePage.tsx; does not affect LCP
 */
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How are wildfire relief donations used by The Wildland Fire Recovery Fund?',
    answer:
      'Your wildfire relief donations are used in three main ways: providing on-site relief to displaced families, offering financial grants to families of fallen firefighters, and partnering with organizations to equip frontline responders. We focus on both immediate emergency needs and long-term wildfire recovery support. Every dollar is carefully allocated to maximize impact for survivors and their communities.',
  },
  {
    question: 'Is my donation to the wildfire recovery fund tax-deductible?',
    answer:
      'Yes, your donation is 100% tax-deductible. The Wildland Fire Recovery Fund operates as a registered 501(c)(3) nonprofit organization (EIN: 41-2905752). You will receive a receipt for your records that you can use when filing your taxes. Your generosity helps wildfire survivors and provides you with a tax benefit.',
  },
  {
    question: 'How quickly do wildfire relief donations reach those in need?',
    answer:
      'We pride ourselves on rapid deployment of resources. When a wildfire emergency occurs, we work to get help to survivors as quickly as possible, often within days of a disaster. Our streamlined processes and local partnerships allow us to cut through delays and deliver aid when it matters most. Your donation today could be helping a family tomorrow.',
  },
  {
    question: 'What is the difference between wildfire relief and wildfire recovery?',
    answer:
      'Wildfire relief refers to immediate emergency assistance provided during and right after a fire, such as food, shelter, and emergency supplies. Wildfire recovery is the longer-term process of rebuilding homes, restoring livelihoods, and helping communities return to normal. The Wildland Fire Recovery Fund supports both phases, ensuring families have help from the moment they evacuate through the years it takes to fully rebuild.',
  },
  {
    question: 'Can I donate to help a specific wildfire or community?',
    answer:
      'While we accept general donations that allow us to help wherever the need is greatest, you can also designate your gift for specific wildfire events or communities when applicable. Contact us to discuss how you would like your wildfire relief donation directed. We work hard to honor donor wishes while ensuring all affected communities receive support.',
  },
  {
    question: 'How does The Wildland Fire Recovery Fund support firefighters?',
    answer:
      'We support firefighters in several important ways: financial grants to families of firefighters who died in the line of duty; partnerships with firefighter organizations to fund essential equipment, training, and safety gear; and mental health resources to help firefighters cope with the stress and trauma of their demanding work. Your wildfire relief donations help protect those who protect us.',
  },
  {
    question: 'What makes The Wildland Fire Recovery Fund different from other charities?',
    answer:
      'Our fund focuses specifically on wildfire relief and recovery, which allows us to develop deep expertise in helping fire-affected communities. We combine immediate emergency response with long-term rebuilding support. We serve both civilian families and firefighter families with equal dedication. Most importantly, we operate with 100% transparency so you always know exactly how your donation is making a difference.',
  },
];

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Inject FAQPage JSON-LD schema on mount
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    let script = document.getElementById(
      'homepage-faq-structured-data'
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'homepage-faq-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      document.getElementById('homepage-faq-structured-data')?.remove();
    };
  }, []);

  return (
    <section id="faq" className="py-20 bg-background" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-14">
          <p className="text-sm tracking-widest uppercase text-primary mb-3">FAQ</p>
          <h2
            id="faq-heading"
            className="text-4xl md:text-5xl mb-4"
          >
            Frequently Asked Questions About Wildfire Relief Donations
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know before making your wildfire relief donation.
          </p>
        </div>

        <dl className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden"
              >
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-base sm:text-lg hover:bg-card/70 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 text-primary transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </dt>
                <dd
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
