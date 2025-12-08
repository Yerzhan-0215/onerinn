// src/components/Splash.tsx
'use client';

export default function Splash() {
  return (
    <div
      className="
        fixed inset-0 z-[70]
        flex items-center justify-center
        bg-[var(--background)]
        text-[var(--foreground)]
        overflow-hidden
      "
    >
      {/* 背景淡水印（可选） */}
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

        {/* 新的副标题 + 渐变颜色 + 更大字号 */}
        <p
          className="
            mt-4 text-2xl md:text-4xl font-bold leading-tight
            bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500
            bg-clip-text text-transparent
          "
        >
          Loading your creative universe...
        </p>

        {/* 小圆圈 spinner */}
        <div className="mx-auto mt-6 h-10 w-10 md:h-12 md:w-12 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
      </div>
    </div>
  );
}
