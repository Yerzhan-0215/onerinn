import Image from 'next/image';

export default function BackgroundLogo() {
  return (
    <div className="fixed inset-0 -z-10 flex items-center justify-center pointer-events-none">
      <Image
        src="/images/onerinn-logo.png"
        alt="Onerinn Logo"
        width={600} // 调小一点以避免撑出滚动条
        height={600}
        className="select-none opacity-10 animate-fade-zoom-in"
        priority
      />
    </div>
  );
}