'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';

type AdTag = 'hot' | 'new' | 'limited';

interface AdItem {
  id: number;
  title: string;
  description: string;
  image: string;
  tag?: AdTag;
  endTime?: string;
  cta?: {
    text: string;
    url: string;
  };
}

function Countdown({ endTime }: { endTime: string }) {
  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      expired: false
    };
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (timeLeft.expired) {
    return <p className="text-xs text-red-500 mt-1">⏳ Время истекло</p>;
  }

  return (
    <p className="text-xs text-amber-600 mt-1">
      ⏳ Осталось: {timeLeft.days}д {timeLeft.hours}ч {timeLeft.minutes}м
    </p>
  );
}

function TagBadge({ tag }: { tag: AdTag }) {
  const tagConfig = {
    hot: { text: '🔥 Хит', color: 'bg-red-500' },
    new: { text: '🆕 Новинка', color: 'bg-green-500' },
    limited: { text: '⏳ Ограничено', color: 'bg-purple-500' }
  };

  return (
    <span className={`text-xs text-white px-2 py-0.5 rounded-full ${tagConfig[tag].color}`}>
      {tagConfig[tag].text}
    </span>
  );
}

export default function AdCarousel() {
  const ads = useMemo<AdItem[]>(() => [
    {
      id: 1,
      title: 'iPhone 14 Pro',
      description: 'Аренда от 2000₸/день. Последняя модель с динамическим островом.',
      image: '/images/ads/iphone.jpg',
      tag: 'hot',
      endTime: '2025-08-01T00:00:00',
      cta: {
        text: 'Арендовать сейчас',
        url: '/devices/iphone-14-pro'
      }
    },
    {
      id: 2,
      title: 'Картина: Туманы Алматы',
      description: 'Прекрасное дополнение к интерьеру от местного художника.',
      image: '/images/ads/art.jpg',
      tag: 'new'
    },
    {
      id: 3,
      title: 'PlayStation 5 + 10 игр',
      description: 'Играйте без ограничений. В комплекте 10 популярных игр.',
      image: '/images/ads/ps5.jpg',
      tag: 'limited',
      endTime: '2025-07-15T00:00:00'
    },
    {
      id: 4,
      title: 'Фотостудия в аренду',
      description: 'Профессиональное оборудование и свет. Почасовая оплата.',
      image: '/images/ads/studio.jpg'
    }
  ], []);

  const swiperConfig = {
    modules: [Navigation, Pagination, Autoplay],
    spaceBetween: 24,
    slidesPerView: 1,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      clickable: true,
      dynamicBullets: true
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    loop: true,
    breakpoints: {
      768: {
        slidesPerView: 2
      },
      1024: {
        slidesPerView: 3
      }
    }
  };

  return (
    <section className="w-full bg-gray-50 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Специальные предложения</h2>

        <div className="relative">
          <Swiper {...swiperConfig} className="overflow-hidden">
            {ads.map((ad) => (
              <SwiperSlide key={ad.id} className="!h-full">
                <div className="h-full bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <div className="w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={ad.image}
                      alt={ad.title}
                      width={400}
                      height={240}
                      className="w-full h-[240px] object-cover"
                      priority={ad.id === 1}
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ad.tag && <TagBadge tag={ad.tag} />}
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-1">{ad.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 flex-grow">{ad.description}</p>

                    {ad.endTime && <Countdown endTime={ad.endTime} />}

                    {ad.cta && (
                      <a
                        href={ad.cta.url}
                        className="mt-4 inline-block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        {ad.cta.text}
                      </a>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="swiper-button-next !text-blue-600 !right-0 after:!text-xl"></div>
          <div className="swiper-button-prev !text-blue-600 !left-0 after:!text-xl"></div>
        </div>
      </div>
    </section>
  );
}
