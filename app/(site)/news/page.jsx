// app/news/page.jsx

import { Suspense } from 'react';
import NewsList from '@/components/News/NewsList';

export const metadata = {
  // ✅ تایتل اختصاصی - بدون "نبض ساختمان"
  title: 'اخبار صنعت ساختمان',
  
  // ✅ توضیحات اختصاصی با اشاره به برند
  description: 'آخرین اخبار و رویدادهای صنعت ساختمان، فناوری‌های نوین، مصالح ساختمانی و تحلیل بازار مسکن توسط هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی LSF در ایران',
  
  // ✅ کلمات کلیدی اختصاصی
  keywords: [
    'اخبار صنعت ساختمان',
    'آخرین اخبار ساختمان',
    'رویدادهای ساختمانی',
    'فناوری نوین ساختمان',
    'مصالح ساختمانی',
    'تحلیل بازار مسکن',
    'سازه ال اس اف',
    'سازه سبک فولادی',
    'هلدینگ آریا استاد',
    'LSF',
    'خبر ساختمانی',
    'صنعت ساخت و ساز',
    'اخبار عمران',
    'اخبار معماری'
  ],
  
  // ✅ OpenGraph اختصاصی
  openGraph: {
    title: 'اخبار صنعت ساختمان | هلدینگ آریا استاد',
    description: 'آخرین اخبار و رویدادهای صنعت ساختمان، فناوری‌های نوین، مصالح ساختمانی و تحلیل بازار مسکن توسط هلدینگ آریا استاد',
    url: 'https://ariastudholding.com/news',
    images: [
      {
        url: 'https://ariastudholding.com/images/news-og.jpg',
        width: 1200,
        height: 630,
        alt: 'اخبار صنعت ساختمان | هلدینگ آریا استاد',
      },
    ],
  },
  
  // ✅ Twitter اختصاصی
  twitter: {
    title: 'اخبار صنعت ساختمان | هلدینگ آریا استاد',
    description: 'آخرین اخبار و رویدادهای صنعت ساختمان توسط هلدینگ آریا استاد',
    images: ['https://ariastudholding.com/images/news-og.jpg'],
  },
  
  // ✅ مسیر متعارف
  alternates: {
    canonical: 'https://ariastudholding.com/news',
  },
};

export default function NewsPage() {
  return (
    <>
      {/* ✅ h1 اختصاصی برای سئو */}
      <h1 className="sr-only">
        اخبار صنعت ساختمان | هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی LSF در ایران
      </h1>
      
      <Suspense fallback={<NewsLoading />}>
        <NewsList />
      </Suspense>
    </>
  );
}

// ✅ کامپوننت لودینگ اختصاصی
function NewsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">در حال بارگذاری اخبار...</p>
      </div>
    </div>
  );
}