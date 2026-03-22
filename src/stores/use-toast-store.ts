"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ShowToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastStore = {
  toasts: ToastItem[];
  showToast: (input: ShowToastInput) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],
  showToast: ({ title, description, variant = "info" }) => {
    const id = nanoid();

    set((state) => ({
      toasts: [...state.toasts, { id, title, description, variant }].slice(-4)
    }));

    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),
  clearToasts: () => set({ toasts: [] })
}));
