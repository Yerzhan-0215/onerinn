// src/app/ru/admin/users/AdminUsersClient.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserBlockToggle } from './UserBlockToggle';

type Role = 'USER' | 'ADMIN';

type AdminUser = {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  isBlocked: boolean;
  sellerVerificationStatus: string | null;
  createdAt: string | Date | null;
};

type AdminUsersClientProps = {
  initialUsers: AdminUser[];
  initialTotal: number;
  initialSearch: string;
  initialRoleFilter: string; // 'ALL' | 'USER' | 'ADMIN'
  initialBlockedFilter: string; // 'all' | 'active' | 'blocked'
};

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

// 每页多少条（可以后面再调整，现在先用 20）
const PAGE_SIZE = 20;

export function AdminUsersClient({
  initialUsers,
  initialTotal,
  initialSearch,
  initialRoleFilter,
  initialBlockedFilter,
}: AdminUsersClientProps) {
  // 列表 & 统计
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [total, setTotal] = useState<number>(initialTotal);

  // 过滤 & 搜索
  const [search, setSearch] = useState<string>(initialSearch);
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>(
    (initialRoleFilter as 'ALL' | Role) || 'ALL',
  );
  const [blockedFilter, setBlockedFilter] = useState<'all' | 'active' | 'blocked'>(
    (initialBlockedFilter as 'all' | 'active' | 'blocked') || 'all',
  );

  // 分页
  const [page, setPage] = useState<number>(1);

  // 状态
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 封装一个统一的加载函数
  async function fetchUsers(options?: {
    page?: number;
    search?: string;
    roleFilter?: 'ALL' | Role;
    blockedFilter?: 'all' | 'active' | 'blocked';
  }) {
    const nextPage = options?.page ?? page;
    const nextSearch = options?.search ?? search;
    const nextRole = options?.roleFilter ?? roleFilter;
    const nextBlocked = options?.blockedFilter ?? blockedFilter;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('pageSize', String(PAGE_SIZE));

      if (nextSearch.trim()) {
        params.set('search', nextSearch.trim());
      }
      if (nextRole !== 'ALL') {
        params.set('role', nextRole);
      }
      if (nextBlocked !== 'all') {
        params.set('blocked', nextBlocked);
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('FAILED');
      }

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error ?? 'FAILED');
      }

      const apiUsers: AdminUser[] = data.users ?? data.items ?? [];

      setUsers(apiUsers);
      setTotal(data.total ?? apiUsers.length);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
      setError('Произошла ошибка при загрузке списка пользователей.');
    } finally {
      setLoading(false);
    }
  }

  // 提交搜索表单（点击“Применить”）
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 搜索时回到第 1 页
    fetchUsers({ page: 1 });
  }

  // 更改角色过滤
  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as 'ALL' | Role;
    setRoleFilter(value);
    // 更改过滤时回到第 1 页
    fetchUsers({ page: 1, roleFilter: value });
  }

  // 更改封禁状态过滤
  function handleBlockedChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as 'all' | 'active' | 'blocked';
    setBlockedFilter(value);
    fetchUsers({ page: 1, blockedFilter: value });
  }

  // 分页：上一页 / 下一页
  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    fetchUsers({ page: nextPage });
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {/* 顶部信息卡片：标题 + 总人数 */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Пользователи
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Список зарегистрированных пользователей платформы Onerinn.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Всего пользователей
          </span>
          <span className="text-base font-semibold text-slate-900">
            {total}
          </span>
        </div>
      </section>

      {/* 搜索 + 筛选工具条 */}
      <section className="rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
        <form
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          onSubmit={handleSearchSubmit}
        >
          <div className="flex flex-1 items-center gap-2">
            <label className="text-xs font-medium text-slate-600">
              Поиск:
            </label>
            <input
              type="text"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Имя, email или телефон"
              className="w-full max-w-xs rounded-full border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            {/* 角色过滤 */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">
                Роль:
              </label>
              <select
                name="role"
                value={roleFilter}
                onChange={handleRoleChange}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="ALL">Все</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {/* 封禁状态过滤 */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">
                Статус:
              </label>
              <select
                name="blocked"
                value={blockedFilter}
                onChange={handleBlockedChange}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="all">Все</option>
                <option value="active">Только активные</option>
                <option value="blocked">Только заблокированные</option>
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-black disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Применить'}
            </button>
          </div>
        </form>
      </section>

      {/* 错误信息 */}
      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* 表格容器 */}
      <section className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Имя пользователя</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Роль / статус</th>
              <th className="px-4 py-3">Дата регистрации</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>

          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  Загрузка...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  Пользователей по заданным фильтрам пока нет.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  {/* ID：只显示前 8 位，避免太长挤爆表格 */}
                  <td className="px-4 py-3 align-top text-xs text-slate-500">
                    {String(user.id).slice(0, 8)}
                  </td>

                  {/* 用户名 */}
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-900">
                      {user.username || '—'}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 align-top text-slate-800">
                    {user.email || '—'}
                  </td>

                  {/* 电话 */}
                  <td className="px-4 py-3 align-top text-slate-800">
                    {user.phone || '—'}
                  </td>

                  {/* 角色 + 卖家验证 + 封禁状态徽章 */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span
                        className={
                          user.role === 'ADMIN'
                            ? 'inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700'
                            : 'inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700'
                        }
                      >
                        {user.role || 'USER'}
                      </span>

                      <span className="inline-flex w-fit rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600">
                        Верификация:{' '}
                        <span className="ml-1 font-medium">
                          {user.sellerVerificationStatus}
                        </span>
                      </span>

                      {user.isBlocked && (
                        <span className="inline-flex w-fit rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
                          Заблокирован
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 注册时间 */}
                  <td className="px-4 py-3 align-top text-slate-700">
                    {user.createdAt
                      ? formatDate(new Date(user.createdAt))
                      : '—'}
                  </td>

                  {/* 操作按钮：封禁/解封 + “Подробнее” */}
                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex flex-col items-end gap-2">
                      <UserBlockToggle
                        userId={user.id}
                        initialBlocked={user.isBlocked}
                      />

                      <Link
                        href={`/ru/admin/users/${user.id}`}
                        className="
                          inline-flex items-center rounded-full
                          border border-slate-200 px-3 py-1
                          text-xs font-medium text-slate-600
                          hover:border-slate-300 hover:text-slate-900
                          cursor-pointer
                        "
                      >
                        Подробнее
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* 分页信息（左说明 + 右按钮，对齐更自然） */}
      <div className="flex flex-col gap-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        {/* 左侧说明文字 */}
        <p className="md:flex-1">
          Показаны пользователи в соответствии с выбранными фильтрами. Вы можете
          использовать поиск, фильтр по роли и статусу, а также навигацию по
          страницам.
        </p>

        {/* 右侧分页按钮组 */}
        <div className="flex items-center gap-2 md:justify-end md:min-w-[260px]">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || loading}
            className="cursor-pointer inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
          >
            Назад
          </button>
          <span>
            Страница{' '}
            <span className="font-semibold text-slate-800">
              {page} / {totalPages}
            </span>
          </span>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="cursor-pointer inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
}
