// /src/app/ru/admin/assistant/page.tsx
'use client';

import AdminChatWidget from '@/components/AdminChatWidget';

export default function AdminAssistantPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">Onerinn Builder</h1>
        <p className="mt-1 text-sm text-gray-600">
          Это специальный ассистент для администраторов: помогает с кодом,
          архитектурой, ошибками, Prisma схемами, деплоем и т.д.
        </p>
      </div>

      {/* 复用同一个 UI，只是占满宽度：这里直接让 Widget 常驻展开 */}
      <div className="h-[560px] w-full">
        {/* 简单方式：让浮窗常开（也可以单独做一个 Fullscreen 版本组件） */}
        <div className="relative h-full w-full">
          <div className="absolute inset-0">
            {/* 用一个变种：直接渲染 AdminChatWidget，并默认打开。
               如果你想更精细，可以单独再抽一个 AdminChatPanel 组件。 */}
            <AdminChatWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
