'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DevicePhoneMobileIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type AppDownloadButtonProps = {
  label?: string;
};

export function AppDownloadButton({
  label = 'Скачать приложение',
}: AppDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 只在浏览器端挂载后再使用 document.body 做 portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modal = (
    <div
      className="
        fixed inset-0 z-[80]
        flex items-center justify-center
        bg-black/40
      "
      onClick={() => setOpen(false)} // 点击黑色背景关闭
    >
      <div
        className="
          relative w-full max-w-xs
          rounded-3xl bg-white p-4
          text-center shadow-2xl
        "
        onClick={(e) => e.stopPropagation()} // 阻止点击内容区域冒泡
      >
        {/* 右上角关闭按钮 */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="
            absolute right-3 top-3
            inline-flex h-7 w-7 items-center justify-center
            rounded-full bg-gray-100 text-gray-500
            hover:bg-gray-200
          "
          aria-label="Закрыть"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        {/* QR 图片 */}
        <div className="mt-2 flex justify-center">
          <div className="h-40 w-40 rounded-xl bg-white p-2 shadow-inner">
            <img
              src="/images/onerinn-qr.png"
              alt="QR code Onerinn App"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* 说明文字：增加 “открыть или установить” */}
        <p className="mt-4 text-sm text-gray-700">
          Отсканируйте QR-код камерой телефона,
          чтобы открыть или установить приложение Onerinn.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* 顶部导航里的按钮本体（保持原有风格） */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          inline-flex items-center space-x-1
          rounded-full border border-gray-200
          bg-white/70 px-3 py-1.5
          text-xs font-medium text-gray-700
          shadow-sm backdrop-blur
          hover:bg-white hover:text-black
          cursor-pointer
        "
      >
        <DevicePhoneMobileIcon className="h-4 w-4" />
        <span>{label}</span>
      </button>

      {/* 通过 Portal 把遮罩挂到 body 上，真正全屏居中 */}
      {mounted && open && createPortal(modal, document.body)}
    </>
  );
}
