'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import UserMenu from './UserMenu';
import { AppDownloadButton } from '@/components/AppDownloadButton'; // ✅ 新增引入

const labels = {
  ru: {
    home: 'Главная',
    artworks: 'Произведения',
    rentals: 'Аренда',
    install: 'Установить приложение',
    faq: 'Часто задаваемые вопросы',
    register: 'Зарегистрироваться',
    login: 'Войти',
    logout: 'Выйти',
    profile: 'Профиль',
    edit: 'Редактировать',
    getApp: 'Скачать приложение',
    dashboard: 'Кабинет',
    about: 'О нас',
  },
  kk: {
    home: 'Басты бет',
    artworks: 'Өнер туындылары',
    rentals: 'Жалдау',
    install: 'Қолданбаны орнату',
    faq: 'Жиі қойылатын сұрақтар',
    register: 'Тіркелу',
    login: 'Кіру',
    logout: 'Шығу',
    profile: 'Профиль',
    edit: 'Өзгерту',
    getApp: 'Қолданбаны жүктеу',
    dashboard: 'Dashboard',
    about: 'Біз туралы',
  },
  zh: {
    home: '首页',
    artworks: '艺术品',
    rentals: '租赁',
    install: '安装应用',
    faq: '常见问题',
    register: '注册',
    login: '登录',
    logout: '退出',
    profile: '我的主页',
    edit: '编辑资料',
    getApp: '获取应用',
    dashboard: '控制台',
    about: '关于我们',
  },
  en: {
    home: 'Home',
    artworks: 'Artworks',
    rentals: 'Rentals',
    install: 'Install App',
    faq: 'FAQ',
    register: 'Register',
    login: 'Login',
    logout: 'Logout',
    profile: 'My Profile',
    edit: 'Edit Profile',
    getApp: 'Get App',
    dashboard: 'Dashboard',
    about: 'About us',
  },
};

