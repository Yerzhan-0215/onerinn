// src/app/ru/dashboard/listings/new/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import ListingFormUnified, {
  type BizType,
} from '../ListingFormUnified';

export default function NewListingPage() {
  const sp = useSearchParams();
  const biz = (sp?.get('type') === 'electronic' ? 'electronic' : 'art') as BizType;

  return <ListingFormUnified mode="create" biz={biz} />;
}
