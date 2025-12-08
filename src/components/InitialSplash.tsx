// src/components/InitialSplash.tsx
'use client';

import { useEffect, useState } from 'react';

export default function InitialSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 给页面一点时间完成布局 / 字体 / 滚动条等的稳定
    const timer = setTimeout(() => {
      setVisible(false);
    }, 800); // 你可以改成 600/1000ms，看手感

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="
        fixed inset-0 z-[70]
        flex items-center justify-center
        bg-slate-950/90
        px-4
        text-center
        overflow-hidden
        pointer-events-none
      "
    >
      {/* 背景淡水印（Ö） */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center select-none">
        <span className="text-[22rem] leading-none font-semibold text-cyan-300/40">
          Ö
        </span>
      </div>

      {/* 中心文案 */}
      <div className="relative z-10 text-center px-4">
        <h1
          className="
            text-5xl md:text-6xl font-extrabold tracking-wide 
            bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 
            bg-clip-text text-transparent
          "
        >
          Önerinn
        </h1>

        <p
          className="
            mt-4 text-2xl md:text-4xl font-bold leading-tight
            bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500
            bg-clip-text text-transparent
          "
        >
          Onerinn · loading your creative universe…
        </p>

        {/* 小圆圈 spinner */}
        <div className="mx-auto mt-6 h-10 w-10 md:h-12 md:w-12 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
      </div>
    </div>
  );
}
