/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  transpilePackages: [
    '@neshan-maps-platform/ol',
    '@neshan-maps-platform/react-openlayers',
  ],
  
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      'admin.ariastudholding.com',
      'images.unsplash.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // API لوکال (Django media) — بدون port یعنی هر پورتی
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.ariastudholding.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.sellniroo.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  env: {
    // همیشه لوکال روی 8000 — 8001 را قبول نکن
    NEXT_PUBLIC_API_URL: (() => {
      const raw = String(
        process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      ).trim()
      return raw
        .replace(/\/$/, '')
        .replace(
          /^(https?:\/\/(?:localhost|127\.0\.0\.1)):8001(?=\/|$)/i,
          '$1:8000'
        )
    })(),
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

  // هاب /school حذف شد — همه چیز در /profile است
  async redirects() {
    return [
      {
        source: '/school',
        destination: '/profile',
        permanent: true,
      },
      {
        source: '/school/teacher',
        destination: '/profile?tab=teacher',
        permanent: true,
      },
      {
        source: '/school/student',
        destination: '/profile?tab=students',
        permanent: true,
      },
      {
        source: '/school/counselor',
        destination: '/profile?tab=counselor',
        permanent: true,
      },
      {
        source: '/school/teachers/:slug',
        destination: '/teachers/:slug',
        permanent: true,
      },
      {
        source: '/school/counselors/:slug',
        destination: '/counselors/:slug',
        permanent: true,
      },
      {
        source: '/school/:path*',
        destination: '/profile',
        permanent: true,
      },
    ]
  },

  // پروکسی مدیا به Django تا /media از فرانت هم در دسترس باشد
  async rewrites() {
    const api =
      process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    return [
      {
        source: '/media/:path*',
        destination: `${api.replace(/\/$/, '')}/media/:path*`,
      },
    ]
  },
};

module.exports = nextConfig;
