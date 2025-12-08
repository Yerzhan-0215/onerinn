// src/components/faq/FAQAccordion.tsx
'use client';

import { useState } from 'react';

export type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

type Props = {
  items: FAQItem[];
};

export default function FAQAccordion({ items }: Props) {
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
                  ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-slate-50'}
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
