// src/app/ru/dashboard/admin/page.tsx (Server Component)
import React from 'react';
import AdminCharts from '@/components/admin/AdminCharts'; // client component
import { cookies } from 'next/headers';

export default async function AdminDashboardPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/admin/stats`, {
    cache: 'no-store',
  });
  const json = await res.json();

  if (!json?.ok) {
    return <div>Нет данных — доступ запрещён или ошибка.</div>;
  }

  const data = json.data;
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Админ панель</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4">Всего пользователей: {data.totalUsers}</div>
        <div className="card p-4">Активно сегодня: {data.activeUsersToday}</div>
        <div className="card p-4">Заблокировано: {data.blockedUsers}</div>
      </div>

      <div className="mb-6">
        <AdminCharts incomeSeries={data.incomeSeries} daily={data.revenueDay} weekly={data.revenueWeek} monthly={data.revenueMonth} />
      </div>
    </div>
  );
}
