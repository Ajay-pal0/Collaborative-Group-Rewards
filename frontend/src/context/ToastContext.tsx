import React, { createContext, useCallback, useContext, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Req 15.4 — auto-dismiss after 4s; max 3 visible, oldest dismissed first (Req 15.6)
  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextId++;
    setToasts((prev) => {
      const updated = [...prev, { id, message, type }];
      return updated.length > 3 ? updated.slice(updated.length - 3) : updated;
    });
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
