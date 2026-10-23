import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/lib/site";
import { LANGUAGE_OPTIONS, DEFAULT_LANG } from "@/app/lib/i18n";

// Only the default "tulevat" view is listed: "menneet" is the same route
// with a query override, not a distinct page worth a separate sitemap entry.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LANGUAGE_OPTIONS.filter((l) => l.code !== DEFAULT_LANG).map((l) => [l.code, `${SITE_URL}/?lang=${l.code}`])
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/tietosuoja`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
