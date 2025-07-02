'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <img
        src="/logo.png"
        alt="Loading..."
        className="w-60 h-60 animate-pulse transition-transform duration-700 ease-in-out transform scale-100"
      />
      <p className="mt-4 text-xl text-gray-600 animate-fade-in">
        Loading Onerinn...
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
