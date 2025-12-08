// src/app/ru/admin/dashboard/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin } from '@/lib/adminSession';

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/ru/admin/login');
  }

  return (
    <div className="min-h-[80vh] px-4 py-6">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Панель администратора
          </h1>
          <p className="text-sm text-gray-600">
            Управляйте пользователями, объявлениями и заказами платформы Onerinn.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm">
          Вы вошли как:&nbsp;
          <span className="font-semibold">{admin.username}</span>&nbsp;
          ({admin.role})
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* Блок 1: Общая статистика */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Общая статистика</h2>
          <p className="text-sm text-gray-500">
            В дальнейшем здесь можно будет показывать:
            общее количество пользователей, новые заказы за сегодня,
            количество активной аренды и другие ключевые показатели.
          </p>
        </div>

        {/* Блок 2: Быстрые действия */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Быстрые действия</h2>
          <ul className="text-sm list-disc list-inside space-y-1 text-gray-600">
            <li>
              <Link href="/ru/admin/users" className="text-blue-600 hover:underline">
                👥 Открыть список пользователей
              </Link>
            </li>
            <li>➕ Добавить новое произведение искусства</li>
            <li>📱 Добавить новое устройство для аренды</li>
            <li>📢 Проверить и утвердить рекламу поставщиков</li>
          </ul>
        </div>

        {/* Блок 3: Системные сообщения */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Системные сообщения</h2>
          <p className="text-sm text-gray-500">
            Позже здесь можно будет отображать логи ошибок,
            предупреждения системы и другие важные уведомления.
          </p>
        </div>
      </div>
    </div>
  );
}
