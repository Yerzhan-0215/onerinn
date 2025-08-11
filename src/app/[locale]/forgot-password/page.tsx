'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import AuthCard from '@/components/AuthCard';

export default function ForgotPasswordPage() {
  const t = useTranslations('Forgot');
  const tErr = useTranslations('Errors.Auth');
  const tAuth = useTranslations('Auth');
  const locale = useLocale();

  const [identity, setIdentity] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const signInBtnRef = useRef<HTMLAnchorElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (done) signInBtnRef.current?.focus();
    else inputRef.current?.focus();
  }, [done]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr(null);

    if (!identity.trim()) {
      setErr(tErr('requiredFields'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, locale })
      });
      await res.json().catch(() => ({}));
      setDone(true);
      setIdentity('');
    } catch {
      setErr(tErr('unknownError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      {done ? (
        <>
          <div
            className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
            role="status"
            aria-live="polite"
          >
            {t('success')}
          </div>

          <Link
            href={`/${locale}/login`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ref={signInBtnRef}
          >
            {tAuth('signIn')}
          </Link>
        </>
      ) : (
        <>
          <h1 className="mb-4 text-center text-xl font-semibold">{t('title')}</h1>

          {err && (
            <div
              className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
              aria-live="assertive"
            >
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3" noValidate>
            <input
              ref={inputRef}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder={t('placeholder')}
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              autoComplete="email"
              inputMode="email"
              enterKeyHint="send"
              aria-label={t('placeholder')}
              required
            />

            <button
              type="submit"
              disabled={loading || !identity.trim()}
              className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {loading ? tAuth('sending') : t('button')}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-gray-500">{t('helper')}</p>
        </>
      )}
    </AuthCard>
  );
}
