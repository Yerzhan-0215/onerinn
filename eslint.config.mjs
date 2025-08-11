import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts'); // ✅ 正确路径！

export default withNextIntl({
  reactStrictMode: true,
  experimental: {
    serverActions: true // 如果你用到了可以保留
  }
});
