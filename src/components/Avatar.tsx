// src/components/Avatar.tsx
'use client';

import { useMemo, useState } from 'react';

type AvatarProps = {
  /** 用于生成首字母、tooltip 的显示名 */
  name: string;
  /** 图片地址（可为空；为空或加载失败时回退到首字母） */
  src?: string | null;
  /** 像素尺寸；也可用 Tailwind 的 h-8 w-8 覆盖 */
  size?: number;
  /** 额外样式类 */
  className?: string;
  /** 悬停时的提示文本；默认使用 name */
  title?: string;
  /** 点击事件（例如跳转到 /profile） */
  onClick?: () => void;
};

export default function Avatar({
  name,
  src,
  size = 32,
  className = '',
  title,
  onClick
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // 生成首字母（最多两位）
  const initials = useMemo(() => {
    const safe = (name || '').trim();
    if (!safe) return 'U';
    return safe
      .replace(/\s+/g, ' ')
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  }, [name]);

  const commonStyle: React.CSSProperties = {
    width: size,
    height: size,
  };

  // 优先显示图片；加载失败或未提供 src 时回退到首字母
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        title={title ?? name}
        onClick={onClick}
        onError={() => setImgError(true)}
        style={commonStyle}
        className={[
          'rounded-full object-cover select-none',
          onClick ? 'cursor-pointer' : '',
          className
        ].join(' ')}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // 首字母 + 渐变背景的默认头像（科技感高、普适耐看）
  return (
    <div
      role="img"
      aria-label={name || 'User'}
      title={title ?? name}
      onClick={onClick}
      style={commonStyle}
      className={[
        'rounded-full grid place-items-center select-none text-white font-bold',
        'bg-gradient-to-br from-blue-500 to-purple-500',
        onClick ? 'cursor-pointer' : '',
        className
      ].join(' ')}
    >
      <span style={{ fontSize: Math.max(12, Math.floor(size * 0.45)) }}>{initials}</span>
    </div>
  );
}
