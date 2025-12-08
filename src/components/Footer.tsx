// src/components/Footer.tsx
'use client';

import { useEffect, useRef } from 'react';

type Props = React.HTMLAttributes<HTMLElement>;

export default function Footer({ className = '', ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateFooterVar = () => {
      const h = ref.current?.offsetHeight;
      if (h) document.documentElement.style.setProperty('--site-footer-h', `${h}px`);
    };
    updateFooterVar();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateFooterVar) : null;
    if (ro && ref.current) ro.observe(ref.current);
    window.addEventListener('resize', updateFooterVar);
    return () => {
      window.removeEventListener('resize', updateFooterVar);
      ro?.disconnect();
    };
  }, []);

  return (
    <footer
      ref={ref}
      className={`bg-white text-center text-sm text-gray-500 py-4 ${className}`}
      {...rest}
    >
      © {new Date().getFullYear()} Onerinn. All rights reserved.
    </footer>
  );
}
