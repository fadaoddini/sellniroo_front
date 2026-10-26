// app/news/page.jsx
// ماژول سایت: news — با خاموش شدن، صفحه /news در دسترس نیست
// چیدمان از AdminWeb → «صفحه لیست اخبار» (news_list_layout)

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import NewsPageSlot from '@/components/modules/NewsPageSlot'
import NewsListPageClient from './NewsListPageClient'
import { isSiteModuleActive } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from '@/components/News/News.module.css'

export const metadata = {
  title: 'اخبار کاریابی و استخدام | سلنیرو',
  description:
    'آخرین اخبار و رویدادهای بازار کار، فرصت‌های شغلی فروش و بازاریابی، استخدام‌های تازه، تحلیل بازار کار و راهکارهای موفقیت در مصاحبه شغلی - سلنیرو، مرجع تخصصی کاریابی فروش و بازاریابی',
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
    'مرجع کاریابی',
  ],
  openGraph: {
    title: 'اخبار کاریابی و استخدام | سلنیرو',
    description:
      'آخرین اخبار و رویدادهای بازار کار، فرصت‌های شغلی فروش و بازاریابی، استخدام‌های تازه و تحلیل بازار کار توسط سلنیرو',
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
    description:
      'آخرین اخبار و رویدادهای بازار کار و فرصت‌های شغلی توسط سلنیرو',
    images: ['https://selniro.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://selniro.com/news',
  },
}

export default async function NewsPage() {
  const newsOn = await isSiteModuleActive(SITE_MODULE_KEYS.NEWS, {
    force: true,
  })
  if (!newsOn) {
    notFound()
  }

  return (
    <NewsPageSlot>
      <h1 className="sr-only">
        اخبار کاریابی و استخدام | سلنیرو - مرجع تخصصی فرصت‌های شغلی فروش و
        بازاریابی در ایران
      </h1>

      <Suspense fallback={<NewsLoading />}>
        <NewsListPageClient />
      </Suspense>
    </NewsPageSlot>
  )
}

function NewsLoading() {
  return (
    <div className={styles.pageLoading}>
      <div className={styles.pageSpinner} />
      <p>در حال بارگذاری اخبار...</p>
    </div>
  )
}
