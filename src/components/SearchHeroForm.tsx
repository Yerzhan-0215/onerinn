// src/components/SearchHeroForm.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchHeroForm() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/ru/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-3xl items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-md"
    >
      {/* 左侧放大镜图标 */}
      <button
        type="submit"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl"
      >
        🔍
      </button>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск: электронные устройства или произведения"
        className="flex-1 bg-transparent text-sm md:text-base outline-none"
      />

      {/* 右侧麦克风按钮，只是展示，占位用 */}
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl"
      >
        🎤
      </button>
    </form>
  );
}
