// src/app/ru/about/page.tsx

import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

type ContactItem = {
  id: number;
  label: string;
  value: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const CONTACTS: ContactItem[] = [
  {
    id: 1,
    label: 'E-mail',
    value: 'support@onerinn.kz',
    href: 'mailto:support@onerinn.kz',
    icon: EnvelopeIcon,
  },
  {
    id: 2,
    label: 'Телефон / WhatsApp',
    value: '+7 777 000 00 00',
    href: 'https://wa.me/77770000000',
    icon: PhoneIcon,
  },
  {
    id: 3,
    label: 'Адрес',
    value: 'Алматы, Казахстан (уточните фактический адрес)',
    icon: MapPinIcon,
  },
  {
    id: 4,
    label: 'Чат поддержки',
    value: 'Напишите нам через онлайн-чат на сайте Onerinn',
    icon: ChatBubbleLeftRightIcon,
  },
];

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* 顶部标题：字号与 “Произведения / FAQ / 搜кс结果” 一致 */}
      <header className="mb-6">
        <h1 className="text-base md:text-lg font-semibold text-gray-800 tracking-[0.02em] mb-1">
          О нас
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          Onerinn — это платформа для аренды электроники и демонстрации произведений искусства.
          Мы помогаем владельцам техники и художникам находить своих клиентов в Казахстане и за его
          пределами.
        </p>
      </header>

      {/* 关于平台 */}
      <section className="mb-6 rounded-xl bg-white/90 shadow-sm border border-slate-200 p-4 md:p-5">
        <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
          Что такое Onerinn?
        </h2>
        <p className="text-sm text-slate-700 mb-2">
          Onerinn объединяет два мира: аренду современных электронных устройств и
          онлайн-галерею произведений искусства. Мы создаём удобную и безопасную среду для
          пользователей, которые хотят:
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>сдавать в аренду свою технику и получать дополнительный доход;</li>
          <li>находить надёжные устройства для временного пользования;</li>
          <li>показывать свои картины, фотографии и другие работы широкой аудитории;</li>
          <li>покупать оригинальные произведения искусства напрямую у авторов.</li>
        </ul>
      </section>

      {/* 工作原理 */}
      <section className="mb-6 rounded-xl bg-white/90 shadow-sm border border-slate-200 p-4 md:p-5">
        <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
          Как работает платформа?
        </h2>
        <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1">
          <li>Вы регистрируетесь на платформе и заполняете профиль.</li>
          <li>Выбираете роль: арендатор, владелец техники, художник или совмещаете несколько.</li>
          <li>Размещаете объявления или находите нужный товар через поиск и фильтры.</li>
          <li>Оформляете заказ, общаетесь с другой стороной и завершаете сделку.</li>
          <li>
            Платформа Onerinn помогает с безопасной оплатой, учётом комиссий и обработкой
            спорных ситуаций.
          </li>
        </ol>
      </section>

      {/* 联系方式 */}
      <section className="mb-6">
        <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
          Контакты и поддержка
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {CONTACTS.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {item.label}
                  </span>
                </div>
                <p className="text-sm text-slate-800">{item.value}</p>
              </>
            );

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white/90 p-3 md:p-4 shadow-sm"
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block hover:text-blue-600"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs md:text-sm text-slate-500">
          * Пожалуйста, замените контактные данные на актуальные реквизиты вашей компании
          (ТОО «Onerinn») перед запуском платформы.
        </p>
      </section>

      {/* 说明：与 FAQ 对应的文案 */}
      <section className="mt-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4">
        <p className="text-xs md:text-sm text-slate-600">
          Если вы не нашли ответ в разделе «Часто задаваемые вопросы», свяжитесь с нами через эту
          страницу или мессенджеры. Мы постараемся помочь вам и при необходимости обновим раздел FAQ.
        </p>
      </section>
    </main>
  );
}
