// صفحه آرشیو ویدیو — همان ساختار /news (چیدمان صفحه‌ساز + لیست فیلتردار)
// ماژول: videoinsta

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import VideoArchivePageSlot from '@/components/modules/VideoArchivePageSlot'
import VideosPageClient from './VideosPageClient'
import { isSiteModuleActive } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import newsStyles from '@/components/News/News.module.css'

export const metadata = {
  title: 'آرشیو ویدیو | سلنیرو',
  description: 'آرشیو ویدیوهای منتخب سلنیرو — جستجو، فیلتر و صفحه‌بندی',
  openGraph: {
    title: 'آرشیو ویدیو | سلنیرو',
    description: 'آرشیو ویدیوهای منتخب سلنیرو',
    url: 'https://selniro.com/videos',
    images: [
      {
        url: 'https://selniro.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'آرشیو ویدیو | سلنیرو',
      },
    ],
  },
  alternates: {
    canonical: 'https://selniro.com/videos',
  },
}

export default async function VideosPage() {
  const on = await isSiteModuleActive(SITE_MODULE_KEYS.VIDEOINSTA, {
    force: true,
  })
  if (!on) {
    notFound()
  }

  return (
    <VideoArchivePageSlot>
      <h1 className="sr-only">آرشیو ویدیو | سلنیرو</h1>
      <Suspense fallback={<VideosLoading />}>
        <VideosPageClient />
      </Suspense>
    </VideoArchivePageSlot>
  )
}

function VideosLoading() {
  return (
    <div className={newsStyles.pageLoading}>
      <div className={newsStyles.pageSpinner} />
      <p>در حال بارگذاری آرشیو ویدیو...</p>
    </div>
  )
}
