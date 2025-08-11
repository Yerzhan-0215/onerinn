'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GlobeAltIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 读取当前登录用户
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    })();
    return () => { mounted = false; };
  }, [pathname]); // 路由变化时刷新一次

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    router.push(prefix || '/');
  };

  const changeLang = (targetLang: string) => {
    const newPath = pathname.replace(/^\/(ru|kk|zh)/, '').replace(/^\//, '');
    const target = targetLang === 'en' ? '/' : `/${targetLang}`;
    router.push(`${target}${newPath ? '/' + newPath : ''}`);
    setShowLangMenu(false);
  };

  return (
    <nav className="w-full bg-white/30 backdrop-blur-sm text-black px-6 py-3 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* 左侧：Logo + 下载 App */}
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Link href={`${prefix || '/'}`} className="outline-none focus:outline-none">
              <img
                src="/images/onerinn-logo.png"
                alt="Onerinn Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <div className="absolute left-0 top-full mt-1 hidden group-hover:block">
              <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded shadow pointer-events-none">
                {t.home}
              </div>
            </div>
          </div>

          <div className="relative group cursor-pointer">
            <div className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black">
              <DevicePhoneMobileIcon className="h-5 w-5" />
              <span>{t.getApp}</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-50">
              <div className="w-[130px] h-[130px] bg-white border border-gray-300 shadow-md p-2 rounded-md">
                <img
                  src="/images/onerinn-qr.png"
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 中间导航链接 */}
        <div className="flex space-x-6 justify-center flex-1">
          <Link href={`${prefix}/artworks`} className="text-sm text-gray-600 hover:text-black">
            {t.artworks}
          </Link>
          <Link href={`${prefix}/rentals`} className="text-sm text-gray-600 hover:text-black">
            {t.rentals}
          </Link>
          <Link href={`${prefix}/faq`} className="text-sm text-gray-600 hover:text-black">
            {t.faq}
          </Link>
        </div>

        {/* 右侧：登录态 / 未登录态 + 语言切换 */}
        <div className="flex items-center space-x-4 text-sm">
          {user ? (
            // ✅ 已登录：显示头像，悬停显示用户名，点击展开菜单
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(v => !v)}
                className="flex items-center"
                title={user.username || user.email || 'User'} // 悬停显示用户名
              >
                <Avatar
                  name={user.username || user.email || 'User'}
                  src={user.avatarUrl ?? undefined}
                  size={32}
                  className="hover:opacity-90 transition"
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="px-4 py-2 text-xs text-gray-500 truncate">
                    {user.username || user.email || 'User'}
                  </div>
                  <button
                    onClick={() => { setShowDropdown(false); router.push(`${prefix}/profile`); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {t.profile}
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); router.push(`${prefix}/profile/edit`); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 未登录：注册 / 登录
            <>
              <Link
                href={`${lang === 'en' ? '' : '/' + lang}/register`}
                className="text-gray-600 hover:text-black font-medium"
              >
                {t.register}
              </Link>
              <Link
                href={`${lang === 'en' ? '' : '/' + lang}/login`}
                className="bg-white text-black px-4 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 transition font-semibold"
              >
                {t.login}
              </Link>
            </>
          )}

          {/* 语言切换器 */}
          <div className="relative" ref={langMenuRef}>
            <GlobeAltIcon
              className="h-5 w-5 text-gray-500 hover:text-black cursor-pointer"
              onClick={() => setShowLangMenu(!showLangMenu)}
            />
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                <button onClick={() => changeLang('kk')} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                  Қазақша
                </button>
                <button onClick={() => changeLang('ru')} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                  Русский
                </button>
                <button onClick={() => changeLang('en')} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                  English
                </button>
                <button onClick={() => changeLang('zh')} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                  中文
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
