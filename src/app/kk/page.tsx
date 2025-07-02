'use client';
import withLoading from '@/components/withLoading';
import Navbar from '@/components/Navbar';

function KazakhPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <Navbar />
      
            <h1 className="text-4xl font-bold mb-4">Onerinn-ге қош келдіңіз!</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
        Сенімді әріптестер мен суретшілерден электронды құрылғылар мен өнер туындыларын жалға алыңыз.
      </p>
    </main>
  );
}

export default withLoading(KazakhPage);
