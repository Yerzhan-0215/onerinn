'use client';

import withLoading from '@/components/withLoading';

function KazakhPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Onerinn-ге қош келдіңіз!</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
      Электроника жалға алу мен өнер көрмелерінің таңғажайып әлеміне саяхат!
      </p>
    </main>
  );
}

export default withLoading(KazakhPage);
