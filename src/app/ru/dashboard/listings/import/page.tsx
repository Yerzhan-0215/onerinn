// /src/app/ru/dashboard/import/csv/page.tsx
'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type Row = Record<string, string>;
type MappingKey =
  | 'title'
  | 'biz'
  | 'category'
  | 'condition'
  | 'quantity'
  | 'pricing.kind'
  | 'pricing.rental.unit'
  | 'pricing.rental.amount'
  | 'pricing.sale.price'
  | 'description'
  | 'images'
  | 'specs.dimensions_mm'
  | 'specs.weight_kg'
  | 'model'
  | 'color'
  | 'country_of_origin'
  | 'production_year';

const INTERNAL_FIELDS: { key: MappingKey; label: string; required?: boolean }[] = [
  { key: 'title', label: 'Название', required: true },
  { key: 'biz', label: 'Категория бизнеса (art/electronic)', required: true },
  { key: 'category', label: 'Категория (внутренняя)' },
  { key: 'condition', label: 'Состояние' },
  { key: 'quantity', label: 'Количество' },
  { key: 'pricing.kind', label: 'Тип сделки (rental/sale/free)', required: true },
  { key: 'pricing.rental.unit', label: 'Единица аренды (day/week/month/year)' },
  { key: 'pricing.rental.amount', label: 'Цена аренды за единицу (KZT)' },
  { key: 'pricing.sale.price', label: 'Цена продажи (KZT)' },
  { key: 'description', label: 'Описание' },
  { key: 'images', label: 'Изображения (URL через запятую)' },
  { key: 'specs.dimensions_mm', label: 'Размеры мм (Д*Ш*В)' },
  { key: 'specs.weight_kg', label: 'Вес (кг)' },
  { key: 'model', label: 'Модель (для электроники)' },
  { key: 'color', label: 'Цвет (для электроники)' },
  { key: 'country_of_origin', label: 'Страна производства' },
  { key: 'production_year', label: 'Год производства' },
];

const AUTO_HEADERS: Record<MappingKey, string[]> = {
  title: ['title','название','name'],
  biz: ['biz','тип','type','категория бизнеса'],
  category: ['category','категория'],
  condition: ['condition','состояние'],
  quantity: ['quantity','qty','количество'],
  'pricing.kind': ['pricing.kind','deal','тип сделки','kind'],
  'pricing.rental.unit': ['pricing.rental.unit','rental.unit','unit'],
  'pricing.rental.amount': ['pricing.rental.amount','rental.amount','rental_price','аренда'],
  'pricing.sale.price': ['pricing.sale.price','sale.price','sale','продажа'],
  description: ['description','описание'],
  images: ['images','urls','media','картинки','изображения'],
  'specs.dimensions_mm': ['dimensions_mm','размеры','габариты','д*ш*в'],
  'specs.weight_kg': ['weight_kg','вес'],
  model: ['model','модель'],
  color: ['color','цвет'],
  country_of_origin: ['country','страна','coo'],
  production_year: ['year','год','production_year'],
};

