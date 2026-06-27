import { getSiteUrl } from "@/lib/site-url";

/** Schema.org JSON-LD for the Illini Sublease homepage (Google name/variant hints). */
export function homePageJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Illini Sublease",
    alternateName: [
      "IlliniSublease",
      "illini sublease",
      "Illini Sublease UIUC",
      "UIUC sublease",
      "UIUC student sublease",
    ],
    url: siteUrl,
    description:
      "Student-to-student sublease marketplace for University of Illinois Urbana-Champaign. Verified @illinois.edu students only.",
    applicationCategory: "HousingApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Sign in with a valid @illinois.edu Google account.",
    provider: {
      "@type": "Organization",
      name: "PushTangle LLC",
      url: siteUrl,
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "University of Illinois Urbana-Champaign students",
    },
  };
}
