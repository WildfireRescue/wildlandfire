import { useEffect } from 'react';

export function StructuredData() {
  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": ["NonprofitOrganization", "Organization"],
      "name": "The Wildland Fire Recovery Fund",
      "alternateName": "Wildland Fire Recovery Fund",
      "url": "https://www.thewildlandfirerecoveryfund.org",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.thewildlandfirerecoveryfund.org/Images/logo-512.png",
        "width": 512,
        "height": 512
      },
      "image": "https://www.thewildlandfirerecoveryfund.org/Images/logo-512.png",
      "description": "The Wildland Fire Recovery Fund provides emergency assistance, housing support, and resources to wildfire survivors with rapid emergency response.",
      "foundingDate": "2026",
      "nonprofitStatus": "501(c)(3)",
      "taxID": "41-2905752",
      "slogan": "Rebuilding Lives, Restoring Hope",
      "mission": "To provide rapid, transparent emergency assistance to wildfire survivors, including emergency housing, mental health support, and firefighter resources.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "info@thewildlandfirerecoveryfund.org",
        "availableLanguage": ["English"],
        "areaServed": "US"
      },
      "sameAs": [
        "https://www.facebook.com/profile.php?id=61585125667396"
      ],
      "areaServed": {
        "@type": "Country",
        "name": "United States"
      },
      "knowsAbout": [
        "Wildfire Relief",
        "Disaster Recovery",
        "Emergency Housing",
        "Fire Survivor Support",
        "Firefighter Assistance",
        "Mental Health Support for Disaster Survivors"
      ],
      "memberOf": {
        "@type": "Organization",
        "name": "501(c)(3) Nonprofit Organizations"
      },
      "seeks": {
        "@type": "Demand",
        "name": "Donations to support wildfire survivors"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "accreditedBy": [
        {
          "@type": "Organization",
          "name": "IRS",
          "url": "https://www.irs.gov"
        }
      ]
    };

    // Website Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "The Wildland Fire Recovery Fund",
      "url": "https://www.thewildlandfirerecoveryfund.org",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.thewildlandfirerecoveryfund.org/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    // Charity Schema
    const charitySchema = {
      "@context": "https://schema.org",
      "@type": "Charity",
      "name": "The Wildland Fire Recovery Fund",
      "url": "https://www.thewildlandfirerecoveryfund.org",
      "description": "Supporting wildfire survivors with emergency housing, mental health resources, and firefighter assistance through transparent, rapid-response aid.",
      "donationUrl": "https://www.thewildlandfirerecoveryfund.org/#donate",
      "missionCoveragePrioritiesPolicy": "We provide rapid emergency response to wildfire survivors, with 75% of donations going directly to survivors. We proactively respond to fire scenes—survivors don't need to apply.",
      "nonprofitStatus": "501(c)(3)"
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.thewildlandfirerecoveryfund.org/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "About Us",
          "item": "https://www.thewildlandfirerecoveryfund.org/#about"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Donate",
          "item": "https://www.thewildlandfirerecoveryfund.org/#donate"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Stories",
          "item": "https://www.thewildlandfirerecoveryfund.org/#stories"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Grants",
          "item": "https://www.thewildlandfirerecoveryfund.org/#grants"
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Contact",
          "item": "https://www.thewildlandfirerecoveryfund.org/#contact"
        }
      ]
    };

    // FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I donate to The Wildland Fire Recovery Fund?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can donate securely through our website using credit/debit cards or bank transfers. Visit our Donate page to make a tax-deductible contribution. We accept one-time and recurring donations."
          }
        },
        {
          "@type": "Question",
          "name": "What percentage of my donation goes directly to wildfire survivors?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "75% of all donations go directly to wildfire survivors through emergency housing, mental health support, and immediate aid. The remaining 25% covers operational costs to ensure sustainable, effective service delivery."
          }
        },
        {
          "@type": "Question",
          "name": "Is The Wildland Fire Recovery Fund a 501(c)(3) nonprofit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we are a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the fullest extent permitted by law."
          }
        },
        {
          "@type": "Question",
          "name": "How quickly do you respond to wildfire emergencies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our goal is to provide emergency assistance within 48 hours of a wildfire incident. We proactively respond to fire scenes—survivors don't need to apply for help."
          }
        },
        {
          "@type": "Question",
          "name": "Do you only help wildfire survivors or also support firefighters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We support both wildfire survivors and firefighters. Our programs include emergency housing and rebuilding assistance for survivors, as well as mental health services and emergency assistance for firefighters and first responders."
          }
        },
        {
          "@type": "Question",
          "name": "How can I apply for assistance as a wildfire survivor?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You don't need to apply. We proactively respond to wildfire incidents and reach out to affected communities. However, you can also contact us directly through our Contact page if you need immediate assistance."
          }
        }
      ]
    };

    // Create or update script tags
    const updateScriptTag = (id: string, schema: object) => {
      let script = document.getElementById(id);
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    };

    updateScriptTag('org-schema', organizationSchema);
    updateScriptTag('website-schema', websiteSchema);
    updateScriptTag('charity-schema', charitySchema);
    updateScriptTag('breadcrumb-schema', breadcrumbSchema);
    updateScriptTag('faq-schema', faqSchema);

    // Cleanup
    return () => {
      const removeScript = (id: string) => {
        const script = document.getElementById(id);
        if (script) {
          script.remove();
        }
      };
      removeScript('org-schema');
      removeScript('website-schema');
      removeScript('charity-schema');
      removeScript('breadcrumb-schema');
      removeScript('faq-schema');
    };
  }, []);

  return null;
}