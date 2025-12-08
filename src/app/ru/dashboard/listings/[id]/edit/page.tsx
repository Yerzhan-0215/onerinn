// src/app/ru/dashboard/listings/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ListingFormUnified, {
  type BizType,
  type ListingFormInitialData,
  type PricingKind,              // ✅ 新增导入
} from '../../ListingFormUnified';

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const listingId = params?.id;
  const sp = useSearchParams();

  // URL 中的 type 只是兜底；真实类型我们也尽量从后端读取
  const bizFromQuery = (sp?.get('type') === 'electronic' ? 'electronic' : 'art') as BizType;

  const [biz, setBiz] = useState<BizType>(bizFromQuery);
  const [initialData, setInitialData] = useState<ListingFormInitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/artworks/${listingId}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`SERVER_${res.status}`);
        }
        const data = await res.json();
        const item = data?.item ?? data;

        if (!item || cancelled) return;

        // 从后端 biz 字段确认真实类型
        const serverBiz: BizType =
          item.biz === 'electronic' ? 'electronic' : 'art';
        setBiz(serverBiz);

        const init: ListingFormInitialData = {
          title: item.title ?? '',
          status: item.status === 'draft' ? 'draft' : 'published',
          description: item.description ?? '',
          category: item.category ?? '',
          condition: item.condition ?? '',
          quantity: item.quantity ?? 1,

          // 位置
          city: item.location_city ?? item.location ?? '',
          district: item.location_district ?? item.district ?? '',
        };

        // 国家信息（如果后端有）
        const locCountry: string | undefined = item.location_country ?? undefined;
        if (!locCountry || locCountry === 'Kazakhstan') {
          init.country = 'kazakhstan';
          init.foreignCountry = '';
        } else {
          init.country = 'other';
          init.foreignCountry = locCountry;
        }

        // ===== pricing =====
        const pricing = item.pricing ?? {};
        // ✅ 这里只和价格类型相关，用 PricingKind 即可
        const kind: PricingKind = (pricing.kind ?? item.pricingKind ?? 'rental') as PricingKind;

        init.pricingKind =
          kind === 'sale' || kind === 'free' || kind === 'rental'
            ? (kind as any)
            : 'rental';

        if (init.pricingKind === 'rental') {
          const r = pricing.rental ?? {};
          init.rentalUnit = (r.unit as any) || 'day';
          init.rentalAmount =
            typeof r.amount === 'number' ? r.amount : '';
          init.rentalDeposit =
            typeof r.deposit === 'number' ? r.deposit : '';
        } else if (init.pricingKind === 'sale') {
          const s = pricing.sale ?? {};
          init.salePrice =
            typeof s.price === 'number' ? s.price : '';
        }

        // ===== specs =====
        const specs = item.specs ?? {};
        const dims = specs.dimensions_cm ?? {};
        const toMm = (cm: number | null | undefined) =>
          typeof cm === 'number' ? Math.round(cm * 10) : null;
        const Lmm = toMm(dims.length);
        const Wmm = toMm(dims.width);
        const Hmm = toMm(dims.height);
        const dimStr =
          Lmm != null && Wmm != null && Hmm != null
            ? `${Lmm}*${Wmm}*${Hmm}`
            : '';

        if (serverBiz === 'art') {
          init.artDims = dimStr;
          init.artWeight =
            typeof specs.weight_kg === 'number' ? specs.weight_kg : '';
        } else {
          init.eleDims = dimStr;
          init.eleWeight =
            typeof specs.weight_kg === 'number' ? specs.weight_kg : '';
          init.eleModel = specs.model ?? '';
          init.eleColor = specs.color ?? '';
          init.eleCountry = specs.country_of_origin ?? '';
          init.eleYear =
            typeof specs.production_year === 'number'
              ? specs.production_year
              : '';
        }

        // ===== acquisition =====
        const acq = item.acquisition ?? {};
        if (acq.pickup) {
          init.acqPickup = !!acq.pickup.enabled;
          init.pickupAddress = acq.pickup.address ?? '';
        }
        if (acq.courier) {
          init.acqCourier = !!acq.courier.enabled;
          init.courierArea = acq.courier.area ?? '';
        }
        if (acq.shipping) {
          init.acqShipping = !!acq.shipping.enabled;
          init.shippingFrom = acq.shipping.from ?? '';
          init.shippingNote = acq.shipping.notes ?? '';
        }
        if (acq.meetup) {
          init.acqMeetup = !!acq.meetup.enabled;
          init.meetupPlace = acq.meetup.place ?? '';
        }

        if (!cancelled) {
          setInitialData(init);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'Не удалось загрузить объявление');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (!listingId) {
    return (
      <div className="text-sm text-red-600">
        Не найден ID объявления.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Загружаем объявление…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="text-sm text-gray-500">
        Объявление не найдено.
      </div>
    );
  }

  return (
    <ListingFormUnified
      mode="edit"
      biz={biz}
      listingId={listingId}
      initialData={initialData}
    />
  );
}
