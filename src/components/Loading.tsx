'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <img
        src="/logo.png"
        alt="Onerinn Logo"
        className="w-60 h-60 animate-pulse transition-transform duration-700 ease-in-out"
      />

      {/* 标题与副标题：黑色、同一字号、同一字体粗细 */}
      <h1 className="mt-3 text-3xl font-medium text-black animate-fade-in">
        Onerinn
      </h1>
      <p className="mt-2 text-3xl font-medium text-black animate-fade-in">
        loading your creative universe...
      </p>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1.2s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
