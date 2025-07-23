import React from 'react'; // ✅ 必须添加
import Navbar from './Navbar';
import Footer from './Footer';
import BackgroundLogo from './BackgroundLogo';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-[calc(100vh-1px)] overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}