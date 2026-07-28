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
    subtitle: 'สร้างบัญชีเพื่อเก็บผลประเมินไว้ดูหรือแก้ไขภายหลัง',
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
    subtitle: 'Create an account to save estimates and return to them later',
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

// หน้าสมัครสมาชิก — สมัครผ่าน /api/auth/register แล้ว auto sign-in ต่อทันที (ไม่ต้อง login ซ้ำ)
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

  // validate รหัสผ่านตรงกันฝั่ง client ก่อน แล้วค่อยสมัครผ่าน API → สมัครสำเร็จแล้ว sign-in ต่อให้อัตโนมัติ
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

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12 sm:py-16">
        <div className="mb-7 border-b border-[var(--line)] pb-5">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[var(--ink)]">{c.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{c.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ui-panel p-5 sm:p-6 space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              {c.nameLabel}
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="ui-field px-3.5 py-2.5 text-sm"
            />
          </div>
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
            className="ui-button-primary w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[var(--paper-muted)] disabled:text-[var(--muted)]"
          >
            {loading ? c.submitting : c.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          {c.haveAccount}{' '}
          <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
            {c.loginLink}
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
