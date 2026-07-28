import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Next.js convention route — เข้าถึงได้ที่ /sitemap.xml โดยอัตโนมัติ
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Only public, non-user-specific pages
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
