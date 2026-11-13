// app/news/[slug]/page.jsx
// param می‌تواند id عددی یا slug فارسی عنوان باشد
import { Suspense } from 'react';
import NewsDetail from '@/components/News/NewsDetail';
import NewsPageSlot from '@/components/modules/NewsPageSlot';
import { notFound, permanentRedirect } from 'next/navigation';
import { isSiteModuleActive } from '@/services/siteModules';
import { SITE_MODULE_KEYS } from '@/config/siteModules';
import Config from '@/config/config';
import {
  getNewsSlug,
  isNumericNewsParam,
} from '@/utils/newsSlug';

async function getNews(param) {
  const key = decodeURIComponent(String(param || '')).trim();
  if (!key) return null;

  try {
    const res = await fetch(Config.endpoints.news.detail(key), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching news:', err);
    return null;
  }
}

/* ============================================
   METADATA — برای هر خبر
   ============================================ */
export async function generateMetadata({ params }) {
  const param = params?.slug;
  const newsData = await getNews(param);
  const canonicalSlug = newsData ? getNewsSlug(newsData) : decodeURIComponent(String(param || '')).trim();

  if (!param) {
    return {
      title: 'جزئیات خبر | سلنیرو',
      description:
        'مشاهده جزئیات خبر در سلنیرو — کاریابی تخصصی فروش و بازاریابی',
    };
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

  const pagePath = canonicalSlug
    ? `https://sellniroo.com/news/${canonicalSlug}`
    : 'https://sellniroo.com/news';

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
      canonical: pagePath,
    },

    openGraph: {
      type: 'article',
      locale: 'fa_IR',
      url: pagePath,
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
  const param = params?.slug;

  if (!param) {
    notFound();
  }

  const newsOn = await isSiteModuleActive(SITE_MODULE_KEYS.NEWS, {
    force: true,
  });
  if (!newsOn) {
    notFound();
  }

  const news = await getNews(param);
  if (news) {
    const slug = getNewsSlug(news);
    // /news/42 → /news/افتتاح-فاز-جدید-...
    if (
      slug &&
      isNumericNewsParam(param) &&
      decodeURIComponent(String(param)) !== slug
    ) {
      permanentRedirect(`/news/${slug}`);
    }
  }

  const resolvedSlug = decodeURIComponent(String(param)).trim();

  return (
    <NewsPageSlot>
      <h1 className="sr-only">جزئیات خبر | سلنیرو — کاریابی تخصصی فروش و بازاریابی</h1>

      <Suspense fallback={<NewsDetailLoading />}>
        <NewsDetail slug={resolvedSlug} />
      </Suspense>
    </NewsPageSlot>
  );
}

/* ============================================
   LOADING FALLBACK
   ============================================ */
function NewsDetailLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        fontFamily: 'var(--font-iran, Tahoma, sans-serif)',
        color: '#6b7280',
      }}
    >
      در حال بارگذاری خبر…
    </div>
  );
}
