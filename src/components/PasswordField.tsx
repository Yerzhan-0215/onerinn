'use client';

import * as React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// 自定义输入尺寸（避免与 <input> 原生 size 冲突）
type FieldSize = 'sm' | 'md';

// 排除原生的 size 属性，然后加上我们自己的 fieldSize
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  error?: string;
  fieldSize?: FieldSize; // 'sm'（默认）或 'md'
};

export default function PasswordField({
  label,
  className = '',
  error,
  fieldSize = 'sm',
  ...props
}: Props) {
  const [show, setShow] = React.useState(false);

  const S =
    fieldSize === 'sm'
      ? { input: 'h-10 text-sm pr-9 px-3', icon: 'h-4 w-4', btn: 'right-2' }
      : { input: 'h-11 text-base pr-10 px-3', icon: 'h-5 w-5', btn: 'right-2.5' };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className={
            `w-full rounded-lg border border-gray-300 bg-white ${S.input} text-gray-900 
             placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
             disabled:cursor-not-allowed disabled:opacity-60 ` + className
          }
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
          className={`absolute inset-y-0 ${S.btn} flex items-center`}
          tabIndex={-1}
        >
          {show ? (
            <EyeSlashIcon className={`${S.icon} text-gray-500`} />
          ) : (
            <EyeIcon className={`${S.icon} text-gray-500`} />
          )}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
