// src/components/admin/AdminCharts.tsx
'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function AdminCharts({ incomeSeries, daily, weekly, monthly }: any) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Доход — последние 30 дней</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={incomeSeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="p-2 border rounded">
          <div className="text-sm text-gray-500">Доход Сегодня</div>
          <div className="text-xl font-bold">{daily}</div>
        </div>
        <div className="p-2 border rounded">
          <div className="text-sm text-gray-500">Доход Неделя</div>
          <div className="text-xl font-bold">{weekly}</div>
        </div>
        <div className="p-2 border rounded">
          <div className="text-sm text-gray-500">Доход Месяц</div>
          <div className="text-xl font-bold">{monthly}</div>
        </div>
      </div>
    </div>
  );
}
