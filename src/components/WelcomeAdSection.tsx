'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function WelcomeAdSection() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [startAds, setStartAds] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setStartAds(true);
    }, 6000); // 6秒后开始广告

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-64 md:h-80 flex flex-col justify-center items-center overflow-hidden">
      {/* 欢迎语部分 */}
      <h1
        className={clsx(
          'text-3xl md:text-5xl font-bold transition-opacity duration-1000',
          showWelcome ? 'opacity-100' : 'opacity-0'
        )}
      >
        Добро пожаловать в Onerinn!
      </h1>

      <p
        className={clsx(
          'text-lg md:text-2xl mt-4 transition-all duration-1000',
          showWelcome ? 'opacity-100 translate-y-0' : 'opacity-100 -translate-y-10'
        )}
      >
        Удивительное путешествие в мир аренды электроники и выставок искусства!
      </p>

      {/* 广告区域 */}
      {startAds && (
        <div className="absolute bottom-0 w-full overflow-hidden">
          <div className="flex animate-scroll-x space-x-4 px-4 py-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[180px] h-24 bg-gray-200 rounded-md shadow-md flex items-center justify-center text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
              >
                📢 Реклама {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* 在 tailwind.config.ts 中添加动画 */
// module.exports = {
//   theme: {
//     extend: {
//       animation: {
//         'scroll-x': 'scrollX 20s linear infinite',
//       },
//       keyframes: {
//         scrollX: {
//           '0%': { transform: 'translateX(0)' },
//           '100%': { transform: 'translateX(-100%)' },
//         },
//       },
//     },
//   },
// }
