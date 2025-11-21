import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-categories.xml`,
      `${baseUrl}/rss.xml`,
    ],
  };
}
