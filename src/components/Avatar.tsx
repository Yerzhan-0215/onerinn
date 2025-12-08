// src/components/Avatar.tsx
'use client';

import { useMemo, useState, type CSSProperties } from 'react';

type AvatarProps = {
  /** 用于生成首字母（最多两位）与无障碍标签 */
  name: string;
  /** 图片地址（为空或加载失败时回退到首字母） */
  src?: string | null;
  /** 像素尺寸；也可用 Tailwind 的类名（例如 h-8 w-8）覆盖 */
  size?: number;
  /** 额外样式类 */
  className?: string;
  /** 点击事件（例如跳转到 /profile） */
  onClick?: () => void;

  /** @deprecated 为避免浏览器原生黑框 tooltip，已废弃 title */
  // title?: string;
};

export default function Avatar({
  name,
  src,
  size = 32,
  className = '',
  onClick,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // 生成首字母（最多两位）
  const initials = useMemo(() => {
    const safe = (name || '').trim();
    if (!safe) return 'U';
    return (
      safe
        .replace(/\s+/g, ' ')
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'U'
    );
  }, [name]);

  const commonStyle: CSSProperties = { width: size, height: size };

  // 有图：优先显示图片；失败则回退到首字母
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        onClick={onClick}
        onError={() => setImgError(true)}
        style={commonStyle}
        className={[
          'rounded-full object-cover select-none',
          onClick ? 'cursor-pointer' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );
  }

  // 无图或加载失败：首字母头像（无 title，避免黑框）
  return (
    <div
      role="img"
      aria-label={name || 'User'}
      onClick={onClick}
      style={commonStyle}
      className={[
        'grid place-items-center rounded-full select-none text-white font-bold',
        'bg-gradient-to-br from-blue-500 to-purple-500',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      draggable={false}
    >
      <span style={{ fontSize: Math.max(12, Math.floor(size * 0.45)) }}>
        {initials}
      </span>
    </div>
  );
}
