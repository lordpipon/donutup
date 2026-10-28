"use client";

import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";

const TONE_ICON = {
  info: "i-sparkle",
  win: "i-check",
  loss: "i-x",
  gold: "i-coin",
} as const;

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <Icon name={TONE_ICON[toast.tone]} />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
