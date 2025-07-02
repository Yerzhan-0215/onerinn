'use client';
import withLoading from '@/components/withLoading';
import Navbar from '@/components/Navbar';

function EnglishPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <Navbar />
            <h1 className="text-4xl font-bold mb-8">Welcome to Onerinn!</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
        Discover and rent electronic devices and original artworks from trusted local artists and partners.
      </p>
    </main>
  );
}

export default withLoading(EnglishPage);
