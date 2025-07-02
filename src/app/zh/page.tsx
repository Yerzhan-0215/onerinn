'use client';
import withLoading from '@/components/withLoading';
import Navbar from '@/components/Navbar';

function ChinesePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <Navbar />
            <h1 className="text-4xl font-bold mb-4">欢迎来到 Onerinn！</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
        向可信赖的本地艺术家和合作伙伴租赁电子产品与原创艺术品。
      </p>
    </main>
  );
}

export default withLoading(ChinesePage);
