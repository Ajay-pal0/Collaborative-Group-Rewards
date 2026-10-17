import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl border border-[#e7e5e4] shadow-[0_20px_50px_rgba(12,10,9,0.14)] w-full ${maxWidth} max-h-[88vh] flex flex-col relative transition-all duration-200 overflow-hidden my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e7e5e4] shrink-0">
          <h2 className="text-lg font-bold text-[#0c0a09] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#78716c] hover:text-[#0c0a09] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 min-h-0 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
