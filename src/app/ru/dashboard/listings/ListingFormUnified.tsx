// src/app/ru/dashboard/listings/ListingFormUnified.tsx
'use client';

import NiceSelect, { type NiceSelectOption } from '@/components/NiceSelect';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

export type BizType = 'art' | 'electronic';
type Status = 'published' | 'draft';

// 新增：交易类型、租期单位
export type PricingKind = 'rental' | 'sale' | 'free';
type RentalUnit = 'day' | 'week' | 'month' | 'year';

export type ListingFormInitialData = Partial<{
  // 基本
  title: string;
  status: Status;
  description: string;
  category: string;
  condition: string;
  quantity: number;

  // 位置
  country: 'kazakhstan' | 'other';
  foreignCountry: string;
  city: string;
  district: string;

  // 价格相关
  pricingKind: PricingKind;
  rentalUnit: RentalUnit;
  rentalAmount: number | '';
  rentalDeposit: number | '';
  salePrice: number | '';

  // 艺术品规格
  artDims: string;
  artWeight: number | '';

  // 电子规格
  eleDims: string;
  eleWeight: number | '';
  eleModel: string;
  eleColor: string;
  eleCountry: string;
  eleYear: number | '';

  // 取得方式
  acqPickup: boolean;
  pickupAddress: string;
  acqCourier: boolean;
  courierArea: string;
  acqShipping: boolean;
  shippingFrom: string;
  shippingNote: string;
  acqMeetup: boolean;
  meetupPlace: string;
}>;

// ==== 自定义 NiceSelect 的静态选项（只新增，不影响旧逻辑） ====
const CONDITION_OPTIONS: NiceSelectOption[] = [
  { value: '', label: '— выберите —' },
  { value: 'new', label: 'Новое' },
  { value: 'like_new', label: 'Как новое' },
  { value: 'used', label: 'Б/у' },
];

const COUNTRY_OPTIONS: NiceSelectOption[] = [
  { value: 'kazakhstan', label: 'Казахстан' },
  { value: 'other', label: 'Другая страна' },
];

const RENTAL_UNIT_OPTIONS: NiceSelectOption[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
];

// ===== 媒体限制（可按需调整） =====
const ACCEPT_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPT_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime']; // mp4/webm/mov
const MAX_IMAGE_MB = 10; // 单张图片 ≤ 10MB
const MAX_VIDEO_MB = 200; // 单个视频 ≤ 200MB
const MAX_FILES_TOTAL = 10; // 最多 10 个文件
const MAX_IMAGES = 8; // 最多 8 张图片
const MAX_VIDEOS = 2; // 最多 2 个视频

type Props = {
  mode: 'create' | 'edit';
  biz: BizType;
  listingId?: string; // edit 模式下用
  initialData?: ListingFormInitialData; // edit 模式预填
};

