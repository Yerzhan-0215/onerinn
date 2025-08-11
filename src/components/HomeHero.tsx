// src/components/HomeHero.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import BackgroundLogo from '@/components/BackgroundLogo';
import { MagnifyingGlassIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

export default function HomeHero() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const [q, setQ] = useState('');
  const [hideTitle, setHideTitle] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 5 秒后隐藏标题，并让副标题上移
  useEffect(() => {
    const timer = setTimeout(() => setHideTitle(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 根据当前界面语言映射语音识别语言
  const speechLang = useMemo(() => {
    switch (locale) {
      case 'ru': return 'ru-RU';
      case 'kk': return 'kk-KZ';
      case 'zh': return 'zh-CN';
      default:   return 'en-US';
    }
  }, [locale]);

  // 卸载时停止识别（防泄漏）
  useEffect(() => {
    return () => { try { recognitionRef.current?.stop?.(); } catch {} };
  }, []);

  // 点击麦克风：启动/停止语音识别
  const handleMicClick = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('你的浏览器不支持语音识别，请使用最新版本的 Chrome（或在 localhost/HTTPS 环境）。');
      return;
    }
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      if (transcript) setQ(transcript);
    };
    recognition.onerror = () => {};
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <section className="relative overflow-hidden">
      {/* 背景淡水印 */}
      <BackgroundLogo />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* 顶部搜索框 */}
        <div className="mx-auto mt-10 w-full max-w-2xl">
          <div className="flex items-center rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm shadow-sm">
            {/* 放大镜 + 自定义白底 Tooltip */}
            <div className="ml-3 relative group">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
              <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-white text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {locale === 'ru' ? 'Поиск' : locale === 'kk' ? 'Іздеу' : locale === 'zh' ? '搜索' : 'Search'}
              </span>
            </div>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPlaceholder', { defaultValue: 'Search…' })}
              className="flex-1 bg-transparent px-3 py-3 outline-none placeholder:text-gray-400"
              aria-label={t('searchPlaceholder', { defaultValue: 'Search' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // TODO: 触发搜索
                  // router.push(`/search?q=${encodeURIComponent(q)}`);
                }
              }}
            />

            {/* 麦克风 + 自定义白底 Tooltip（替代原生 title） */}
            <div className="mr-2 relative group">
              <button
                type="button"
                aria-label={listening
                  ? (locale === 'ru' ? 'Остановить запись' : locale === 'kk' ? 'Тыңдауды тоқтату' : locale === 'zh' ? '停止录音' : 'Stop recording')
                  : (locale === 'ru' ? 'Говорите' : locale === 'kk' ? 'Айтыңыз' : locale === 'zh' ? '开始说话' : 'Click to speak')}
                onClick={handleMicClick}
                className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-100 transition"
              >
                <MicrophoneIcon
                  className={`h-5 w-5 ${listening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-black'}`}
                />
              </button>
              <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-white text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {listening
                  ? (locale === 'ru' ? 'Остановить' : locale === 'kk' ? 'Тоқтату' : locale === 'zh' ? '停止' : 'Stop')
                  : (locale === 'ru' ? 'Нажмите и говорите' : locale === 'kk' ? 'Басын басып сөйлеңіз' : locale === 'zh' ? '点击开始说话' : 'Click to speak')}
              </span>
            </div>
          </div>

          {/* 录音状态提示（可选） */}
          {listening && (
            <div className="mt-2 text-center text-xs text-gray-500">
              {locale === 'ru' ? 'Слушаю…' : locale === 'kk' ? 'Тыңдап тұрмын…' : locale === 'zh' ? '正在聆听…' : 'Listening…'}
            </div>
          )}
        </div>

        {/* 欢迎标题 & 副标题（科幻渐变 + 动画） */}
        <div className="mt-6 text-center select-none">
          <h1
            className={[
              'text-3xl sm:text-4xl font-bold',
              'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500',
              'bg-clip-text text-transparent drop-shadow-md',
              'transition-opacity duration-1000',
              hideTitle ? 'opacity-0' : 'opacity-100'
            ].join(' ')}
          >
            {t('welcomeTitle', { defaultValue: 'Welcome to Onerinn!' })}
          </h1>

          <p
            className={[
              'mt-3 text-lg sm:text-xl',
              'bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-500',
              'bg-clip-text text-transparent drop-shadow-sm',
              // 如果你在 globals.css 添加了 animate-gradient-flow，这里取消注释即可开启动画
              // 'animate-gradient-flow',
              'transition-all duration-1000 ease-in-out',
              hideTitle ? '-translate-y-2 sm:-translate-y-3' : 'translate-y-0'
            ].join(' ')}
          >
            {t('welcomeSubtitle', { defaultValue: 'Explore artworks and rentals.' })}
          </p>
        </div>

        {/* 预留底部空间，避免出现垂直滚动条 */}
        <div className="h-14 sm:h-20" />
      </div>
    </section>
  );
}
