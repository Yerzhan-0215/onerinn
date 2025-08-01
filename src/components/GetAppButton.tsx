'use client';

import { useState } from 'react';
import { FiSmartphone } from 'react-icons/fi';

export default function GetAppButton() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div
      className="relative flex items-center space-x-2 group cursor-pointer"
      onMouseEnter={() => setShowQR(true)}
      onMouseLeave={() => setShowQR(false)}
    >
      {/* 手机图标 */}
      <FiSmartphone className="h-5 w-5 text-gray-600 group-hover:text-black" aria-hidden="true" />

      {/* 下载按钮 */}
      <button
        type="button"
        className="text-sm text-gray-600 hover:text-black transition"
        aria-label="Download App"
      >
        Скачать приложение
      </button>

      {/* 弹出的二维码 */}
      {showQR && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 mt-1 w-32 h-32 bg-white border border-gray-300 shadow-lg p-2 rounded-md z-50">
          <img
            src="/images/qrcode-app.png"
            alt="QR Code"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
