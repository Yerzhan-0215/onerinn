'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { defaultLocale } from '@/i18n'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/${defaultLocale}`)
    }, 2000) // 2秒后跳转
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center">
      {/* Logo */}
      <h1 className="text-5xl font-bold text-black opacity-0 animate-fade-in-scale">
        Onerinn
      </h1>

      {/* Slogan */}
      <p className="text-lg text-gray-600 mt-4 opacity-0 animate-fade-in-delay">
        Loading your creative universe...
      </p>

      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-scale {
          animation: fadeInScale 1s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fadeInScale 1s ease-out forwards;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}
