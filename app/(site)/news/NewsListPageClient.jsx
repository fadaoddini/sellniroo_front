'use client'

import React, { useEffect, useState } from 'react'
import NewsList from '@/components/News/NewsList'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import {
  DEFAULT_NEWS_LIST_LAYOUT,
  normalizeNewsListLayout,
} from '@/config/homeLayout'
import { fetchSiteSettings } from '@/services/siteSettings'

/**
 * صفحه /news — چیدمان از AdminWeb (news_list_layout)
 */
export default function NewsListPageClient() {
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
      articleSlot={<NewsList />}
    />
  )
}
