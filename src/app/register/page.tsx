'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PasswordInput } from '@/components/PasswordInput';
import { useLang } from '@/contexts/LanguageContext';

const content = {
  th: {
    title: 'สมัครสมาชิก',
    subtitle: 'สร้างบัญชีเพื่อเริ่มเก็บประวัติการประเมินของคุณเอง',
    nameLabel: 'ชื่อ (ไม่บังคับ)',
    emailLabel: 'อีเมล',
    passwordLabel: 'รหัสผ่าน',
    passwordHint: 'อย่างน้อย 8 ตัวอักษร',
    passwordWeak: 'รหัสผ่านอ่อน',
    passwordMedium: 'รหัสผ่านปานกลาง',
    passwordStrong: 'รหัสผ่านแข็งแรง',
    confirmLabel: 'ยืนยันรหัสผ่าน',
    submit: 'สมัครสมาชิก',
    submitting: 'กำลังสมัครสมาชิก…',
    mismatch: 'รหัสผ่านไม่ตรงกัน',
    genericError: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่',
    haveAccount: 'มีบัญชีอยู่แล้ว?',
    loginLink: 'เข้าสู่ระบบ',
  },
  en: {
    title: 'Sign Up',
    subtitle: 'Create an account to start keeping your own estimation history',
    nameLabel: 'Name (optional)',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    passwordHint: 'At least 8 characters',
    passwordWeak: 'Weak password',
    passwordMedium: 'Medium password',
    passwordStrong: 'Strong password',
    confirmLabel: 'Confirm password',
    submit: 'Sign Up',
    submitting: 'Signing up…',
    mismatch: 'Passwords do not match',
    genericError: 'Registration failed. Please try again.',
    haveAccount: 'Already have an account?',
    loginLink: 'Log in',
  },
};

export default function RegisterPage() {
  const { lang } = useLang();
  const c = content[lang];
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(c.mismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? c.genericError);
        setLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', { email, password, redirect: false });
      if (!signInResult || signInResult.error) {
        // Account created but auto-login failed — send them to the login page instead
        router.push('/login');
        return;
      }
      router.push('/app');
      router.refresh();
    } catch {
      setError(c.genericError);
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

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-5 sm:p-6 space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
              {c.nameLabel}
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700 text-sm text-gray-800 dark:text-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
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
            minLength={8}
            autoComplete="new-password"
            hint={c.passwordHint}
            showStrength
            strengthLabels={{ weak: c.passwordWeak, medium: c.passwordMedium, strong: c.passwordStrong }}
          />
          <PasswordInput
            label={c.confirmLabel}
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={8}
            autoComplete="new-password"
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
          {c.haveAccount}{' '}
          <Link href="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            {c.loginLink}
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
