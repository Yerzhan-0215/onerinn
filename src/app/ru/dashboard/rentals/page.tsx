// src/app/ru/dashboard/rentals/page.tsx
'use client';

import { useState } from 'react';

export default function RentalsPage() {
  const [status, setStatus] = useState<'active' | 'due' | 'overdue' | 'done'>('active');

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Аренды</h1>

      <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
        {(['active', 'due', 'overdue', 'done'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 text-sm rounded-full ${status === s ? 'bg-gray-100 font-semibold' : ''}`}
          >
            {s === 'active' ? 'В аренде' : s === 'due' ? 'К возврату' : s === 'overdue' ? 'Просрочены' : 'Завершённые'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
        {/* TODO: 租赁列表（按 status 过滤） */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
          Нет аренд.
        </div>
      </div>
    </div>
  );
}
