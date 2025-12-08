// src/components/GoogleSignInButton.tsx
'use client';

import * as React from 'react';
import GoogleIcon from './GoogleIcon';

export interface GoogleSignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 显示加载点动效并自动禁用按钮 */
  loading?: boolean;
  /** 按钮文案（多语言从外部传入） */
  label?: string;
  /** 追加自定义类名 */
  className?: string;
}

/**
 * 不再依赖 NextIntl；文案从外部传入，彻底避免 “Missing NextIntlClientProvider” 报错。
 * 仍然保留 onClick 等原生按钮属性。
 */
const GoogleSignInButton = React.forwardRef<HTMLButtonElement, GoogleSignInButtonProps>(
  (
    {
      loading = false,
      label = 'Sign in with Google',
      className = '',
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={typeof children === 'string' ? children : label}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={`w-full bg-white text-gray-800 border border-gray-300 py-2 rounded
                    hover:bg-gray-50 flex items-center justify-center gap-2
                    disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        <GoogleIcon className="h-5 w-5 shrink-0" title="Google" />
        {/* 支持 children 自定义文案；否则用 label */}
        <span>{children ?? label}</span>
        {loading && <span className="ml-1 inline-block animate-pulse" aria-hidden>…</span>}
      </button>
    );
  }
);

GoogleSignInButton.displayName = 'GoogleSignInButton';
export default GoogleSignInButton;