export default function ListingFormUnified({ mode, biz, listingId, initialData }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const isEdit = mode === 'edit';

  // ===== 原有字段（保留），初始化时优先用 initialData =====
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [price, setPrice] = useState<string>(''); // 兼容旧接口：可被“日租”同步（目前主要用于 legacyPrice）
  // ⭐ 默认存成 draft；真正发布只通过“Опубликовать”按钮触发
  const [status, setStatus] = useState<Status>(initialData?.status ?? 'draft');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [condition, setCondition] = useState(initialData?.condition ?? '');
  const [quantity, setQuantity] = useState<number>(initialData?.quantity ?? 1);

  // ★ 原有：城市 / 区（位置）
  const [city, setCity] = useState(initialData?.city ?? '');
  const [district, setDistrict] = useState(initialData?.district ?? '');

  // ★ 新增：国家选择（Казахстан / Другая страна）
  const [country, setCountry] = useState<'kazakhstan' | 'other'>(
    initialData?.country ?? 'kazakhstan',
  );
  const [foreignCountry, setForeignCountry] = useState(initialData?.foreignCountry ?? '');

  // 上传（保留 + 增强）
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null); // 轻量提示（忽略原因）

  // ⭐ 新增：用于区分当前是在“保存”还是“发布”
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null);

  // ⭐ 新增：表单引用，用于在按钮里触发表单提交
  const formRef = useRef<HTMLFormElement | null>(null);

  // ===== 新增：尺寸单输入（mm） =====
  const [artDims, setArtDims] = useState<string>(initialData?.artDims ?? ''); // 艺术品
  const [eleDims, setEleDims] = useState<string>(initialData?.eleDims ?? ''); // 电子
  const [artWeight, setArtWeight] = useState<number | ''>(initialData?.artWeight ?? '');
  const [eleModel, setEleModel] = useState(initialData?.eleModel ?? '');
  const [eleColor, setEleColor] = useState(initialData?.eleColor ?? '');
  const [eleWeight, setEleWeight] = useState<number | ''>(initialData?.eleWeight ?? '');
  const [eleCountry, setEleCountry] = useState(initialData?.eleCountry ?? '');
  const [eleYear, setEleYear] = useState<number | ''>(initialData?.eleYear ?? '');

  // ===== 新增：交易类型与价格 =====
  const [pricingKind, setPricingKind] = useState<PricingKind>(
    initialData?.pricingKind ?? 'rental', // 默认租赁
  );
  const [rentalUnit, setRentalUnit] = useState<RentalUnit>(
    initialData?.rentalUnit ?? 'day',
  );
  const [rentalAmount, setRentalAmount] = useState<number | ''>(
    initialData?.rentalAmount ?? '',
  ); // 对应单位的金额
  const [rentalDeposit, setRentalDeposit] = useState<number | ''>(
    initialData?.rentalDeposit ?? '',
  ); // 押金（可选）
  const [salePrice, setSalePrice] = useState<number | ''>(
    initialData?.salePrice ?? '',
  ); // 销售价

  // ===== 新增：客户如何取得 =====
  const [acqPickup, setAcqPickup] = useState(initialData?.acqPickup ?? false);
  const [pickupAddress, setPickupAddress] = useState(initialData?.pickupAddress ?? '');
  const [acqCourier, setAcqCourier] = useState(initialData?.acqCourier ?? false);
  const [courierArea, setCourierArea] = useState(initialData?.courierArea ?? '');
  const [acqShipping, setAcqShipping] = useState(initialData?.acqShipping ?? false);
  const [shippingFrom, setShippingFrom] = useState(initialData?.shippingFrom ?? '');
  const [shippingNote, setShippingNote] = useState(initialData?.shippingNote ?? '');
  const [acqMeetup, setAcqMeetup] = useState(initialData?.acqMeetup ?? false);
  const [meetupPlace, setMeetupPlace] = useState(initialData?.meetupPlace ?? '');

  const headline =
    isEdit
      ? biz === 'electronic'
        ? 'Редактировать электронику'
        : 'Редактировать произведение'
      : biz === 'electronic'
        ? 'Опубликовать электронику'
        : 'Опубликовать произведение';

  // ✅ Категория 选项（保持原结构：v / l）
  const categoryOptions = useMemo(() => {
    return biz === 'art'
      ? [
          { v: '', l: '— выберите —' },
          { v: 'painting', l: 'Живопись' },
          { v: 'photo', l: 'Фотография' },
          { v: 'sculpture', l: 'Скульптура' },
          { v: 'graphic', l: 'Графика / иллюстрация' },
          { v: 'installation', l: 'Инсталляция / объект' },
          { v: 'digital', l: 'Цифровое искусство' },
          { v: 'other', l: 'Другое' },
        ]
      : [
          { v: '', l: '— выберите —' },
          { v: 'phone', l: 'Смартфон' },
          { v: 'laptop', l: 'Ноутбук' },
          { v: 'tablet', l: 'Планшет' },
          { v: 'camera', l: 'Камера / фотоаппарат' },
          { v: 'accessory', l: 'Аксессуар' },
          { v: 'audio', l: 'Аудио' },
          { v: 'game_console', l: 'Игровая приставка' },
          { v: 'other', l: 'Другое устройство' },
        ];
  }, [biz]);

  // 顶部类型切换：create 模式下才可切换；edit 模式只展示，不修改真实 biz
  function switchBiz(next: BizType) {
    if (isEdit) return; // 编辑模式下禁止切换类型，避免与后端类型不一致
    const params = new URLSearchParams(sp?.toString() || '');
    params.set('type', next);
    router.push(`/ru/dashboard/listings/new?${params.toString()}`, { scroll: false });
  }

  function handlePickFiles() {
    fileInputRef.current?.click();
  }

  // 统计当前已选图片/视频
  function countKinds(fs: File[]) {
    let imgs = 0,
      vids = 0;
    fs.forEach((f) => {
      if (ACCEPT_IMAGE.includes(f.type)) imgs += 1;
      else if (ACCEPT_VIDEO.includes(f.type)) vids += 1;
    });
    return { imgs, vids };
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const current = [...files];
    let notice: string[] = [];
    let kept: File[] = [];

    // 逐个文件检查：类型/大小
    for (const f of selected) {
      const isImg = ACCEPT_IMAGE.includes(f.type);
      const isVid = ACCEPT_VIDEO.includes(f.type);

      if (!isImg && !isVid) {
        notice.push(`Формат не поддерживается: ${f.name}`);
        continue;
      }
      const sizeMB = f.size / (1024 * 1024);
      if (isImg && sizeMB > MAX_IMAGE_MB) {
        notice.push(`Слишком большой файл (image > ${MAX_IMAGE_MB}MB): ${f.name}`);
        continue;
      }
      if (isVid && sizeMB > MAX_VIDEO_MB) {
        notice.push(`Слишком большой файл (video > ${MAX_VIDEO_MB}MB): ${f.name}`);
        continue;
      }

      kept.push(f);
    }

    // 与已有的合并后再做 “数量上限” 检查
    let merged = [...current, ...kept];
    // 总数限制
    if (merged.length > MAX_FILES_TOTAL) {
      const over = merged.length - MAX_FILES_TOTAL;
      notice.push(`Превышен лимит файлов: максимум ${MAX_FILES_TOTAL} (−${over})`);
      merged = merged.slice(0, MAX_FILES_TOTAL);
    }
    // 按类型数量限制
    const after = countKinds(merged);
    if (after.imgs > MAX_IMAGES) {
      notice.push(`Слишком много изображений: максимум ${MAX_IMAGES}`);
      // 裁剪多余图片
      let imgsSeen = 0;
      merged = merged.filter((f) => {
        if (ACCEPT_IMAGE.includes(f.type)) {
          imgsSeen += 1;
          return imgsSeen <= MAX_IMAGES;
        }
        return true;
      });
    }
    if (after.vids > MAX_VIDEOS) {
      notice.push(`Слишком много видео: максимум ${MAX_VIDEOS}`);
      // 裁剪多余视频
      let vidsSeen = 0;
      merged = merged.filter((f) => {
        if (ACCEPT_VIDEO.includes(f.type)) {
          vidsSeen += 1;
          return vidsSeen <= MAX_VIDEOS;
        }
        return true;
      });
    }

    setFiles(merged);
    setUploadNotice(notice.length ? notice.join(' • ') : null);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }
  function clearAll() {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // 尺寸解析：接受 "L*W*H" / "LxWxH" / "L × W × H"；单位 mm
  function parseDimsMm(input: string): {
    length_mm: number | null;
    width_mm: number | null;
    height_mm: number | null;
  } {
    const s = (input || '')
      .replace(/мм|mm/gi, '')
      .replace(/,/g, '.')
      .trim();
    if (!s) return { length_mm: null, width_mm: null, height_mm: null };
    const parts = s.split(/\s*[xX*×]\s*/).filter(Boolean);
    if (parts.length !== 3)
      return { length_mm: null, width_mm: null, height_mm: null };
    const nums = parts.map((p) => {
      const n = Number(p);
      return Number.isFinite(n) && n >= 0 ? n : NaN;
    });
    if (nums.some((n) => Number.isNaN(n)))
      return { length_mm: null, width_mm: null, height_mm: null };
    const [L, W, H] = nums;
    return { length_mm: L, width_mm: W, height_mm: H };
  }
  const mmToCm = (n: number | null) =>
    n == null ? null : Math.round((n / 10) * 1000) / 1000;

  // ✅ 新版 onSubmit：按模式区分 POST / PUT，且不改其它逻辑
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1) 上传媒体（保留原逻辑）
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append('files', f));
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!up.ok) {
          const t = await up.text().catch(() => '');
          throw new Error(`UPLOAD_FAILED ${t || up.status}`);
        }
        const ujson = (await up.json()) as { urls?: string[] };
        mediaUrls = ujson.urls || [];
      }

      // 2) 尺寸 → specs
      const dimsArt = parseDimsMm(artDims);
      const dimsEle = parseDimsMm(eleDims);
      const specs =
        biz === 'art'
          ? {
              dimensions_cm: {
                length: mmToCm(dimsArt.length_mm),
                width: mmToCm(dimsArt.width_mm),
                height: mmToCm(dimsArt.height_mm),
              },
              weight_kg: artWeight === '' ? null : Number(artWeight),
            }
          : {
              model: eleModel || null,
              dimensions_cm: {
                length: mmToCm(dimsEle.length_mm),
                width: mmToCm(dimsEle.width_mm),
                height: mmToCm(dimsEle.height_mm),
              },
              color: eleColor || null,
              weight_kg: eleWeight === '' ? null : Number(eleWeight),
              country_of_origin: eleCountry || null,
              production_year: eleYear === '' ? null : Number(eleYear),
            };

      // 3) 交易类型与价格 → pricing
      const pricing: any = {
        kind: pricingKind, // 'rental' | 'sale' | 'free'
        currency: 'KZT',
      };
      if (pricingKind === 'rental') {
        pricing.rental = {
          unit: rentalUnit,
          amount: rentalAmount === '' ? null : Number(rentalAmount),
          deposit: rentalDeposit === '' ? null : Number(rentalDeposit),
        };
      } else if (pricingKind === 'sale') {
        pricing.sale = {
          price: salePrice === '' ? null : Number(salePrice),
        };
      } else {
        pricing.isFree = true;
      }

      // 兼容旧字段 price
      const legacyPrice =
        pricingKind === 'rental' && rentalUnit === 'day'
          ? rentalAmount === '' ? undefined : Number(rentalAmount)
          : pricingKind === 'sale'
          ? salePrice === '' ? undefined : Number(salePrice)
          : undefined;

      // 4) 取得方式 → acquisition
      const acquisition = {
        pickup: acqPickup ? { enabled: true, address: pickupAddress || null } : { enabled: false },
        courier: acqCourier ? { enabled: true, area: courierArea || null } : { enabled: false },
        shipping: acqShipping
          ? { enabled: true, from: shippingFrom || null, notes: shippingNote || null }
          : { enabled: false },
        meetup: acqMeetup ? { enabled: true, place: meetupPlace || null } : { enabled: false },
      };

      // ★ 位置：兼容旧字段 + 新结构
      const cityTrimmed = city.trim();
      const districtTrimmed = district.trim();
      const foreignTrimmed = foreignCountry.trim();

      const legacyLocation =
        country === 'kazakhstan'
          ? cityTrimmed || undefined
          : [foreignTrimmed, cityTrimmed].filter(Boolean).join(', ') || undefined;

      const payload = {
        title: title.trim(),
        price: legacyPrice,
        status, // draft / published
        description: description?.trim() || undefined,
        category: category || undefined,
        condition: condition || undefined,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        mediaUrls,

        // 旧字段兼容
        location: legacyLocation,
        district: country === 'kazakhstan' ? districtTrimmed || undefined : undefined,

        // 新结构：国家 / 城市 / 区
        location_country:
          country === 'kazakhstan' ? 'Kazakhstan' : foreignTrimmed || undefined,
        location_city: cityTrimmed || undefined,
        location_district:
          country === 'kazakhstan' ? districtTrimmed || undefined : undefined,

        // 新增：扩展结构
        biz,        // art / electronic
        specs,      // 规格
        pricing,    // 交易类型与价格
        acquisition // 取得方式
      };

      // 5) 根据 mode 选择 URL 和 method
      const isRealEdit = isEdit && listingId;
      const endpoint = isRealEdit ? `/api/artworks/${listingId}` : '/api/artworks';
      const method = isRealEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) throw new Error('UNAUTHORIZED');
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `SERVER_${res.status}`);
      }

      // 6) 跳转逻辑
      if (isRealEdit) {
        // 编辑成功统一回列表，并提示 saved=1
        router.push('/ru/dashboard/listings?saved=1');
      } else {
        // 新建：保持之前 draft/published 的分支
        if (status === 'draft') {
          router.push('/ru/dashboard/listings?saved=1');
        } else {
          router.push('/ru/dashboard/listings');
        }
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  }

  // ===== 右侧温馨提示文案（根据 biz / pricingKind） =====
  const helperTitle =
    biz === 'art' ? 'Ваше произведение важно для нас' : 'Ваша электроника в надёжных руках';

  const helperBullets =
    biz === 'art'
      ? [
          'Добавьте 2–5 качественных фото, чтобы показать фактуру и детали.',
          'Укажите честное состояние работы — это повышает доверие.',
          'Размеры в миллиметрах помогут покупателю представить произведение в интерьере.',
          pricingKind === 'rental'
            ? 'Если вы сдаёте работу в аренду, подумайте о разумном залоге.'
            : 'Если продаёте работу, можно оставить цену пустой и обсудить её с покупателем.',
        ]
      : [
          'Сделайте несколько фото устройства с разных ракурсов и при хорошем освещении.',
          'Укажите состояние и год выпуска — это влияет на скорость аренды/продажи.',
          'Размеры и вес помогут рассчитать доставку и понять реальный габарит.',
          pricingKind === 'rental'
            ? 'Залог защищает вас как владельца, но постарайтесь не завышать его.'
            : 'Для продажи можно указать ориентировочную цену и быть готовым к диалогу.',
        ];

  // ⭐ “只保存”为 draft
  function handleSaveDraft() {
    if (submitting) return;
    setSavingMode('draft');
    setStatus('draft');
    formRef.current?.requestSubmit();
  }

  // ⭐ “保存并尝试发布”
  async function handleSaveAndPublish() {
    if (submitting) return;
    setSavingMode('publish');
    setError(null);

    try {
      const meRes = await fetch('/api/me', { cache: 'no-store' });
      if (!meRes.ok) throw new Error('Не удалось получить профиль');
      const meData = await meRes.json();
      const verificationStatus =
        meData?.user?.sellerVerificationStatus ??
        meData?.sellerVerificationStatus ??
        null;

      if (verificationStatus !== 'APPROVED') {
        router.push('/ru/profile/verify');
        return;
      }

      setStatus('published');
      formRef.current?.requestSubmit();
    } catch (e: any) {
      setError(e.message || 'Не удалось опубликовать объявление');
      setSavingMode(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* 顶部：标题 + 返回 + 类型切换 */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">{headline}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
            <button
              type="button"
              onClick={() => switchBiz('art')}
              className={[
                'rounded-full px-3 py-1 text-sm transition',
                biz === 'art'
                  ? 'bg-violet-100 text-violet-800'
                  : 'hover:bg-gray-50 text-gray-700',
                isEdit ? 'cursor-not-allowed opacity-60 hover:bg-white' : '',
              ].join(' ')}
              aria-pressed={biz === 'art'}
            >
              Произведение
            </button>
            <button
              type="button"
              onClick={() => switchBiz('electronic')}
              className={[
                'rounded-full px-3 py-1 text-sm transition',
                biz === 'electronic'
                  ? 'bg-sky-100 text-sky-800'
                  : 'hover:bg-gray-50 text-gray-700',
                isEdit ? 'cursor-not-allowed opacity-60 hover:bg-white' : '',
              ].join(' ')}
              aria-pressed={biz === 'electronic'}
            >
              Электроника
            </button>
          </div>

          <a
            href="/ru/dashboard/listings"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Назад к объявлениям
          </a>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* 主体区域：左 2/3 表单 + 右 1/3 温馨提示（右侧 sticky 悬浮） */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* 左侧表单 */}
        <div className="lg:w-2/3">
          <form
            ref={formRef}
            onSubmit={onSubmit}
            className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm listing-form"
          >
            {/* 基本信息 */}
            <Section title="Основная информация">
              <TwoCol>
                <Field label="Название *">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Название работы / устройства"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Категория">
                  <NiceSelect
                    value={category}
                    onChange={setCategory}
                    placeholder="— выберите —"
                    options={categoryOptions.map(
                      (o): NiceSelectOption => ({
                        value: o.v,
                        label: o.l,
                      }),
                    )}
                  />
                </Field>
              </TwoCol>

              <TwoCol>
                <Field label="Состояние">
                  <NiceSelect
                    value={condition}
                    onChange={setCondition}
                    placeholder="— выберите —"
                    options={CONDITION_OPTIONS}
                  />
                </Field>
                <Field label="Количество">
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value || 1)))
                    }
                  />
                </Field>
              </TwoCol>
            </Section>

            {/* ★ 位置 */}
            <Section title="Расположение товара">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Страна">
                  <NiceSelect
                    value={country}
                    onChange={(v) => {
                      const val = (v as 'kazakhstan' | 'other') || 'kazakhstan';
                      setCountry(val);
                      if (val === 'kazakhstan') {
                        setForeignCountry('');
                      } else {
                        setDistrict('');
                      }
                    }}
                    options={COUNTRY_OPTIONS}
                  />
                </Field>

                <Field label="Город">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder={
                      country === 'kazakhstan'
                        ? 'Напр.: Алматы, Астана'
                        : 'Напр.: Стамбул / Пекин / Нью-Йорк'
                    }
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Field>

                {country === 'kazakhstan' ? (
                  <Field label="Район / часть города">
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Напр.: Бостандыкский район"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </Field>
                ) : (
                  <Field label="Страна (укажите)">
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Напр.: Турция, Китай, США"
                      value={foreignCountry}
                      onChange={(e) => setForeignCountry(e.target.value)}
                    />
                  </Field>
                )}
              </div>
            </Section>

            {/* 交易类型与价格 */}
            <Section title="Тип сделки и цена">
              <Field label="Тип сделки">
                <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setPricingKind('rental')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      pricingKind === 'rental'
                        ? 'bg-gray-900 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    aria-pressed={pricingKind === 'rental'}
                  >
                    Аренда
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingKind('sale')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      pricingKind === 'sale'
                        ? 'bg-gray-900 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    aria-pressed={pricingKind === 'sale'}
                  >
                    Продажа
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingKind('free')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      pricingKind === 'free'
                        ? 'bg-gray-900 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    aria-pressed={pricingKind === 'free'}
                  >
                    Бесплатно
                  </button>
                </div>
              </Field>

              {pricingKind === 'rental' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Единица аренды">
                    <NiceSelect
                      value={rentalUnit}
                      onChange={(v) =>
                        setRentalUnit((v as RentalUnit) || 'day')
                      }
                      options={RENTAL_UNIT_OPTIONS}
                    />
                  </Field>
                  <Field label="Цена за единицу (KZT)">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={rentalAmount === '' ? '' : rentalAmount}
                      onChange={(e) =>
                        setRentalAmount(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      placeholder="напр., 5000"
                    />
                  </Field>
                  <Field label="Залог (KZT)">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={rentalDeposit === '' ? '' : rentalDeposit}
                      onChange={(e) =>
                        setRentalDeposit(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      placeholder="необязательно"
                    />
                  </Field>
                </div>
              )}

              {pricingKind === 'sale' && (
                <TwoCol>
                  <Field label="Цена продажи (KZT)">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={salePrice === '' ? '' : salePrice}
                      onChange={(e) =>
                        setSalePrice(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      placeholder="напр., 120000"
                    />
                  </Field>
                  <Field label="(Совместимость с прежним полем 'Цена')">
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                      value={
                        pricingKind === 'sale'
                          ? salePrice === ''
                            ? ''
                            : String(salePrice)
                          : pricingKind === 'rental' && rentalUnit === 'day'
                          ? rentalAmount === ''
                            ? ''
                            : String(rentalAmount)
                          : ''
                      }
                      readOnly
                    />
                  </Field>
                </TwoCol>
              )}

              {pricingKind === 'free' && (
                <div className="text-sm text-gray-600">
                  Этот лот публикуется бесплатно. Цена будет игнорирована.
                </div>
              )}
            </Section>

            {/* 描述 */}
            <Section title="Описание">
              <Field label="Описание">
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  rows={4}
                  placeholder="Краткое описание товара / работы"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </Section>

            {/* Фото / видео */}
            <Section title="Фото / видео">
              <div className="md:flex md:items-start md:gap-4">
                <div className="md:w-80">
                  <Field
                    label="Медиа-файлы"
                    hint={`Изобр.: JPEG/PNG/WebP ≤ ${MAX_IMAGE_MB}MB; Видео: MP4/WebM/MOV ≤ ${MAX_VIDEO_MB}MB; ↑ до ${MAX_FILES_TOTAL} файлов (≤${MAX_IMAGES} фото, ≤${MAX_VIDEOS} видео)`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={`${ACCEPT_IMAGE.join(',')},${ACCEPT_VIDEO.join(',')}`}
                      multiple
                      className="hidden"
                      onChange={handleFilesSelected}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handlePickFiles}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        Выбрать файлы
                      </button>

                      <span className="text-sm text-gray-700">
                        Выбрано: {files.length} / {MAX_FILES_TOTAL}
                      </span>

                      {files.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAll}
                          className="text-xs text-gray-500 underline hover:text-gray-700"
                        >
                          Очистить
                        </button>
                      )}
                    </div>

                    {uploadNotice && (
                      <div className="mt-2 text-xs text-amber-700">
                        {uploadNotice}
                      </div>
                    )}
                  </Field>
                </div>

                <div className="mt-3 md:mt-0 md:flex-1">
                  {files.length > 0 ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {files.map((f, i) => {
                        const isVideo = ACCEPT_VIDEO.includes(f.type);
                        const url = URL.createObjectURL(f);
                        return (
                          <div
                            key={i}
                            className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-gray-100"
                          >
                            {isVideo ? (
                              // eslint-disable-next-line jsx-a11y/media-has-caption
                              <video
                                src={url}
                                className="h-full w-full object-cover"
                                onLoadedData={(e) =>
                                  URL.revokeObjectURL(
                                    (e.target as HTMLVideoElement).src,
                                  )
                                }
                                muted
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                alt={f.name}
                                src={url}
                                className="h-full w-full object-cover"
                                onLoad={(e) =>
                                  URL.revokeObjectURL(
                                    (e.target as HTMLImageElement).src,
                                  )
                                }
                              />
                            )}
                            <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] leading-4 text-white">
                              {isVideo ? 'Видео' : 'Фото'}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute right-1 top-1 rounded bg-black/60 px-1 text-xs text-white"
                              aria-label="Удалить файл"
                              title="Удалить"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-24 rounded border border-dashed border-gray-300 p-3 text-sm text-gray-400">
                      Превью появится здесь после выбора файлов
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* 规格（按类型显示；尺寸为单框 mm） */}
            {biz === 'art' ? (
              <Section title="Характеристики произведения">
                <TwoCol>
                  <Field
                    label="Размеры (мм)"
                    hint="Введите: Д*Ш*В, например 1200*800*30"
                  >
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
                      placeholder="Д*Ш*В mm"
                      value={artDims}
                      onChange={(e) => setArtDims(e.target.value)}
                    />
                  </Field>
                  <Field label="Вес (кг)">
                    <NumberInput
                      value={artWeight}
                      onChange={setArtWeight}
                      step={0.01}
                      min={0}
                    />
                  </Field>
                </TwoCol>
              </Section>
            ) : (
              <Section title="Характеристики электроники">
                <TwoCol>
                  <Field label="Модель">
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={eleModel}
                      onChange={(e) => setEleModel(e.target.value)}
                      placeholder="Напр.: iPhone 13 Pro / ThinkPad X1"
                    />
                  </Field>
                  <Field label="Цвет">
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={eleColor}
                      onChange={(e) => setEleColor(e.target.value)}
                      placeholder="Напр.: Черный / Серебристый"
                    />
                  </Field>
                </TwoCol>

                <TwoCol>
                  <Field
                    label="Размеры (мм)"
                    hint="Введите: Д*Ш*В, например 150*70*8"
                  >
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
                      placeholder="Д*Ш*В mm"
                      value={eleDims}
                      onChange={(e) => setEleDims(e.target.value)}
                    />
                  </Field>
                  <Field label="Вес (кг)">
                    <NumberInput
                      value={eleWeight}
                      onChange={setEleWeight}
                      step={0.01}
                      min={0}
                    />
                  </Field>
                </TwoCol>

                <TwoCol>
                  <Field label="Страна производства">
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={eleCountry}
                      onChange={(e) => setEleCountry(e.target.value)}
                      placeholder="Напр.: Китай / Вьетнам / США"
                    />
                  </Field>
                  <Field label="Год производства">
                    <input
                      type="number"
                      min={1990}
                      max={new Date().getFullYear() + 1}
                      step={1}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={eleYear === '' ? '' : eleYear}
                      onChange={(e) =>
                        setEleYear(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      placeholder="Напр.: 2023"
                    />
                  </Field>
                </TwoCol>
              </Section>
            )}

            {/* 客户如何取得 */}
            <Section title="Как получить товар">
              <div className="space-y-3">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={acqPickup}
                    onChange={(e) => setAcqPickup(e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Самовывоз</div>
                    {acqPickup && (
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Адрес самовывоза (улица, дом, ориентир)"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={acqCourier}
                    onChange={(e) => setAcqCourier(e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Курьер по городу</div>
                    {acqCourier && (
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Зона доставки / районы (напр.: Алматы, в пределах... )"
                        value={courierArea}
                        onChange={(e) => setCourierArea(e.target.value)}
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={acqShipping}
                    onChange={(e) => setAcqShipping(e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      Доставка транспортной компанией / почтой
                    </div>
                    {acqShipping && (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Адрес отправления / склад (откуда)"
                          value={shippingFrom}
                          onChange={(e) => setShippingFrom(e.target.value)}
                        />
                        <input
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Примечание: упаковка, сроки, КТК/EMS и т.п."
                          value={shippingNote}
                          onChange={(e) => setShippingNote(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={acqMeetup}
                    onChange={(e) => setAcqMeetup(e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Встреча и передача</div>
                    {acqMeetup && (
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Место встречи / условия"
                        value={meetupPlace}
                        onChange={(e) => setMeetupPlace(e.target.value)}
                      />
                    )}
                  </div>
                </label>
              </div>
            </Section>

            {/* ⭐ 底部：Отмена + Сохранить + Опубликовать */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <a
                href="/ru/dashboard/listings"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                Отмена
              </a>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={submitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {submitting && savingMode === 'draft'
                  ? 'Сохраняем…'
                  : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={handleSaveAndPublish}
                disabled={submitting}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60 cursor-pointer"
              >
                {submitting && savingMode === 'publish'
                  ? 'Публикуем…'
                  : 'Опубликовать'}
              </button>
            </div>
          </form>
        </div>

        {/* 右侧悬浮温馨提示 */}
        <aside className="lg:w-1/3 lg:pl-4 lg:sticky lg:top-24 self-start">
          <div className="max-h-[calc(100vh-140px)] overflow-y-auto rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-gray-800 shadow-sm">
            <h2 className="mb-2 text-base font-semibold text-indigo-900">
              {helperTitle}
            </h2>
            <ul className="list-disc space-y-1 pl-4">
              {helperBullets.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-indigo-900/80">
              Потратьте ещё 1–2 минуты на заполнение — так вы поможете
              покупателю/арендатору быстрее сделать выбор, а себе — быстрее
              получить первую сделку на Onerinn.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- 复用小组件 ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-lg border border-gray-200 p-4">
      <h2 className="mb-1 text-base font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  step,
  min,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  step?: number;
  min?: number;
}) {
  return (
    <input
      type="number"
      step={step ?? 1}
      min={min}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      value={value === '' ? '' : value}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? '' : Number(v));
      }}
    />
  );
}
