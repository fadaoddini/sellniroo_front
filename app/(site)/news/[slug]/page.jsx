// app/news/[slug]/page.jsx

import { Suspense } from 'react';
import NewsDetail from '@/components/News/NewsDetail';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  if (!slug) {
    return {
      title: 'جزئیات خبر | هلدینگ آریا استاد',
      description: 'مشاهده جزئیات خبر توسط هلدینگ آریا استاد',
    };
  }
  
  return {
    title: `جزئیات خبر | هلدینگ آریا استاد`,
    description: 'مشاهده جزئیات خبر در هلدینگ آریا استاد',
    alternates: {
      canonical: `https://ariastudholding.com/news/${slug}`,
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = params;
  
  if (!slug) {
    notFound();
  }
  
  return (
    <>
      <h1 className="sr-only">
        جزئیات خبر | هلدینگ آریا استاد
      </h1>
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">در حال بارگذاری خبر...</p>
          </div>
        </div>
      }>
        <NewsDetail slug={slug} />
      </Suspense>
    </>
  );
}