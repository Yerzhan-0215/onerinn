'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function withLoading(WrappedComponent: React.ComponentType) {
  return function WithLoadingComponent() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timeout = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timeout);
    }, []);

    if (isLoading) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-white">
          <Image
            src="/logo.png"
            alt="Onerinn Logo"
            width={120}
            height={120}
            className="opacity-0 animate-fade-in-scale"
          />
          <style>{`
            @keyframes fadeInScale {
              0% {
                opacity: 0;
                transform: scale(0.6);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }

            .animate-fade-in-scale {
              animation: fadeInScale 0.8s ease-out forwards;
            }
          `}</style>
        </main>
      );
    }

    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* 背景 logo */}
        <img
  src="/logo.png"
  alt="Background Logo"
  className="absolute w-[33vw] h-auto opacity-5 object-contain top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  style={{ zIndex: 0 }}
/>
        />
        <div className="relative z-10">
          <WrappedComponent />
        </div>
      </div>
    );
  };
}
