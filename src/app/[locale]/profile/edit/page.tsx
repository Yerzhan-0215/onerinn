// src/app/[locale]/profile/edit/page.tsx
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
};

export default function EditProfilePage() {
  const t = useTranslations('Profile');
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setUsername(data.user.username ?? '');
        setPhone(data.user.phone ?? '');
        setAvatarUrl(data.user.avatarUrl ?? '');
      } catch {
        router.replace(`${prefix}/login`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router, prefix]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          phone: phone.trim() || null,
          avatarUrl: avatarUrl.trim() || null
        })
      });

      if (res.ok) {
        router.push(`${prefix}/profile`);
        return;
      }

      const data = await res.json().catch(() => ({} as any));
      const code = data?.code as string | undefined;
      if (code === 'PHONE_EXISTS') setError(t('errors.phoneExists'));
      else if (code === 'EMAIL_EXISTS') setError(t('errors.emailExists'));
      else if (code === 'INVALID_USERNAME') setError(t('errors.invalidUsername'));
      else setError(t('errors.saveFailed'));
    } catch {
      setError(t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <div className="space-y-2 w-full">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-56 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-9 bg-gray-200 rounded" />
          <div className="h-9 bg-gray-200 rounded" />
          <div className="h-9 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-6">
      <form
        onSubmit={handleSave}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">{t('editTitle')}</h1>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Avatar
            name={username || user.email || 'User'}
            src={avatarUrl || undefined}
            size={64}
          />
          <div className="text-sm text-gray-500">
            {t('tips.avatar')}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('labels.username')}</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder={t('placeholders.username')}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('labels.phone')}</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder={t('placeholders.phone')}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('labels.avatarUrl')}</label>
          <input
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder={t('placeholders.avatarUrl')}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? t('buttons.saving') : t('buttons.save')}
          </button>
          <button
            type="button"
            onClick={() => router.push(`${prefix}/profile`)}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
          >
            {t('buttons.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
