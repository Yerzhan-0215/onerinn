'use client';

import { useState } from 'react';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/register', {
        username,
        email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
        phone: emailOrPhone.startsWith('+') ? emailOrPhone : undefined,
        password,
      });
      if (response.status === 200) {
        alert('Успешно зарегистрирован!');
        router.push('/ru/login');
      }
    } catch (error) {
      alert('Ошибка при регистрации');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 overflow-hidden">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-[90%] max-w-md">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5 text-center">
          Регистрация
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Имя пользователя"
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="e-mail или телефон (например +7701...)"
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm"
          >
            Зарегистрироваться
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-xs text-gray-400">или</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          onClick={() => signIn('google')}
          className="w-full border border-gray-300 text-gray-800 py-2 rounded-md text-sm hover:bg-gray-100 transition"
        >
          Войти через Gmail
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          Уже есть аккаунт?{' '}
          <a href="/ru/login" className="text-blue-600 hover:underline">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}
