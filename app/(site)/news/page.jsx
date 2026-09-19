// app/news/page.jsx

import { Suspense } from 'react';
import NewsList from '@/components/News/NewsList';

export const metadata = {
  title: 'اخبار کاریابی و استخدام | سلنیرو',
  description: 'آخرین اخبار و رویدادهای بازار کار، فرصت‌های شغلی فروش و بازاریابی، استخدام‌های تازه، تحلیل بازار کار و راهکارهای موفقیت در مصاحبه شغلی - سلنیرو، مرجع تخصصی کاریابی فروش و بازاریابی',
  keywords: [
    'اخبار کاریابی',
    'آخرین اخبار استخدام',
    'فرصت‌های شغلی',
    'استخدام فروش و بازاریابی',
    'بازار کار ایران',
    'رزومه نویسی',
    'مصاحبه شغلی',
    'مشاوره شغلی',
    'کاریابی تخصصی',
    'استخدام بازاریاب',
    'استخدام فروشنده',
    'اخبار استخدامی',
    'فرصت شغلی جدید',
    'کار در تهران',
    'استخدام فوری',
    'سلنیرو',
    'مرجع کاریابی'
  ],
  openGraph: {
    title: 'اخبار کاریابی و استخدام | سلنیرو',
    description: 'آخرین اخبار و رویدادهای بازار کار، فرصت‌های شغلی فروش و بازاریابی، استخدام‌های تازه و تحلیل بازار کار توسط سلنیرو',
    url: 'https://selniro.com/news',
    images: [
      {
        url: 'https://selniro.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'اخبار کاریابی و استخدام | سلنیرو',
      },
    ],
  },
  twitter: {
    title: 'اخبار کاریابی و استخدام | سلنیرو',
    description: 'آخرین اخبار و رویدادهای بازار کار و فرصت‌های شغلی توسط سلنیرو',
    images: ['https://selniro.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://selniro.com/news',
  },
};

export default function NewsPage() {
  return (
    <>
      <h1 className="sr-only">
        اخبار کاریابی و استخدام | سلنیرو - مرجع تخصصی فرصت‌های شغلی فروش و بازاریابی در ایران
      </h1>
      
      <Suspense fallback={<NewsLoading />}>
        <NewsList />
      </Suspense>
    </>
  );
}

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