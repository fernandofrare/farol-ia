"use client";

import { useEffect } from "react";

// Registra o service worker para habilitar a instalacao do app (PWA).
export function PWARegister() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
