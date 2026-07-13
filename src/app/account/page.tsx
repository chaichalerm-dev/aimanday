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

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 sm:py-16">
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
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" style={{ transition: 'none' }} />
                {c.badge}
              </span>

              <div className="mt-5 w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-600/20">
                {initial}
              </div>

              <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white truncate">
                {name || email}
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{email}</p>
              {joinedLabel && (
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{c.joinedOn} {joinedLabel}</p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-5" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'profile'}
                onClick={() => setTab('profile')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  tab === 'profile'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  tab === 'password'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
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
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-5 sm:p-6 space-y-4"
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

                {profileError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl">
                    <p className="text-xs text-red-700 dark:text-red-300">{profileError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-slate-500 font-semibold py-3 px-6 rounded-xl text-sm"
                >
                  {savingProfile ? c.saving : c.saveProfile}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleChangePassword}
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-5 sm:p-6 space-y-4"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-slate-500 font-semibold py-3 px-6 rounded-xl text-sm"
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
