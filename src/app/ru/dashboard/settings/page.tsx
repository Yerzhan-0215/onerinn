// src/app/ru/dashboard/settings/page.tsx
'use client';

import { useState, FormEvent } from 'react';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [policy, setPolicy] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: 保存设置到后端
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
      <h1 className="mb-3 text-lg font-semibold">Настройки магазина</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">Название магазина</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Мой магазин"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">Политика (возврат/аренда)</label>
          <textarea
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Опишите условия возврата и аренды..."
          />
        </div>

        <button className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700">
          Сохранить
        </button>
      </form>
    </div>
  );
}
