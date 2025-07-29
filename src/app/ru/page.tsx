'use client';

import { MagnifyingGlassIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import BackgroundLogo from '@/components/BackgroundLogo';
import AdCarousel from '@/components/AdCarousel';

export default function Page() {
  return (
    <div className="relative flex flex-col items-center text-center min-h-[85vh] overflow-hidden mb-4">
      {/* 背景图 */}
      <BackgroundLogo />

      {/* 内容区域上移 */}
      <div className="mt-[12vh] px-4 flex flex-col items-center">
        {/* 搜索框 */}
        <div className="w-full max-w-xl flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white/10 backdrop-blur-md">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Поиск: электронные устройства или произведения"
            className="flex-grow outline-none text-gray-800 placeholder-gray-500 bg-transparent"
          />
          <MicrophoneIcon className="h-5 w-5 text-gray-500 ml-2" />
        </div>

        {/* 欢迎语 */}
        <h1 className="text-xl md:text-2xl font-bold mt-6 mb-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-transparent bg-clip-text">
          Добро пожаловать в Onerinn!
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Удивительное путешествие в мир аренды электроники и выставок искусства!
        </p>
      </div>

      {/* 广告轮播区域 */}
      <div className="w-full mt-8">
        <AdCarousel />
      </div>
    </div>
  );
}
