// src/components/ChatWidget.tsx
'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type ChangeEventHandler,
} from 'react';
import { usePathname } from 'next/navigation';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperClipIcon,
} from '@heroicons/react/24/solid';

type Role = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

type LangCode = 'ru' | 'kk' | 'zh' | 'en';

type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
};

const UI_TEXT: Record<
  LangCode,
  {
    title: string;
    placeholder: string;
    send: string;
    typing: string;
    emptyHello: string;
    buttonLabel: string;
    attachmentHint: string;
  }
> = {
  ru: {
    title: 'Onerinn ассистент',
    placeholder: 'Задайте вопрос о платформе, аренде или произведениях…',
    send: 'Отпр.',
    typing: 'Onerinn ассистент печатает…',
    emptyHello:
      'Здравствуйте! Я виртуальный помощник Onerinn. Спросите меня о платформе, аренде техники или произведениях искусства.',
    buttonLabel: 'Открыть чат с Onerinn ассистентом',
    attachmentHint: 'Добавьте фото работы или файл (до 3 вложений).',
  },
  kk: {
    title: 'Onerinn көмекшісі',
    placeholder: 'Платформа, жалға алу немесе туындылар туралы сұрақ қойыңыз…',
    send: 'Жіберу',
    typing: 'Onerinn көмекшісі жауап дайындап жатыр…',
    emptyHello:
      'Сәлеметсіз бе! Мен – Onerinn виртуалды көмекшімін. Платформа, техника жалға алу немесе өнер туындылары туралы сұрақтарыңызды қойыңыз.',
    buttonLabel: 'Onerinn көмекшісімен чат ашу',
    attachmentHint:
      'Жұмыстың фотосын немесе файлды қосыңыз (3-тен аспасын).',
  },
  zh: {
    title: 'Onerinn 助手',
    placeholder: '可以问我平台、租赁、艺术品相关的问题…',
    send: '发送',
    typing: 'Onerinn 助手正在输入…',
    emptyHello:
      '你好，我是 Onerinn 助手，可以帮你解答关于平台、电子设备租赁和艺术品的问题。',
    buttonLabel: '打开与 Onerinn 助手的聊天',
    attachmentHint: '可以附加作品照片或文件（最多 3 个）。',
  },
  en: {
    title: 'Onerinn Assistant',
    placeholder: 'Ask anything about Onerinn, rentals or artworks…',
    send: 'Send',
    typing: 'Onerinn Assistant is typing…',
    emptyHello:
      'Hi! I am the Onerinn virtual assistant. Ask me about the platform, rentals or artworks.',
    buttonLabel: 'Open chat with Onerinn Assistant',
    attachmentHint: 'Attach artwork photos or files (up to 3).',
  },
};

function detectLang(pathname: string | null): LangCode {
  if (!pathname) return 'en';
  if (pathname.startsWith('/ru')) return 'ru';
  if (pathname.startsWith('/kk')) return 'kk';
  if (pathname.startsWith('/zh')) return 'zh';
  return 'en';
}

