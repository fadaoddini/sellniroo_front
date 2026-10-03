// app/news/[slug]/page.jsx
import { Suspense } from 'react';
import NewsDetail from '@/components/News/NewsDetail';
import { notFound } from 'next/navigation';

/* ============================================
   METADATA — برای هر خبر
   ============================================ */
export async function generateMetadata({ params }) {
  const { slug } = params;

  if (!slug) {
    return {
      title: 'جزئیات خبر | سلنیرو',
      description:
        'مشاهده جزئیات خبر در سلنیرو — کاریابی تخصصی فروش و بازاریابی',
    };
  }

  // تلاش برای دریافت اطلاعات خبر از API
  let newsData = null;
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${apiUrl}/api/news/${slug}/`, {
      next: { revalidate: 60 }, // کش ۶۰ ثانیه
    });
    if (res.ok) {
      newsData = await res.json();
    }
  } catch {
    // در صورت خطا، از metadata پیش‌فرض استفاده می‌شود
  }

  const title = newsData?.title
    ? `${newsData.title} | سلنیرو`
    : 'جزئیات خبر | سلنیرو';

  const description =
    newsData?.excerpt ||
    newsData?.description?.substring(0, 160) ||
    'جدیدترین اخبار و مطالب در حوزه فروش و بازاریابی در سلنیرو';

  const imageUrl =
    newsData?.featured_image_display || newsData?.featured_image
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${
          newsData.featured_image_display || newsData.featured_image
        }`
      : 'https://sellniroo.com/images/logo.png';

  return {
    title,
    description,

    keywords: newsData?.keywords || [
      'اخبار فروش',
      'اخبار بازاریابی',
      'کاریابی',
      'استخدام',
      'سلنیرو',
    ],

    alternates: {
      canonical: `https://sellniroo.com/news/${slug}`,
    },

    openGraph: {
      type: 'article',
      locale: 'fa_IR',
      url: `https://sellniroo.com/news/${slug}`,
      siteName: 'سلنیرو',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: newsData?.title || 'خبر سلنیرو',
        },
      ],
      publishedTime: newsData?.publish_date,
      modifiedTime: newsData?.updated_at || newsData?.publish_date,
      authors: [
        newsData?.writer_name_display ||
          newsData?.source_name ||
          'سلنیرو',
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/* ============================================
   PAGE COMPONENT
   ============================================ */
export default async function NewsDetailPage({ params }) {
  const { slug } = params;

  if (!slug) {
    notFound();
  }

  return (
    <>
      {/* h1 اختصاصی برای SEO */}
      <h1 className="sr-only">جزئیات خبر | سلنیرو — کاریابی تخصصی فروش و بازاریابی</h1>

      <Suspense fallback={<NewsDetailLoading />}>
        <NewsDetail slug={slug} />
      </Suspense>
    </>
  );
}

/* ============================================
   LOADING FALLBACK
   ============================================ */
function NewsDetailLoading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #0e8f59',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            marginTop: '16px',
            color: '#4b5563',
            fontFamily: 'var(--font-iran)',
          }}
        >
          در حال بارگذاری خبر...
        </p>
      </div>
    </div>
  );
}