'use client';

import { useId, useState } from 'react';
import { calculatePasswordStrength, type PasswordStrengthLevel } from '@/lib/passwordStrength';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  showStrength?: boolean;
  strengthLabels?: Record<PasswordStrengthLevel, string>;
}

const BAR_COLOR: Record<PasswordStrengthLevel, string> = {
  weak: 'bg-red-500',
  medium: 'bg-amber-500',
  strong: 'bg-green-500',
};

const TEXT_COLOR: Record<PasswordStrengthLevel, string> = {
  weak: 'text-red-600 dark:text-red-400',
  medium: 'text-amber-600 dark:text-amber-400',
  strong: 'text-green-600 dark:text-green-400',
};

const ACTIVE_SEGMENTS: Record<PasswordStrengthLevel, number> = { weak: 1, medium: 2, strong: 3 };

export function PasswordInput({
  label, value, onChange, autoComplete, required, minLength, hint, showStrength, strengthLabels,
}: PasswordInputProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? calculatePasswordStrength(value) : null;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700 text-sm text-gray-800 dark:text-slate-200 px-3.5 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
        >
          {visible ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {hint && !showStrength && <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{hint}</p>}

      {showStrength && value && strength && strengthLabels && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < ACTIVE_SEGMENTS[strength.level] ? BAR_COLOR[strength.level] : 'bg-gray-200 dark:bg-zinc-600'
                }`}
                style={{ transition: 'none' }}
              />
            ))}
          </div>
          <p className={`mt-1 text-xs font-medium ${TEXT_COLOR[strength.level]}`}>
            {strengthLabels[strength.level]}
          </p>
        </div>
      )}
    </div>
  );
}
