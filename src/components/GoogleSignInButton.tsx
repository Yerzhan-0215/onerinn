// src/components/GoogleSignInButton.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import GoogleIcon from './GoogleIcon';

export interface GoogleSignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function GoogleSignInButton({
  loading = false,
  onClick,
  className = '',
  disabled,
  ...props
}: GoogleSignInButtonProps) {
  const tAuth = useTranslations('Auth');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={tAuth('signInWithGoogle')}
      className={`w-full bg-white text-gray-800 border border-gray-300 py-2 rounded
                  hover:bg-gray-50 flex items-center justify-center gap-2
                  disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <GoogleIcon className="h-5 w-5 shrink-0" title="Google" />
      <span>{tAuth('signInWithGoogle')}</span>
      {loading && (
        <span className="ml-1 inline-block animate-pulse">…</span>
      )}
    </button>
  );
}
