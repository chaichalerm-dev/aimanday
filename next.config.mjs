const isDev = process.env.NODE_ENV === 'development';

// Content-Security-Policy
// - script-src ต้องมี 'unsafe-inline' เพราะมี inline theme script ใน layout.tsx
//   และ Next.js เองก็ inject inline script ตอน hydration (ถ้าจะเข้มกว่านี้ต้องย้ายไป nonce ผ่าน middleware)
// - 'unsafe-eval' + ws: จำเป็นเฉพาะ dev (webpack HMR)
// - style-src/font-src allow Google Fonts เพราะหน้าต่าง print (window.open + document.write
//   ใน lib/print.ts) สืบทอด CSP จากหน้าแม่และโหลดฟอนต์ Sarabun จาก CDN
// - media-src blob: สำหรับ AudioPreview (URL.createObjectURL)
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // Vercel ใส่ HSTS ให้อยู่แล้ว แต่ประกาศเองให้ชัด (และได้ค่า preload)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
