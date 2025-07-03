'use client';

import withLoading from '@/components/withLoading';
import Navbar from '@/components/Navbar';

function ChinesePage() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <Navbar />
        <h1 className="text-4xl font-bold mb-8">欢迎来到 Onerinn！</h1>
        <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
          开启电子产品租赁与艺术品展示的奇妙旅程！
        </p>
      </main>
      <footer className="text-center text-gray-500 text-sm py-4">
        © {new Date().getFullYear()} Onerinn 版权所有。
      </footer>
    </>
  );
}

export default withLoading(ChinesePage);