type MeUser = {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  if (!pathname) return null;

  const lang =
    pathname.startsWith('/ru') ? 'ru' :
    pathname.startsWith('/kk') ? 'kk' :
    pathname.startsWith('/zh') ? 'zh' : 'en';

  const prefix = lang === 'en' ? '' : `/${lang}`;
  const t = labels[lang as keyof typeof labels];

  const [user, setUser] = useState<MeUser | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const navRef = useRef<HTMLDivElement>(null);

  // —— Header 高度注入 CSS 变量（保持原功能）——
  useEffect(() => {
    const updateHeaderVar = () => {
      const h = navRef.current?.offsetHeight;
      if (h) document.documentElement.style.setProperty('--site-header-h', `${h}px`);
    };
    updateHeaderVar();

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateHeaderVar)
        : null;

    if (ro && navRef.current) ro.observe(navRef.current);

    window.addEventListener('resize', updateHeaderVar);
    return () => {
      window.removeEventListener('resize', updateHeaderVar);
      ro?.disconnect();
    };
  }, [pathname]);

  // —— 读取登录态（保持原样）——
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!mounted) return;
        setUser(res.ok ? (await res.json()).user ?? null : null);
      } catch {
        setUser(null);
      }
    })();
    return () => { mounted = false; };
  }, [pathname]);

  // —— 语言菜单点击外部关闭 —— 
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAuthPage = /^\/(ru|kk|zh|en)?\/?(login|register|forgot-password|reset-password)\/?$/.test(pathname);
  const showAvatar = !!user && !isAuthPage;
  const isDashboard = /^\/(ru|kk|zh|en)?\/dashboard(\/|$)/.test(pathname);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', cache: 'no-store' });
    } catch {}
    setUser(null);
    const target = prefix || '/';
    router.replace(target);
    window.location.assign(target);
  };

  const changeLang = (targetLang: string) => {
    const newPath = pathname.replace(/^\/(ru|kk|zh|en)/, '').replace(/^\//, '');
    const target = targetLang === 'en' ? '/' : `/${targetLang}`;
    router.push(`${target}${newPath ? '/' + newPath : ''}`);
    setShowLangMenu(false);
  };

  return (
    <nav
      ref={navRef}
      className="relative z-[60] w-full overflow-visible bg-white/30 px-6 py-3 text-black shadow-sm backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* 左侧：Logo + 下载 App 按钮 */}
        <div className="flex items-center space-x-4">
          
          {/* Logo (保持原样) */}
          <div className="relative group/brand">
            <Link
              href={`${prefix || '/'}`}
              className="inline-flex items-center outline-none focus:outline-none no-underline"
              aria-label={t.home}
            >
              <img
                src="/images/onerinn-logo.png"
                alt="Onerinn Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* 原 tooltip 保持不变 */}
            <div
              role="tooltip"
              className="
                pointer-events-none absolute left-0 top-full mt-1
                z-[60] opacity-0 translate-y-1
                transition duration-150 ease-out
                group-hover/brand:opacity-100 group-hover/brand:translate-y-0
              "
            >
              <div className="rounded bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-lg ring-1 ring-black/10 whitespace-nowrap">
                {t.home}
              </div>
            </div>
          </div>

          {/* 🔥 替换旧 hover QR —— 用中心弹窗版按钮 */}
          <AppDownloadButton label={t.getApp} />

        </div>

        {/* —— 中间导航 —— */}
        <div className="flex flex-1 justify-center space-x-6">
          <Link href={`${prefix}/artworks`} className="text-sm text-gray-600 hover:text-black">
            {t.artworks}
          </Link>

          <Link href={`${prefix}/rentals`} className="text-sm text-gray-600 hover:text-black">
            {t.rentals}
          </Link>

          <Link href={`${prefix}/about`} className="text-sm text-gray-600 hover:text-black">
            {t.about}
          </Link>

          <Link href={`${prefix}/faq`} className="text-sm text-gray-600 hover:text-black">
            {t.faq}
          </Link>

          {showAvatar && (
            <Link
              href={`${prefix}/dashboard`}
              className={`text-sm ${
                isDashboard ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'
              }`}
            >
              {t.dashboard}
            </Link>
          )}
        </div>

        {/* —— 右侧：用户头像 + 语言切换 —— */}
        <div className="flex items-center space-x-4 text-sm">
          {showAvatar ? (
            <UserMenu
              user={{
                name: user?.username || user?.email || 'User',
                avatarUrl: user?.avatarUrl ?? undefined,
              }}
              prefix={prefix}
              labels={{ profile: t.profile, edit: t.edit, logout: t.logout }}
              onLogout={handleLogout}
            />
          ) : (
            <>
              <Link href={`${prefix}/register`} className="font-medium text-gray-600 hover:text-black">
                {t.register}
              </Link>
              <Link
                href={`${prefix}/login`}
                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 font-semibold text-black transition hover:bg-gray-100"
              >
                {t.login}
              </Link>
            </>
          )}

          {/* —— 语言菜单 —— */}
          <div className="relative" ref={langMenuRef}>
            <button
              className="
                inline-flex items-center justify-center rounded-full
                bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-black/5
                hover:bg-gray-50 cursor-pointer
              "
              onClick={() => setShowLangMenu((v) => !v)}
              aria-label="Change language"
              aria-haspopup="menu"
              aria-expanded={showLangMenu}
              type="button"
            >
              <GlobeAltIcon className="h-5 w-5 text-gray-600" />
            </button>

            {showLangMenu && (
              <div
                className="
                  absolute right-0 z-50 mt-2 w-fit min-w-[6.5rem]
                  rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5
                "
                role="menu"
              >
                {[{ code: 'kk', label: 'Қазақша' },
                  { code: 'ru', label: 'Русский' },
                  { code: 'en', label: 'English' },
                  { code: 'zh', label: '中文' }
                ].map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => changeLang(opt.code)}
                    className="
                      mt-1 block w-full rounded-lg px-3 py-2 text-center text-sm
                      whitespace-nowrap hover:bg-gray-100 first:mt-0 cursor-pointer
                    "
                    role="menuitem"
                    type="button"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}
