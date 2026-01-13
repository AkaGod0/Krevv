import { MetadataRoute } from "next";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.krevv.com";

  let jobs: any[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobs?status=active&limit=10000`,
      { cache: "no-store" }
    );

    const data = await res.json();
    jobs = Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    console.error("❌ Failed to fetch jobs for sitemap:", err);
  }

  const urls = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: new Date(job.updatedAt || job.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...urls,
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map(
    (item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified?.toISOString()}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>
`
  )
  .join("")}
</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    }
  );
}
