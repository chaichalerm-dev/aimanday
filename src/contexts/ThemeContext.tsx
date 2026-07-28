'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

// Read the class the inline script already set — avoids flash + incorrect initial state
// อ่านค่า theme เริ่มต้นจาก class บน <html> ที่ inline script ใน layout.tsx เซ็ตไว้ก่อน React ทำงาน
// (ไม่อ่านจาก localStorage ตรง ๆ ในนี้ เพราะ DOM class คือ source of truth ที่กันจอกะพริบไปแล้ว)
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// Provider ครอบทั้งแอป — ให้ทุกหน้าเข้าถึง theme ปัจจุบัน + ฟังก์ชันสลับผ่าน useTheme()
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme: () => setTheme(t => (t === 'light' ? 'dark' : 'light')) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
