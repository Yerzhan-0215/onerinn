// /src/components/AdminChatWidget.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEventHandler } from 'react';
import { usePathname } from 'next/navigation';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/solid';

type Role = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

type LangCode = 'ru' | 'kk' | 'zh' | 'en';

const UI_TEXT: Record<
  LangCode,
  {
    title: string;
    placeholder: string;
    send: string;
    typing: string;
    buttonLabel: string;
  }
> = {
  ru: {
    title: 'Onerinn Builder',
    placeholder: 'Спросите про код, базу данных или архитектуру Onerinn…',
    send: 'Отпр.',
    typing: 'Onerinn Builder думает…',
    buttonLabel: 'Открыть чат с Onerinn Builder',
  },
  kk: {
    title: 'Onerinn Builder',
    placeholder: 'Код, база деректер немесе Onerinn архитектурасы туралы сұраңыз…',
    send: 'Жіберу',
    typing: 'Onerinn Builder жауап дайындап жатыр…',
    buttonLabel: 'Onerinn Builder чатын ашу',
  },
  zh: {
    title: 'Onerinn Builder',
    placeholder: '可以问我代码、数据库、Next.js、Prisma 等开发问题…',
    send: '发送',
    typing: 'Onerinn Builder 正在思考…',
    buttonLabel: '打开 Onerinn Builder 助手',
  },
  en: {
    title: 'Onerinn Builder',
    placeholder: 'Ask about code, DB, Next.js, Prisma and Onerinn architecture…',
    send: 'Send',
    typing: 'Onerinn Builder is typing…',
    buttonLabel: 'Open Onerinn Builder chat',
  },
};

function detectLang(pathname: string | null): LangCode {
  if (!pathname) return 'en';
  if (pathname.startsWith('/ru')) return 'ru';
  if (pathname.startsWith('/kk')) return 'kk';
  if (pathname.startsWith('/zh')) return 'zh';
  return 'en';
}

/**
 * ⚠ 使用说明：
 * 只在 Dashboard / Admin 布局里挂载，例如：
 *   <AdminChatWidget />
 * 不要在前台公共页面挂。
 */
export default function AdminChatWidget() {
  const pathname = usePathname();
  const lang = detectLang(pathname);
  const t = UI_TEXT[lang];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 以语言为维度把历史记录拆开存：不同语言各自一份
  const storageKey = useMemo(() => `onerinn_admin_chat_${lang}`, [lang]);

  // 首次加载：从 localStorage 读历史
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // 忽略本地存储错误
    }
  }, [storageKey]);

  // 每次 messages 变化时，写回 localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // 忽略本地存储错误
    }
  }, [messages, storageKey]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const res = await fetch('/api/admin-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 把当前页面上下文也发过去（可选）
          'x-page-context': `${window.location.pathname} | ${document.title || ''}`,
        },
        body: JSON.stringify({
          locale: lang,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error('HTTP_' + res.status);

      const data = await res.json();
      const replyText: string =
        data.reply ||
        (lang === 'ru'
          ? 'Извините, что-то пошло не так.'
          : lang === 'kk'
          ? 'Кешіріңіз, қате шықты.'
          : lang === 'zh'
          ? '抱歉，好像出错了。'
          : 'Sorry, something went wrong.');

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const errText =
        lang === 'ru'
          ? 'Не удалось получить ответ. Попробуйте ещё раз.'
          : lang === 'kk'
          ? 'Жауап алу мүмкін болмады. Қайтадан көріңіз.'
          : lang === 'zh'
          ? '暂时无法获取回复，请稍后重试。'
          : 'Failed to get a reply, please try again later.';
      const botMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: errText,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 悬浮打开按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-4 right-16 z-[80]
          flex items-center justify-center
          w-10 h-10 rounded-full shadow-lg
          bg-slate-800 text-white
          hover:scale-105 active:scale-95
          transition-transform
        "
        aria-label={t.buttonLabel}
      >
        <ChatBubbleLeftRightIcon className="h-5 w-5" />
      </button>

      {/* 主聊天窗口 */}
      {open && (
        <div
          className="
            fixed bottom-20 right-16 z-[90]
            w-80 max-w-[90vw]
            rounded-2xl shadow-2xl bg-white
            border border-gray-200
            flex flex-col
          "
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">
                {t.title}
              </span>
              <span className="text-[11px] text-gray-500">
                Onerinn Builder • dev
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-gray-100"
              aria-label="Close admin chat"
            >
              <XMarkIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* 消息区 */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm bg-gray-50/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap
                    ${
                      m.role === 'user'
                        ? 'bg-slate-800 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                    }
                  `}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1 rounded-2xl bg-white border border-gray-200 px-3 py-2">
                  <span className="text-[11px] text-gray-500">
                    {t.typing}
                  </span>
                  <span className="flex gap-1">
                    <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce" />
                    <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]" />
                    <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 输入区 */}
          <div className="flex items-center gap-2 border-t px-3 py-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className="
                flex-1 rounded-full border border-gray-300
                px-3 py-2 text-sm outline-none
                focus:ring-2 focus:ring-slate-800 focus:border-slate-800
              "
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              className={`
                rounded-full px-3 py-1.5 text-xs font-semibold
                ${
                  isSending || !input.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }
              `}
            >
              {t.send}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
