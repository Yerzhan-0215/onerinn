// src/app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import RouteFlagger from '@/components/RouteFlagger'; // ✅ 引入现有的 RouteFlagger

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      className="h-full w-full"
      // 保持纵向滚动条稳定（避免布局抖动），并允许需要时出现纵向滚动
      style={{ overflowY: 'auto', scrollbarGutter: 'stable both-edges' }}
      // 防止服务端/客户端细微差异引起的水合告警（例如未来动态注入类名时）
      suppressHydrationWarning
    >
      {/* 统一禁止横向滚动，使用 dvh 提升移动端可视高度准确性 */}
      <body className="min-h-dvh w-full overflow-x-hidden">
        <RouteFlagger />   {/* ✅ 在这里挂上，全局监听路径，自动给 <html> 加 data-route */}
        {children}
      </body>
    </html>
  );
}
