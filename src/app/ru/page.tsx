'use client';

import { MagnifyingGlassIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import BackgroundLogo from '@/components/BackgroundLogo';

export default function RussianHomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative">
      <BackgroundLogo />

      {/* 主体内容：垂直偏上约 1/3 */}
      <main className="flex-grow flex flex-col items-center text-center px-4 pt-[20vh]">
        {/* 搜索框 */}
        <div className="w-full max-w-xl flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white bg-opacity-80 backdrop-blur-md">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Поиск: электронные устройства или произведения"
            className="flex-grow outline-none text-gray-800 placeholder-gray-500 bg-transparent"
          />
          <MicrophoneIcon className="h-5 w-5 text-gray-500 ml-2" />
        </div>

        {/* 欢迎语 */}
        <h1 className="text-3xl md:text-4xl font-bold mt-6 mb-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-transparent bg-clip-text">
          Добро пожаловать в Onerinn!
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Удивительное путешествие в мир аренды электроники и выставок искусства!
        </p>
      </main>
    </div>
  );
}
