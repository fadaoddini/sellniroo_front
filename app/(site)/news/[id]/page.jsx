// app/news/[id]/page.jsx

import { Suspense } from 'react';
import NewsDetail from '@/components/News/NewsDetail';

// ✅ generateMetadata برای SEO
export async function generateMetadata({ params }) {
  const id = params?.id;
  
  if (!id) {
    return {
      title: 'جزئیات خبر',
      description: 'مشاهده جزئیات خبر توسط هلدینگ آریا استاد',
      alternates: {
        canonical: 'https://ariastudholding.com/news',
      },
    };
  }
  
  // دریافت اطلاعات خبر برای متادیتا
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ariastudholding.com';
    const res = await fetch(`${baseUrl}/api/news/${id}`, {
      cache: 'no-store',
    });
    
    if (res.ok) {
      const data = await res.json();
      const news = data.data || data;
      
      return {
        title: `${news.title} | هلدینگ آریا استاد`,
        description: news.excerpt || news.content?.substring(0, 160) || 'مشاهده جزئیات خبر در هلدینگ آریا استاد',
        alternates: {
          canonical: `https://ariastudholding.com/news/${id}`,
        },
        openGraph: {
          title: `${news.title} | هلدینگ آریا استاد`,
          description: news.excerpt || news.content?.substring(0, 160),
          url: `https://ariastudholding.com/news/${id}`,
          images: news.featured_image ? [
            {
              url: news.featured_image,
              width: 1200,
              height: 630,
              alt: news.title,
            }
          ] : [],
        },
      };
    }
  } catch {
    // اگر خطا رخ داد، متادیتای پیش‌فرض
  }
  
  return {
    title: `خبر شماره ${id} | هلدینگ آریا استاد`,
    description: 'مشاهده جزئیات خبر در هلدینگ آریا استاد',
    alternates: {
      canonical: `https://ariastudholding.com/news/${id}`,
    },
  };
}

// ✅ صفحه اصلی - Server Component
export default async function NewsDetailPage({ params }) {
  const id = params?.id;
  
  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">❌ خطا</h1>
          <p className="text-gray-600 mb-6">شناسه خبر معتبر نیست</p>
          <a 
            href="/news" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            بازگشت به اخبار
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* ✅ h1 مخفی برای سئو */}
      <h1 className="sr-only">
        جزئیات خبر | هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی LSF در ایران
      </h1>
      
      {/* ✅ NewsDetail مستقیماً به عنوان Server Component رندر می‌شود */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">در حال بارگذاری خبر...</p>
          </div>
        </div>
      }>
        <NewsDetail id={id} />
      </Suspense>
    </>
  );
}