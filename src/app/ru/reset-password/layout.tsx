// src/app/ru/reset-password/layout.tsx
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Сброс пароля | Onerinn',
  description: 'Обновите пароль вашей учётной записи Onerinn.',
};

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  // 不包任何额外容器，保持父级 /ru/layout.tsx 的垂直居中与背景逻辑
  return children;
}
