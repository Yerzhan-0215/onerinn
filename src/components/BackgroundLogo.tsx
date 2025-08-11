import Image from 'next/image';
import background from '/public/images/onerinn-background.png';

const BackgroundLogo = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 overflow-hidden z-0 pointer-events-none">
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
