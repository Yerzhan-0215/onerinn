import React from 'react';
import BaseLayout from '@/components/BaseLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>;
}