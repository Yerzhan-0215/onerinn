// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

// ✅ 确保路径正确（我们用 src 下的 i18n）
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
  reactStrictMode: true,
  experimental: {
    serverActions: {} // ✅ 修复了这个字段
  }
});