export default function ChatWidget() {
  const pathname = usePathname();
  const lang = detectLang(pathname);
  const t = UI_TEXT[lang];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [expanded, setExpanded] = useState(false); // 🔹 是否已经“变大”

  const storageKey = useMemo(() => `onerinn_chat_${lang}`, [lang]);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 载入历史记录 / 首次欢迎（sessionStorage，关标签页就清空）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setExpanded(true);
          return;
        }
      }
      const hello: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: t.emptyHello,
        createdAt: Date.now(),
      };
      setMessages([hello]);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // 同步到 sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, storageKey]);

  // 新消息 / 打字状态 -> 自动滚到底部
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  // 点击外部关闭聊天窗
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    // 第一次真正发消息时，让面板可以“长高”到 70vh
    if (!expanded) setExpanded(true);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-page-context':
            typeof window !== 'undefined'
              ? `${window.location.pathname} | ${document.title || ''}`
              : '',
        },
        body: JSON.stringify({
          locale: lang,
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
          attachments: attachments.map(f => ({
            name: f.name,
            type: f.type,
            size: f.size,
          })),
        }),
      });

      if (!res.ok) throw new Error('HTTP_' + res.status);

      const data = await res.json();
      const replyText: string =
        data.reply ||
        (lang === 'ru'
          ? 'Извините, произошла ошибка. Попробуйте ещё раз.'
          : lang === 'kk'
          ? 'Кешіріңіз, қате шықты. Қайтадан көріңіз.'
          : lang === 'zh'
          ? '抱歉，发生了一点错误，请稍后再试。'
          : 'Sorry, something went wrong. Please try again.');

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        createdAt: Date.now(),
      };

      setMessages(prev => [...prev, botMsg]);
      setAttachments([]);
    } catch {
      const errText =
        lang === 'ru'
          ? 'Не удалось получить ответ. Проверьте интернет и попробуйте ещё раз.'
          : lang === 'kk'
          ? 'Жауап алу мүмкін болмады. Интернетті тексеріп, қайта көріңіз.'
          : lang === 'zh'
          ? '暂时无法获取回复，请检查网络后重试。'
          : 'Failed to get a reply. Please check your connection and try again.';
      const botMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: errText,
        createdAt: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = e => {
    const files = e.target.files;
    if (!files) return;

    const arr: Attachment[] = [];
    for (let i = 0; i < files.length && i < 3; i += 1) {
      const f = files[i];
      arr.push({
        id: `${Date.now()}-${i}`,
        name: f.name,
        type: f.type,
        size: f.size,
      });
    }
    setAttachments(arr);
  };

  // 面板最大高度：刚打开时偏小，真正聊天后放大到 70vh
  const panelMaxHeight = expanded ? '70vh' : '260px';

  return (
    <>
      {/* 右下角小按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-4 right-4 z-[80]
          flex items-center justify-center
          w-10 h-10
          rounded-full shadow-lg
          bg-[#9edeee] text-white
          hover:scale-105 active:scale-95
          transition-transform
        "
        aria-label={t.buttonLabel}
      >
        <ChatBubbleLeftRightIcon className="h-5 w-5" />
      </button>

      {/* 聊天对话框 */}
      {open && (
        <div
          className="
            fixed bottom-20 right-4 z-[90]
            w-80 max-w-[90vw]
          "
        >
          <div
            ref={panelRef}
            className="
              flex flex-col
              rounded-2xl shadow-2xl bg-white
              border border-gray-200
              overflow-hidden
              min-h-0
            "
            style={{ maxHeight: panelMaxHeight }}
          >
            {/* 顶部栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  {t.title}
                </span>
                <span className="text-[11px] text-gray-500">
                  Onerinn • online
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
                aria-label="Close chat"
              >
                <XMarkIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* 消息区域：flex-1 + min-h-0，超出时在这里滚动 */}
            <div
              ref={messagesContainerRef}
              className="
                onerinn-chat-messages
                flex-1 min-h-0
                px-3 py-2 space-y-2 text-sm
                bg-gray-50/60
                overflow-y-auto
              "
              style={{
                WebkitOverflowScrolling: 'touch',
              }}
              onWheelCapture={e => {
                // 防止滚轮事件直接传给 body，优先滚动聊天区域
                e.stopPropagation();
              }}
            >
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-3 py-2
                      whitespace-pre-wrap break-words
                      ${
                        m.role === 'user'
                          ? 'bg-[#9edeee] text-gray-900 rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }
                    `}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {/* 打字中动画 */}
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

              {/* 附件提示 */}
              {attachments.length > 0 && (
                <div className="mt-1 rounded-xl bg-white border border-dashed border-gray-300 px-3 py-2 text-[11px] text-gray-600">
                  <div className="font-medium mb-1">
                    {lang === 'ru'
                      ? 'Вложенные файлы:'
                      : lang === 'kk'
                      ? 'Қосылған файлдар:'
                      : lang === 'zh'
                      ? '已附加文件:'
                      : 'Attached files:'}
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {attachments.map(a => (
                      <li key={a.id}>
                        {a.name}{' '}
                        <span className="text-gray-400">
                          ({a.type || 'file'})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-1 text-[10px] text-gray-400">
                    {t.attachmentHint}
                  </div>
                </div>
              )}
            </div>

            {/* 底部输入区 */}
            <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2 bg-white">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={handleFileClick}
                className="rounded-full p-1.5 hover:bg-gray-100"
                aria-label="Attach files"
              >
                <PaperClipIcon className="h-4 w-4 text-gray-600" />
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                className="
                  flex-1 rounded-full border border-gray-300
                  px-3 py-2 text-sm outline-none
                  focus:ring-2 focus:ring-[#9edeee] focus:border-[#9edeee]
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
                      : 'bg-[#9edeee] text-white hover:bg-[#8ad4e5]'
                  }
                `}
              >
                {t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
