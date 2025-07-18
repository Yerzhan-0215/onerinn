'use client';

import withLoading from '@/components/withLoading';

function ChinesePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">欢迎来到 Onerinn！</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
        开启电子产品租赁与艺术品展示的奇妙旅程！
      </p>
    </main>
  );
}

export default withLoading(ChinesePage);
