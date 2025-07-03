'use client';

import withLoading from '@/components/withLoading';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function ChinesePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <Navbar />
        <h1 className="text-4xl font-bold mb-8">欢迎来到 Onerinn！</h1>
        <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
          开启电子产品租赁与艺术品展示的奇妙旅程!
        </p>
      </main>
      <Footer />
    </div>
  );
}

export default withLoading(ChinesePage);
