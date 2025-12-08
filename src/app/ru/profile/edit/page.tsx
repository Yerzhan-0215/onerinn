// src/app/ru/profile/edit/page.tsx
'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';

type MeUser = {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
  name?: string | null; // ✅ 新增：预留 name 字段（不影响现有逻辑）
  // ✅ 新增 4 个联系字段（可选）
  contactPhone?: string | null;
  contactWhatsApp?: string | null;
  contactTelegram?: string | null;
  contactNote?: string | null;
  // ✅ 新增：是否对买家显示我的姓名/用户名
  showName?: boolean | null;
};

export default function ProfileEditPage() {
  const [me, setMe] = useState<MeUser | null>(null);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  // ✅ 联系方式字段
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsApp, setContactWhatsApp] = useState('');
  const [contactTelegram, setContactTelegram] = useState('');
  const [contactNote, setContactNote] = useState('');
  // ✅ “显示我的姓名” 开关
  const [showName, setShowName] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // 读取当前用户信息，填充表单
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!alive) return;
        if (res.ok) {
          const data = (await res.json()) as { user?: MeUser | null };
          const user = data?.user ?? null;
          setMe(user);
          setUsername(user?.username || '');
          setPhone(user?.phone || '');
          setAvatarUrl(user?.avatarUrl || '');

          // ✅ 从 /api/me 中填充联系字段（如果有）
          setContactPhone(user?.contactPhone || '');
          setContactWhatsApp(user?.contactWhatsApp || '');
          setContactTelegram(user?.contactTelegram || '');
          setContactNote(user?.contactNote || '');

          // ✅ 从 /api/me 中填充 showName（默认 false）
          setShowName(!!user?.showName);
        }
      } catch {
        /* 忽略 */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const initial = useMemo(() => {
    const src = username || me?.username || me?.email || '';
    const ch = src.trim().charAt(0);
    return ch ? ch.toUpperCase() : 'U';
  }, [username, me]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    setOk(false);
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          phone,
          avatarUrl,
          contactPhone,
          contactWhatsApp,
          contactTelegram,
          contactNote,
          // ✅ 一并提交 showName
          showName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? 'Не удалось сохранить профиль');
      }
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || 'Ошибка сохранения профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 高度 = 视窗高 - Navbar - Footer，在这块区域内垂直/水平居中
    <div className="min-h-[calc(100dvh-var(--site-header-h,64px)-var(--site-footer-h,56px))] flex items-center justify-center px-3">
      {/* 更紧凑的卡片（灰色细边 + 轻阴影） */}
      <div className="w-full max-w-[28rem] rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
        {/* ✅ 标题样式对齐 Произведения 的 SectionHeader */}
        <h1 className="mb-4 text-base md:text-lg font-semibold text-gray-800 tracking-[0.02em]">
          Редактировать профиль
        </h1>

        {/* 顶部头像 + 提示 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-700">
            {initial}
          </div>
          <p className="text-sm text-gray-600">
            Сейчас можно вставить ссылку на изображение (URL). Позже добавим загрузку.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-800">
              Имя пользователя
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-800">
              Телефон
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="+7701..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="avatarUrl" className="mb-1 block text-sm font-medium text-gray-800">
              Ссылка на аватар
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* ✅ 新增：卖家公开联系方式的小 section */}
          <section className="mt-4 rounded-lg border border-gray-200 p-3">
            <h2 className="mb-2 text-sm font-semibold">
              Контакты для покупателей (будут видны на объявлениях)
            </h2>

            {/* ✅ “显示我的姓名” 开关 */}
            <div className="mb-3 flex items-center gap-2">
              <input
                id="showName"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={showName}
                onChange={(e) => setShowName(e.target.checked)}
              />
              <label
                htmlFor="showName"
                className="text-xs text-gray-700"
              >
                Показывать моё имя покупателям рядом с объявлениями
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Телефон / WhatsApp (публично)
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="+7 701 123 45 67"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  WhatsApp (номер или ссылка)
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="77011234567 или https://wa.me/77011234567"
                  value={contactWhatsApp}
                  onChange={(e) => setContactWhatsApp(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Telegram @username
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="@onerinn_seller"
                  value={contactTelegram}
                  onChange={(e) => setContactTelegram(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Примечание
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Например: предпочитаю писать в WhatsApp"
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                />
              </div>
            </div>
          </section>

          {err && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {err}
            </div>
          )}
          {ok && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
              Профиль сохранён.
            </div>
          )}

          <div className="mt-2 flex items-center gap-3">
            {/* ✅ 使用统一按钮系统：主按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md"
            >
              {loading ? 'Сохранение…' : 'Сохранить'}
            </button>

            {/* ✅ 使用统一按钮系统：次级按钮 */}
            <Link
              href="/ru/profile"
              className="btn btn-secondary btn-md"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
