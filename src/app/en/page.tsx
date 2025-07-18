'use client';

import withLoading from '@/components/withLoading';

function EnglishPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Onerinn!</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
       Embark on a Fantastic Journey of Electronics Rental & Art Exhibitions!
      </p>
    </main>
  );
}

export default withLoading(EnglishPage);
