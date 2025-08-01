'use client'; 

import GetAppButton from './GetAppButton';

export default function HomeHero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4 pt-20">
      {/* 顶部行：Önerinn + Get App */}
      <div className="flex items-center space-x-6 mb-10">
        <button className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Önerinn
        </button>
        <GetAppButton />
      </div>

      {/* 欢迎语 */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
        Добро пожаловать в Onerinn!
      </h1>

      {/* 子标题或简短说明 */}
      <p className="text-gray-600 text-sm md:text-base max-w-md">
        Платформа для аренды электроники и покупки произведений искусства.
        Удобно, просто и быстро!
      </p>
    </section>
  );
}