export default function ImportCsvPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  // ✅ 修复点：允许空对象，使用 Partial<Record<...>>
  const [mapping, setMapping] = useState<Partial<Record<MappingKey, string>>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function downloadTemplate() {
    const cols = [
      'title','biz','category','condition','quantity',
      'pricing.kind','pricing.rental.unit','pricing.rental.amount','pricing.sale.price',
      'description','images',
      'specs.dimensions_mm','specs.weight_kg',
      'model','color','country_of_origin','production_year'
    ];
    const sample = [
      ['Картина маслом','art','painting','like_new','1','rental','day','5000','','Пейзаж.','https://ex.com/a.jpg,https://ex.com/b.jpg','1200*800*30','5','','','',''],
      ['iPhone 13 Pro','electronic','phone','used','2','sale','','','120000','256GB, хорошее состояние','https://ex.com/phone.jpg','150*70*8','0.19','A2638','Серебристый','Китай','2021']
    ];
    const csv = [cols.join(','), ...sample.map(r => r.map(escapeCSV).join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'onerinn-import-template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    parseCsv(text);
  }

  function parseCsv(text: string) {
    setRaw(text);
    const { header, records } = csvParse(text);
    setHeaders(header);
    setRows(records);
    // 自动映射
    const auto: Partial<Record<MappingKey, string>> = {};
    INTERNAL_FIELDS.forEach(({ key }) => {
      const candidates = AUTO_HEADERS[key] || [];
      const hit = header.find(h => candidates.includes(h.trim().toLowerCase()));
      if (hit) auto[key] = hit;
    });
    setMapping(auto);
    setNotice(null);
  }

  function onMapChange(key: MappingKey, col: string) {
    setMapping(prev => ({ ...prev, [key]: col }));
  }

  const preview = useMemo(() => rows.slice(0, 10), [rows]);

  function transformRows() {
    // 必填字段检查
    const reqMissing: string[] = [];
    INTERNAL_FIELDS.filter(f => f.required).forEach(f => {
      if (!mapping[f.key]) reqMissing.push(f.label);
    });
    if (reqMissing.length) {
      setNotice(`Заполните обязательные сопоставления: ${reqMissing.join(', ')}`);
      return null;
    }

    // 映射到我们后端结构
    const out = rows.map((r, idx) => {
      const get = (k: MappingKey) => {
        const col = mapping[k];
        return col ? (r[col] ?? '').trim() : '';
      };
      const dims = get('specs.dimensions_mm');
      const payload: any = {
        title: get('title') || undefined,
        biz: (get('biz') || '').toLowerCase() || undefined, // art/electronic
        category: get('category') || undefined,
        condition: get('condition') || undefined,
        quantity: nOrNull(get('quantity')),
        description: get('description') || undefined,
        images: splitUrls(get('images')),
        pricing: normalizePricing({
          kind: get('pricing.kind'),
          unit: get('pricing.rental.unit'),
          rent: get('pricing.rental.amount'),
          sale: get('pricing.sale.price'),
        }),
        specs: {
          dimensions_mm: dims || undefined,
          weight_kg: nOrNull(get('specs.weight_kg')),
          model: get('model') || undefined,
          color: get('color') || undefined,
          country_of_origin: get('country_of_origin') || undefined,
          production_year: nOrNull(get('production_year')),
        },
      };
      return { __row: idx + 2, payload }; // 2 = header(1) + index
    });
    return out;
  }

  async function onSubmit() {
    const data = transformRows();
    if (!data) return;

    // 轻量预检：title/biz/pricing.kind
    const errs: string[] = [];
    data.forEach(({ __row, payload }) => {
      if (!payload.title) errs.push(`Строка ${__row}: нет Названия`);
      if (!['art','electronic'].includes(payload.biz || '')) errs.push(`Строка ${__row}: неверный biz (art/electronic)`);
      if (!['rental','sale','free'].includes(payload.pricing?.kind || '')) errs.push(`Строка ${__row}: неверный тип сделки`);
    });
    if (errs.length) { setNotice(errs.slice(0, 10).join(' • ')); return; }

    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapping,
          rows: data.map(d => d.payload),
          raw, // 原始 CSV 文本（便于后端留档/回显）
        }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `SERVER_${res.status}`);
      }
      alert('Импорт запущен. Проверьте результаты в списке объявлений.');
    } catch (e: any) {
      setNotice(e?.message || 'Ошибка импорта');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">Импорт (CSV)</h1>
        <div className="ml-auto">
          <Link href="/ru/dashboard" className="text-sm text-blue-600 hover:underline">← Назад</Link>
        </div>
      </div>

      {notice && <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{notice}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 左：上传与映射 */}
        <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onPickFile} />
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Выбрать CSV
            </button>
            <button
              onClick={downloadTemplate}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Скачать шаблон
            </button>
            <span className="text-xs text-gray-500">CSV в кодировке UTF-8</span>
          </div>

          {headers.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-2 text-sm font-semibold">Сопоставление полей</h2>
              <div className="grid grid-cols-1 gap-3">
                {INTERNAL_FIELDS.map(f => (
                  <label key={f.key} className="block">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium">{f.label}</span>
                      {f.required ? <span className="text-xs text-red-600">*</span> : null}
                    </div>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                      value={mapping[f.key] || ''}
                      onChange={(e) => onMapChange(f.key, e.target.value)}
                    >
                      <option value="">— не использовать —</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={onSubmit}
                  disabled={submitting || rows.length === 0}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {submitting ? 'Импортируем…' : 'Импортировать'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右：预览 */}
        <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold">Предпросмотр (первые 10 строк)</h2>
          {rows.length === 0 ? (
            <div className="text-sm text-gray-500">Загрузите CSV для предпросмотра.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr><th className="px-3 py-2">#</th>{headers.map(h => (<th key={h} className="px-3 py-2 text-left">{h}</th>))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-gray-500">{i+1}</td>
                      {headers.map(h => (<td key={h} className="px-3 py-2">{r[h] || ''}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function escapeCSV(s: string) {
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvParse(text: string): { header: string[]; records: Row[] } {
  const rows: string[][] = [];
  let cur = '';
  let row: string[] = [];
  let inQuotes = false;

  function pushCell() {
    row.push(cur); cur = '';
  }
  function pushRow() {
    rows.push(row); row = [];
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i+1] === '"') { cur += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { pushCell(); }
      else if (ch === '\n') { pushCell(); pushRow(); }
      else if (ch === '\r') {
        if (text[i+1] === '\n') { /* swallow, handled by \n */ }
        else { pushCell(); pushRow(); }
      } else {
        cur += ch;
      }
    }
  }
  // last cell/row
  pushCell();
  pushRow();

  // trim possible trailing empty row
  while (rows.length && rows[rows.length-1].every(c => c === '')) rows.pop();

  const header = (rows.shift() || []).map(h => h.trim());
  const records = rows.map(r => {
    const obj: Row = {};
    header.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
    return obj;
  });
  // normalize header to lowercase for auto-map
  return { header: header.map(h => h.trim().toLowerCase()), records };
}

function nOrNull(s: string): number | null {
  if (!s) return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function splitUrls(s: string): string[] | undefined {
  if (!s) return undefined;
  const arr = s.split(/[,\s]+/).map(x => x.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

function normalizePricing(p: { kind: string; unit: string; rent: string; sale: string }) {
  const kind = (p.kind || '').toLowerCase();
  if (kind === 'rental') {
    return {
      kind,
      currency: 'KZT',
      rental: {
        unit: (p.unit || 'day') as any,
        amount: nOrNull(p.rent),
      }
    };
  }
  if (kind === 'sale') {
    return {
      kind,
      currency: 'KZT',
      sale: { price: nOrNull(p.sale) }
    };
  }
  return { kind: 'free', currency: 'KZT', isFree: true };
}
