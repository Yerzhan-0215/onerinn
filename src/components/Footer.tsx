// src/components/Footer.tsx
'use client';

export default function Footer() {
  return (
    <footer className="text-center text-gray-500 text-sm py-6">
      © {new Date().getFullYear()} Onerinn. All rights reserved.
    </footer>
  );
}
