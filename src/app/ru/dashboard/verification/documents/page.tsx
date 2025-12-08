'use client';

import { useEffect, useState } from 'react';

type Doc = {
  id: string;
  type: string;
  url: string;
  filename?: string | null;
  uploadedAt?: string;
};

export default function VerificationDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('passport');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/verification/documents', { cache: 'no-store' });
      const j = await r.json();
      setDocs(j?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!file) {
      setMsg('Выберите файл');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      const r = await fetch('/api/verification/documents', {
        method: 'POST',
        body: fd,
      });
      const j = await r.json();
      if (!r.ok) {
        setMsg(j?.error || 'Ошибка загрузки');
      } else {
        setFile(null);
        setMsg('Загружено');
        await refresh();
      }
    } catch {
      setMsg('Сеть недоступна');
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Удалить документ?')) return;
    const r = await fetch(`/api/verification/documents/${id}`, { method: 'DELETE' });
    if (r.ok) {
      await refresh();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg md:text-xl font-semibold">Документы</h1>
        <p className="mt-1 text-sm text-gray-600">
          Загрузите паспорт/свидетельство. Поддерживаются JPG/PNG/PDF.
        </p>
      </div>

      {/* Upload form */}
      <form onSubmit={onUpload} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Тип документа</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="passport">Паспорт</option>
              <option value="certificate">Свидетельство</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Файл</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        {msg && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">{msg}</div>
        )}

        <div className="mt-4">
          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {uploading ? 'Загрузка…' : 'Загрузить'}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">Загруженные документы</div>

        {loading ? (
          <div className="text-sm text-gray-600">Загрузка…</div>
        ) : docs.length === 0 ? (
          <div className="text-sm text-gray-600">Пока пусто</div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium">{d.type}</div>
                  <div className="truncate text-gray-600">{d.filename || d.url}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={d.url}
                    target="_blank"
                    className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
                  >
                    Открыть
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(d.id)}
                    className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
