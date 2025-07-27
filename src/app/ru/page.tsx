'use client';

import { usePathname } from 'next/navigation';
import { MagnifyingGlassIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import BackgroundLogo from '@/components/BackgroundLogo';
import AdCarousel from '@/components/AdCarousel';

export default function RussianHomePage() {
  const pathname = usePathname();
  const isHomePage = pathname === '/ru';

  return (
<<<<<<< HEAD
    <div className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
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
=======
    <main>
      {/* 欢迎语与搜索框区域（只在首页显示） */}
      {isHomePage && (
        <div className="relative flex flex-col items-center text-center min-h-[70vh] overflow-hidden mb-2">
          {/* 背景图 */}
          <BackgroundLogo />

          {/* 内容区域上移 */}
          <div className="mt-[6vh] px-4 flex flex-col items-center">
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

            {/* 保留副标题但改用主标题样式 */}
            <p className="text-xl md:text-2xl font-bold mt-6 mb-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-transparent bg-clip-text">
              Удивительное путешествие в мир аренды электроники и выставок искусства!
            </p>
          </div>
>>>>>>> 3a7237c (最新更新，比如首页完成、轮播图等)
        </div>
      )}

<<<<<<< HEAD
        {/* 欢迎语 */}
        <h1 className="text-xl md:text-2xl font-bold mt-6 mb-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-transparent bg-clip-text">
          Добро пожаловать в Onerinn!
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Удивительное путешествие в мир аренды электроники и выставок искусства!
        </p>
      </div>
    </div>
=======
      {/* 广告轮播区（首页和其他页面都可以保留） */}
      <AdCarousel />
    </main>
>>>>>>> 3a7237c (最新更新，比如首页完成、轮播图等)
  );
}