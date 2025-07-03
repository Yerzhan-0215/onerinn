'use client';

import withLoading from '@/components/withLoading';
import Navbar from '@/components/Navbar';

function KazakhPage() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <Navbar />
        <h1 className="text-4xl font-bold mb-8">Onerinn-ге қош келдіңіз!</h1>
        <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
          Сенімді серіктестер мен суретшілерден электронды құрылғыларды және түпнұсқа өнер туындыларын жалға алыңыз.
        </p>
      </main>
      <footer className="text-center text-gray-500 text-sm py-4">
        © {new Date().getFullYear()} Onerinn. Барлық құқықтар қорғалған.
      </footer>
    </>
  );
}

export default withLoading(KazakhPage);
