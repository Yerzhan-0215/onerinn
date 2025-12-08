// src/components/SiteShell.tsx
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget'; // ✅ 新增：全站聊天按钮

type Props = {
  children: ReactNode;
};

export default function SiteShell({ children }: Props) {
  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      {/* 🔵 固定在顶部的 Onerinn 主导航 */}
      <header className="fixed inset-x-0 top-0 z-40 h-[var(--site-header-h)]">
        <Navbar />
      </header>

      {/* 🔵 中间内容：预留出 header 和 footer 的高度 */}
      <main
        className="
          min-h-[calc(100dvh-var(--site-header-h,64px)-var(--site-footer-h,56px))]
          pt-[var(--site-header-h)]
          pb-[var(--site-footer-h)]
          flex flex-col
        "
      >
        {children}
      </main>

      {/* 🔵 固定在底部的 Onerinn 底部版权信息 */}
      <footer className="fixed inset-x-0 bottom-0 z-30 h-[var(--site-footer-h)]">
        <Footer />
      </footer>

      {/* 💬 新增：Onerinn 全站聊天小按钮 */}
      <ChatWidget />
    </div>
  );
}
