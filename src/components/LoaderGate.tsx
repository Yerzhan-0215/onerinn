'use client';
import { useEffect, useState } from 'react';
import Splash from './Splash';

export default function LoaderGate({ children, minMs = 1200 }: { children: React.ReactNode; minMs?: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), minMs);
    return () => clearTimeout(t);
  }, [minMs]);
  return ready ? <>{children}</> : <Splash />;
}
