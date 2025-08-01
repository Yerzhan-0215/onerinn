'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email: emailOrPhone,
      password,
    });

    if (result?.ok) {
      router.push('/ru'); // 登录成功后跳转首页
    } else {
      alert('Неверные данные для входа');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 overflow-hidden">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Вход</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="e-mail или телефон"
            className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Войти
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-sm text-gray-500">или</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          onClick={() => signIn('google')}
          className="w-full border border-gray-400 text-gray-800 py-2 rounded-lg text-sm hover:bg-gray-100"
        >
          Войти через Gmail
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Нет аккаунта?{' '}
          <a href="/ru/register" className="text-blue-600 hover:underline">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}
