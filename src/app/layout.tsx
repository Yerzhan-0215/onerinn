// src/app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
