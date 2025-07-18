'use client';

import Image from 'next/image';
import { Search, Mic } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 背景 LOGO 半透明 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none animate-fade-in">
        <Image
          src="/images/onerinn-logo.png.gif"
          alt="Onerinn Logo Background"
          layout="fill"
          objectFit="contain"
        />
      </div>

      {/* 内容区块（含搜索框与欢迎语） */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-24 md:pt-28 pb-2 px-4 text-center">

        {/* 搜索框区域 */}
        <div className="relative w-full max-w-md mb-8 animate-fade-in">
          <input
            type="text"
            placeholder="Поиск: электронные устройства или произведения искусства"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Mic className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" />
        </div>

        {/* 欢迎语块 */}
        <div className="flex flex-col items-center animate-fade-in mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать в Onerinn!
          </h1>
          <p className="text-md md:text-lg text-gray-700">
            Удивительное путешествие в мир аренды электроники и выставок искусства!
          </p>
        </div>
      </div>

      {/* 页面底部版权信息 */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 text-center text-sm text-gray-500 pb-1">
        © 2025 Onerinn. All rights reserved.
      </footer>
    </div>
  );
}