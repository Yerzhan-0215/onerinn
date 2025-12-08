// src/components/RouteFlagger.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteFlagger() {
  const pathname = usePathname() || '';

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.getAttribute('data-route') || '';
    html.setAttribute('data-route', pathname);
    return () => {
      // 离开页面时还原
      html.setAttribute('data-route', prev);
    };
  }, [pathname]);

  return null;
}
