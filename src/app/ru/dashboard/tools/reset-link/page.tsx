'use client';

import { useState, FormEvent } from 'react';

export default function AdminResetLinkPage() {
  const [identity, setIdentity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!identity.trim()) {
      setError('Введите e-mail или номер телефона');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: identity.trim(),
          locale: 'ru',
        }),
      });

      if (!res.ok) throw new Error('Не удалось отправить ссылку');
      setMessage('✅ Ссылка для сброса отправлена (если аккаунт существует)');
      setIdentity('');
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full grid place-items-center bg-gray-50 px-3 py-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[22rem] rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-5 shadow-md shadow-gray-200"
      >
        <h1 className="mb-3 text-center text-lg font-semibold">
          Админ: отправить ссылку сброса пароля
        </h1>

        <input
          type="text"
          placeholder="E-mail или телефон +77..."
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        {message && (
          <p className="mt-2 text-xs text-green-600 text-center">{message}</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-3 h-9 w-full rounded-lg bg-blue-600 text-[13px] text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Отправляем…' : 'Отправить ссылку для сброса'}
        </button>
      </form>
    </div>
  );
}
