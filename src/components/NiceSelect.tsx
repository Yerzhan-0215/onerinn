// src/components/NiceSelect.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export type NiceSelectOption = {
  value: string;
  label: string;
};

type NiceSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: NiceSelectOption[];
  placeholder?: string;
  className?: string;
};

export default function NiceSelect({
  value,
  onChange,
  options,
  placeholder = '— выберите —',
  className = '',
}: NiceSelectProps) {
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const current = options.find((o) => o.value === value) || null;

  // 关闭时重置 hoverIndex
  useEffect(() => {
    if (!open) setHoverIndex(null);
  }, [open]);

  // 点击外面收起菜单
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function toggleOpen() {
    setOpen((o) => !o);
  }

  function handleSelect(option: NiceSelectOption) {
    onChange(option.value);
    setOpen(false);
    // 回到按钮上，方便继续 Tab
    buttonRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }

    const enabled = options;
    if (!enabled.length) return;

    const currentIndex =
      hoverIndex != null
        ? hoverIndex
        : Math.max(
            0,
            enabled.findIndex((o) => o.value === value),
          );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (currentIndex + 1) % enabled.length;
      setHoverIndex(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next =
        (currentIndex - 1 + enabled.length) % enabled.length;
      setHoverIndex(next);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const idx = hoverIndex ?? currentIndex;
      const opt = enabled[idx];
      if (opt) handleSelect(opt);
    }
  }

  const baseBtn =
    'w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black/10';
  const textCls = value
    ? 'text-gray-900'
    : 'text-gray-400';

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        ref={buttonRef}
        className={`${baseBtn} ${textCls}`}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">
          {current ? current.label : placeholder}
        </span>
        {/* 小箭头图标（纯 SVG，无系统竖线） */}
        <span
          className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full ${
            open ? 'bg-gray-100' : ''
          }`}
        >
          <svg
            className={`h-3 w-3 text-gray-500 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <ul
          className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
          role="listbox"
        >
          {options.map((opt, idx) => {
            const selected = opt.value === value;
            const hovered = hoverIndex === idx;

            return (
              <li
                key={opt.value || `opt-${idx}`}
                role="option"
                aria-selected={selected}
                className={`flex cursor-pointer items-center px-3 py-1.5 ${
                  selected
                    ? 'bg-gray-100 text-gray-900'
                    : hovered
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-800'
                }`}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => handleSelect(opt)}
              >
                <span className="truncate">{opt.label}</span>
                {selected && (
                  <span className="ml-auto text-xs text-gray-500">
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
