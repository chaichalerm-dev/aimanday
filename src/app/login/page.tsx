'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PasswordInput } from '@/components/PasswordInput';
import { useLang } from '@/contexts/LanguageContext';

// Seeded test account — lets reviewers try the app without registering
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'Demo12345';

const content = {
  th: {
    title: 'เข้าสู่ระบบ',
    subtitle: 'ดูผลประเมินที่เคยบันทึกไว้ หรือกลับมาทำงานเดิมต่อ',
    emailLabel: 'อีเมล',
    passwordLabel: 'รหัสผ่าน',
    submit: 'เข้าสู่ระบบ',
    submitting: 'กำลังเข้าสู่ระบบ…',
    error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    noAccount: 'ยังไม่มีบัญชี?',
    registerLink: 'สมัครสมาชิก',
    testAccountTitle: 'บัญชีสำหรับทดสอบ',
    testAccountFill: 'ใส่ข้อมูลนี้ให้',
  },
  en: {
    title: 'Log In',
    subtitle: 'View your saved estimates or continue earlier work',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submit: 'Log In',
    submitting: 'Logging in…',
    error: 'Invalid email or password',
    noAccount: "Don't have an account?",
    registerLink: 'Sign up',
    testAccountTitle: 'Test Account',
    testAccountFill: 'Use this account',
  },
};

function LoginForm() {
  const { lang } = useLang();
  const c = content[lang];
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (!result || result.error) {
        setError(c.error);
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(c.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12 sm:py-16">
        <div className="mb-7 border-b border-[var(--line)] pb-5">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[var(--ink)]">{c.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{c.subtitle}</p>
        </div>

        {/* Seeded test account — reviewers can try the app without registering */}
        <div className="mb-5 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-[var(--ink)]">{c.testAccountTitle}</span>
          </div>
          <div className="text-xs text-[var(--muted)] space-y-0.5 font-mono">
            <p>{DEMO_EMAIL}</p>
            <p>{DEMO_PASSWORD}</p>
          </div>
          <button
            type="button"
            onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}
            className="mt-2.5 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            {c.testAccountFill}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ui-panel p-5 sm:p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              {c.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="ui-field px-3.5 py-2.5 text-sm"
            />
          </div>
          <PasswordInput
            label={c.passwordLabel}
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl">
              <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ui-button-primary w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[var(--paper-muted)] disabled:text-[var(--muted)]"
          >
            {loading ? c.submitting : c.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          {c.noAccount}{' '}
          <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
            {c.registerLink}
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
