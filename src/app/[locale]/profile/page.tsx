// src/app/[locale]/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';

type MeUser = {
  id: string;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Profile');
  const router = useRouter();
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!mounted) return;
        if (!res.ok) {
          router.replace(`${prefix}/login`);
          return;
        }
        const data = await res.json();
        if (!data?.user) {
          router.replace(`${prefix}/login`);
          return;
        }
        setUser(data.user);
      } catch {
        router.replace(`${prefix}/login`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router, prefix]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-56 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">{t('title')}</h1>

        <div className="flex items-center gap-4">
          <Avatar
            name={user.username || user.email || 'User'}
            src={user.avatarUrl ?? undefined}
            size={64}
          />
          <div className="min-w-0">
            <div className="text-lg font-medium truncate">
              {user.username || '—'}
            </div>
            <div className="text-gray-600 text-sm truncate">
              {user.email || '—'}
            </div>
            <div className="text-gray-600 text-sm truncate">
              {user.phone || '—'}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`${prefix}/profile/edit`)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {t('edit')}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
          >
            {t('back')}
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <div>{t('uid')}: {user.id}</div>
          {user.createdAt && <div>{t('createdAt')}: {new Date(user.createdAt).toLocaleString()}</div>}
          {user.updatedAt && <div>{t('updatedAt')}: {new Date(user.updatedAt).toLocaleString()}</div>}
        </div>
      </div>
    </div>
  );
}
