/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ['localhost', 'admin.ariastudholding.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },
  
  // حذف optimizeFonts از experimental
  // فشرده‌سازی
  compress: true,
  
  // تنظیمات trailing slash
  trailingSlash: false,
  
  // مخفی کردن هدر X-Powered-By
  poweredByHeader: false,
};

module.exports = nextConfig;
