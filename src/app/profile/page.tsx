
'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; phone?: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Ошибка при получении пользователя:', err);
      }
    }
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="p-10 text-center text-gray-600">
        <h1 className="text-2xl font-semibold">Вы не вошли в систему.</h1>
        <p>Пожалуйста, войдите, чтобы просмотреть ваш профиль.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">👤 Профиль пользователя</h1>

      <div className="bg-white shadow-md rounded-md p-6 space-y-4 border">
        <div>
          <p className="text-sm text-gray-500">Электронная почта:</p>
          <p className="text-lg">{user.email || '—'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Номер телефона:</p>
          <p className="text-lg">{user.phone || '—'}</p>
        </div>
      </div>

      <div className="mt-10">
        <button
          onClick={async () => {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}