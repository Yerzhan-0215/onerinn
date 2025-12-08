// src/app/ru/faq/page.tsx
'use client';

import { useState } from 'react';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <header className="mb-6">
      {/* 字号与 “Произведения” 完全一致 */}
      <h1 className="text-base md:text-lg font-semibold text-gray-800 tracking-[0.02em] mb-1">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm md:text-base text-slate-600">
          {subtitle}
        </p>
      )}
    </header>
  );
}

type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
};

function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = item.id === openId;
        return (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white/90 shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="
                flex w-full items-center justify-between
                px-4 py-3 md:px-5 md:py-3.5
              "
            >
              <span className="text-sm md:text-base font-medium text-slate-900 text-left">
                {item.question}
              </span>
              <span
                className={`
                  ml-3 inline-flex h-6 w-6 items-center justify-center
                  rounded-full border border-slate-300 text-xs
                  transition
                  ${isOpen ? 'bg-slate-800 text-white' : 'bg-slate-50'}
                `}
              >
                {isOpen ? '−' : '+'}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-slate-200 px-4 py-3 md:px-5 md:py-4 text-sm text-slate-700">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * FAQ 列表：
 * - 保留你原来的 4 个问题，并扩展为 12 条
 * - 已合并/替换“Какие способы оплаты поддерживаются?”为更详细版本，避免重复
 */
const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: 'Что такое Onerinn?',
    answer:
      'Onerinn — это онлайн-платформа, где вы можете сдавать в аренду электронику, а также покупать и продавать произведения искусства. Мы объединяем владельцев техники, художников и покупателей на одной удобной площадке.',
  },
  {
    id: 2,
    question: 'Как арендовать устройство?',
    answer:
      'Выберите устройство в разделе «Аренда», ознакомьтесь с условиями и оформите заявку. После подтверждения мы свяжемся с вами для передачи устройства или согласования доставки.',
  },
  {
    id: 3,
    question: 'Как разместить произведение искусства?',
    answer:
      'Создайте аккаунт, выберите тип профиля (как художник или продавец), загрузите фото работы, укажите размер, описание и стоимость. После модерации работа появится в каталоге Onerinn.',
  },
  {
    id: 4,
    question: 'Какие способы оплаты поддерживаются?',
    answer:
      'Для пользователей из Казахстана на домене onerinn.kz доступны локальные платежи (Kaspi, Halyk и др.). Для международных пользователей на onerinn.com доступны банковские карты и международные платёжные системы. Конкретный набор способов оплаты зависит от вашей страны.',
  },

  // ===== 你提供的 8 条新增问答 =====
  {
    id: 5,
    question: 'Как зарегистрироваться на платформе Onerinn?',
    answer:
      'Выберите «Зарегистрироваться» в правом верхнем углу, заполните имя пользователя, e-mail или телефон и придумайте пароль. После подтверждения вы сможете заходить в личный кабинет и оформлять аренду или размещать свои произведения.',
  },
  {
    id: 6,
    question: 'Могу ли я войти по номеру телефона без e-mail?',
    answer:
      'Да. На Onerinn достаточно указать либо e-mail, либо номер телефона. Важно, чтобы указанные данные были доступны вам для восстановления доступа к аккаунту.',
  },
  {
    id: 7,
    question: 'Как оставить жалобу на продавца или арендатора?',
    answer:
      'Зайдите в личный кабинет → раздел «Поддержка» или откройте чат на странице FAQ. Опишите ситуацию, приложите номер заказа и, по возможности, скриншоты. Наша команда разберёт обращение и свяжется с вами.',
  },
  {
    id: 8,
    question: 'Как формируется комиссия платформы Onerinn?',
    answer:
      'Комиссия списывается автоматически при успешной оплате заказа и зависит от категории товара и типа услуги (аренда или покупка). Актуальные ставки комиссий вы можете уточнить в личном кабинете продавца.',
  },
  {
    id: 9,
    question: 'Что делать, если товар не соответствует описанию?',
    answer:
      'Не завершайте заказ и сразу свяжитесь с нами через чат поддержки или раздел «Споры и претензии» в личном кабинете. Опишите проблему, приложите фотографии. Мы поможем найти решение — замену, частичный или полный возврат.',
  },
  {
    id: 10,
    question: 'Как рассчитывается залог за аренду техники?',
    answer:
      'Размер залога устанавливается владельцем товара и отображается на странице объявления. Залог удерживается на время аренды и может быть скорректирован в случаях повреждения или утери устройства согласно правилам платформы.',
  },
  {
    id: 11,
    question: 'Могу ли я удалить свой аккаунт и данные?',
    answer:
      'Да. Напишите в службу поддержки через чат или форму обратной связи, укажите причину и подтвердите личность. После обработки запроса ваш аккаунт и связанные данные будут удалены в соответствии с политикой конфиденциальности Onerinn.',
  },
  {
    id: 12,
    question: 'Что делать, если я не нашёл ответ на свой вопрос?',
    answer:
      'Если нужного ответа нет в списке FAQ, свяжитесь с нами через раздел «О нас», мессенджеры или чат поддержки на сайте. Мы постараемся помочь вам и при необходимости обновим раздел FAQ.',
  },
];

export default function FAQPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <SectionHeader
        title="Часто задаваемые вопросы"
        subtitle="Не нашли ответ? Свяжитесь с нами через раздел «О нас» или мессенджеры. Со временем мы будем расширять этот раздел на основе ваших вопросов."
      />

      <FAQAccordion items={FAQ_ITEMS} />
    </main>
  );
}
