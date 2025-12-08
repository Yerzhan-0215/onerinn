// src/app/ru/admin/verification/page.tsx
'use client';

import { useEffect, useState } from 'react';

type SellerTypeDb = 'INDIVIDUAL' | 'COMPANY';
type SellerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type AdminDoc = {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
};

type AdminUser = {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  documents?: AdminDoc[];
};

type AdminSellerVerification = {
  id: string;
  userId: string;
  type: SellerTypeDb | null;
  iinOrBin: string | null;
  fullName: string | null;
  companyName: string | null;
  status: SellerVerificationStatus;
  adminComment: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdminUser;
};

export default function AdminVerificationPage() {
  const [items, setItems] = useState<AdminSellerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/verification', {
          cache: 'no-store',
        });

        if (!alive) return;

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const msg =
            json?.error === 'FORBIDDEN'
              ? 'Нет доступа. Пожалуйста, войдите как администратор.'
              : 'Не удалось загрузить список заявок.';
          setError(msg);
          return;
        }

        const list: AdminSellerVerification[] = json.items ?? [];
        setItems(list);

        const comments: Record<string, string> = {};
        list.forEach((it) => {
          if (it.adminComment) comments[it.id] = it.adminComment;
        });
        setCommentInputs(comments);
      } catch {
        if (!alive) return;
        setError('Не удалось загрузить список заявок.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  function statusBadge(status: SellerVerificationStatus) {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-[2px] text-[11px] font-medium text-emerald-700">
          ✅ Одобрено
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-[2px] text-[11px] font-medium text-rose-700">
          ⚠️ Отклонено
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-[2px] text-[11px] font-medium text-amber-700">
        ⏳ На рассмотрении
      </span>
    );
  }

  async function handleAction(
    id: string,
    action: 'approve' | 'reject',
  ) {
    setError(null);
    setActionLoadingId(id);

    try {
      const res = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          comment: commentInputs[id] ?? null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        const msg =
          json?.error === 'FORBIDDEN'
            ? 'Нет доступа. Пожалуйста, войдите как администратор.'
            : 'Не удалось обновить статус.';
        setError(msg);
        return;
      }

      const updated: AdminSellerVerification = json.item;

      setItems((prev) =>
        prev.map((it) => (it.id === updated.id ? { ...it, ...updated } : it)),
      );
    } catch (e) {
      console.error(e);
      setError('Произошла ошибка при обновлении статуса.');
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Заявки на верификацию продавцов
        </h1>
        <span className="text-[11px] md:text-xs text-gray-500">
          Admin · Модерация продавцов
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">
          Загрузка заявок…
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">
          Заявок на верификацию пока нет.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isCompany = item.type === 'COMPANY';
            const user = item.user;
            const docs = user.documents ?? [];

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-gray-900">
                        {isCompany
                          ? item.companyName || 'Компания'
                          : item.fullName || 'Частное лицо'}
                      </h2>
                      {statusBadge(item.status)}
                    </div>
                    <p className="text-xs text-gray-600">
                      {isCompany ? 'Компания / ИП' : 'Физическое лицо'} ·{' '}
                      {item.iinOrBin ? (
                        <span className="font-mono">
                          {isCompany ? 'БИН' : 'ИИН'}: {item.iinOrBin}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          ИИН/БИН не указан
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Пользователь:{' '}
                      <span className="font-medium">
                        {user.username || user.name || user.email || '—'}
                      </span>{' '}
                      {user.email && (
                        <span className="ml-2 text-gray-500">
                          · {user.email}
                        </span>
                      )}
                      {user.phone && (
                        <span className="ml-2 text-gray-500">
                          · {user.phone}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-gray-500">
                    <div>
                      Создано:{' '}
                      {new Date(item.createdAt).toLocaleString('ru-RU')}
                    </div>
                    <div>
                      Обновлено:{' '}
                      {new Date(item.updatedAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>

                {/* Документы */}
                <div className="space-y-1 text-xs">
                  <div className="font-medium text-gray-800">
                    Документы ({docs.length})
                  </div>
                  {docs.length === 0 ? (
                    <p className="text-gray-500">
                      Документы ещё не загружены.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {docs.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-[2px] text-[11px] text-gray-700 hover:bg-gray-100"
                        >
                          <span>📎</span>
                          <span>{doc.type}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Комментарий администратора + кнопки */}
                <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 space-y-1">
                    <label className="block text-[11px] font-medium text-gray-700">
                      Комментарий администратора
                    </label>
                    <textarea
                      value={commentInputs[item.id] ?? ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Причина отклонения или дополнительные заметки (необязательно)"
                    />
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2 md:flex-col md:items-end">
                    <button
                      type="button"
                      onClick={() => handleAction(item.id, 'approve')}
                      disabled={actionLoadingId === item.id}
                      className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoadingId === item.id &&
                      items.find((i) => i.id === item.id)?.status ===
                        'APPROVED'
                        ? 'Сохранение…'
                        : 'Одобрить'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(item.id, 'reject')}
                      disabled={actionLoadingId === item.id}
                      className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoadingId === item.id &&
                      items.find((i) => i.id === item.id)?.status ===
                        'REJECTED'
                        ? 'Сохранение…'
                        : 'Отклонить'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
