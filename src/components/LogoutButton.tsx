'use client';

import { signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';

export default function LogoutButton({ className = '' }: { className?: string }) {
  const locale = useLocale();
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `/${locale}` })}
      className={className}
    >
      Выйти
    </button>
  );
}
