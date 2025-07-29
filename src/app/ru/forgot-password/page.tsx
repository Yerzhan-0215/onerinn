'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Ссылка для сброса пароля отправлена на вашу почту.');
        setError('');
      } else {
        setError(data.message || 'Ошибка при отправке письма.');
        setMessage('');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу.');
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded shadow space-y-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Забыли пароль?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Введите вашу почту"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Отправить ссылку
          </button>
        </form>
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
