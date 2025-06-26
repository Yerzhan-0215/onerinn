// src/app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Onerinn',
  description: 'Art & Rental Platform',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Onerinn</h1>
          <nav className="space-x-4">
            <a href="/" className="text-gray-600 hover:text-black">Home</a>
            <a href="/artworks" className="text-gray-600 hover:text-black">Artworks</a>
            <a href="/rentals" className="text-gray-600 hover:text-black">Rentals</a>
            <a href="/about" className="text-gray-600 hover:text-black">About</a>
          </nav>
        </header>
        <main className="p-4">{children}</main>
        <footer className="text-center text-sm text-gray-500 p-4 border-t mt-8">
          © 2025 Onerinn. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
