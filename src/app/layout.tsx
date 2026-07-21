import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthProvider';
import { BottomNav, MobileNavSpacer } from '@/components/BottomNav';

// Prompt keeps Thai and Latin metrics consistent across reports and forms.
const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-prompt',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const description =
  'ระบบ AI ช่วยประเมิน Manday จากไฟล์เสียง Requirement — ถอดเสียงเป็นข้อความ ' +
  'แล้ววิเคราะห์เป็น Scope of Work (SOW) พร้อมประมาณการวันทำงานแยกรายโมดูล. ' +
  'AI-powered manday estimator: turn audio requirements into a scoped, estimated SOW.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI Manday Estimator — ประเมิน Manday จากไฟล์เสียงด้วย AI',
    template: '%s · AI Manday Estimator',
  },
  description,
  applicationName: 'AI Manday Estimator',
  keywords: [
    'manday estimator', 'ประเมิน manday', 'AI estimation', 'speech to text',
    'scope of work', 'SOW', 'project estimation', 'ประเมินงานโปรเจกต์',
    'Whisper', 'requirement analysis',
  ],
  authors: [{ name: 'AI Manday Estimator' }],
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'AI Manday Estimator',
    title: 'AI Manday Estimator — ประเมิน Manday จากไฟล์เสียงด้วย AI',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Manday Estimator',
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Set by src/middleware.ts on every request — required so this inline script is
  // allowed to run under the nonce-based CSP (script-src has no 'unsafe-inline').
  // Reading headers() here opts the whole app out of static rendering, since the
  // nonce must be fresh per request.
  const nonce = headers().get('x-nonce') ?? undefined;

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to prevent flash */}
        {/* suppressHydrationWarning: React deliberately omits `nonce` from its SSR
            diff (so it can't be scraped from a saved copy of the HTML) — the raw
            response still has the real value and the browser's CSP check reads
            that, so this only silences a cosmetic, functionally-inert warning. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Default to LIGHT mode — only go dark if the user explicitly chose it before.
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${prompt.variable} font-sans min-h-screen antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <MobileNavSpacer>{children}</MobileNavSpacer>
                <BottomNav />
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
