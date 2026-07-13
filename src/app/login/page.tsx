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
    subtitle: 'เข้าสู่ระบบเพื่อดูประวัติการประเมินของคุณ',
    emailLabel: 'อีเมล',
    passwordLabel: 'รหัสผ่าน',
    submit: 'เข้าสู่ระบบ',
    submitting: 'กำลังเข้าสู่ระบบ…',
    error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    noAccount: 'ยังไม่มีบัญชี?',
    registerLink: 'สมัครสมาชิก',
    testAccountTitle: 'บัญชีสำหรับทดสอบ',
    testAccountFill: 'กรอกให้อัตโนมัติ',
  },
  en: {
    title: 'Log In',
    subtitle: 'Log in to see your own estimation history',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submit: 'Log In',
    submitting: 'Logging in…',
    error: 'Invalid email or password',
    noAccount: "Don't have an account?",
    registerLink: 'Sign up',
    testAccountTitle: 'Test Account',
    testAccountFill: 'Autofill',
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

      <main className="flex-1 max-w-sm w-full mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{c.title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{c.subtitle}</p>
        </div>

        {/* Seeded test account — reviewers can try the app without registering */}
        <div className="mb-5 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{c.testAccountTitle}</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400 space-y-0.5 font-mono">
            <p>{DEMO_EMAIL}</p>
            <p>{DEMO_PASSWORD}</p>
          </div>
          <button
            type="button"
            onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}
            className="mt-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {c.testAccountFill}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-5 sm:p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
              {c.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700 text-sm text-gray-800 dark:text-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-slate-500 font-semibold py-3 px-6 rounded-xl text-sm"
          >
            {loading ? c.submitting : c.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-slate-400">
          {c.noAccount}{' '}
          <Link href="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
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
