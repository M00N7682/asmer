"use client";

import { create } from "zustand";
import { Toast, type ToastType } from "./Toast";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
