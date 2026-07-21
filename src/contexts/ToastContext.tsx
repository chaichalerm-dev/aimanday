'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

// --- Individual toast ---
function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Enter
    const enter = setTimeout(() => setVisible(true), 16);
    // Begin exit before removal
    const exit = setTimeout(() => setVisible(false), 2600);
    return () => { clearTimeout(enter); clearTimeout(exit); };
  }, []);

  const cfg: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-gray-900 dark:bg-gray-800 border-gray-700 dark:border-gray-600',
      icon: (
        <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ),
    },
    error: {
      bg: 'bg-gray-900 dark:bg-gray-800 border-gray-700 dark:border-gray-600',
      icon: (
        <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      ),
    },
    info: {
      bg: 'bg-gray-900 dark:bg-gray-800 border-gray-700 dark:border-gray-600',
      icon: (
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-600">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
          </svg>
        </span>
      ),
    },
  };

  const { bg, icon } = cfg[toast.type];

  return (
    <div
      onClick={() => onRemove(toast.id)}
      className={`flex cursor-pointer select-none items-center gap-3 rounded-[6px] border px-4 py-3 shadow-lg ${bg}`}
      style={{
        transition: 'transform 300ms ease, opacity 300ms ease',
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 1rem))',
        opacity: visible ? 1 : 0,
      }}
    >
      {icon}
      <span className="text-sm font-medium text-white">{toast.message}</span>
    </div>
  );
}

// --- Provider (includes container) ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none w-72 sm:w-80">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
