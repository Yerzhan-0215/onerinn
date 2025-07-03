'use client';

import withLoading from '@/components/withLoading';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function EnglishPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar 应该在 main 之外 */}
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-8">Welcome to Onerinn!</h1>
        <p className="text-lg text-gray-600 text-center max-w-xl mt-8">
          Discover and rent electronic devices and original artworks from trusted local artists and partners.
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default withLoading(EnglishPage);
