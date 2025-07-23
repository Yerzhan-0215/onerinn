import Image from 'next/image';
import background from '/public/images/onerinn-background.png';

const BackgroundLogo = () => {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-0">
      <Image
        src={background}
        alt="Onerinn Background"
        fill
        style={{ objectFit: 'contain' }}
        className="opacity-10"
        priority
      />
    </div>
  );
};

export default BackgroundLogo;