'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const GA_MEASUREMENT_ID = 'G-GXCSFJLNXR';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function GoogleAnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname ?? window.location.pathname,
    });
  }, [pathname]);

  return null;
}
