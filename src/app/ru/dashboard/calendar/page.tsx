// src/app/ru/dashboard/calendar/page.tsx
'use client';

export default function CalendarPage() {
  // TODO: 接入你的日历事件 (rentals due, handovers, returns)
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
      <h1 className="mb-3 text-lg font-semibold">Календарь</h1>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
        Событий нет. Подключите аренды и заказы.
      </div>
    </div>
  );
}
