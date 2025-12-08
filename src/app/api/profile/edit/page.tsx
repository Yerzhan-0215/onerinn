'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; phone?: string; avatarUrl?: string } | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 获取当前用户信息
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setEmail(data.user.email || '');
          setPhone(data.user.phone || '');
          setPreview(data.user.avatarUrl || null);
        }
      } catch (err) {
        console.error('Ошибка при получении пользователя:', err);
      }
    }
    fetchUser();
  }, []);

  // 选择头像后预览
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 提交表单
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('phone', phone);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/profile');
      } else {
        console.error('Не удалось обновить профиль');
      }
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
    }
  };

  if (!user) {
    return (
      <div className="p-10 text-center text-gray-600">
        <h1 className="text-2xl font-semibold">Вы не вошли в систему.</h1>
        <p>Пожалуйста, войдите, чтобы редактировать ваш профиль.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">✏️ Редактировать профиль</h1>

      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {/* 上传头像 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Загрузить аватар
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {preview && (
            <img
              src={preview}
              alt="avatar preview"
              className="mt-4 w-24 h-24 rounded-full object-cover border"
            />
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Электронная почта</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}