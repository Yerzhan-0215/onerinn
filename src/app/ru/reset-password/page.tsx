'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Токен отсутствует в ссылке');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Пароль успешно обновлён! Перенаправление на страницу входа...');
        setTimeout(() => {
          router.push('/ru/login');
        }, 3000); // 3 秒后跳转
      } else {
        setError(data.error || 'Ошибка сброса пароля');
      }
    } catch (err) {
      console.error(err);
      setError('Произошла ошибка сервера');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded shadow space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-900">Сброс пароля</h2>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Новый пароль"
            className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Повторите пароль"
            className="w-full px-4 py-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Сбросить пароль
          </button>
        </form>
      </div>
    </div>
  );
}
