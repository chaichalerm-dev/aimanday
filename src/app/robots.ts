import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Next.js convention route — เข้าถึงได้ที่ /robots.txt โดยอัตโนมัติ (ไม่ต้องสร้างไฟล์ static เอง)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep API routes and user-data detail pages out of search engines
      disallow: ['/api/', '/history/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
