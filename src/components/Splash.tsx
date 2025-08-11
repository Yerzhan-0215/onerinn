'use client';

export default function Splash() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
      {/* 背景淡水印（可选） */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center select-none">
        <span className="text-[22rem] leading-none font-semibold text-cyan-300/40">
          Ö
        </span>
      </div>

      {/* 中心文案 */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-semibold tracking-wide">Önerinn</h1>
        <p className="mt-2 text-gray-500">Loading the universe…</p>

        {/* 小圆圈 spinner */}
        <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    </div>
  );
}
