"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className="flex items-center gap-3 rounded-lg border border-galaxy-gold/30 bg-galaxy-card px-5 py-3 shadow-glow">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <p className="text-sm font-medium text-white">{message}</p>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };

  const hideToast = () => {
    setToast({ show: false, message: "" });
  };

  return { toast, showToast, hideToast };
}
