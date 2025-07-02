'use client';
import withLoading from '@/components/withLoading';
import Navbar from '@/components/Navbar';

function RussianPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <Navbar />
            <h1 className="text-4xl font-bold mb-4">Добро пожаловать в Onerinn!</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl">
        Арендуйте электронные устройства и оригинальные произведения искусства от проверенных художников и партнёров.
      </p>
    </main>
  );
}

export default withLoading(RussianPage);
