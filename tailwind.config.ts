import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',     // 主代码路径
    './app/**/*.{js,ts,jsx,tsx}',     // Next.js app 目录（如有）
    './pages/**/*.{js,ts,jsx,tsx}',   // 如果你用了 pages 目录
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 2s ease-in-out',
      },
    },
  },
  plugins: [],
}
export default config
