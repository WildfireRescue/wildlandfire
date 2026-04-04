import { useEffect } from 'react';

export function StructuredData() {
  useEffect(() => {
    // Single authoritative organization schema (NonprofitOrganization)
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "NonprofitOrganization",
      "@id": "https://www.thewildlandfirerecoveryfund.org/#organization",
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
      "donationUrl": "https://www.thewildlandfirerecoveryfund.org/donate",
      "missionCoveragePrioritiesPolicy": "We provide rapid emergency response to wildfire survivors, with 75% of donations going directly to survivors. We proactively respond to fire scenes so survivors don't need to apply.",
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
      "accreditedBy": [
        {
          "@type": "Organization",
          "name": "IRS",
          "url": "https://www.irs.gov"
        }
      ]
    };

    // WebSite schema for sitelinks searchbox eligibility
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://www.thewildlandfirerecoveryfund.org/#website",
      "name": "The Wildland Fire Recovery Fund",
      "url": "https://www.thewildlandfirerecoveryfund.org",
      "publisher": {
        "@id": "https://www.thewildlandfirerecoveryfund.org/#organization"
      }
    };

    const updateScriptTag = (id: string, schema: object) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    };

    updateScriptTag('org-structured-data', organizationSchema);
    updateScriptTag('website-structured-data', websiteSchema);

    return () => {
      ['org-structured-data', 'website-structured-data'].forEach(id => {
        const script = document.getElementById(id);
        if (script) script.remove();
      });
    };
  }, []);

  return null;
}