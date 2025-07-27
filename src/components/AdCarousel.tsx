'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type AdItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  tag?: 'hot' | 'new';
  endTime?: string;
  link?: string; // 点击跳转链接
};

const allAds: AdItem[] = [
  {
    id: 1,
    title: 'iPhone 14 Pro',
    description: 'Аренда от 2000₸/день',
    image: '/images/ads/iphone.jpg',
    tag: 'hot',
    endTime: '2025-08-01T00:00:00',
    link: '/rentals/1',
  },
  {
    id: 2,
    title: 'Картина: Туманы Алматы',
    description: 'Прекрасное дополнение к интерьеру',
    image: '/images/ads/art.jpg',
    tag: 'new',
    link: '/artworks/2',
  },
  {
    id: 3,
    title: 'PlayStation 5',
    description: 'Играйте без ограничений',
    image: '/images/ads/ps5.jpg',
    link: '/rentals/3',
  },
  {
    id: 4,
    title: 'MacBook Pro M2',
    description: 'Для работы и творчества',
    image: '/images/ads/macbook.jpg',
    tag: 'new',
    link: '/rentals/4',
  },
  {
    id: 5,
    title: 'Картина: Оживший Восток',
    description: 'Традиции и краски',
    image: '/images/ads/art2.jpg',
    tag: 'hot',
    link: '/artworks/5',
  },
  {
    id: 6,
    title: 'GoPro Hero 11',
    description: 'Снимай каждый момент',
    image: '/images/ads/gopro.jpg',
    link: '/rentals/6',
  },
  {
    id: 7,
    title: 'Картина: Древо жизни',
    description: 'Символ силы и роста',
    image: '/images/ads/art3.jpg',
    link: '/artworks/7',
  },
  {
    id: 8,
    title: 'AirPods Pro 2',
    description: 'Чистый звук и тишина',
    image: '/images/ads/airpods.jpg',
    link: '/rentals/8',
  },
  {
    id: 9,
    title: 'iPad Pro 12.9"',
    description: 'Идеально для дизайна и чтения',
    image: '/images/ads/ipad.jpg',
    tag: 'new',
    link: '/rentals/9',
  },
  {
    id: 10,
    title: 'Картина: Горы Казахстана',
    description: 'Мир и вдохновение',
    image: '/images/ads/art4.jpg',
    tag: 'hot',
    link: '/artworks/10',
  },
];

function Countdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('0д 0ч 0м');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}д ${hours}ч ${minutes}м`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [endTime]);

  return <p className="text-sm text-gray-600 mt-1">⏳ Осталось: {timeLeft}</p>;
}

export default function AdCarousel() {
  const [adsToShow, setAdsToShow] = useState<AdItem[]>([]);
  const [batchIndex, setBatchIndex] = useState(0);

  useEffect(() => {
    const batchSize = 10;
    const intervalTime = 4000 * 10 * 2; // 每张广告展示4秒 × 10个 × 2轮

    const updateBatch = () => {
      const start = (batchIndex * batchSize) % allAds.length;
      const nextAds = allAds.slice(start, start + batchSize);
      setAdsToShow(nextAds);
      setBatchIndex((prev) => (prev + 1) % Math.ceil(allAds.length / batchSize));
    };

    updateBatch();
    const timer = setInterval(updateBatch, intervalTime);
    return () => clearInterval(timer);
  }, [batchIndex]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
      >
        {adsToShow.map((ad) => (
          <SwiperSlide key={ad.id}>
            <Link href={ad.link || '#'}>
              <div className="relative bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition">
                <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                  <Image
                    src={ad.image}
                    alt={ad.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-4 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 mb-2">
                    {ad.tag === 'hot' && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">🔥 Хит</span>
                    )}
                    {ad.tag === 'new' && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">🆕 Новинка</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{ad.title}</h3>
                  <p className="text-sm text-gray-600">{ad.description}</p>
                  {ad.endTime && <Countdown endTime={ad.endTime} />}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
