'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PasswordInput } from '@/components/PasswordInput';
import { useLang } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

const content = {
  th: {
    badge: 'บัญชีของฉัน',
    joinedOn: 'เข้าร่วมเมื่อ',
    tabProfile: 'ข้อมูลส่วนตัว',
    tabPassword: 'รหัสผ่าน',
    nameLabel: 'ชื่อ',
    namePlaceholder: 'ยังไม่ระบุชื่อ',
    emailLabel: 'อีเมล',
    saveProfile: 'บันทึกการเปลี่ยนแปลง',
    saving: 'กำลังบันทึก…',
    profileSuccess: 'บันทึกข้อมูลบัญชีแล้ว',
    profileError: 'บันทึกไม่สำเร็จ กรุณาลองใหม่',
    currentPasswordLabel: 'รหัสผ่านปัจจุบัน',
    newPasswordLabel: 'รหัสผ่านใหม่',
    newPasswordHint: 'อย่างน้อย 8 ตัวอักษร',
    passwordWeak: 'รหัสผ่านอ่อน',
    passwordMedium: 'รหัสผ่านปานกลาง',
    passwordStrong: 'รหัสผ่านแข็งแรง',
    confirmPasswordLabel: 'ยืนยันรหัสผ่านใหม่',
    savePassword: 'เปลี่ยนรหัสผ่าน',
    changingPassword: 'กำลังเปลี่ยนรหัสผ่าน…',
    passwordSuccess: 'เปลี่ยนรหัสผ่านแล้ว',
    passwordMismatch: 'รหัสผ่านใหม่ไม่ตรงกัน',
    passwordError: 'เปลี่ยนรหัสผ่านไม่สำเร็จ',
    loading: 'กำลังโหลด…',
  },
  en: {
    badge: 'My Account',
    joinedOn: 'Joined',
    tabProfile: 'Profile',
    tabPassword: 'Password',
    nameLabel: 'Name',
    namePlaceholder: 'No name set',
    emailLabel: 'Email',
    saveProfile: 'Save Changes',
    saving: 'Saving…',
    profileSuccess: 'Account details updated',
    profileError: 'Save failed. Please try again.',
    currentPasswordLabel: 'Current password',
    newPasswordLabel: 'New password',
    newPasswordHint: 'At least 8 characters',
    passwordWeak: 'Weak password',
    passwordMedium: 'Medium password',
    passwordStrong: 'Strong password',
    confirmPasswordLabel: 'Confirm new password',
    savePassword: 'Change Password',
    changingPassword: 'Changing password…',
    passwordSuccess: 'Password changed',
    passwordMismatch: 'New passwords do not match',
    passwordError: 'Password change failed',
    loading: 'Loading…',
  },
};

type Tab = 'profile' | 'password';

// หน้าจัดการบัญชี (/account) — แท็บโปรไฟล์ (ชื่อ/อีเมล) และแท็บเปลี่ยนรหัสผ่าน แยกฟอร์ม/state กัน
export default function AccountPage() {
  const { lang } = useLang();
  const c = content[lang];
  const { update: updateSession } = useSession();
  const { showToast } = useToast();

  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/account')
      .then(r => r.json())
      .then((data: { name: string | null; email: string; createdAt: string }) => {
        setName(data.name ?? '');
        setEmail(data.email);
        setCreatedAt(data.createdAt);
      })
      .finally(() => setLoading(false));
  }, []);

  // บันทึกชื่อ/อีเมลผ่าน PATCH /api/account แล้วเรียก updateSession() ให้ token/Header อัปเดตตาม
  // ทันที (ไม่งั้นต้อง login ใหม่ header ถึงจะเห็นอีเมลใหม่ — ดู jwt callback ใน lib/auth.ts)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSavingProfile(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error ?? c.profileError);
        return;
      }
      await updateSession({ name: data.name, email: data.email });
      showToast(c.profileSuccess);
    } catch {
      setProfileError(c.profileError);
    } finally {
      setSavingProfile(false);
    }
  };

  // เปลี่ยนรหัสผ่านผ่าน PATCH /api/account/password (ต้องส่ง currentPassword ไปให้ server ตรวจก่อนเสมอ)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(c.passwordMismatch);
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? c.passwordError);
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(c.passwordSuccess);
    } catch {
      setPasswordError(c.passwordError);
    } finally {
      setSavingPassword(false);
    }
  };

  const initial = (name || email || '?').charAt(0).toUpperCase();
  const joinedLabel = createdAt
    ? new Date(createdAt).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400 dark:text-slate-500">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ transition: 'none' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">{c.loading}</span>
          </div>
        ) : (
          <>
            {/* Profile hero */}
            <div className="mb-8 border-b border-[var(--line)] pb-7 text-left">
              <p className="eyebrow">{c.badge}</p>

              <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-[4px] bg-[var(--ink)] text-xl font-bold text-[var(--page)]">
                {initial}
              </div>

              <h1 className="mt-4 truncate text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
                {name || email}
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{email}</p>
              {joinedLabel && (
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{c.joinedOn} {joinedLabel}</p>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-5 flex items-center border-b border-[var(--line)]" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'profile'}
                onClick={() => setTab('profile')}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium ${
                  tab === 'profile'
                    ? 'border-[var(--accent)] text-[var(--ink)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {c.tabProfile}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'password'}
                onClick={() => setTab('password')}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium ${
                  tab === 'password'
                    ? 'border-[var(--accent)] text-[var(--ink)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                {c.tabPassword}
              </button>
            </div>

            {tab === 'profile' ? (
              <form
                onSubmit={handleSaveProfile}
                className="ui-panel p-5 sm:p-6 space-y-4"
              >
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                    {c.nameLabel}
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder={c.namePlaceholder}
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="ui-field px-3.5 py-2.5 text-sm"
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
                    className="ui-field px-3.5 py-2.5 text-sm"
                  />
                </div>

                {profileError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl">
                    <p className="text-xs text-red-700 dark:text-red-300">{profileError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="ui-button-primary w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[var(--paper-muted)] disabled:text-[var(--muted)]"
                >
                  {savingProfile ? c.saving : c.saveProfile}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleChangePassword}
                className="ui-panel p-5 sm:p-6 space-y-4"
              >
                <PasswordInput
                  label={c.currentPasswordLabel}
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  required
                  autoComplete="current-password"
                />
                <PasswordInput
                  label={c.newPasswordLabel}
                  value={newPassword}
                  onChange={setNewPassword}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  hint={c.newPasswordHint}
                  showStrength
                  strengthLabels={{ weak: c.passwordWeak, medium: c.passwordMedium, strong: c.passwordStrong }}
                />
                <PasswordInput
                  label={c.confirmPasswordLabel}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />

                {passwordError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl">
                    <p className="text-xs text-red-700 dark:text-red-300">{passwordError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="ui-button-primary w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[var(--paper-muted)] disabled:text-[var(--muted)]"
                >
                  {savingPassword ? c.changingPassword : c.savePassword}
                </button>
              </form>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
