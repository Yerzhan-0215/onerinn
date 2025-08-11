// src/components/AuthCard.tsx
'use client';

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100svh-160px)] flex items-center justify-center px-3">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
