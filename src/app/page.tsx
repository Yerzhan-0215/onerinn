'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const savedLocale = localStorage.getItem('preferredLocale') || 'en';
    router.replace(`/${savedLocale}`);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Redirecting to your language page...</p>
    </main>
  );
}
