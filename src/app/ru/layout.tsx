import { ReactNode } from 'react';
import BaseLayout from '@/components/BaseLayout';

export default function Layout({ children }: { children: ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>;
}