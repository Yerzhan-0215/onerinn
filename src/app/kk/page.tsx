'use client';

import BackgroundLogo from '@/components/BackgroundLogo';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-1px)] overflow-x-hidden">
      {/* 背景动画 Logo */}
      <BackgroundLogo />

      {/* 欢迎语部分 */}
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold">欢迎来到 Onerinn！</h1>
        <p className="text-lg mt-2">开启电子产品租赁与艺术品展示的奇妙旅程！</p>
      </div>

      {/* 搜索框：设置与导航栏的垂直间距 */}
      <div className="mt-6 sm:mt-10 md:mt-16 lg:mt-24 xl:mt-32">
        <input
          type="text"
          className="p-3 w-80 max-w-full rounded-lg shadow-md border"
          placeholder="搜索你感兴趣的商品或艺术品..."
        />
      </div>
    </div>
  );
}