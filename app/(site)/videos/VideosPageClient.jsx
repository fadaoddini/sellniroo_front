'use client'

import React, { Suspense, useEffect, useState } from 'react'
import VideoArchiveListPage from '@/components/Story/VideoArchiveListPage'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import {
  DEFAULT_NEWS_LIST_LAYOUT,
  normalizeNewsListLayout,
} from '@/config/homeLayout'
import { fetchSiteSettings } from '@/services/siteSettings'
import newsStyles from '@/components/News/News.module.css'

function VideosLoading() {
  return (
    <div className={newsStyles.pageLoading}>
      <div className={newsStyles.pageSpinner} />
      <p>در حال بارگذاری آرشیو ویدیو...</p>
    </div>
  )
}

/**
 * صفحه /videos — دقیقاً همان چیدمان هدر /news (news_list_layout)
 * بدون اعمال دوبارهٔ کروم خانه تا هدر قاطی نشود.
 */
export default function VideosPageClient() {
  const [layout, setLayout] = useState(DEFAULT_NEWS_LIST_LAYOUT)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await fetchSiteSettings({ force: true })
        if (!cancelled) {
          setLayout(normalizeNewsListLayout(s?.news_list_layout))
        }
      } catch {
        if (!cancelled) setLayout(DEFAULT_NEWS_LIST_LAYOUT)
      }
    })()
    const onLayout = (ev) => {
      if (ev?.detail) setLayout(normalizeNewsListLayout(ev.detail))
    }
    window.addEventListener('news-list-layout-changed', onLayout)
    return () => {
      cancelled = true
      window.removeEventListener('news-list-layout-changed', onLayout)
    }
  }, [])

  return (
    <PageBuilderRenderer
      layout={normalizeNewsListLayout(layout)}
      articleSlot={
        <Suspense fallback={<VideosLoading />}>
          <VideoArchiveListPage />
        </Suspense>
      }
    />
  )
}
