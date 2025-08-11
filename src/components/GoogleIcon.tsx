// src/components/GoogleIcon.tsx
import React, { forwardRef, memo } from 'react';

export type GoogleIconProps = React.SVGProps<SVGSVGElement> & {
  /** 像素尺寸；若你用 Tailwind 的 h-5 w-5，可以不传 size */
  size?: number;
  /** 可选，无障碍标题 */
  title?: string;
};

const GoogleIcon = forwardRef<SVGSVGElement, GoogleIconProps>(
  ({ size = 20, title = 'Google', className, ...props }, ref) => {
    // 如果传了 className（例如 h-5 w-5），就不再内联 width/height，避免冲突
    const sizeProps =
      className && /(^|\s)h-\d/.test(className) ? {} : { width: size, height: size };

    return (
      <svg
        ref={ref}
        viewBox="0 0 46 46"
        aria-hidden={!title}
        role={title ? 'img' : undefined}
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
        className={className}
        {...sizeProps}
        {...props}
      >
        {title && <title>{title}</title>}
        <g>
          <path
            fill="#EA4335"
            d="M23 9.5c3.5 0 6.6 1.2 9 3.5l-3.6 3.6c-1.5-1.5-3.6-2.4-5.4-2.4-4.6 0-8.5 3.8-8.5 8.5s3.9 8.5 8.5 8.5c4.3 0 7.1-2.5 7.6-6H23v-4.8h14.1c.1.8.1 1.5.1 2.3 0 8-5.4 13.7-14.1 13.7-8 0-14.6-6.6-14.6-14.6S15 9.5 23 9.5z"
          />
          <path
            fill="#34A853"
            d="M6.7 17.8l4.9 3.6c1.3-3.9 5-6.7 9.4-6.7 1.8 0 3.9.9 5.4 2.4l3.6-3.6c-2.4-2.3-5.5-3.5-9-3.5-6.8 0-12.5 4.3-14.3 10.8z"
          />
          <path
            fill="#FBBC05"
            d="M6 24.4c0-1.3.3-2.6.7-3.8l4.9 3.6c-.3.9-.5 1.8-.5 2.8s.2 1.9.5 2.8l-4.9 3.6c-.4-1.2-.7-2.5-.7-3.8z"
          />
          <path
            fill="#4285F4"
            d="M37.1 24.5c0-1-.1-1.7-.1-2.5H23v4.8h7.6c-.6 3.5-3.3 6-7.6 6-3.3 0-6.2-2.1-7.3-5l-4.9 3.6c2.6 5 7.7 8.4 12.2 8.4 7.1 0 14.1-5.1 14.1-13.7z"
          />
        </g>
      </svg>
    );
  }
);

export default memo(GoogleIcon);
