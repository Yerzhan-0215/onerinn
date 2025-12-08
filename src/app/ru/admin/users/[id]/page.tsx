// src/app/ru/admin/users/[id]/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/adminSession';

/**
 * 简单的日期格式化函数：显示为俄语风格 dd.MM.yyyy HH:mm
 */
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

type PageProps = {
  params: { id: string };
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  // 1. 仍然先做 admin 鉴权
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/ru/admin/login');
  }

  const userId = params.id;

  // 2. 查询这个用户的详细信息
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      role: true,
      isBlocked: true,
      sellerVerificationStatus: true,
      createdAt: true,
      updatedAt: true,
      // 以后如果有更多字段（地址、头像等），可以继续在这里加
    },
  });

  if (!user) {
    return (
      <div className="px-4 py-6">
        <div className="mb-3">
          <Link
            href="/ru/admin/users"
            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-slate-300 hover:text-slate-900 cursor-pointer"
          >
            ← Назад к списку пользователей
          </Link>
        </div>
        <p className="text-sm text-slate-600">Пользователь не найден.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {/* 返回按钮 */}
      <div>
        <Link
          href="/ru/admin/users"
          className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-slate-300 hover:text-slate-900 cursor-pointer"
        >
          ← Назад к списку пользователей
        </Link>
      </div>

      {/* 卡片：基本信息 */}
      <section className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900 mb-2">
          Профиль пользователя
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          Подробная информация по выбранному пользователю платформы Onerinn.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs uppercase text-slate-500">ID</div>
            <div className="text-sm font-mono text-slate-800">{user.id}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase text-slate-500">
              Имя пользователя
            </div>
            <div className="text-sm text-slate-800">
              {user.username || '—'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase text-slate-500">E-mail</div>
            <div className="text-sm text-slate-800">{user.email || '—'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase text-slate-500">Телефон</div>
            <div className="text-sm text-slate-800">{user.phone || '—'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase text-slate-500">
              Роль / статус
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  user.role === 'ADMIN'
                    ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700'
                    : 'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700'
                }
              >
                {user.role || 'USER'}
              </span>

              <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600">
                Верификация:{' '}
                <span className="ml-1 font-medium">
                  {user.sellerVerificationStatus || '—'}
                </span>
              </span>

              {user.isBlocked && (
                <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
                  Заблокирован
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase text-slate-500">
              Дата регистрации
            </div>
            <div className="text-sm text-slate-800">
              {user.createdAt ? formatDate(new Date(user.createdAt)) : '—'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase text-slate-500">
              Последнее обновление
            </div>
            <div className="text-sm text-slate-800">
              {user.updatedAt ? formatDate(new Date(user.updatedAt)) : '—'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
